import { defineStore } from 'pinia'

export const useTaskStore = defineStore('taskStore', {
    state: () => ({
        boards: JSON.parse(localStorage.getItem('taskmaster_boards')) || [
            {
                id: '1',
                name: 'Mi Primer Tablero',
                tasks: [
                    {
                        id: 't1',
                        titulo: 'Bienvenida',
                        descripcion: '¡Bienvenido a TaskMaster! Puedes arrastrar esta tarjeta.',
                        estado: 'pendiente',
                        prioridad: 'Baja'
                    }
                ]
            }
        ],
        columns: [
            { id: 'pendiente', name: 'Pendiente', color: '#64748b' },
            { id: 'en-curso', name: 'En Curso', color: '#3b82f6' },
            { id: 'completada', name: 'Completada', color: '#10b981' },
            { id: 'rechazada', name: 'Rechazada', color: '#ef4444' },
            { id: 'en-espera', name: 'En Espera', color: '#f59e0b' }
        ]
    }),

    actions: {
        saveToLocal() {
            localStorage.setItem('taskmaster_boards', JSON.stringify(this.boards))
        },

        addBoard(name) {
            const newBoard = {
                id: crypto.randomUUID(),
                name,
                tasks: []
            }
            this.boards.push(newBoard)
            this.saveToLocal()
            return newBoard.id
        },

        deleteBoard(boardId) {
            this.boards = this.boards.filter(b => b.id !== boardId)
            this.saveToLocal()
        },

        addTask(boardId, task) {
            const board = this.boards.find(b => b.id === boardId)
            if (board) {
                board.tasks.push({
                    id: crypto.randomUUID(),
                    ...task
                })
                this.saveToLocal()
            }
        },

        updateTask(boardId, taskId, updatedTask) {
            const board = this.boards.find(b => b.id === boardId)
            if (board) {
                const index = board.tasks.findIndex(t => t.id === taskId)
                if (index !== -1) {
                    board.tasks[index] = { ...board.tasks[index], ...updatedTask }
                    this.saveToLocal()
                }
            }
        },

        deleteTask(boardId, taskId) {
            const board = this.boards.find(b => b.id === boardId)
            if (board) {
                board.tasks = board.tasks.filter(t => t.id !== taskId)
                this.saveToLocal()
            }
        },

        moveTask(boardId, taskId, newStatus) {
            const board = this.boards.find(b => b.id === boardId)
            if (board) {
                const task = board.tasks.find(t => t.id === taskId)
                if (task) {
                    task.estado = newStatus
                    this.saveToLocal()
                }
            }
        }
    }
})
