import { defineStore } from 'pinia'

const API_URL = 'http://localhost:3001/api/board'

export const useTaskStore = defineStore('taskStore', {
    state: () => ({
        boards: [], // Se cargará desde el JSON
        columns: [
            { id: 'todo', name: 'Pendiente', color: '#64748b' },
            { id: 'in-progress', name: 'En Curso', color: '#3b82f6' },
            { id: 'review', name: 'Revisión', color: '#f59e0b' },
            { id: 'done', name: 'Completada', color: '#10b981' },
            { id: 'on-hold', name: 'En Espera', color: '#94a3b8' },
            { id: 'rejected', name: 'Rechazada', color: '#ef4444' }
        ],
        isLoading: false,
        lastUpdated: null, // ISO string del servidor
        pollingInterval: null
    }),

    actions: {
        async fetchBoard(silent = false) {
            if (!silent) this.isLoading = true
            try {
                const response = await fetch(API_URL)
                if (!response.ok) throw new Error('Error al cargar datos')
                const data = await response.json()

                // Si el servidor no es más nuevo, no hacemos nada
                if (this.lastUpdated && data.last_updated === this.lastUpdated) {
                    return
                }

                this.lastUpdated = data.last_updated
                
                // Mapeo simple: el CLI llama "projects" a lo que el UI llama "boards"
                this.boards = data.projects.map(p => ({
                    ...p,
                    tasks: p.tasks.map(t => ({
                        ...t,
                        titulo: t.title || t.titulo,
                        estado: t.status || t.estado,
                        tags: Array.isArray(t.tags) ? t.tags.join(', ') : (t.tags || ''),
                        prioridad: this.mapPriorityToUI(t.priority || t.prioridad)
                    }))
                }))
            } catch (error) {
                if (!silent) console.error('Error fetching board:', error)
                const localData = localStorage.getItem('taskmaster_boards_backup')
                if (localData && !this.boards.length) this.boards = JSON.parse(localData)
            } finally {
                if (!silent) this.isLoading = false
            }
        },

        startPolling(intervalMs = 5000) {
            if (this.pollingInterval) return
            this.pollingInterval = setInterval(() => {
                this.fetchBoard(true)
            }, intervalMs)
        },

        stopPolling() {
            if (this.pollingInterval) {
                clearInterval(this.pollingInterval)
                this.pollingInterval = null
            }
        },

        async saveToServer() {
            // Mapeo inverso: boards -> projects, titulo -> title
            const projects = this.boards.map(b => ({
                ...b,
                tasks: b.tasks.map(t => ({
                    ...t,
                    title: t.titulo || t.title,
                    status: t.estado || t.status,
                    tags: typeof t.tags === 'string' ? t.tags.split(',').map(tag => tag.trim()).filter(Boolean) : (t.tags || []), 
                    priority: this.mapPriorityToCLI(t.prioridad || t.priority)
                }))
            }))

            const dataToSave = {
                version: "1.0",
                last_updated: new Date().toISOString(),
                projects,
                config: {
                    valid_statuses: this.columns.map(c => c.id),
                    valid_priorities: ["low", "medium", "high", "urgent"]
                }
            }

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dataToSave)
                })
                const result = await response.json()
                if (result.success) {
                    this.lastUpdated = result.last_updated
                }
                localStorage.setItem('taskmaster_boards_backup', JSON.stringify(this.boards))
            } catch (error) {
                console.error('Error saving board:', error)
            }
        },

        mapPriorityToUI(p) {
            const map = { 'low': 'Baja', 'medium': 'Media', 'high': 'Alta', 'urgent': 'Urgente' }
            return map[p] || 'Media'
        },

        mapPriorityToCLI(p) {
            const map = { 'Baja': 'low', 'Media': 'medium', 'Alta': 'high', 'Urgente': 'urgent' }
            return map[p] || 'medium'
        },

        async addBoard(name) {
            const newBoard = {
                id: `proj_${Date.now().toString(36)}`,
                name,
                description: '',
                tasks: [],
                status: 'active',
                created: new Date().toISOString().split('T')[0]
            }
            this.boards.push(newBoard)
            await this.saveToServer()
            return newBoard.id
        },

        async deleteBoard(boardId) {
            this.boards = this.boards.filter(b => b.id !== boardId)
            await this.saveToServer()
        },

        async addTask(boardId, task) {
            const board = this.boards.find(b => b.id === boardId)
            if (board) {
                board.tasks.push({
                    id: `task_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`,
                    ...task,
                    created: new Date().toISOString().split('T')[0],
                    updated: new Date().toISOString().split('T')[0]
                })
                await this.saveToServer()
            }
        },

        async updateTask(boardId, taskId, updatedTask) {
            const board = this.boards.find(b => b.id === boardId)
            if (board) {
                const index = board.tasks.findIndex(t => t.id === taskId)
                if (index !== -1) {
                    board.tasks[index] = { 
                        ...board.tasks[index], 
                        ...updatedTask,
                        updated: new Date().toISOString().split('T')[0]
                    }
                    await this.saveToServer()
                }
            }
        },

        async deleteTask(boardId, taskId) {
            const board = this.boards.find(b => b.id === boardId)
            if (board) {
                board.tasks = board.tasks.filter(t => t.id !== taskId)
                await this.saveToServer()
            }
        },

        async moveTask(boardId, taskId, newStatus) {
            const board = this.boards.find(b => b.id === boardId)
            if (board) {
                const task = board.tasks.find(t => t.id === taskId)
                if (task) {
                    task.estado = newStatus
                    task.updated = new Date().toISOString().split('T')[0]
                    if (newStatus === 'done') {
                        task.completed = new Date().toISOString().split('T')[0]
                    }
                    await this.saveToServer()
                }
            }
        },

        async addSubtask(boardId, taskId, text) {
            const board = this.boards.find(b => b.id === boardId)
            if (board) {
                const task = board.tasks.find(t => t.id === taskId)
                if (task) {
                    if (!task.subtasks) task.subtasks = []
                    task.subtasks.push({
                        id: crypto.randomUUID(),
                        text,
                        completed: false
                    })
                    await this.saveToServer()
                }
            }
        },

        async toggleSubtask(boardId, taskId, subtaskId) {
            const board = this.boards.find(b => b.id === boardId)
            if (board) {
                const task = board.tasks.find(t => t.id === taskId)
                if (task && task.subtasks) {
                    const subtask = task.subtasks.find(st => st.id === subtaskId)
                    if (subtask) {
                        subtask.completed = !subtask.completed
                        await this.saveToServer()
                    }
                }
            }
        },

        async deleteSubtask(boardId, taskId, subtaskId) {
            const board = this.boards.find(b => b.id === boardId)
            if (board) {
                const task = board.tasks.find(t => t.id === taskId)
                if (task && task.subtasks) {
                    task.subtasks = task.subtasks.filter(st => st.id !== subtaskId)
                    await this.saveToServer()
                }
            }
        }
    }
})
