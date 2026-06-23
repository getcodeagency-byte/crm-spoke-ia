(function () {
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
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eWVxcGNxaGRuZ2Fpc2Z6ZG5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNzU1MDcsImV4cCI6MjA5NTg1MTUwN30.LTT9jBg2qFqTtxXijgyW242BKS-s3_w68e9VTCEI5Tg';

        // Patrón Singleton estricto para evitar múltiples instancias de GoTrueClient
        if (!window.supabaseClient) {
            window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey, {
                auth: {
                    storage: window.localStorage,
                    autoRefreshToken: true,
                    persistSession: true
                }
            });
        }
        const supabaseClient = window.supabaseClient;

        // Guardar mensaje local con fallback y sincronización
        async function localGuardarMensajeEnSupabase(leadId, sender, content, msgType = 'text', metadata = null) {
            const crmSender = sender === 'user' ? 'customer' : 'ai';

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
                await saveDirectly(leadId, crmSender, content, msgType, metadata);
            }

            // Disparo Non-Blocking al Webhook de n8n (solo para el visitante) - Evasión Estricta de CORS (Legacy URL muebleoia.app.n8n.cloud removido)
            if (crmSender === 'customer') {
                const URL_WEBHOOK_N8N = 'https://n8n.muebleo.com.co/webhook/3940b692-d275-434b-82d0-c75e0ec43c07';
                const payload = {
                    lead_id: leadId,
                    mensaje: content,
                    remitente: 'visitante',
                    timestamp: new Date().toISOString()
                };
                fetch(URL_WEBHOOK_N8N, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'text/plain'
                    },
                    body: JSON.stringify(payload)
                }).catch(e => console.warn('n8n silencioso:', e));
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
                        const fallbackImg = 'https://placehold.co/150?text=No+Image';
                        let rawImg = prod.imagen || prod.image || prod.image_url || prod.url || prod.img || prod.thumbnail || '';
                        let imgUrl = fallbackImg;
                        if (rawImg && typeof rawImg === 'string') {
                            const trimmed = rawImg.trim();
                            const isInvalid = trimmed.includes('muebleoexample.com') ||
                                trimmed.includes('via.placeholder.com') ||
                                /muebleo\.com\/\d+/i.test(trimmed) ||
                                /\/\d+\.(jpg|jpeg|png|webp|gif)$/i.test(trimmed);
                            if (!isInvalid && (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:'))) {
                                imgUrl = trimmed;
                            }
                        }
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
                                <img src="${imgUrl}" alt="${nombre}" onerror="this.src='${fallbackImg}'">
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

        // Suscribirse a tiempo real en el widget para recibir respuestas de la IA/Asesor automáticamente
        function suscribirseAMensajesRealtimeWidget() {
            if (typeof supabaseClient.channel !== 'function') return;

            supabaseClient
                .channel('widget-realtime')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'chat_history',
                        filter: `lead_id=eq.${visitorId}`
                    },
                    (payload) => {
                        console.log('📬 [Widget] Nuevo mensaje en Supabase:', payload);
                        const newMsg = payload.new;
                        if (!newMsg) return;

                        // Solo renderizar si el remitente es la IA ('ai') o el asesor ('human'/'advisor')
                        if (newMsg.sender === 'ai' || newMsg.sender === 'human' || newMsg.sender === 'advisor') {
                            const chatBody = document.getElementById("muebleo-widget-messages");
                            if (chatBody) {
                                // Quitar cualquier typing indicator si existe
                                const typingIndicators = chatBody.querySelectorAll('.muebleo-widget-typing-indicator');
                                typingIndicators.forEach(indicator => {
                                    if (chatBody.contains(indicator)) {
                                        chatBody.removeChild(indicator);
                                    }
                                });
                            }
                            const role = 'ai'; // para la burbuja de la izquierda en el widget
                            renderWidgetMessage(role, newMsg.content, newMsg.products_data);
                        }
                    }
                )
                .subscribe();
        }

        // Exponer función de sincronización al CRM
        if (window.spokeCRM) {
            window.spokeCRM.syncWidgetHistory = syncWidgetHistory;
        }

        // Carga inicial del historial y suscripción Realtime
        if (window.spokeCRM && window.spokeCRM.chatsHistory[visitorId]) {
            syncWidgetHistory(visitorId);
        } else {
            await loadHistory();
        }

        suscribirseAMensajesRealtimeWidget();

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

            // Remover automáticamente después de 12 segundos si la IA no responde
            setTimeout(() => {
                if (chatBody.contains(typingIndicator)) {
                    chatBody.removeChild(typingIndicator);
                }
            }, 12000);
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
