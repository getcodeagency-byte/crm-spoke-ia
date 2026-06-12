(function() {
    // 1. Obtener la ruta base desde donde se carga el script
    const scriptUrl = document.currentScript ? document.currentScript.src : '';
    let cssOrigin = '';
    if (scriptUrl) {
        try {
            const urlObj = new URL(scriptUrl);
            cssOrigin = urlObj.origin + urlObj.pathname.substring(0, urlObj.pathname.lastIndexOf('/js/'));
        } catch (e) {
            console.error("[Widget Loader] Error al parsear URL del script:", e);
        }
    }
    if (!cssOrigin) {
        cssOrigin = window.location.origin;
    }
    const stylesheetUrl = cssOrigin + '/css/widget.css';

    // 2. Cargar CSS dinámicamente
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = stylesheetUrl;
    document.head.appendChild(link);

    // Helper para cargar scripts CDN
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            if (window.supabase) {
                resolve();
                return;
            }
            const existingScript = document.querySelector(`script[src="${src}"]`);
            if (existingScript) {
                if (window.supabase) {
                    resolve();
                } else {
                    existingScript.addEventListener('load', resolve);
                    existingScript.addEventListener('error', reject);
                }
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }

    // Inicialización del Widget
    async function initWidget() {
        // Generar o recuperar ID de visitante único
        let visitorId = localStorage.getItem('spoke_visitor_id');
        if (!visitorId) {
            visitorId = 'visitor-' + Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 11);
            localStorage.setItem('spoke_visitor_id', visitorId);
        }

        // Inyectar Estructura HTML
        const widgetHtml = `
            <div id="muebleo-widget-container">
                <div id="muebleo-widget-window" class="muebleo-widget-hidden">
                    <div class="muebleo-widget-header">
                        <div class="muebleo-widget-header-info">
                            <span class="muebleo-widget-status-dot"></span>
                            <h4 class="muebleo-widget-title">María - Muebleo</h4>
                        </div>
                        <button id="muebleo-widget-close-btn">✖</button>
                    </div>
                    <div id="muebleo-widget-messages" class="muebleo-widget-body">
                        <div class="muebleo-widget-bubble muebleo-widget-ia">¡Hola! Soy María. ¿En qué espacio de tu casa estás pensando hoy?</div>
                    </div>
                    <div class="muebleo-widget-footer">
                        <input type="text" id="muebleo-widget-input" placeholder="Escribe tu mensaje...">
                        <button id="muebleo-widget-send-btn">Enviar</button>
                    </div>
                </div>
                
                <button id="muebleo-widget-fab">
                    <span class="muebleo-widget-fab-icon">💬</span>
                </button>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', widgetHtml);

        // Cargar Supabase CDN y conectar si no está disponible localmente
        await loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2");

        const supabaseUrl = 'https://luyeqpcqhdngaisfzdnl.supabase.co';
        const supabaseKey = 'sb_publishable_5PhCsOnvuqs3HagvA1CxxA_lHYhuEjb';
        const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

        // Guardar mensaje local con fallback y sincronización
        async function localGuardarMensajeEnSupabase(leadId, sender, content, msgType = 'text', metadata = null) {
            if (window.spokeCRM) {
                // Si el lead no existe en leadsList del CRM, crearlo dinámicamente
                if (window.spokeCRM.leadsList && !window.spokeCRM.leadsList.some(l => l.id === leadId)) {
                    const newLead = {
                        id: leadId,
                        name: `Visitante Web (${leadId.replace('visitor-', '')})`,
                        phone: '',
                        channel_source: 'webchat',
                        ai_chat_status: 'ai_active',
                        commercial_stage: 'nuevo',
                        unread: true,
                        estimated_budget: 0.00,
                        quoted_value: 0.00,
                        avatar_url: 'https://placehold.co/100x100/1e293b/06B6D4?text=WEB',
                        time_in_stage: 'ahora',
                        created_at: new Date().toISOString().split('T')[0],
                        assigned_to: 'advisor-ia-uuid',
                        delivery_date: '',
                        observations: 'Lead creado dinámicamente desde chat web.',
                        attachments: [],
                        activity_log: [
                            { time: 'Ahora', author: 'Sistema', content: 'Lead creado e indexado desde el Widget Web.' }
                        ],
                        tags: [
                            { name: 'Nuevo', color: '#03DAC6' }
                        ]
                    };
                    window.spokeCRM.leadsList.unshift(newLead);
                    if (typeof window.spokeCRM.renderInbox === 'function') window.spokeCRM.renderInbox();
                }

                const timeStr = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
                if (!window.spokeCRM.chatsHistory[leadId]) {
                    window.spokeCRM.chatsHistory[leadId] = [];
                }
                
                // Mapear sender para cumplir con estructura CRM (customer/ai)
                const crmSender = sender === 'user' ? 'customer' : 'ai';
                if (msgType === 'carousel') {
                    window.spokeCRM.chatsHistory[leadId].push({ 
                        sender: crmSender, 
                        type: 'carousel', 
                        products: metadata, 
                        content: content, 
                        time: timeStr 
                    });
                } else {
                    window.spokeCRM.chatsHistory[leadId].push({ 
                        sender: crmSender, 
                        content: content, 
                        time: timeStr 
                    });
                }
                
                // Intentar guardar a través de la función del CRM si existe
                if (typeof window.spokeCRM.guardarMensajeEnSupabase === 'function') {
                    await window.spokeCRM.guardarMensajeEnSupabase(leadId, crmSender, content, msgType, metadata);
                } else {
                    await saveDirectly(leadId, crmSender, content, msgType, metadata);
                }

                // Sincronizar UI del CRM en tiempo real
                if (window.spokeCRM.activeInboxLeadId === leadId) {
                    if (typeof window.spokeCRM.renderInbox === 'function') window.spokeCRM.renderInbox();
                    if (typeof window.spokeCRM.renderActiveChat === 'function') window.spokeCRM.renderActiveChat();
                }
            } else {
                const crmSender = sender === 'user' ? 'customer' : 'ai';
                await saveDirectly(leadId, crmSender, content, msgType, metadata);
            }
        }

        async function saveDirectly(leadId, sender, content, msgType, metadata) {
            try {
                const { error } = await supabaseClient
                    .from('chat_history')
                    .insert([
                        { 
                            lead_id: leadId, 
                            sender: sender, 
                            content: content, 
                            type: msgType,
                            products_data: metadata 
                        }
                    ]);
                if (error) throw error;
                console.log(`✅ [Widget] Mensaje de ${sender} guardado en Supabase.`);
            } catch (err) {
                console.error("❌ [Widget] Error al guardar mensaje directamente en Supabase:", err.message);
            }
        }

        // Renderizar burbujas y carruseles
        function renderWidgetMessage(sender, replyText, preParsedProducts = null) {
            const chatBody = document.getElementById("muebleo-widget-messages");
            if (!chatBody) return;

            if (sender === 'user' || sender === 'human' || sender === 'customer') {
                const userMsg = document.createElement("div");
                userMsg.className = "muebleo-widget-bubble muebleo-widget-user";
                userMsg.textContent = replyText;
                chatBody.appendChild(userMsg);
            } else {
                let parsedProducts = preParsedProducts;
                let textOnly = replyText;

                if (!parsedProducts) {
                    try {
                        const jsonMatch = replyText.match(/\[\s*\{[\s\S]*\}\s*\]/);
                        if (jsonMatch) {
                            const parsed = JSON.parse(jsonMatch[0]);
                            if (Array.isArray(parsed) && parsed.length > 0) {
                                parsedProducts = parsed;
                                textOnly = replyText.replace(jsonMatch[0], '').trim();
                            }
                        }
                    } catch (e) {
                        console.error("[Widget] Error al parsear productos:", e);
                    }
                }

                if (textOnly) {
                    const iaMsg = document.createElement("div");
                    iaMsg.className = "muebleo-widget-bubble muebleo-widget-ia";
                    iaMsg.textContent = textOnly;
                    chatBody.appendChild(iaMsg);
                }

                if (parsedProducts && parsedProducts.length > 0) {
                    const productos = parsedProducts;
                    console.log("Productos extraídos:", productos);

                    const carouselContainer = document.createElement("div");
                    carouselContainer.className = "muebleo-widget-carousel-container";

                    productos.forEach(prod => {
                        const imgUrl = prod.imagen || prod.image || prod.image_url || prod.url || prod.img || prod.thumbnail || 'https://via.placeholder.com/150?text=No+Image';
                        const nombre = prod.nombre || prod.name || prod.titulo || prod.title || 'Producto';
                        const precio = prod.precio !== undefined ? prod.precio : prod.price;
                        const precioFormateado = precio ? Number(precio).toLocaleString('es-CO') : null;
                        const priceText = precioFormateado ? `$${precioFormateado}` : 'Consultar Precio';
                        const url = prod.url || prod.product_url || prod.link || '#';

                        const productCard = document.createElement("div");
                        productCard.className = "muebleo-widget-product-card";
                        productCard.onclick = () => window.open(url, '_blank');

                        productCard.innerHTML = `
                            <div class="muebleo-widget-card-img-container">
                                <img src="${imgUrl}" alt="${nombre}">
                            </div>
                            <div class="muebleo-widget-card-info">
                                <h4 class="muebleo-widget-card-title">${nombre}</h4>
                                <span class="muebleo-widget-card-price">${priceText}</span>
                            </div>
                        `;
                        carouselContainer.appendChild(productCard);
                    });

                    chatBody.appendChild(carouselContainer);
                }
            }
            chatBody.scrollTop = chatBody.scrollHeight;
        }

        // Cargar historial desde DB
        async function loadHistory() {
            const targetLeadId = visitorId;
            try {
                const { data, error } = await supabaseClient
                    .from('chat_history')
                    .select('*')
                    .eq('lead_id', targetLeadId)
                    .order('created_at', { ascending: true });

                if (error) throw error;

                if (data && data.length > 0) {
                    const messagesContainer = document.getElementById("muebleo-widget-messages");
                    messagesContainer.innerHTML = '';
                    data.forEach(msg => {
                        const role = (msg.sender === 'customer' || msg.sender === 'human' || msg.sender === 'user') ? 'user' : 'ai';
                        renderWidgetMessage(role, msg.content, msg.products_data);
                    });
                }
            } catch (err) {
                console.error("❌ [Widget] Error al cargar historial desde Supabase:", err);
            }
        }

        // Sincronizador de historial para entorno CRM
        function syncWidgetHistory(leadId) {
            const targetLeadId = leadId || visitorId;
            const messagesContainer = document.getElementById("muebleo-widget-messages");
            if (messagesContainer && window.spokeCRM && window.spokeCRM.chatsHistory[targetLeadId]) {
                messagesContainer.innerHTML = '';
                window.spokeCRM.chatsHistory[targetLeadId].forEach(msg => {
                    const role = (msg.sender === 'customer' || msg.sender === 'user') ? 'user' : 'ai';
                    renderWidgetMessage(role, msg.content, msg.products || null);
                });
            }
        }

        // Exponer función de sincronización al CRM
        if (window.spokeCRM) {
            window.spokeCRM.syncWidgetHistory = syncWidgetHistory;
        }

        // Carga inicial del historial
        if (window.spokeCRM && window.spokeCRM.chatsHistory[visitorId]) {
            syncWidgetHistory(visitorId);
        } else {
            await loadHistory();
        }

        // Lógica de Enviar Mensaje
        async function sendMessageFromWeb() {
            const input = document.getElementById("muebleo-widget-input");
            const chatBody = document.getElementById("muebleo-widget-messages");
            if (!input || !chatBody) return;

            const text = input.value.trim();
            if (!text) return;

            // 1. Mostrar mensaje al instante
            renderWidgetMessage('user', text);
            input.value = "";

            // 2. Guardar en Supabase y sincronizar CRM
            await localGuardarMensajeEnSupabase(visitorId, 'user', text, 'text');

            // 3. Indicador de escritura IA
            const typingIndicator = document.createElement("div");
            typingIndicator.className = "muebleo-widget-bubble muebleo-widget-ia muebleo-widget-typing-indicator";
            typingIndicator.innerHTML = "<span>.</span><span>.</span><span>.</span>";
            chatBody.appendChild(typingIndicator);
            chatBody.scrollTop = chatBody.scrollHeight;

            // 4. Petición a Webhook n8n
            const webhookUrl = "https://muebleoia.app.n8n.cloud/webhook/webchat-muebleo";
            try {
                const response = await fetch(webhookUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ mensaje: text })
                });

                const data = await response.json();

                // Quitar indicador de escritura
                if (chatBody.contains(typingIndicator)) {
                    chatBody.removeChild(typingIndicator);
                }

                const responseText = data.respuesta || data.output || data.response || data.text || '';
                if (responseText) {
                    let parsedProducts = null;
                    let textOnly = responseText;
                    try {
                        const jsonMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
                        if (jsonMatch) {
                            const parsed = JSON.parse(jsonMatch[0]);
                            if (Array.isArray(parsed) && parsed.length > 0) {
                                parsedProducts = parsed;
                                textOnly = responseText.replace(jsonMatch[0], '').trim();
                            }
                        }
                    } catch (e) {
                        console.error("[Widget] Error al parsear respuesta IA:", e);
                    }

                    // 5. Mostrar respuesta en el Widget
                    renderWidgetMessage('ai', responseText);

                    // 6. Guardar en Supabase y sincronizar CRM
                    if (parsedProducts) {
                        await localGuardarMensajeEnSupabase(visitorId, 'ai', textOnly || '', 'carousel', parsedProducts);
                    } else {
                        await localGuardarMensajeEnSupabase(visitorId, 'ai', responseText, 'text');
                    }
                }
            } catch (err) {
                console.error("❌ [Widget] Error de conexión con n8n:", err);
                if (chatBody.contains(typingIndicator)) {
                    chatBody.removeChild(typingIndicator);
                }
                const errorMsg = document.createElement("div");
                errorMsg.className = "muebleo-widget-bubble muebleo-widget-ia";
                errorMsg.textContent = "Lo siento, mi conexión falló un momento. ¿Puedes repetirlo?";
                chatBody.appendChild(errorMsg);
            }
            chatBody.scrollTop = chatBody.scrollHeight;
        }

        // Adjuntar manejadores de eventos
        const widgetFab = document.getElementById("muebleo-widget-fab");
        const widgetWindow = document.getElementById("muebleo-widget-window");
        const widgetCloseBtn = document.getElementById("muebleo-widget-close-btn");
        const widgetSendBtn = document.getElementById("muebleo-widget-send-btn");
        const widgetInput = document.getElementById("muebleo-widget-input");

        if (widgetFab && widgetWindow) {
            widgetFab.addEventListener("click", () => widgetWindow.classList.remove("muebleo-widget-hidden"));
            widgetCloseBtn.addEventListener("click", () => widgetWindow.classList.add("muebleo-widget-hidden"));
        }

        if (widgetSendBtn && widgetInput) {
            widgetSendBtn.addEventListener("click", sendMessageFromWeb);
            widgetInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter") sendMessageFromWeb();
            });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initWidget);
    } else {
        initWidget();
    }
})();
