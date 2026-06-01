# spoke! Master PRD - Versión 3.5 (Core Refinement & Product Sync)

## 1. Ajuste de Branding (Elegancia Funcional)
- **Base:** Fondo Oscuro Neutro (#0A0A0B). Tarjetas en Gris Pizarra (#111827).
- **Uso del Neón:** Reservado UNICAMENTE para Etiquetas (Tags) con estilo Outline.
- **Botones y UI:** Colores corporativos sólidos (Azul acero, Blanco roto).

## 2. Inbox Dinámico y Asignación
- **Chat Universal:** Se elimina el bloqueo. El chat debe estar activo siempre que un lead esté seleccionado, sin importar el filtro.
- **Propiedad del Lead:** Cada cliente tiene un campo `assigned_to` (UUID del asesor). 
- **Filtros de Vista:** Toggle para alternar entre "Mis Leads" (asignados a mí) y "Todos" (visión de supervisor).

## 3. Registro de Pedido y Tiempos
- **Ciclo de Vida:** 
    - `Order Date`: Fecha automática de creación del registro.
    - `Delivery Date`: Fecha estimada de despacho (editable desde la ficha Jira).
- **Etiquetado Manual:** El asesor puede añadir/quitar etiquetas desde el chat o Kanban mediante un buscador rápido de tags.

## 4. Hub de Canales & IA Real
- **Conectores Funcionales:** Tarjetas interactivas para FB Messenger, TikTok, Webchat y WhatsApp. Cada una con su panel de "Configuración de Webhook".
- **AI Config:** Selector real de modelo (GPT-4o, Claude 3.5, Gemini 1.5) con campo de "System Prompt" para definir la personalidad de la IA.

## 5. Catálogo Híbrido (Product Engine)
- Soporte para múltiples fuentes simultáneas (Shopify + Woo + API REST).
- Sincronización en segundo plano hacia el `product_cache` local.
