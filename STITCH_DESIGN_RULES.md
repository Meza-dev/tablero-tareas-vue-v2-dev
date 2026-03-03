# Stitch & Antigravity: Product Design Manifesto (Silicon Valley Standard)

Este documento establece las reglas fundamentales de diseño y experiencia de producto para todas las intervenciones realizadas por la IA en este entorno. Actuaremos bajo la mentalidad de **Principal Designer & Head of Product**, priorizando la excelencia visual, la cohesión técnica y la utilidad radical.

> [!IMPORTANT]
> **Mandato de Ejecución:** Todas las llamadas a herramientas de **Stitch MCP** (`generate_screen`, `edit_screens`, `generate_variants`) deben ser filtradas y guiadas por este manifiesto. La IA debe actuar como el orquestador que asegura que cada frame generado cumpla con los estándares aquí descritos.

---

## 0. Contexto de la Aplicación: TaskMaster Vue 🍍

*   **Identidad:** Herramienta de gestión de tareas y tableros de alto rendimiento.
*   **Stack Técnico:** Vue 3 (Composition API / Script Setup), Vite, Pinia (Gestión de estado), Vue Router.
*   **Filosofía:** Minimalismo productivo. La interfaz debe facilitar el flujo de trabajo sin distracciones, utilizando una estética limpia y moderna con acentos vibrantes.

---

## 1. Core Principles: El Manifiesto de Calidad

1.  **Invisible Perfection:** El gran diseño no grita; funciona de forma fluida. Cada píxel debe tener una razón de existir.
2.  **Content First:** El contenedor nunca debe opacar al contenido. Usamos el espacio en blanco como una herramienta, no como un vacío.
3.  **Physical Intuition:** Las interfaces deben responder como objetos físicos. El peso, la elevación y el movimiento deben seguir leyes lógicas de inercia y profundidad.
4.  **Emotional Utility:** No basta con que sea funcional; debe sentirse *premium*. La confianza del usuario se construye a través de la consistencia y el detalle.

---

## 2. Design Tokens: El Lenguaje de la Marca

### 📏 Escala de Espaciado (Leyes de Proximidad)
Basada estrictamente en una unidad base de **4px**. No se permiten valores fuera de esta escala para Padding o Margin.

| Token | Valor | Uso Sugerido |
| :--- | :--- | :--- |
| `space-1` | 4px | Micro-ajustes, iconos internos. |
| `space-2` | 8px | Separación de elementos pequeños. |
| `space-3` | 12px | Espaciado interno de inputs/botones. |
| `space-4` | 16px | Padding estándar de contenedores pequeños. |
| `space-6` | 24px | Separación entre secciones relacionadas. |
| `space-8` | 32px | Gutter de grid, padding de sección. |
| `space-12` | 48px | Espaciado de grandes bloques de contenido. |
| `space-16` | 64px | Hero sections y aire radical. |

### 🎨 Color & Dark Mode First
Prohibido el uso de negro puro (`#000`). Usamos "Enriched Grays" para mayor profundidad.

-   **Surface Primary (Dark):** `#0A0A0B` (Fondo principal).
-   **Surface Secondary (Dark):** `#141416` (Cards, Modales).
-   **Border:** `#262629` (Sutil, contraste bajo pero perceptible).
-   **Accent:** Indigo moderno o "TaskMaster Blue" (`#6366F1`) con sombras proyectadas suaves.

---

## 3. UI UX Pro Max: Intelligence System 🧠

Integramos las capacidades del framework **UI UX Pro Max** para la toma de decisiones de diseño:

*   **Reasoning Engine:** Antes de generar código o diseños en Stitch, la IA debe "razonar" el tipo de producto. Para TaskMaster (SaaS/Productivity), priorizar estilos como **Bento Grid**, **Minimalism** o **AI-Native UI**.
*   **Multi-Domain Matching:** Utilizar una de las 96 paletas de colores específicas para la industria de Productividad/SaaS.
*   **Typography Mood:** Seleccionar combinaciones de fuentes que transmitan eficiencia y modernidad (ej: Inter + System UI).
*   **Anti-Patterns Intelligence:** Filtrar activamente errores comunes de la industria (ej: evitar saturación de modales en flujos de creación de tareas).

---

## 4. The "No-Go" List: Errores de Diseño Prohibidos

*   ❌ **Generic Components:** Prohibido usar estilos por defecto de librerías sin personalización de radios, sombras y estados.
*   ❌ **Pure Black/White:** Prohibido el contraste agresivo `#000` vs `#FFF`. Usar grises ópticos.
*   ❌ **Hidden Focus:** Prohibido eliminar el `outline` sin proporcionar un estado `:focus-visible` altamente legible.
*   ❌ **Ambiguous CTAs:** Prohibido usar "Click aquí" o "Enviar".
*   ❌ **Layout Shifts:** Prohibido mostrar estados vacíos sin **Skeleton Loaders** de la misma jerarquía visual.
*   ❌ **Overcrowding:** Prohibido romper la **Ley de Miller** (> 7 elementos por sección cognitiva).

---

## 5. Validation Checklist: Antes de cada entrega

Antes de considerar un componente o pantalla como terminada, la IA debe validar:

1.  **Jerarquía Matemática:** ¿La tipografía sigue una escala clara (ej. 12, 14, 16, 20, 24, 32, 48)?
2.  **Ley de Hick:** ¿He minimizado las decisiones del usuario en esta pantalla crítica (Creación de Tarea/Board)?
3.  **Touch Targets:** ¿Todos los elementos interactivos tienen al menos 44x44px de área de click?
4.  **Micro-interacciones:** ¿El botón tiene estados `:hover`, `:active`, `:focus-visible` y `:disabled` diferenciados con curvas `cubic-bezier`?
5.  **Accesibilidad:** ¿El contraste de texto sobre el fondo es al menos 4.5:1?
6.  **Skeleton States:** ¿Existe una transición suave desde el estado de carga al contenido final?
7.  **UX Writing:** ¿El CTA está orientado al beneficio (ej. "Añadir subtarea" en lugar de "Guardar")?

---

*Este estándar es innegociable. Cualquier desviación debe ser justificada por una mejora técnica excepcional siguiendo el criterio de UI UX Pro Max. Toda operación en Stitch debe ser supervisada bajo estos parámetros.*

