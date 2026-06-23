// ==========================================================================
// LÓGICA DE LA APLICACIÓN 2.6 (EVOLUTION + AJUSTES CRÍTICOS) - spoke!
// ==========================================================================

// ==========================================================================
// 1. INICIALIZACIÓN DE SUPABASE Y FUNCIÓN MAESTRA
// ==========================================================================
const supabaseUrl = 'https://luyeqpcqhdngaisfzdnl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eWVxcGNxaGRuZ2Fpc2Z6ZG5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNzU1MDcsImV4cCI6MjA5NTg1MTUwN30.LTT9jBg2qFqTtxXijgyW242BKS-s3_w68e9VTCEI5Tg';



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
// Validar y sanear URLs de imágenes de prueba/rotas para evitar errores de red en la consola
function getValidImageUrl(url, fallback = 'https://placehold.co/260x380?text=No+Image') {
    if (!url || typeof url !== 'string') return fallback;
    const trimmed = url.trim();
    if (trimmed.includes('muebleoexample.com') || trimmed.includes('via.placeholder.com')) {
        return fallback;
    }
    // Interceptar secuencias numéricas de prueba en la raíz de Muebleo o terminadas en /12345.jpg, /12346.jpg
    if (/muebleo\.com\/\d+/i.test(trimmed) || /\/\d+\.(jpg|jpeg|png|webp|gif)$/i.test(trimmed)) {
        return fallback;
    }
    // Si es una ruta relativa o URL mal formada (ej. "12345.jpg" o similar sin protocolo)
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:')) {
        return fallback;
    }
    return trimmed;
}

let spokeAudioCtx = null;
window.playSpokeSound = function (type) {
    try {
        if (!spokeAudioCtx) {
            spokeAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (spokeAudioCtx.state === 'suspended') {
            spokeAudioCtx.resume();
        }

        const ctx = spokeAudioCtx;
        const now = ctx.currentTime;

        if (type === 'new_message') {
            // Tono suave y corto (bloop)
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(350, now);
            osc.frequency.exponentialRampToValueAtTime(700, now + 0.12);
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);

        } else if (type === 'new_lead') {
            // Tono doble (ding-dong)
            // Ding
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(880, now);
            gain1.gain.setValueAtTime(0.15, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
            osc1.start(now);
            osc1.stop(now + 0.25);

            // Dong
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(660, now + 0.15);
            gain2.gain.setValueAtTime(0.15, now + 0.15);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            osc2.start(now + 0.15);
            osc2.stop(now + 0.45);

        } else if (type === 'sale_won') {
            // Sonido ka-ching de caja registradora + acorde victorioso
            // Clink metálico (ruido blanco filtrado de alta frecuencia)
            const bufferSize = ctx.sampleRate * 0.08;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noiseNode = ctx.createBufferSource();
            noiseNode.buffer = buffer;

            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 6000;
            filter.Q.value = 4;

            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.25, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.005, now + 0.06);

            noiseNode.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(ctx.destination);
            noiseNode.start(now);
            noiseNode.stop(now + 0.08);

            // Acorde victorioso en arpegio (Do Mayor: C5 -> E5 -> G5 -> C6)
            const frequencies = [523.25, 659.25, 783.99, 1046.50];
            frequencies.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gainNode = ctx.createGain();
                osc.connect(gainNode);
                gainNode.connect(ctx.destination);
                osc.type = 'triangle';
                const noteStart = now + 0.04 + idx * 0.035;
                osc.frequency.setValueAtTime(freq, noteStart);

                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(0.1, noteStart + 0.02);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45 + idx * 0.035);

                osc.start(noteStart);
                osc.stop(now + 0.55 + idx * 0.035);
            });
        }
    } catch (e) {
        console.warn("⚠️ AudioContext no pudo reproducir el sonido (bloqueo o falta de interacción):", e);
    }
}

async function guardarMensajeEnSupabase(leadId, sender, content, msgType = 'text', metadata = null) {
    try {
        const { data, error } = await supabaseClient
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
        console.log(`✅ Mensaje de ${sender} guardado exitosamente en Supabase.`);

        // ⚡ Disparo AISLADO al Webhook de n8n (fire-and-forget)
        // IMPORTANTE: Se ejecuta en un setTimeout(0) para desacoplar completamente
        // del hilo de Supabase y evitar que un fallo de red (CORS/Mixed Content)
        // arrastre la conexión WebSocket de Realtime.
        // ⚠️ MIXED CONTENT: Si URL_WEBHOOK_N8N usa http:// en vez de https://,
        // Chrome y Firefox lo bloquearán silenciosamente en producción.
        if (sender === 'human' || sender === 'advisor') {
            setTimeout(async () => {
                try {
                    const URL_WEBHOOK_N8N = 'https://n8n.muebleo.com.co/webhook/3940b692-d275-434b-82d0-c75e0ec43c07';
                    const payload = {
                        lead_id: leadId,
                        mensaje: content || (msgType === 'file' ? '📁 Archivo' : msgType === 'image' ? '📷 Imagen' : ''),
                        remitente: 'asesor',
                        timestamp: new Date().toISOString()
                    };
                    console.log('📡 [Webhook n8n] Intentando disparo fire-and-forget para lead:', leadId);
                    await fetch(URL_WEBHOOK_N8N, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: { 'Content-Type': 'text/plain' },
                        body: JSON.stringify(payload)
                    });
                    console.log('✅ [Webhook n8n] Disparo completado (opaco, sin lectura de respuesta).');
                } catch (e) {
                    console.warn('⚠️ [Webhook n8n] Interceptado localmente — no afecta Supabase:', e.message || e);
                }
            }, 0);
        }
    } catch (error) {
        console.error("❌ Error al guardar en Supabase:", error.message);
    }
}

// ==========================================================================
// 2. RECUPERACIÓN DE CONTRASEÑA — Flujo Supabase
// ==========================================================================

// Interceptor: cuando el usuario regresa desde el correo de recuperación
supabaseClient.auth.onAuthStateChange(async (event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
        const newPassword = prompt('🔐 Ingresa tu nueva contraseña (mínimo 6 caracteres):');
        if (newPassword && newPassword.length >= 6) {
            const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
            if (error) {
                alert('❌ Error al actualizar: ' + error.message);
            } else {
                alert('✅ ¡Contraseña actualizada con éxito! Ya puedes iniciar sesión con tu nueva clave.');
            }
        } else if (newPassword !== null) {
            alert('⚠️ La contraseña debe tener al menos 6 caracteres.');
        }
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    let currentSession = null;

    function getCurrentAgent() {
        if (currentSession && currentSession.user) {
            const user = currentSession.user;
            const photo = user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100&h=100';
            return {
                uuid: user.id,
                name: user.user_metadata?.name || user.email.split('@')[0],
                email: user.email,
                photo: photo,
                avatar: photo
            };
        }
        return {
            uuid: 'advisor-vendedora-uuid',
            name: 'Vendedora Activa',
            email: 'vendedora@muebleo.com',
            photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100&h=100',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100&h=100'
        };
    }

    // ----------------------------------------------------------------------
    // 1. Datos iniciales simulados (Semilla)
    // ----------------------------------------------------------------------
    let leadsList = [
        {
            id: 'lead-simulador-ia',
            name: '🤖 Simulador IA',
            phone: '+573999999999',
            channel_source: 'whatsapp',
            ai_chat_status: 'ai_active',
            commercial_stage: 'nuevo',
            estimated_budget: 0.00,
            quoted_value: 0.00,
            avatar_url: 'https://placehold.co/100x100/111827/03dac6?text=SIM',
            time_in_stage: 'ahora',
            created_at: '2026-05-30',
            assigned_to: 'advisor-vendedora-uuid',
            delivery_date: '',
            observations: 'Lead de simulación cerrado para pruebas internas de la IA.',
            attachments: [],
            activity_log: [
                { time: 'Ahora', author: 'Sistema', content: 'Lead de simulador IA inicializado.' }
            ],
            tags: [
                { name: 'Nuevo', color: '#03DAC6' }
            ]
        },
        {
            id: 'lead-1',
            name: 'Cliente Anónimo',
            phone: '+573115551234',
            channel_source: 'whatsapp',
            ai_chat_status: 'ai_active',
            commercial_stage: 'nuevo',
            estimated_budget: 2500000.00,
            quoted_value: 0.00,
            avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100',
            time_in_stage: 'hace 2h',
            created_at: '2026-05-28',
            assigned_to: 'advisor-vendedora-uuid',
            delivery_date: '',
            observations: '',
            attachments: [],
            activity_log: [
                { time: 'Hace 2h', author: 'n8n AI', content: 'Lead creado e indexado desde WhatsApp Cloud API.' }
            ],
            tags: [
                { name: 'Alta Prioridad', color: 'var(--neon-green)' }, // Verde
                { name: 'Nuevo', color: '#03DAC6' } // Cian
            ]
        },
        {
            id: 'lead-2',
            name: 'María Rodríguez',
            phone: '+573004445678',
            channel_source: 'instagram',
            ai_chat_status: 'ai_active',
            commercial_stage: 'nuevo',
            unread: true,
            estimated_budget: 0.00,
            quoted_value: 0.00,
            avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100',
            time_in_stage: 'hace 1d',
            created_at: '2026-05-29',
            assigned_to: 'advisor-vendedora-uuid',
            delivery_date: '',
            observations: '',
            attachments: [],
            activity_log: [
                { time: 'Hace 1d', author: 'n8n AI', content: 'Lead creado e indexado desde Instagram Direct.' }
            ],
            tags: [
                { name: 'Nuevo', color: '#03DAC6' } // Cian
            ]
        },

        {
            id: 'lead-4',
            name: 'Andrés Mendoza',
            phone: '+573127778899',
            channel_source: 'whatsapp',
            ai_chat_status: 'ai_active',
            commercial_stage: 'cotizado',
            estimated_budget: 0.00,
            quoted_value: 1800000.00,
            avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100',
            time_in_stage: 'hace 9d',
            created_at: '2026-05-20',
            assigned_to: 'advisor-vendedora-uuid',
            delivery_date: '',
            observations: 'Andrés cotizó un Escritorio Home Office Roble.',
            attachments: [],
            activity_log: [
                { time: 'Hace 9d', author: 'Sistema', content: 'Presupuesto cotizado por $1.8M COP.' }
            ],
            tags: [
                { name: 'Seguimiento', color: '#BB86FC' }
            ]
        },
        {
            id: 'lead-5',
            name: 'Liliana Gomez',
            phone: '+573152223344',
            channel_source: 'instagram',
            ai_chat_status: 'human_paused',
            commercial_stage: 'ganado',
            estimated_budget: 0.00,
            quoted_value: 3200000.00,
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100',
            time_in_stage: 'hace 2d',
            created_at: '2026-05-27',
            assigned_to: 'advisor-vendedora-uuid',
            delivery_date: '2026-06-03', // 5 días exactos de hoy (29 Mayo)
            observations: 'Mesa de centro y estantes flotantes. Despacho programado para el 3 de Junio.',
            attachments: [],
            activity_log: [
                { time: 'Hace 2d', author: 'Vendedora', content: 'Venta cerrada y abonada.' }
            ],
            tags: [
                { name: 'Conversión', color: 'var(--neon-magenta)' }
            ]
        },
        {
            id: 'lead-6',
            name: 'Jorge Valenzuela',
            phone: '+573105556677',
            channel_source: 'whatsapp',
            ai_chat_status: 'human_paused',
            commercial_stage: 'ganado',
            estimated_budget: 0.00,
            quoted_value: 1500000.00,
            avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=100&h=100',
            time_in_stage: 'hace 8d',
            created_at: '2026-05-21',
            assigned_to: 'advisor-vendedora-uuid',
            delivery_date: '2026-05-29', // Vence hoy! (29 Mayo)
            observations: 'Silla Ergonómica Premium. Despacho prioritario hoy.',
            attachments: [],
            activity_log: [
                { time: 'Hace 8d', author: 'n8n AI', content: 'Intención de compra registrada.' }
            ],
            tags: [
                { name: 'Conversión', color: 'var(--neon-magenta)' }
            ]
        },
        {
            id: 'lead-7',
            name: 'Patricia Restrepo',
            phone: '+573183334455',
            channel_source: 'tiktok',
            ai_chat_status: 'human_paused',
            commercial_stage: 'ganado',
            estimated_budget: 0.00,
            quoted_value: 5200000.00,
            avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100&h=100',
            time_in_stage: 'hace 49d',
            created_at: '2026-04-10', // Período anterior (Mes pasado)
            assigned_to: 'advisor-vendedora-uuid',
            delivery_date: '2026-04-20',
            observations: 'Sofá Nórdico de 3 puestos y poltrona de cuero Oxford.',
            attachments: [],
            activity_log: [
                { time: 'Hace 49d', author: 'Vendedora', content: 'Venta cerrada y entregada el mes pasado.' }
            ],
            tags: [
                { name: 'Conversión', color: 'var(--neon-magenta)' }
            ]
        },
        {
            id: 'lead-8',
            name: 'Sofía Medina',
            phone: '+573146667788',
            channel_source: 'messenger',
            ai_chat_status: 'ai_active',
            commercial_stage: 'perdido',
            estimated_budget: 900000.00,
            quoted_value: 0.00,
            avatar_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=100&h=100',
            time_in_stage: 'hace 19d',
            created_at: '2026-05-10',
            assigned_to: 'advisor-ia-uuid',
            delivery_date: '',
            observations: 'Cliente buscaba mueble económico pero no se ajustaba al catálogo disponible.',
            attachments: [],
            activity_log: [
                { time: 'Hace 19d', author: 'Sistema', content: 'Marcar lead como perdido.' }
            ],
            tags: [
                { name: 'Pendiente', color: '#FFAB40' }
            ]
        }
    ];

    // Catálogo de Productos (product_cache universal) con soporte multi-plataforma
    const productCache = [
        {
            id: 'prod-1',
            platform: 'woocommerce',
            external_id: '304',
            title: 'Sofá Nórdico Escandinavo',
            price: 2200000.00,
            stock: 'instock',
            description: 'Sofá de 3 puestos nórdico con patas de madera clara de roble. Tapizado en lino gris claro antimanchas.',
            img: 'https://muebleo.spoke-ia.com/wp-content/uploads/sofa-nordico.jpg'
        },
        {
            id: 'prod-2',
            platform: 'woocommerce',
            external_id: '305',
            title: 'Comedor Industrial Minimalista',
            price: 3800000.00,
            stock: 'instock',
            description: 'Mesa de comedor de 6 puestos hecha de madera maciza de pino recuperado con base metálica negra industrial.',
            img: 'https://muebleo.spoke-ia.com/wp-content/uploads/comedor-industrial.jpg'
        },
        {
            id: 'prod-3',
            platform: 'shopify',
            external_id: 'shop_9921',
            title: 'Lámpara de Pie Vintage Cobre',
            price: 450000.00,
            stock: 'instock',
            description: 'Lámpara de pie de brazo ajustable de metal con acabado en cobre cepillado estilo vintage.',
            img: 'https://muebleo.spoke-ia.com/wp-content/uploads/lampara-vintage.jpg'
        },
        {
            id: 'prod-4',
            platform: 'shopify',
            external_id: 'shop_7741',
            title: 'Escritorio Home Office Roble',
            price: 1200000.00,
            stock: 'outofstock',
            description: 'Escritorio con cajones flotantes de madera de roble y estructura de acero reforzado.',
            img: 'https://muebleo.spoke-ia.com/wp-content/uploads/escritorio-roble.jpg'
        },
        {
            id: 'prod-5',
            platform: 'vtex',
            external_id: 'vtex_0093',
            title: 'Poltrona de Cuero Oxford',
            price: 1800000.00,
            stock: 'instock',
            description: 'Poltrona clásica tapizada en cuero genuino color marrón oxford con capitoné hecho a mano.',
            img: 'https://placehold.co/100x100/1e293b/00e676?text=Poltrona'
        },
        {
            id: 'prod-6',
            platform: 'magento',
            external_id: 'mag_4889',
            title: 'Mesa de Centro Rústica',
            price: 850000.00,
            stock: 'instock',
            description: 'Mesa de centro baja de madera maciza envejecida con patas en cruz de hierro forjado.',
            img: 'https://placehold.co/100x100/1e293b/00e676?text=Mesa'
        },
        {
            id: 'prod-7',
            platform: 'tiendanube',
            external_id: 'nube_2210',
            title: 'Estante Flotante Asimétrico',
            price: 320000.00,
            stock: 'instock',
            description: 'Estante de pared de diseño contemporáneo asimétrico hecho en melamina con acabado tipo nogal.',
            img: 'https://placehold.co/100x100/1e293b/00e676?text=Estante'
        },
        {
            id: 'prod-8',
            platform: 'custom_api',
            external_id: 'custom_888',
            title: 'Silla Ergonómica Premium Office',
            price: 1500000.00,
            stock: 'instock',
            description: 'Silla ergonómica de oficina con soporte lumbar ajustable 3D, reposacabezas y malla antitranspirante de alta resistencia.',
            img: 'https://placehold.co/100x100/1e293b/00e676?text=Silla'
        }
    ];

    // Historial de Chats para Inbox
    let chatsHistory = {

        'lead-1': [
            { sender: 'customer', content: 'Hola, busco un sofá compacto.', time: '11:15 AM' },
            { sender: 'ai', content: '¡Hola! Te recomiendo nuestro Sofá Nórdico de 3 puestos, es ideal para apartamentos pequeños y está tapizado en lino gris claro.', time: '11:16 AM' }
        ],
        'lead-2': [
            { sender: 'customer', content: 'Hola, ¿tienen stock de lámparas vintage?', time: 'Ayer' },
            { sender: 'ai', content: '¡Hola María! Sí, contamos con la Lámpara de Pie Vintage Cobre a $450,000 COP.', time: 'Ayer' }
        ]
    };

    const channelSVGs = {
        whatsapp: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NDggNTEyIj48cGF0aCBmaWxsPSIjMjVEMzY2IiBkPSJNMzgwLjkgOTcuMUMzMzkgNTUuMSAyODMuMiAzMiAyMjMuOSAzMmMtMTIyLjQgMC0yMjIgOTkuNi0yMjIgMjIyIDAgMzkuMSAxMC4yIDc3LjMgMjkuNiAxMTFMMy4yIDQ5NmwxMzMuOS0zNS4xYzMyLjcgMTcuOCA2OS40IDI3LjIgMTA2LjcgMjcuMiAxMjIuNCAwIDIyMi05OS42IDIyMi0yMjIgMC01OS4zLTIzLTExNS4xLTY1LTE1Ny4xek0yMjMuOSA0NDUuNWMtMzMuMiAwLTY1LjctOC45LTk0LTI1LjdsLTYuNy00LTc5LjggMjAuOSAyMS4zLTc3LjgtNC40LTdjLTE4LjUtMjkuNC0yOC4yLTYzLjMtMjguMi05OC4yIDAtMTAxLjcgODIuOC0xODQuNSAxODQuNi0xODQuNSA0OS4zIDAgOTUuNiAxOS4yIDEzMC40IDU0LjEgMzQuOCAzNC45IDU2LjIgODEuMiA1Ni4xIDEzMC41IDAgMTAxLjgtODQuOSAxODQuNy0xODYuNiAxODQuN3ptMTAxLjItMTM4LjJjLTUuNS0yLjgtMzIuOC0xNi4yLTM3LjktMTgtNS4xLTEuOS04LjgtMi44LTEyLjUgMi44LTMuNyA1LjYtMTQuMyAxOC0xNy42IDIxLjgtMy4yIDMuNy02LjUgNC4yLTEyIDEuNC0zMi42LTE2LjMtNTQtMjkuMS03NS41LTY2LTUuNy05LjggNS43LTkuMSAxNi4zLTMwLjMgMS44LTMuNy45LTYuOS0uNS05LjctMS40LTIuOC0xMi41LTMwLjEtMTcuMS00MS4yLTQuNS0xMC44LTkuMS05LjUtMTIuNS05LjUtMy4yLS4yLTYuOS0uMi0xMC42LS4yLTMuNyAwLTkuNyAxLjQtMTQuOCA2LjktNS4xIDUuNi0xOS40IDE5LTE5LjQgNDYuMyAwIDI3LjMgMTkuOSA1My43IDIyLjYgNTcuNCAyLjggMy43IDM5LjEgNTkuNyA5NC44IDgzLjggMzUuMiAxNS4yIDQ5IDE2LjUgNjYuNiAxMy45IDEwLjctMS42IDMyLjgtMTMuNCAzNy40LTI2LjQgNC42LTEzIDQuNi0yNC4xIDMuMi0yNi40LTEuMy0yLjUtNS0zLjktMTAuNS02LjZ6Ii8+PC9zdmc+',
        tiktok: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NDggNTEyIj48cGF0aCBmaWxsPSIjMDAwMDAwIiBkPSJNNDQ4IDIwOS45YTIxMCAyMTAgMCAwIDEtMTIyLjgtMzkuM3YxNzguN2ExNjIuNiAxNjIuNiAwIDEgMS0yMjUtMTUwYzUuNy0uOCAxMS42LTEuMyAxNy40LTEuM0ExNjMuOCAxNjMuOCAwIDAgMSAxODQgMjA2djgxLjFhODEuNCA4MS40IDAgMSAwLTY2LjMgNzkuOGMzLjguNCA3LjYuNiAxMS40LjZhODEuMiA4MS4yIDAgMCAwIDgxLjItODEuMnYtMjg1aDg1LjVjLjIgMzcuOSAyMy4zIDcxIDU4LjcgODQuMnY4MS4xYTEyNi44IDEyNi44IDAgMCAwLTM4LjMtNi4yYy0zLjEgMC02LjIuMi05LjMuNXY4MS4xYTIwOS44IDIwOS44IDAgMCAxIDE1Mi45IDIwMS4yeiIvPjwvc3ZnPg==',
        webchat: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBmaWxsPSIjMDZCNkQ0IiBkPSJNMjU2IDMyQzEyMC4xIDMyIDEyIDEyMC4xIDEyIDI1NmMwIDYwLjYgMjIgMTE2IDU4LjcgMTU4LjdMMzIgNDgwbDY1LjMtMzguN0MyNTYuNSA0NzcuMyAzNTcuOSA0NTIuMyA0MzUgMzkwLjcgNDgzLjMgMzM4IDUxMiAyOTcuNiA1MTIgMjU2IDUxMiAxMjAuMSA0MDMuOSAzMiAyNTYgMzJ6bTAgMzg0Yy05Mi44IDAtMTY4LTU3LjMtMTY4LTEyOHM3NS4yLTEyOCAxNjgtMTI4IDE2OCA1Ny4zIDE2OCAxMjgtNzUuMiAxMjgtMTY4IDEyOHoiLz48L3N2Zz4=',
        messenger: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBmaWxsPSIjMDA4NEZGIiBkPSJNMjU2IDhDMTE5IDggOCAxMTAuMyA4IDI0OC42YzAgNzIuMyAyOS43IDEzNC44IDc4LjMgMTc3LjkgOC40IDcuNSA2LjYgMTEuOSA4IDU4LjIgMS40IDQ2LjQgMjIuOSAyMS42IDMwLjggMTUuNGw0MC4yLTMxLjZjMjYuNyA3LjUgNTUuNiAxMS43IDg1LjIgMTEuNyAxNDAgMCAyNDguNi0xMDIuMyAyNDguNi0yNDAuNkM1MDUuMSAxMTAuMyAzOTYuNiA4IDI1NiA4em0zOC4yIDMwNi45bC01OC4yLTYyLjEtMTEzLjYgNjIuMSAxMjUuMS0xMzIuOCA1OS4yIDYyLjEgMTEyLjYtNjIuMS0xMjUuMSAxMzIuOHoiLz48L3N2Zz4=',
        instagram: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NDggNTEyIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9ImlnLWdyYWQiIGN4PSIyMCUiIGN5PSIxMDAlIiByPSIxNTAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZmRmNDk3Ii8+PHN0b3Agb2Zmc2V0PSI1JSIgc3RvcC1jb2xvcj0iI2ZkZjQ5NyIvPjxzdG9wIG9mZnNldD0iNDUlIiBzdG9wLWNvbG9yPSIjZmQ1OTQ5Ii8+PHN0b3Agb2Zmc2V0PSI2MCUiIHN0b3AtY29sb3I9IiNkNjI0OWYiLz48c3RvcCBvZmZzZXQ9IjkwJSIgc3RvcC1jb2xvcj0iIzI4NWFlYiIvPjwvcmFkaWFsR3JhZGllbnQ+PC9kZWZzPjxwYXRoIGZpbGw9InVybCgjaWctZ3JhZCkiIGQ9Ik0yMjQuMSAxNDFjLTYzLjYgMC0xMTQuOSA1MS4zLTExNC45IDExNC45czUxLjMgMTE0LjkgMTE0LjkgMTE0LjlTMzM5IDMxOS41IDMzOSAyNTUuOVMyODcuNyAxNDEgMjI0LjEgMTQxem0wIDE4OS42Yy00MS4xIDAtNzQuNy0zMy41LTc0LjctNzQuN3MzMy41LTc0LjcgNzQuNy03NC43IDc0LjcgMzMuNSA3NC43IDc0LjdzLTMzLjYgNzQuNy03NC43IDc0Ljd6bTE0Ni40LTE5NC4zYzAgMTQuOS0xMiAyNi44LTI2LjggMjYuOC0xNC45IDAtMjYuOC0xMi0yNi44LTI2LjhzMTItMjYuOCAyNi44LTI2LjggMjYuOCAxMiAyNi44IDI2Ljh6bTc2LjEgMjcuMmMtMS43LTM1LjktOS45LTY3LjctMzYuMi05My45LTI2LjItMjYuMi01OC0zNC40LTkzLjktMzYuMi0zNy0yLjEtMTQ3LjktMi4xLTE4NC45IDAtMzUuOCAxLjctNjcuNiA5LjktOTMuOSAzNi4xcy0zNC40IDU4LTM2LjIgOTMuOWMtMi4xIDM3LTIuMSAxNDcuOSAwIDE4NC45IDEuNyAzNS45IDkuOSA2Ny43IDM2LjIgOTMuOXM5OCAzNC45IDkzLjkgMzYuMmMzNyAyLjEgMTQ3LjkgMi4xIDE4NC45IDAgMzUuOS0xLjcgNjcuNy05LjkgOTMuOS0zNi4yIDI2LjItMjYuMiAzNC40LTU4IDM2LjItOTMuOSAyLjEtMzcgMi4xLTE0Ny44IDAtMTg0Ljh6TTM5OC44IDM4OGMtNy44IDE5LjYtMjIuOSAzNC43LTQyLjYgNDIuNi0yOS41IDExLjctOTkuNSA5LTEzMi4xIDlzLTEwMi43IDIuNi0xMzIuMS05Yy0xOS42LTcuOC0zNC43LTIyLjktNDIuNi00Mi42LTExLjctMjkuNS05LTk5LjUtOS0xMzIuMXMtMi42LTEwMi43IDktMTMyLjFjNy44LTE5LjYgMjIuOS0zNC43IDQyLjYtNDIuNiAyOS41LTExLjcgOTkuNS05IDEzMi4xLTlzMTAyLjctMi42IDEzMi4xIDljMTkuNiA3LjggMzQuNyAyMi45IDQyLjYgNDIuNiAxMS43IDI5LjUgOSA5OS41IDkgMTMyLjFzLTIuNyAxMDIuNy05IDEzMi4xeiIvPjwvc3ZnPg=='
    };


    function getChannelSVGHTML(channel, size = '16px') {
        if (!channel) return `<i class="fa-solid fa-circle"></i>`;
        const cleanChannel = channel.toLowerCase().trim();
        if (cleanChannel === 'whatsapp') {
            return `<i class="fa-brands fa-whatsapp" style="color: #25D366; font-size: ${size};"></i>`;
        } else if (cleanChannel === 'messenger') {
            return `<i class="fa-brands fa-facebook-messenger" style="color: #0084FF; font-size: ${size};"></i>`;
        } else if (cleanChannel === 'instagram') {
            return `<i class="fa-brands fa-instagram" style="color: #E1306C; font-size: ${size};"></i>`;
        } else if (cleanChannel === 'tiktok') {
            return `<i class="fa-brands fa-tiktok" style="color: #000000; font-size: ${size};"></i>`;
        } else if (cleanChannel === 'webchat') {
            return `<i class="fa-solid fa-comments" style="color: #06B6D4; font-size: ${size};"></i>`;
        }
        return `<i class="fa-solid fa-circle"></i>`;
    }

    // ----------------------------------------------------------------------
    // 2. Lógica de Autenticación y Registro (Login Seguro - V3.0)
    // ----------------------------------------------------------------------
    const loginScreen = document.getElementById('login-screen');
    const crmLayout = document.getElementById('crm-layout');

    // Ocultar contenedores de inmediato para evitar destellos (Race Condition)
    if (loginScreen) {
        loginScreen.classList.add('hidden');
        loginScreen.style.setProperty('display', 'none', 'important');
    }
    if (crmLayout) {
        crmLayout.classList.add('hidden');
        crmLayout.style.setProperty('display', 'none', 'important');
    }

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    const loginEmailInput = document.getElementById('login-email');
    const loginPasswordInput = document.getElementById('login-password');
    const loginErrorMsg = document.getElementById('login-error-msg');

    const regNameInput = document.getElementById('reg-name');
    const regEmailInput = document.getElementById('reg-email');
    const regPasswordInput = document.getElementById('reg-password');
    const regPhotoInput = document.getElementById('reg-photo');
    const registerErrorMsg = document.getElementById('register-error-msg');

    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');

    const agentDisplayName = document.getElementById('agent-display-name');
    const dashboardWelcome = document.getElementById('dashboard-welcome');
    const logoutBtn = document.getElementById('logout-btn');

    // Enlace "¿Olvidaste tu contraseña?" — Envío de correo de recuperación
    const linkForgotPassword = document.getElementById('link-forgot-password');
    if (linkForgotPassword) {
        linkForgotPassword.addEventListener('click', async (e) => {
            e.preventDefault();
            const emailVal = loginEmailInput ? loginEmailInput.value.trim() : '';
            if (!emailVal) {
                alert('Por favor, ingresa tu correo electrónico en el campo de arriba y luego haz clic aquí.');
                if (loginEmailInput) loginEmailInput.focus();
                return;
            }
            try {
                const { error } = await supabaseClient.auth.resetPasswordForEmail(emailVal, {
                    redirectTo: window.location.origin + window.location.pathname
                });
                if (error) throw error;
                alert('📧 ¡Revisa tu bandeja de entrada! Te hemos enviado un enlace para restablecer tu contraseña.');
            } catch (err) {
                console.error('Error enviando correo de recuperación:', err);
                alert('Hubo un error al enviar el correo: ' + err.message);
            }
        });
    }

    // Cambiar entre pestañas
    if (tabLogin && tabRegister && loginForm && registerForm) {
        tabLogin.addEventListener('click', () => {
            tabLogin.classList.add('active');
            tabRegister.classList.remove('active');
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
            if (loginErrorMsg) loginErrorMsg.classList.add('hidden');
        });

        tabRegister.addEventListener('click', () => {
            tabRegister.classList.add('active');
            tabLogin.classList.remove('active');
            registerForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
            if (registerErrorMsg) registerErrorMsg.classList.add('hidden');
        });
    }

    // Comprobar si ya existe sesión activa en sessionStorage (Desactivado legacy)
    function checkAuth() {
        // Obsoleto, la autenticación ahora es manejada por el flujo de Supabase y cambiarPantallaSegunSesion
    }

    // ⚡ PROMISE CACHE: Garantía de petición única a Supabase durante la carga inicial.
    // Múltiples módulos (Inbox, Kanban, Dashboard) pueden invocar esta función
    // simultáneamente durante la inicialización. Sin este cache, cada invocación
    // dispara un GET independiente a chat_history, activando el Rate Limit de
    // Cloudflare/Supabase y causando ERR_CONNECTION_RESET en Chromium.
    let fetchHistorialPromise = null;

    async function cargarConversacionesDesdeSupabase() {
        // Si ya hay una petición en vuelo, reutilizarla (Promise Cache / Singleton)
        if (fetchHistorialPromise) {
            console.log('📦 [Promise Cache] Reutilizando petición en vuelo a chat_history (0 peticiones de red adicionales).');
            return fetchHistorialPromise;
        }

        // Crear la promesa singleton y almacenarla
        fetchHistorialPromise = (async () => {
            try {
                console.log('🔄 [Red] Cargando conversaciones e historial desde Supabase (petición única)...');
                const { data: messages, error } = await supabaseClient
                    .from('chat_history')
                    .select('*')
                    .order('created_at', { ascending: true });

                if (error) throw error;
                console.log(`✅ [Red] Historial descargado: ${messages ? messages.length : 0} mensajes. Distribuyendo a componentes de UI...`);

                if (messages && messages.length > 0) {
                    const grouped = {};
                    messages.forEach(msg => {
                        if (!grouped[msg.lead_id]) {
                            grouped[msg.lead_id] = [];
                        }
                        grouped[msg.lead_id].push(msg);
                    });

                    for (const leadId in grouped) {
                        const leadMsgs = grouped[leadId];

                        chatsHistory[leadId] = leadMsgs.map(msg => {
                            let timeStr = 'Ahora';
                            if (msg.created_at) {
                                try {
                                    const date = new Date(msg.created_at);
                                    timeStr = date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
                                } catch (e) { }
                            }

                            const item = {
                                sender: msg.sender,
                                content: msg.content,
                                time: timeStr
                            };

                            if (msg.type === 'carousel') {
                                item.type = 'carousel';
                                item.products = msg.products_data;
                            }
                            return item;
                        });

                        const exists = leadsList.some(l => l.id === leadId);
                        if (!exists && leadId !== 'lead-simulador-ia') {
                            let createdAtStr = new Date().toISOString().split('T')[0];
                            if (leadMsgs[0] && leadMsgs[0].created_at) {
                                try {
                                    createdAtStr = new Date(leadMsgs[0].created_at).toISOString().split('T')[0];
                                } catch (e) { }
                            }

                            const lastMsg = leadMsgs[leadMsgs.length - 1];
                            const isUnread = lastMsg && (lastMsg.sender === 'customer' || lastMsg.sender === 'user');

                            const newLead = {
                                id: leadId,
                                name: `Visitante Web (${leadId.replace('visitor-', '')})`,
                                phone: '',
                                channel_source: 'webchat',
                                ai_chat_status: 'ai_active',
                                commercial_stage: 'nuevo',
                                unread: isUnread,
                                estimated_budget: 0.00,
                                quoted_value: 0.00,
                                avatar_url: 'https://placehold.co/100x100/1e293b/06B6D4?text=WEB',
                                time_in_stage: 'ahora',
                                created_at: createdAtStr,
                                assigned_to: (typeof getCurrentAgent === 'function' ? getCurrentAgent().uuid : 'advisor-vendedora-uuid'),
                                delivery_date: '',
                                observations: 'Lead cargado dinámicamente desde Supabase.',
                                attachments: [],
                                activity_log: [
                                    { time: 'Ahora', author: 'Sistema', content: 'Lead recuperado desde el historial de Supabase.' }
                                ],
                                tags: [
                                    { name: 'Nuevo', color: '#03DAC6' }
                                ]
                            };
                            leadsList.unshift(newLead);
                        }
                    }

                    if (typeof renderInbox === 'function') renderInbox();
                    if (typeof renderKanban === 'function') renderKanban();
                    if (typeof renderDashboardStats === 'function') renderDashboardStats();
                }

                // Suscribirse a tiempo real (solo una vez, Realtime se encarga de los nuevos mensajes)
                suscribirseAMensajesRealtime();
            } catch (e) {
                console.error('❌ Error al cargar conversaciones desde Supabase:', e.message);
                // Limpiar la promesa en caso de error para permitir reintentos futuros
                fetchHistorialPromise = null;
                throw e;
            }
        })();

        return fetchHistorialPromise;
    }

    function suscribirseAMensajesRealtime() {
        if (typeof window.supabaseClient.channel !== 'function') {
            console.warn("⚠️ window.supabaseClient.channel no está disponible (puede ser un mock de pruebas).");
            return;
        }

        if (window.supabaseRealtimeChannel) {
            try {
                window.supabaseClient.removeChannel(window.supabaseRealtimeChannel);
            } catch (err) {
                console.warn("Error al remover canal existente:", err.message);
            }
        }

        console.log("🔌 Inicializando suscripción en tiempo real para chat_history...");
        window.supabaseRealtimeChannel = window.supabaseClient
            .channel('chat-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_history'
                },
                (payload) => {
                    console.log('📬 Nuevo mensaje recibido en tiempo real:', payload);
                    const newMsg = payload.new;
                    if (!newMsg) return;

                    const leadId = newMsg.lead_id;

                    // 1. Agrega el mensaje dinámicamente al objeto global chatsHistory
                    if (!chatsHistory[leadId]) {
                        chatsHistory[leadId] = [];
                    }

                    let timeStr = 'Ahora';
                    if (newMsg.created_at) {
                        try {
                            const date = new Date(newMsg.created_at);
                            timeStr = date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
                        } catch (e) { }
                    }

                    const item = {
                        sender: newMsg.sender,
                        content: newMsg.content,
                        time: timeStr
                    };

                    if (newMsg.type) {
                        item.type = newMsg.type;
                    }

                    if (newMsg.products_data) {
                        if (newMsg.type === 'carousel') {
                            item.products = newMsg.products_data;
                        } else {
                            Object.assign(item, newMsg.products_data);
                            if (newMsg.type === 'image' && !item.imgUrl) {
                                item.imgUrl = newMsg.products_data.mediaUrl || newMsg.content;
                            }
                            if (newMsg.type === 'file' && !item.fileName) {
                                item.fileName = newMsg.products_data.fileName || newMsg.content;
                            }
                            if (newMsg.type === 'audio' && !item.audioUrl) {
                                item.audioUrl = newMsg.products_data.mediaUrl || newMsg.products_data.audioUrl;
                            }
                        }
                    }

                    // Evitar duplicados (por ejemplo, si el cliente local que envió el mensaje ya lo agregó de forma optimista)
                    const leadHistory = chatsHistory[leadId];
                    const isDuplicate = leadHistory.length > 0 &&
                        leadHistory[leadHistory.length - 1].sender === item.sender &&
                        leadHistory[leadHistory.length - 1].content === item.content;

                    if (!isDuplicate) {
                        leadHistory.push(item);
                    }

                    // 2. Si el visitante es nuevo y su ID no existe en leadsList, crea dinámicamente el objeto Lead
                    const exists = leadsList.some(l => l.id === leadId);
                    if (!exists && leadId !== 'lead-simulador-ia') {
                        let createdAtStr = new Date().toISOString().split('T')[0];
                        if (newMsg.created_at) {
                            try {
                                createdAtStr = new Date(newMsg.created_at).toISOString().split('T')[0];
                            } catch (e) { }
                        }
                        const isUnread = newMsg.sender === 'customer' || newMsg.sender === 'user';
                        const newLead = {
                            id: leadId,
                            name: `Visitante Web (${leadId.replace('visitor-', '')})`,
                            phone: '',
                            channel_source: 'webchat',
                            ai_chat_status: 'ai_active',
                            commercial_stage: 'nuevo',
                            unread: isUnread,
                            estimated_budget: 0.00,
                            quoted_value: 0.00,
                            avatar_url: 'https://placehold.co/100x100/1e293b/06B6D4?text=WEB',
                            time_in_stage: 'ahora',
                            created_at: createdAtStr,
                            assigned_to: (typeof getCurrentAgent === 'function' ? getCurrentAgent().uuid : 'advisor-vendedora-uuid'),
                            delivery_date: '',
                            observations: 'Lead creado dinámicamente vía WebSockets.',
                            attachments: [],
                            activity_log: [
                                { time: 'Ahora', author: 'Sistema', content: 'Lead creado por mensaje recibido en tiempo real.' }
                            ],
                            tags: [
                                { name: 'Nuevo', color: '#03DAC6' }
                            ]
                        };
                        leadsList.unshift(newLead);
                        if (newMsg.sender === 'customer' || newMsg.sender === 'user') {
                            window.playSpokeSound('new_lead');
                        }
                    } else if (exists) {
                        // Si el lead existe y el mensaje no es del asesor y no pertenece al chat activo, marcar como no leído
                        const lead = leadsList.find(l => l.id === leadId);
                        if (lead && leadId !== activeInboxLeadId && (newMsg.sender === 'customer' || newMsg.sender === 'user')) {
                            lead.unread = true;
                        }
                        if (newMsg.sender === 'customer' || newMsg.sender === 'user') {
                            window.playSpokeSound('new_message');
                        }
                    }

                    // 3. Dispara renderInbox() para actualizar la barra lateral
                    if (typeof renderInbox === 'function') {
                        renderInbox();
                    }

                    // 4. Si el lead_id coincide con el chat abierto actualmente, dispara renderActiveChat()
                    if (leadId === activeInboxLeadId) {
                        if (typeof renderActiveChat === 'function') {
                            renderActiveChat();
                        }
                    }
                }
            )
            .subscribe((status) => {
                console.log(`🔌 Estado de la suscripción Realtime: ${status}`);
            });
    }

    function updatePresenceUI(status) {
        const dot = document.getElementById('agent-status-dot');
        if (!dot) return;
        if (status === 'active') {
            dot.className = 'status-indicator online';
            dot.style.backgroundColor = 'var(--neon-green)';
            dot.style.boxShadow = '0 0 6px var(--neon-green)';
        } else {
            dot.className = 'status-indicator away';
            dot.style.backgroundColor = 'var(--text-muted)';
            dot.style.boxShadow = 'none';
        }
    }

    const presenceSelect = document.getElementById('agent-presence-select');
    if (presenceSelect) {
        presenceSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            localStorage.setItem('spoke_presence', val);
            updatePresenceUI(val);
        });
    }
    // Procesar envío de Login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginEmailInput.value.trim();
            const password = loginPasswordInput.value;

            try {
                const { data, error } = await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });

                if (error) {
                    console.error("Supabase login falló:", error.message);
                    if (loginErrorMsg) {
                        loginErrorMsg.textContent = "Error al iniciar sesión: " + error.message;
                        loginErrorMsg.classList.remove('hidden');
                    }
                    return;
                }

                console.log("Sesión de Supabase iniciada exitosamente.");
                if (loginEmailInput) loginEmailInput.value = '';
                if (loginPasswordInput) loginPasswordInput.value = '';
                if (loginErrorMsg) loginErrorMsg.classList.add('hidden');

                cambiarPantallaSegunSesion(data.session);
            } catch (err) {
                console.error("Error durante login:", err.message);
                if (loginErrorMsg) {
                    loginErrorMsg.textContent = "Error inesperado durante login.";
                    loginErrorMsg.classList.remove('hidden');
                }
            }
        });
    }

    // Procesar envío de Registro
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = regNameInput.value.trim();
            const email = regEmailInput.value.trim();
            const password = regPasswordInput.value;
            const photoFile = regPhotoInput.files[0];

            async function saveAndLogin(photoBase64) {
                // Registrar en Supabase Auth 100%
                try {
                    const { data, error } = await supabaseClient.auth.signUp({
                        email: email,
                        password: password,
                        options: {
                            data: {
                                name: name,
                                avatar_url: photoBase64
                            }
                        }
                    });

                    if (error) {
                        if (registerErrorMsg) {
                            registerErrorMsg.textContent = 'Error al registrar: ' + error.message;
                            registerErrorMsg.classList.remove('hidden');
                        }
                        return;
                    }

                    // Limpiar campos
                    regNameInput.value = '';
                    regEmailInput.value = '';
                    regPasswordInput.value = '';
                    regPhotoInput.value = '';
                    if (registerErrorMsg) registerErrorMsg.classList.add('hidden');

                    alert('Registro exitoso. Si es necesario, verifica tu correo. Ahora puedes iniciar sesión.');

                    // Ir a la pestaña de login
                    if (tabLogin) tabLogin.click();

                } catch (signUpErr) {
                    console.error("Supabase signUp error:", signUpErr.message);
                    if (registerErrorMsg) {
                        registerErrorMsg.textContent = 'Error inesperado durante el registro.';
                        registerErrorMsg.classList.remove('hidden');
                    }
                }
            }

            if (photoFile) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    saveAndLogin(event.target.result);
                };
                reader.onerror = () => {
                    if (registerErrorMsg) {
                        registerErrorMsg.textContent = 'Error al leer el archivo de foto.';
                        registerErrorMsg.classList.remove('hidden');
                    }
                };
                reader.readAsDataURL(photoFile);
            } else {
                // Foto de perfil por defecto si no sube archivo
                const defaultAvatar = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100&h=100';
                saveAndLogin(defaultAvatar);
            }
        });
    }

    // Botón de Cerrar Sesión
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await window.supabaseClient.auth.signOut();
            } catch (signOutErr) {
                console.warn("Supabase signOut error:", signOutErr.message);
            }

            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key && key.startsWith('sb-')) {
                    localStorage.removeItem(key);
                }
            }
            sessionStorage.clear();

            window.location.href = window.location.origin + window.location.pathname;
        });
    }

    // ----------------------------------------------------------------------
    // 3. Navegación Single Page Application (SPA)
    // ----------------------------------------------------------------------
    const menuItems = document.querySelectorAll('.menu-item');
    const sections = document.querySelectorAll('.tab-section');

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');

            // Actualizar menú activo
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Alternar secciones visibles
            sections.forEach(section => {
                if (section.id === targetId) {
                    section.classList.add('active');
                } else {
                    section.classList.remove('active');
                }
            });

            // Recargar datos específicos
            if (targetId === 'view-kanban') {
                renderKanban();
            } else if (targetId === 'view-catalogue') {
                renderCatalogue();
            } else if (targetId === 'view-inbox') {
                renderInbox();
            } else if (targetId === 'view-tags') {
                renderTagsPanel();
            } else if (targetId === 'view-dashboard') {
                renderDashboardStats();
            }
        });
    });

    // ----------------------------------------------------------------------
    // 4. Control de Temas (Día/Noche automático e override manual)
    // ----------------------------------------------------------------------
    const themeBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = themeBtn ? themeBtn.querySelector('i') : null;
    const bodyElement = document.body;

    function applyTheme(theme) {
        // Enforce light mode as per Brandbook Original
        bodyElement.setAttribute('data-theme', 'light');
    }

    // Inicializar el tema corporativo por defecto
    applyTheme('light');

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            applyTheme('light');
        });
    }

    // ----------------------------------------------------------------------
    // 5. Selector E-commerce Agnóstico Universal (Menú Desplegable)
    // ----------------------------------------------------------------------
    const platformSelect = document.getElementById('ecommerce-platform-select');
    const activePlatformName = document.getElementById('active-platform-name');
    const platformStatusBadge = document.getElementById('platform-status-badge');

    const platformColors = {
        all: 'var(--neon-green)',
        woocommerce: '#FF9900',
        shopify: '#96BF48',
        vtex: '#F71963',
        magento: '#F27625',
        tiendanube: '#00B9F2',
        custom_api: '#03DAC6'
    };

    function updatePlatformSelection() {
        if (!platformSelect) return;
        const selectedVal = platformSelect.value;

        // Actualizar textos e identidades visuales según la plataforma
        let displayName = 'Todas';
        if (selectedVal !== 'all') {
            const selectedOption = platformSelect.options[platformSelect.selectedIndex];
            displayName = selectedOption.textContent;
        }

        activePlatformName.textContent = displayName;

        // Cambiar el color neón del badge según la marca seleccionada
        const brandColor = platformColors[selectedVal] || 'var(--neon-green)';
        platformStatusBadge.style.color = brandColor;
        platformStatusBadge.style.borderColor = brandColor;

        renderCatalogue();
    }

    if (platformSelect) {
        platformSelect.addEventListener('change', updatePlatformSelection);
    }

    // ----------------------------------------------------------------------
    // 6. Renderizado del Catálogo (Agnóstico)
    // ----------------------------------------------------------------------
    const productListContainer = document.getElementById('product-cache-list');

    function renderCatalogue() {
        if (!productListContainer) return;
        productListContainer.innerHTML = '';

        const selectedVal = platformSelect ? platformSelect.value : 'all';

        // Filtrar productos
        const filteredProducts = selectedVal === 'all'
            ? productCache
            : productCache.filter(p => p.platform === selectedVal);

        filteredProducts.forEach(prod => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${prod.img}" class="product-img-preview" alt="${prod.title}" onerror="this.src='https://placehold.co/50x50/111/fff?text=Mueble'" /></td>
                <td><code>${prod.external_id}</code></td>
                <td><span class="platform-badge ${prod.platform}">${prod.platform}</span></td>
                <td><strong>${prod.title}</strong></td>
                <td>$${prod.price.toLocaleString('es-CO')} COP</td>
                <td><span class="lead-tag-badge" style="background-color: ${prod.stock === 'instock' ? 'var(--neon-green)' : 'var(--neon-magenta)'}">${prod.stock === 'instock' ? 'En Stock' : 'Agotado'}</span></td>
                <td><p class="product-semantic-desc">${prod.description}</p></td>
            `;
            productListContainer.appendChild(tr);
        });
    }

    // ----------------------------------------------------------------------
    // 7. Renderizado del Tablero Kanban & Acumulados Financieros
    // ----------------------------------------------------------------------
    const tagFilterSelect = document.getElementById('tag-filter');
    const budgetFilterSelect = document.getElementById('budget-filter');
    const periodFilterSelect = document.getElementById('period-filter'); // NUEVO

    const columns = {
        nuevo: document.getElementById('cards-nuevo'),
        seguimiento: document.getElementById('cards-seguimiento'),
        cotizado: document.getElementById('cards-cotizado'),
        ganado: document.getElementById('cards-ganado'),
        perdido: document.getElementById('cards-perdido')
    };

    const counts = {
        nuevo: document.getElementById('count-nuevo'),
        seguimiento: document.getElementById('count-seguimiento'),
        cotizado: document.getElementById('count-cotizado'),
        ganado: document.getElementById('count-ganado'),
        perdido: document.getElementById('count-perdido')
    };

    const totalContainers = {
        nuevo: document.getElementById('total-nuevo'),
        seguimiento: document.getElementById('total-seguimiento'),
        cotizado: document.getElementById('total-cotizado'),
        ganado: document.getElementById('total-ganado'),
        perdido: document.getElementById('total-perdido')
    };

    // Formatear valores financieros cortos (Ej: $4.2M o $350K)
    function formatFinancialValue(val) {
        if (val >= 1000000) {
            return `$${(val / 1000000).toFixed(1)}M COP`;
        } else if (val > 0) {
            return `$${(val / 1000).toFixed(0)}K COP`;
        }
        return '$0.0M COP';
    }

    // Obtener todos los asesores registrados (V3.5)
    function getRegisteredAdvisors() {
        const currentAgent = getCurrentAgent();

        const advisors = [
            { uuid: 'advisor-vendedora-uuid', name: 'Vendedora Activa', photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100&h=100' },
            { uuid: 'advisor-ia-uuid', name: 'Asesor IA', photo: 'https://placehold.co/100x100/111827/03dac6?text=IA' }
        ];

        // Añadir el asesor actual si no es la vendedora por defecto
        if (currentAgent && currentAgent.uuid && currentAgent.uuid !== 'advisor-vendedora-uuid') {
            advisors.push({
                uuid: currentAgent.uuid,
                name: currentAgent.name,
                photo: currentAgent.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100&h=100'
            });
        }

        // Añadir desde usuarios registrados en localStorage
        const registeredUsers = JSON.parse(localStorage.getItem('spoke_registered_users') || '[]');
        registeredUsers.forEach(u => {
            const uuid = u.uuid || 'advisor-' + u.email;
            if (!advisors.some(a => a.uuid === uuid)) {
                advisors.push({
                    uuid: uuid,
                    name: u.name,
                    photo: u.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100&h=100'
                });
            }
        });

        return advisors;
    }

    // Resolver detalles de asignación del asesor
    function resolveAssigneeDetails(assignedToVal) {
        if (assignedToVal === 'tu') {
            assignedToVal = 'advisor-vendedora-uuid';
        } else if (assignedToVal === 'ai') {
            assignedToVal = 'advisor-ia-uuid';
        }

        const advisors = getRegisteredAdvisors();
        const found = advisors.find(a => a.uuid === assignedToVal);
        if (found) {
            return { name: found.name, avatar: found.photo };
        }
        return { name: 'Sin Asignar', avatar: 'https://placehold.co/100x100/111827/6b7280?text=?' };
    }

    // Calcular período según fecha de creación (V2.9.3)
    function getLeadPeriod(createdDateStr) {
        if (!createdDateStr) return 'all';
        const createdDate = new Date(createdDateStr);
        const now = new Date();

        createdDate.setHours(0, 0, 0, 0);
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);

        const diffTime = today - createdDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        const isSameMonth = createdDate.getMonth() === today.getMonth() && createdDate.getFullYear() === today.getFullYear();

        if (diffDays >= 0 && diffDays <= 7) {
            return 'this_week';
        } else if (diffDays > 7 && diffDays <= 14) {
            return 'last_week';
        } else if (isSameMonth) {
            return 'this_month';
        } else {
            return 'prior_months';
        }
    }

    // Verificar fechas de despacho y disparar notificaciones de advertencia (V2.9.3)
    function checkDeliveryDates() {
        if (typeof aiNotifications === 'undefined') return; // Prevenir ejecuciones antes de la inicialización del feed
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        leadsList.forEach(lead => {
            const hasConversionTag = lead.tags.some(t => t.name === 'Conversión');
            if (hasConversionTag && lead.delivery_date) {
                const deliveryDate = new Date(lead.delivery_date);
                deliveryDate.setHours(0, 0, 0, 0);

                const diffTime = deliveryDate - now;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 5) {
                    const msg = `La IA advierte: El lead ${lead.name} está a 5 días de su fecha de despacho (${lead.delivery_date}).`;
                    if (!aiNotifications.some(n => n.message === msg)) {
                        addAINotification('prioridad', msg);
                    }
                } else if (diffDays === 0) {
                    const msg = `La IA advierte: ¡Hoy vence el despacho de ${lead.name}! (${lead.delivery_date})`;
                    if (!aiNotifications.some(n => n.message === msg)) {
                        addAINotification('prioridad', msg);
                    }
                }
            }
        });
    }

    function renderKanban() {
        if (!columns.nuevo) return;

        // Ejecutar chequeo de alertas de despacho antes de realizar cualquier filtrado
        if (typeof checkDeliveryDates === 'function') {
            checkDeliveryDates();
        }

        // Limpiar columnas
        Object.keys(columns).forEach(stage => {
            if (columns[stage]) columns[stage].innerHTML = '';
        });

        // Contadores y Acumuladores de presupuesto por columna
        const counters = { nuevo: 0, seguimiento: 0, cotizado: 0, ganado: 0, perdido: 0 };
        const financialTotals = { nuevo: 0, seguimiento: 0, cotizado: 0, ganado: 0, perdido: 0 };

        const selectedTag = tagFilterSelect.value;
        const selectedBudget = budgetFilterSelect.value;
        const selectedPeriod = periodFilterSelect ? periodFilterSelect.value : 'all'; // NUEVO

        leadsList.forEach(lead => {
            // Aplicar filtros de etiqueta y presupuesto
            const matchesTag = selectedTag === 'all' || lead.tags.some(t => t.name === selectedTag);
            let matchesBudget = true;
            if (selectedBudget === 'high') {
                matchesBudget = lead.estimated_budget > 2000000;
            } else if (selectedBudget === 'low') {
                matchesBudget = lead.estimated_budget > 0 && lead.estimated_budget <= 2000000;
            }

            // Aplicar filtro de período
            let matchesPeriod = true;
            if (selectedPeriod !== 'all') {
                const now = new Date();
                const period = getLeadPeriod(lead.created_at);
                if (selectedPeriod === 'this_week') {
                    matchesPeriod = (period === 'this_week');
                } else if (selectedPeriod === 'last_week') {
                    matchesPeriod = (period === 'last_week');
                } else if (selectedPeriod === 'this_month') {
                    const leadDate = new Date(lead.created_at);
                    matchesPeriod = (leadDate.getMonth() === now.getMonth() && leadDate.getFullYear() === now.getFullYear());
                } else if (selectedPeriod === 'prior_months') {
                    const leadDate = new Date(lead.created_at);
                    matchesPeriod = (leadDate.getFullYear() < now.getFullYear() || (leadDate.getFullYear() === now.getFullYear() && leadDate.getMonth() < now.getMonth()));
                }
            }

            if (!matchesTag || !matchesBudget || !matchesPeriod) return;

            // Incrementar contadores
            const stage = lead.commercial_stage;
            if (counters[stage] !== undefined) {
                counters[stage]++;

                // Sumar al total de la columna (priorizar quoted_value, sino usar estimated_budget)
                const leadValue = lead.quoted_value > 0 ? lead.quoted_value : lead.estimated_budget;
                financialTotals[stage] += leadValue;
            }

            // Comprobar si el despacho vence hoy y tiene la etiqueta de Conversión
            const hasConversionTag = lead.tags.some(t => t.name === 'Conversión');
            let isDeliveryExpired = false;
            if (hasConversionTag && lead.delivery_date) {
                const deliveryDate = new Date(lead.delivery_date);
                deliveryDate.setHours(0, 0, 0, 0);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const diffTime = deliveryDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays === 0) {
                    isDeliveryExpired = true;
                }
            }

            // Crear tarjeta
            const card = document.createElement('div');
            card.className = 'lead-card' + (isDeliveryExpired ? ' delivery-expired' : '');
            card.dataset.id = lead.id;
            card.setAttribute('draggable', 'true');

            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', lead.id);
                card.classList.add('dragging');
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
            });

            let budgetHTML = '';
            if (lead.estimated_budget > 0) {
                budgetHTML = `<div class="lead-budget-badge">$${(lead.estimated_budget / 1000000).toFixed(1)}M COP</div>`;
            } else if (lead.quoted_value > 0) {
                budgetHTML = `<div class="lead-quoted-badge">Cotizado: $${(lead.quoted_value / 1000000).toFixed(1)}M</div>`;
            } else {
                budgetHTML = `<div class="lead-budget-badge" style="background:transparent; border-style:dashed; color:var(--text-muted)">Calculando...</div>`;
            }

            const tagsHTML = (lead.tags || []).map(t => {
                let colorVal = t.color || '#cccccc';
                if (t.name === 'Alta Prioridad') {
                    colorVal = 'var(--neon-green)';
                } else if (typeof colorVal === 'string' && colorVal.startsWith('var(')) {
                    if (colorVal.includes('magenta')) colorVal = '#FF0266';
                    else if (colorVal.includes('purple')) colorVal = '#BB86FC';
                    else if (colorVal.includes('cyan')) colorVal = '#03DAC6';
                    else if (colorVal.includes('orange')) colorVal = '#FFAB40';
                    else if (colorVal.includes('green')) colorVal = '#00E676';
                }
                return `<span class="lead-tag-badge" style="background-color: #000000; color: #FFFFFF; border: 1px solid #000000; box-shadow: none;">${t.name}</span>`;
            }).join('');

            const timeHTML = `<div class="lead-card-time" style="font-size: 11px; color: var(--text-muted); margin-top: 4px;"><i class="fa-regular fa-clock"></i> ${getStageDisplayName(lead.commercial_stage)} &bull; ${lead.time_in_stage}</div>`;

            // Fecha de creación del lead (V2.9.3)
            const creationDateHTML = `<div class="lead-card-created" style="font-size: 10px; color: var(--text-muted); margin-top: 2px;"><i class="fa-regular fa-calendar"></i> Creado: ${lead.created_at || 'Sin fecha'}</div>`;

            const assignedTo = lead.assigned_to || (lead.ai_chat_status === 'ai_active' ? 'advisor-ia-uuid' : 'advisor-vendedora-uuid');
            const assigneeInfo = resolveAssigneeDetails(assignedTo);
            const assigneeHTML = `
                <div class="lead-assignee-avatar-wrapper">
                    <img class="lead-assignee-avatar" src="${assigneeInfo.avatar}" alt="${assigneeInfo.name}" onerror="this.src='https://placehold.co/20/111/fff?text=?'" />
                    <span class="lead-assignee-tooltip">Asignado: ${assigneeInfo.name}</span>
                </div>
            `;

            card.innerHTML = `
                <div class="lead-card-header">
                    <div class="lead-card-avatar-group">
                        <img class="lead-card-avatar" src="${lead.avatar_url}" alt="${lead.name}" onerror="this.src='https://placehold.co/50x50/111/fff?text=Client'" />
                        <h4 class="lead-card-title">${lead.name}</h4>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                        ${assigneeHTML}
                        <span class="lead-channel-icon ${lead.channel_source}">${getChannelSVGHTML(lead.channel_source, '16px')}</span>
                    </div>
                </div>
                <div class="lead-card-body">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        ${budgetHTML}
                        ${timeHTML}
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top: 4px;">
                        ${creationDateHTML}
                    </div>
                    <div class="lead-tags-container" style="margin-top: 8px;">${tagsHTML}</div>
                </div>
            `;

            // Abrir Jira Modal al hacer click
            card.addEventListener('click', () => {
                openJiraModal(lead);
            });

            if (columns[stage]) {
                columns[stage].appendChild(card);
            }
        });

        // Actualizar contadores y badges financieros en las cabeceras
        Object.keys(counts).forEach(stage => {
            if (counts[stage]) counts[stage].textContent = counters[stage];
            if (totalContainers[stage]) {
                totalContainers[stage].textContent = formatFinancialValue(financialTotals[stage]);
            }
        });
    }

    if (tagFilterSelect) tagFilterSelect.addEventListener('change', renderKanban);
    if (budgetFilterSelect) budgetFilterSelect.addEventListener('change', renderKanban);
    if (periodFilterSelect) periodFilterSelect.addEventListener('change', renderKanban);

    // ----------------------------------------------------------------------
    // 8. Lógica de Bandeja de Entrada Unificada (Inbox)
    // ----------------------------------------------------------------------
    let activeInboxLeadId = 'lead-simulador-ia';
    let currentInboxFilter = 'all'; // 'all' or 'unread'
    let currentInboxTagFilter = 'all'; // 'all' or tag name

    // Variables de control para grabación de notas de voz reubicadas (V4.5.0)
    let isRecording = false;
    let recordingInterval = null;
    let recordingSeconds = 0;

    const convoListContainer = document.getElementById('inbox-conversation-list');
    const chatHistoryContainer = document.getElementById('chat-history-container');
    const chatActiveName = document.getElementById('chat-active-name');
    const chatActiveStatus = document.getElementById('chat-active-status');
    const aiControlToggle = document.getElementById('ai-control-toggle');
    const aiControlStatusText = document.getElementById('ai-control-status-text');

    const chatMessageForm = document.getElementById('chat-message-form');
    const chatInputField = document.getElementById('chat-input-field');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatBtnMic = document.getElementById('chat-btn-mic');
    const chatBtnAiAssist = document.getElementById('chat-btn-ai-assist');
    const chatBtnClip = document.getElementById('chat-btn-clip');
    const chatBtnImage = document.getElementById('chat-btn-image');
    const chatFileInput = document.getElementById('chat-file-input');
    const chatImgInput = document.getElementById('chat-img-input');
    const chatRecordingStatus = document.getElementById('chat-recording-status');
    const recordingTimer = document.getElementById('recording-timer');

    if (aiControlToggle) {
        aiControlToggle.addEventListener('change', () => {
            const isAIActive = aiControlToggle.checked;
            aiControlStatusText.textContent = isAIActive ? 'Activo (AI)' : 'Pausado (Humano)';
            aiControlStatusText.className = isAIActive ? 'status-active' : 'status-paused';

            chatInputField.disabled = false;
            chatSendBtn.disabled = false;
            if (isAIActive) {
                chatInputField.placeholder = "Escribe un mensaje para responder (se pausará la IA)...";
            } else {
                chatInputField.placeholder = "Escribe un mensaje para responder...";
            }

            if (chatBtnMic) chatBtnMic.disabled = false;

            const activeLead = leadsList.find(l => l.id === activeInboxLeadId);
            if (activeLead) {
                activeLead.ai_chat_status = isAIActive ? 'ai_active' : 'human_paused';
                renderInbox();
                renderKanban();
            }
        });
    }

    function renderInboxList(filteredLeads) {
        if (!convoListContainer) return;
        convoListContainer.innerHTML = '';

        filteredLeads.forEach(lead => {
            const messages = chatsHistory[lead.id] || [];
            const lastMsgObj = messages[messages.length - 1];
            const lastMsgText = lastMsgObj ? lastMsgObj.content || (lastMsgObj.type === 'file' ? '📁 Archivo PDF' : lastMsgObj.type === 'image' ? '📷 Imagen' : 'Sin mensajes') : 'Sin mensajes';
            const lastMsgTime = lastMsgObj ? lastMsgObj.time : '';

            const card = document.createElement('div');
            card.className = `convo-card ${lead.id === activeInboxLeadId ? 'active' : ''}`;
            card.dataset.id = lead.id;

            const tagsHTML = (lead.tags || []).map(t => {
                let colorVal = t.color || '#cccccc';
                if (t.name === 'Alta Prioridad') {
                    colorVal = 'var(--neon-green)';
                } else if (typeof colorVal === 'string' && colorVal.startsWith('var(')) {
                    if (colorVal.includes('magenta')) colorVal = '#FF0266';
                    else if (colorVal.includes('purple')) colorVal = '#BB86FC';
                    else if (colorVal.includes('cyan')) colorVal = '#03DAC6';
                    else if (colorVal.includes('orange')) colorVal = '#FFAB40';
                    else if (colorVal.includes('green')) colorVal = '#00E676';
                }
                return `<span class="convo-card-tag-badge" style="background-color: #000000; color: #FFFFFF; border: 1px solid #000000; box-shadow: none;">${t.name}</span>`;
            }).join('');

            const assignedTo = lead.assigned_to || (lead.ai_chat_status === 'ai_active' ? 'advisor-ia-uuid' : 'advisor-vendedora-uuid');
            const assigneeInfo = resolveAssigneeDetails(assignedTo);
            const assigneeHTML = `
                <div class="lead-assignee-avatar-wrapper" style="margin-right: 4px;">
                    <img class="lead-assignee-avatar" src="${assigneeInfo.avatar}" alt="${assigneeInfo.name}" onerror="this.src='https://placehold.co/20/111/fff?text=?'" />
                    <span class="lead-assignee-tooltip">Asignado: ${assigneeInfo.name}</span>
                </div>
            `;

            card.innerHTML = `
                <div class="convo-avatar">
                    <img class="convo-avatar-img" src="${lead.avatar_url}" alt="${lead.name}" onerror="this.src='https://placehold.co/50x50/111/fff?text=Client'" />
                    ${lead.unread ? '<span class="unread-dot"></span>' : ''}
                </div>
                <div class="convo-details">
                    <div class="convo-name-row">
                        <span class="convo-name ${lead.unread ? 'unread-text' : ''}">${lead.name}</span>
                        <span class="convo-time">${lastMsgTime}</span>
                    </div>
                    <span class="convo-msg">${lastMsgText}</span>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
                        <span class="channel-indicator ${lead.channel_source}">${getChannelSVGHTML(lead.channel_source, '14px')} ${lead.channel_source}</span>
                        <div style="display: flex; align-items: center; gap: 6px;">
                            ${assigneeHTML}
                            <div class="convo-card-tags">${tagsHTML}</div>
                        </div>
                    </div>
                </div>
            `;

            card.addEventListener('click', () => {
                activateChatForLead(lead.id);
            });

            convoListContainer.appendChild(card);
        });
    }

    function activateChatForLead(leadId) {
        // Reset voice recording if switching leads while recording
        if (isRecording) {
            isRecording = false;
            if (recordingInterval) {
                clearInterval(recordingInterval);
                recordingInterval = null;
            }
            if (chatBtnMic) {
                chatBtnMic.classList.remove('recording');
                chatBtnMic.style.color = '';
                chatBtnMic.style.borderColor = '';
                chatBtnMic.innerHTML = '<i class="fa-solid fa-microphone"></i>';
            }
            if (chatInputField) chatInputField.classList.remove('hidden');
            if (chatRecordingStatus) chatRecordingStatus.classList.add('hidden');
        }

        activeInboxLeadId = leadId;
        const activeLead = leadsList.find(l => l.id === leadId);
        if (activeLead) {
            activeLead.unread = false;
        }

        // Habilitar campos de entrada
        if (chatInputField) {
            chatInputField.disabled = false;
            chatInputField.placeholder = activeLead && activeLead.ai_chat_status === 'ai_active'
                ? "Escribe un mensaje para responder (se pausará la IA)..."
                : "Escribe un mensaje para responder...";
        }
        if (chatSendBtn) chatSendBtn.disabled = false;
        if (chatBtnMic) chatBtnMic.disabled = false;
        if (aiControlToggle) aiControlToggle.disabled = false;

        renderInbox();
        renderActiveChat();
    }

    function renderActiveChat() {
        if (!chatHistoryContainer) return;
        chatHistoryContainer.innerHTML = '';

        const activeLead = leadsList.find(l => l.id === activeInboxLeadId);
        if (!activeLead) return;

        chatActiveName.textContent = activeLead.name;
        chatActiveStatus.innerHTML = `${getChannelSVGHTML(activeLead.channel_source, '14px')} ${activeLead.channel_source}`;
        chatActiveStatus.className = `channel-indicator ${activeLead.channel_source}`;

        // Cargar selectores de asesor asignado (V3.5)
        const chatAssigneeSelect = document.getElementById('chat-assignee-select');
        if (chatAssigneeSelect) {
            chatAssigneeSelect.innerHTML = '';

            const optUnassigned = document.createElement('option');
            optUnassigned.value = 'unassigned';
            optUnassigned.textContent = 'Sin Asignar';
            chatAssigneeSelect.appendChild(optUnassigned);

            const advisors = getRegisteredAdvisors();
            advisors.forEach(adv => {
                const opt = document.createElement('option');
                opt.value = adv.uuid;
                opt.textContent = adv.name;
                chatAssigneeSelect.appendChild(opt);
            });

            const currentAssigned = activeLead.assigned_to || (activeLead.ai_chat_status === 'ai_active' ? 'advisor-ia-uuid' : 'advisor-vendedora-uuid');
            chatAssigneeSelect.value = currentAssigned;
        }

        const isAI = activeLead.ai_chat_status === 'ai_active';
        if (aiControlToggle) aiControlToggle.disabled = false;
        aiControlToggle.checked = isAI;
        aiControlStatusText.textContent = isAI ? 'Activo (AI)' : 'Pausado (Humano)';
        aiControlStatusText.className = isAI ? 'status-active' : 'status-paused';

        if (chatMessageForm) {
            chatMessageForm.classList.remove('hidden');
        }

        chatInputField.disabled = false;
        chatSendBtn.disabled = false;
        if (isAI) {
            chatInputField.placeholder = "Control de IA activo. Escribe para responder y pausar la IA...";
        } else {
            chatInputField.placeholder = "Escribe un mensaje para responder...";
        }

        // Habilitar micrófono
        if (chatBtnMic) chatBtnMic.disabled = false;

        const history = chatsHistory[activeInboxLeadId] || [];
        history.forEach(msg => {
            const senderClassMap = {
                customer: 'bubble-cliente',
                human: 'bubble-asesor',
                ai: 'bubble-ia'
            };
            const senderClass = senderClassMap[msg.sender] || msg.sender;

            const rowClassMap = {
                customer: 'row-cliente',
                human: 'row-asesor',
                ai: 'row-ia'
            };
            const rowClass = rowClassMap[msg.sender] || '';

            let avatarSrc = '';
            if (msg.sender === 'ai') {
                avatarSrc = './assets/ai-avatar.png';
            } else if (msg.sender === 'human') {
                const currentAgent = getCurrentAgent();
                avatarSrc = currentAgent.avatar || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23374151'><circle cx='12' cy='12' r='12' fill='%23D1D5DB'/><path d='M12 14c-4.418 0-8 2.582-8 6v1h16v-1c0-3.418-3.582-6-8-6zm0-1c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z'/></svg>";
            } else {
                avatarSrc = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236B7280'><circle cx='12' cy='12' r='12' fill='%23E5E7EB'/><path d='M12 14c-4.418 0-8 2.582-8 6v1h16v-1c0-3.418-3.582-6-8-6zm0-1c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z'/></svg>";
            }

            const createMessageRow = (bubbleElement) => {
                const row = document.createElement('div');
                row.className = `message-row ${rowClass}`;

                const avatarImg = document.createElement('img');
                avatarImg.className = 'avatar';
                avatarImg.src = avatarSrc;
                avatarImg.alt = msg.sender === 'ai' ? 'IA' : msg.sender;
                avatarImg.onerror = function () { this.style.display = 'none'; };
                avatarImg.setAttribute('onerror', "this.style.display='none'");

                row.appendChild(avatarImg);
                row.appendChild(bubbleElement);
                return row;
            };

            const bubble = document.createElement('div');
            bubble.className = msg.type === 'carousel'
                ? `chat-bubble ${msg.sender} ${senderClass} chat-bubble-carousel`
                : `chat-bubble ${msg.sender} ${senderClass}`;

            if (msg.type === 'carousel') {
                // Renderizar burbuja de texto previa si existe
                if (msg.content && msg.content.trim()) {
                    const textBubble = document.createElement('div');
                    textBubble.className = `chat-bubble ${msg.sender} ${senderClass}`;
                    textBubble.innerHTML = `
                        <p>${msg.content}</p>
                        <span class="bubble-meta">${msg.time}</span>
                    `;
                    chatHistoryContainer.appendChild(createMessageRow(textBubble));
                }

                const productCardsHTML = msg.products.map(prod => {
                    const fallbackImg = 'https://placehold.co/260x380?text=No+Image';
                    const imgUrl = getValidImageUrl(prod.imagen || prod.image || prod.image_url || prod.url || prod.img || prod.thumbnail || '', fallbackImg);
                    const nombre = prod.nombre || prod.name || prod.titulo || prod.title || 'Producto';

                    const precio = prod.precio !== undefined ? prod.precio : prod.price;
                    const precioFormateado = precio ? Number(precio).toLocaleString('es-CO') : null;
                    const priceText = precioFormateado ? `$${precioFormateado} COP` : 'Consultar Precio';

                    const url = prod.url || prod.product_url || prod.link || '#';
                    return `
                        <div class="product-card">
                            <div class="card-img-container">
                                <img src="${imgUrl}" alt="${nombre}" onerror="this.src='${fallbackImg}'">
                            </div>
                            <div class="card-info">
                                <h3 class="card-title">${nombre}</h3>
                                <p class="card-desc">Diseño exclusivo de Muebleo</p>
                                <div class="card-bottom">
                                    <span class="card-price">${priceText}</span>
                                    <button class="card-buy-btn" onclick="window.open('${url}', '_blank'); event.stopPropagation();">Ver Producto <span>↗</span></button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');

                bubble.innerHTML = `
                    <div class="carousel-wrapper">
                        <div class="carousel-container">
                            ${productCardsHTML}
                        </div>
                    </div>
                    <span class="bubble-meta">${msg.time}</span>
                `;
                chatHistoryContainer.appendChild(createMessageRow(bubble));
            } else if (msg.type === 'file') {
                bubble.innerHTML = `
                    <div class="chat-file-bubble">
                        <div class="file-icon"><i class="fa-solid fa-file-pdf"></i></div>
                        <div class="file-info">
                            <span class="file-name">${msg.fileName}</span>
                            <span class="file-size">${msg.fileSize}</span>
                        </div>
                        <a href="#" class="file-download-btn" onclick="event.preventDefault(); alert('Descargando archivo...');"><i class="fa-solid fa-download"></i></a>
                    </div>
                    <span class="bubble-meta">${msg.time}</span>
                `;
                chatHistoryContainer.appendChild(createMessageRow(bubble));
            } else if (msg.type === 'image') {
                bubble.innerHTML = `
                    <div class="chat-image-bubble">
                        <img src="${getValidImageUrl(msg.imgUrl)}" alt="Imagen enviada" class="chat-sent-image" onclick="window.open(this.src)" onerror="this.src='https://placehold.co/260x380?text=No+Image'" />
                    </div>
                    <span class="bubble-meta">${msg.time}</span>
                `;
                chatHistoryContainer.appendChild(createMessageRow(bubble));
            } else if (msg.type === 'audio') {
                const hasUrl = !!(msg.audioUrl || msg.mediaUrl);
                const audioSrc = msg.audioUrl || msg.mediaUrl || '';
                bubble.innerHTML = `
                    <div class="chat-audio-bubble">
                        <button class="audio-play-btn" type="button"><i class="fa-solid fa-play"></i></button>
                        <div class="audio-waveform">
                            <span class="wave-bar" style="height: 12px;"></span>
                            <span class="wave-bar" style="height: 18px;"></span>
                            <span class="wave-bar" style="height: 8px;"></span>
                            <span class="wave-bar" style="height: 22px;"></span>
                            <span class="wave-bar" style="height: 14px;"></span>
                            <span class="wave-bar" style="height: 20px;"></span>
                            <span class="wave-bar" style="height: 10px;"></span>
                            <span class="wave-bar" style="height: 16px;"></span>
                            <span class="wave-bar" style="height: 12px;"></span>
                        </div>
                        <span class="audio-duration">${msg.duration || '00:00'}</span>
                        ${hasUrl ? `<audio style="display:none;" src="${audioSrc}" preload="auto"></audio>` : ''}
                    </div>
                    <span class="bubble-meta">${msg.time}</span>
                `;
                const playBtn = bubble.querySelector('.audio-play-btn');
                const playIcon = playBtn ? playBtn.querySelector('i') : null;
                const audioEl = bubble.querySelector('audio');
                const waveBars = bubble.querySelectorAll('.wave-bar');

                const startWave = () => waveBars.forEach(b => b.style.animation = 'wavePlayAnimation 1.2s infinite alternate');
                const stopWave = () => waveBars.forEach(b => b.style.animation = 'none');

                if (playBtn && playIcon) {
                    if (audioEl) {
                        // Reproducción real con el Blob/URL
                        playBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            if (audioEl.paused) {
                                audioEl.play().catch(() => { });
                            } else {
                                audioEl.pause();
                            }
                        });
                        audioEl.addEventListener('play', () => { playIcon.className = 'fa-solid fa-pause'; startWave(); });
                        audioEl.addEventListener('pause', () => { playIcon.className = 'fa-solid fa-play'; stopWave(); });
                        audioEl.addEventListener('ended', () => { playIcon.className = 'fa-solid fa-play'; stopWave(); });
                    } else {
                        // Sin URL disponible — feedback visual de que no hay audio
                        playBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            playBtn.title = 'Audio no disponible aún';
                        });
                    }
                }
                chatHistoryContainer.appendChild(createMessageRow(bubble));
            } else {
                let parsedProducts = null;
                let textOnly = msg.content || '';

                if (msg.sender === 'ai' && textOnly) {
                    try {
                        const jsonMatch = textOnly.match(/\[\s*\{[\s\S]*\}\s*\]/);
                        if (jsonMatch) {
                            const parsed = JSON.parse(jsonMatch[0]);
                            if (Array.isArray(parsed) && parsed.length > 0) {
                                parsedProducts = parsed;
                                textOnly = textOnly.replace(jsonMatch[0], '').trim();
                            }
                        }
                    } catch (e) {
                        console.error("Error al parsear productos en renderActiveChat:", e);
                    }
                }

                if (parsedProducts) {
                    if (textOnly) {
                        const textBubble = document.createElement('div');
                        textBubble.className = `chat-bubble ${msg.sender} ${senderClass}`;
                        textBubble.innerHTML = `
                            <p>${textOnly}</p>
                            <span class="bubble-meta">${msg.time}</span>
                        `;
                        chatHistoryContainer.appendChild(createMessageRow(textBubble));
                    }

                    const productCardsHTML = parsedProducts.map(prod => {
                        const fallbackImg = 'https://placehold.co/260x380?text=No+Image';
                        const imgUrl = getValidImageUrl(prod.imagen || prod.image || prod.image_url || prod.url || prod.img || prod.thumbnail || '', fallbackImg);
                        const nombre = prod.nombre || prod.name || prod.titulo || prod.title || 'Producto';
                        const precio = prod.precio !== undefined ? prod.precio : prod.price;
                        const precioFormateado = precio ? Number(precio).toLocaleString('es-CO') : null;
                        const priceText = precioFormateado ? `$${precioFormateado} COP` : 'Consultar Precio';
                        const url = prod.url || prod.product_url || prod.link || '#';
                        return `
                            <div class="product-card">
                                <div class="card-img-container">
                                    <img src="${imgUrl}" alt="${nombre}" onerror="this.src='${fallbackImg}'">
                                </div>
                                <div class="card-info">
                                    <h3 class="card-title">${nombre}</h3>
                                    <p class="card-desc">Diseño exclusivo de Muebleo</p>
                                    <div class="card-bottom">
                                        <span class="card-price">${priceText}</span>
                                        <button class="card-buy-btn" onclick="window.open('${url}', '_blank'); event.stopPropagation();">Ver Producto <span>↗</span></button>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('');

                    const carouselBubble = document.createElement('div');
                    carouselBubble.className = `chat-bubble ${msg.sender} ${senderClass} chat-bubble-carousel`;
                    carouselBubble.innerHTML = `
                        <div class="carousel-wrapper">
                            <div class="carousel-container">
                                ${productCardsHTML}
                            </div>
                        </div>
                        <span class="bubble-meta">${msg.time}</span>
                    `;
                    chatHistoryContainer.appendChild(createMessageRow(carouselBubble));
                } else {
                    bubble.innerHTML = `
                        <p>${msg.content || ''}</p>
                        <span class="bubble-meta">${msg.time}</span>
                    `;
                    chatHistoryContainer.appendChild(createMessageRow(bubble));
                }
            }
        });

        chatHistoryContainer.scrollTop = chatHistoryContainer.scrollHeight;
    }

    function clearActiveChat() {
        if (chatActiveName) chatActiveName.textContent = 'Ningún cliente seleccionado';
        if (chatActiveStatus) {
            chatActiveStatus.innerHTML = '';
            chatActiveStatus.className = 'channel-indicator';
        }
        if (chatHistoryContainer) {
            chatHistoryContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-muted);">No hay conversaciones en esta categoría.</div>';
        }
        if (chatInputField) {
            chatInputField.disabled = true;
            chatInputField.value = '';
            chatInputField.placeholder = 'Selecciona una conversación para responder...';
        }
        if (chatSendBtn) chatSendBtn.disabled = true;
        if (chatBtnMic) chatBtnMic.disabled = true;
        if (aiControlToggle) {
            aiControlToggle.checked = false;
            aiControlToggle.disabled = true;
        }
        if (aiControlStatusText) {
            aiControlStatusText.textContent = 'Inactivo';
            aiControlStatusText.className = 'status-paused';
        }

        if (chatMessageForm) {
            chatMessageForm.classList.remove('hidden');
        }
    }

    function renderInbox() {
        // Filtrar leads para el Inbox
        const filteredLeads = leadsList.filter(lead => {
            // Filtro de pertenencia (Mis Leads vs Todos) (V3.5)
            const currentAgent = getCurrentAgent();
            const myUuid = currentAgent.uuid || 'advisor-vendedora-uuid';
            const assignedTo = lead.assigned_to || (lead.ai_chat_status === 'ai_active' ? 'advisor-ia-uuid' : 'advisor-vendedora-uuid');

            if (currentInboxPertenenciaFilter === 'my' && assignedTo !== myUuid) {
                return false;
            }

            // Filtro de no leídos
            if (currentInboxFilter === 'unread' && !lead.unread) {
                return false;
            }
            // Filtro de etiquetas
            if (currentInboxTagFilter !== 'all' && !lead.tags.some(t => t.name === currentInboxTagFilter)) {
                return false;
            }
            return true;
        });

        // Siempre renderizar la lista lateral de conversaciones filtradas
        renderInboxList(filteredLeads);

        // Si hay un cliente seleccionado en el sistema y cumple con los filtros activos, renderizar el chat activo
        const activeLeadExists = filteredLeads.some(l => l.id === activeInboxLeadId);
        if (activeInboxLeadId && activeLeadExists) {
            renderActiveChat();
        } else {
            // Si no hay ninguno seleccionado o el actual no cumple los filtros, seleccionar el primero de la lista filtrada
            if (filteredLeads.length > 0) {
                activeInboxLeadId = filteredLeads[0].id;
                renderActiveChat();
            } else {
                clearActiveChat();
            }
        }
    }

    if (chatMessageForm) {
        chatMessageForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = chatInputField.value.trim();
            if (!text) return;

            const targetLeadId = activeInboxLeadId;
            const timeStr = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

            // Registrar en historial local y Supabase
            if (!chatsHistory[targetLeadId]) chatsHistory[targetLeadId] = [];
            chatsHistory[targetLeadId].push({ sender: 'human', content: text, time: timeStr });
            guardarMensajeEnSupabase(targetLeadId, 'human', text, 'text');

            chatInputField.value = '';
            renderInbox();

            // Disparar webhook n8n con payload estandarizado (solo texto)
            await enviarAlWebhook({ sessionId: targetLeadId, mensaje: text, tipo: 'texto', mediaUrl: null });

            // Auto-pausa IA si estaba activa
            const activeLead = leadsList.find(l => l.id === activeInboxLeadId);
            if (activeLead && activeLead.id !== 'lead-simulador-ia' && activeLead.ai_chat_status === 'ai_active') {
                activeLead.ai_chat_status = 'human_paused';
                const currentAgent = getCurrentAgent();
                const myUuid = currentAgent.uuid || 'advisor-vendedora-uuid';
                activeLead.assigned_to = myUuid;
                if (aiControlToggle) aiControlToggle.checked = false;
                if (aiControlStatusText) {
                    aiControlStatusText.textContent = 'Pausado (Humano)';
                    aiControlStatusText.className = 'status-paused';
                }
                const chatAssigneeSelect = document.getElementById('chat-assignee-select');
                if (chatAssigneeSelect) chatAssigneeSelect.value = myUuid;
                renderKanban();
            }
        });
    }

    // ===========================================================================
    // FUNCIÓN MAESTRA DE ENVÍO MULTIMEDIA AL WEBHOOK n8n
    // Sube archivo a Supabase Storage (si hay), obtiene URL pública y dispara el
    // webhook con el JSON estandarizado: { sessionId, mensaje, tipo, mediaUrl }
    // ===========================================================================
    async function uploadToSupabaseStorage(file) {
        const ext = file.name.split('.').pop();
        const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const filePath = `chat-media/${uniqueName}`;

        const { error: uploadError } = await supabaseClient
            .storage
            .from('crm-media')
            .upload(filePath, file, { contentType: file.type, upsert: false });

        if (uploadError) {
            console.error('❌ Error subiendo archivo a Supabase Storage:', uploadError.message);
            return null;
        }

        const { data } = supabaseClient.storage.from('crm-media').getPublicUrl(filePath);
        return data?.publicUrl || null;
    }

    function showAITypingIndicator() {
        const container = document.getElementById('chat-history-container');
        if (!container) return null;

        const row = document.createElement('div');
        row.className = 'message-row row-ia';

        const avatarImg = document.createElement('img');
        avatarImg.className = 'avatar';
        avatarImg.src = './assets/ai-avatar.png';
        avatarImg.alt = 'IA';
        avatarImg.onerror = function () { this.style.display = 'none'; };
        avatarImg.setAttribute('onerror', "this.style.display='none'");

        const typingEl = document.createElement('div');
        typingEl.className = 'typing-indicator';
        typingEl.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;

        row.appendChild(avatarImg);
        row.appendChild(typingEl);

        container.appendChild(row);
        container.scrollTop = container.scrollHeight;
        return row;
    }

    function removeAITypingIndicator(indicatorEl) {
        if (indicatorEl && indicatorEl.parentNode) {
            indicatorEl.parentNode.removeChild(indicatorEl);
        } else {
            const fallbacks = document.querySelectorAll('.message-row.row-ia');
            fallbacks.forEach(el => {
                if (el.querySelector('.typing-indicator') && el.parentNode) {
                    el.parentNode.removeChild(el);
                }
            });
        }
    }

    // ⚡ enviarAlWebhook: Totalmente aislado del hilo principal.
    // El fetch se ejecuta dentro de setTimeout(0) para que cualquier error de red
    // (CORS, Mixed Content, ERR_CONNECTION_CLOSED) NO arrastre la conexión
    // WebSocket de Supabase Realtime.
    // ⚠️ MIXED CONTENT: Si URL_WEBHOOK_N8N usa http:// en producción HTTPS,
    // Chrome/Firefox lo bloquearán. Debe ser siempre https://.
    async function enviarAlWebhook({ sessionId, mensaje, tipo, mediaUrl }) {
        console.log(`🚀 [Webhook n8n] Preparando disparo aislado | sesión: ${sessionId} | tipo: ${tipo} | mediaUrl: ${mediaUrl || 'N/A'}`);

        let typingEl = null;
        const targetLead = leadsList.find(l => l.id === sessionId);
        const isSimulator = sessionId === 'lead-simulador-ia';
        const isAIActive = isSimulator || (targetLead && targetLead.ai_chat_status === 'ai_active');

        if (isAIActive && activeInboxLeadId === sessionId) {
            typingEl = showAITypingIndicator();
        }

        // Desacoplar el fetch del hilo principal con setTimeout(0)
        setTimeout(async () => {
            try {
                const URL_WEBHOOK_N8N = 'https://n8n.muebleo.com.co/webhook/3940b692-d275-434b-82d0-c75e0ec43c07';
                const payload = { sessionId, mensaje, tipo, mediaUrl, origen: 'CRM Local' };
                console.log('📡 [Webhook n8n] Disparando fire-and-forget para sesión:', sessionId);
                await fetch(URL_WEBHOOK_N8N, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify(payload)
                });
                console.log('✅ [Webhook n8n] Disparo completado (opaco).');
            } catch (e) {
                console.warn('⚠️ [Webhook n8n] Interceptado localmente — no afecta Supabase:', e.message || e);
            } finally {
                // Limpiar indicador de escritura después de un delay razonable
                setTimeout(() => {
                    if (typingEl) {
                        removeAITypingIndicator(typingEl);
                        typingEl = null;
                    }
                }, 3000);
            }
        }, 0);
    }

    // 3. Envío de Archivos y Fotos en el Chat
    // (Los click handlers definitivos están consolidados abajo junto a handoverToHuman)

    if (chatFileInput) {
        chatFileInput.addEventListener('change', async (e) => {
            const files = e.target.files;
            if (!files || files.length === 0) return;
            const file = files[0];
            const targetLeadId = activeInboxLeadId;
            const sizeStr = file.size > 1024 * 1024
                ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
                : (file.size / 1024).toFixed(0) + ' KB';
            const timeStr = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

            // 1. Subir a Supabase Storage
            const mediaUrl = await uploadToSupabaseStorage(file);

            // 2. Registrar en historial local
            if (!chatsHistory[targetLeadId]) chatsHistory[targetLeadId] = [];
            chatsHistory[targetLeadId].push({ sender: 'human', type: 'file', fileName: file.name, fileSize: sizeStr, mediaUrl, time: timeStr });

            // 3. Guardar en Supabase DB
            guardarMensajeEnSupabase(targetLeadId, 'human', file.name, 'file', { mediaUrl, fileSize: sizeStr });

            // 4. Clasificación dinámica por MIME type real del archivo
            let tipo;
            if (file.type.startsWith('image/')) tipo = 'imagen';
            else if (file.type.startsWith('audio/')) tipo = 'audio';
            else tipo = 'documento';
            await enviarAlWebhook({ sessionId: targetLeadId, mensaje: '', tipo, mediaUrl });

            chatFileInput.value = '';
            renderInbox();
        });
    }

    if (chatImgInput) {
        chatImgInput.addEventListener('change', async (e) => {
            const files = e.target.files;
            if (!files || files.length === 0) return;
            const file = files[0];
            const targetLeadId = activeInboxLeadId;
            const timeStr = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

            // 1. Subir a Supabase Storage y obtener URL pública real
            const mediaUrl = await uploadToSupabaseStorage(file);

            // 2. Preview local mientras la URL real ya está disponible
            const reader = new FileReader();
            reader.onload = (event) => {
                if (!chatsHistory[targetLeadId]) chatsHistory[targetLeadId] = [];
                chatsHistory[targetLeadId].push({ sender: 'human', type: 'image', imgUrl: mediaUrl || event.target.result, time: timeStr });
                renderInbox();
            };
            reader.readAsDataURL(file);

            // 3. Guardar en Supabase DB
            if (mediaUrl) guardarMensajeEnSupabase(targetLeadId, 'human', '', 'image', { mediaUrl });

            // 4. Disparar webhook n8n con tipo "imagen"
            await enviarAlWebhook({ sessionId: targetLeadId, mensaje: '', tipo: 'imagen', mediaUrl });

            chatImgInput.value = '';
        });
    }
    function handoverToHuman() {
        const activeLead = leadsList.find(l => l.id === activeInboxLeadId);
        if (activeLead && activeLead.ai_chat_status === 'ai_active') {
            activeLead.ai_chat_status = 'human_paused';

            const currentAgent = getCurrentAgent();
            const myUuid = currentAgent.uuid || 'advisor-vendedora-uuid';
            activeLead.assigned_to = myUuid; // Auto-asignar al humano activo

            // Actualizar la UI del control de IA directamente sin re-renderizar todo el chat para conservar el foco del input
            if (aiControlToggle) {
                aiControlToggle.checked = false;
            }
            if (aiControlStatusText) {
                aiControlStatusText.textContent = 'Pausado (Humano)';
                aiControlStatusText.className = 'status-paused';
            }
            if (chatInputField) {
                chatInputField.placeholder = "Escribe un mensaje para responder...";
            }

            // Sincronizar el selector de asesor asignado con la vendedora activa para evitar desajustes visuales
            const chatAssigneeSelect = document.getElementById('chat-assignee-select');
            if (chatAssigneeSelect) {
                chatAssigneeSelect.value = myUuid;
            }

            // Re-renderizar listas laterales de forma silenciosa para actualizar los indicadores
            renderInboxList(leadsList.filter(lead => {
                const currentAgent = getCurrentAgent();
                const myUuid = currentAgent.uuid || 'advisor-vendedora-uuid';
                const assignedTo = lead.assigned_to || (lead.ai_chat_status === 'ai_active' ? 'advisor-ia-uuid' : 'advisor-vendedora-uuid');

                if (currentInboxPertenenciaFilter === 'my' && assignedTo !== myUuid) return false;
                if (currentInboxFilter === 'unread' && !lead.unread) return false;
                if (currentInboxTagFilter !== 'all' && !lead.tags.some(t => t.name === currentInboxTagFilter)) return false;
                return true;
            }));
            renderKanban();
        }
    }

    if (chatInputField) {
        chatInputField.addEventListener('focus', handoverToHuman);
    }
    // chatBtnClip: handover + abrir selector de archivo (UN solo listener)
    if (chatBtnClip && chatFileInput) {
        chatBtnClip.addEventListener('click', () => {
            handoverToHuman();
            chatFileInput.click();
        });
    }
    // chatBtnImage: handover + abrir selector de imagen (UN solo listener)
    if (chatBtnImage && chatImgInput) {
        chatBtnImage.addEventListener('click', () => {
            handoverToHuman();
            chatImgInput.click();
        });
    }
    // chatBtnMic: handoverToHuman se llama internamente en el handler de MediaRecorder
    if (chatBtnAiAssist) {
        chatBtnAiAssist.addEventListener('click', () => {
            // Activar pausa silenciosa de control de IA si estaba activa
            handoverToHuman();

            const text = chatInputField ? chatInputField.value.trim() : '';
            // Deshabilitar botón visualmente y mostrar estado cargando
            chatBtnAiAssist.disabled = true;
            const originalHTML = chatBtnAiAssist.innerHTML;
            chatBtnAiAssist.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

            // ⚡ Sugerencia de IA: Convertido a fire-and-forget con mode:'no-cors'
            // para evitar que Chrome/Firefox disparen un preflight OPTIONS que
            // colapsa la red y mata los WebSockets de Supabase.
            // La respuesta de la IA llegará por Realtime (INSERT en chat_history),
            // no por la respuesta HTTP de este fetch.
            // ⚠️ MIXED CONTENT: URL debe ser siempre https:// en producción.
            console.log('📡 [Webhook n8n] Solicitando sugerencia de IA (fire-and-forget)...');
            setTimeout(async () => {
                try {
                    const URL_WEBHOOK_N8N = 'https://n8n.muebleo.com.co/webhook/3940b692-d275-434b-82d0-c75e0ec43c07';
                    await fetch(URL_WEBHOOK_N8N, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: { 'Content-Type': 'text/plain' },
                        body: JSON.stringify({
                            sessionId: activeInboxLeadId,
                            mensaje: text || '[Sugerir respuesta]',
                            origen: 'CRM Local'
                        })
                    });
                    console.log('✅ [Webhook n8n] Solicitud de sugerencia IA enviada (opaca).');
                } catch (e) {
                    console.warn('⚠️ [Webhook n8n] Sugerencia IA interceptada localmente:', e.message || e);
                } finally {
                    // Restaurar estado del botón después de un breve delay
                    setTimeout(() => {
                        chatBtnAiAssist.disabled = false;
                        chatBtnAiAssist.innerHTML = originalHTML;
                    }, 2000);
                }
            }, 0);
        });
    }

    let currentInboxPertenenciaFilter = 'my'; // 'my' o 'all' (V3.5)

    // Configurar controladores de filtros rápidos del Inbox
    const filterBtns = document.querySelectorAll('.inbox-filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentInboxFilter = btn.getAttribute('data-filter');
            renderInbox();
        });
    });

    const tagFilterInbox = document.getElementById('inbox-tag-filter');
    if (tagFilterInbox) {
        tagFilterInbox.addEventListener('change', (e) => {
            currentInboxTagFilter = e.target.value;
            renderInbox();
        });
    }

    // Toggle de pertenencia en Inbox (V3.5)
    const filterMyLeadsBtn = document.getElementById('inbox-filter-my-leads');
    const filterAllLeadsBtn = document.getElementById('inbox-filter-all-leads');

    if (filterMyLeadsBtn && filterAllLeadsBtn) {
        filterMyLeadsBtn.addEventListener('click', () => {
            filterMyLeadsBtn.classList.add('active');
            filterAllLeadsBtn.classList.remove('active');
            currentInboxPertenenciaFilter = 'my';
            renderInbox();
        });

        filterAllLeadsBtn.addEventListener('click', () => {
            filterAllLeadsBtn.classList.add('active');
            filterMyLeadsBtn.classList.remove('active');
            currentInboxPertenenciaFilter = 'all';
            renderInbox();
        });
    }

    // Listener para reasignación en cabecera del chat (V3.5)
    const chatAssigneeSelectHeader = document.getElementById('chat-assignee-select');
    if (chatAssigneeSelectHeader) {
        chatAssigneeSelectHeader.addEventListener('change', (e) => {
            const activeLead = leadsList.find(l => l.id === activeInboxLeadId);
            if (activeLead) {
                const newAssignee = e.target.value;
                const oldAssignee = activeLead.assigned_to || (activeLead.ai_chat_status === 'ai_active' ? 'advisor-ia-uuid' : 'advisor-vendedora-uuid');

                if (newAssignee !== oldAssignee) {
                    activeLead.assigned_to = newAssignee;

                    if (newAssignee === 'advisor-ia-uuid') {
                        activeLead.ai_chat_status = 'ai_active';
                        if (aiControlToggle) {
                            aiControlToggle.checked = true;
                            aiControlStatusText.textContent = 'Activo (AI)';
                            aiControlStatusText.className = 'status-active';
                        }
                    } else {
                        activeLead.ai_chat_status = 'human_paused';
                        if (aiControlToggle) {
                            aiControlToggle.checked = false;
                            aiControlStatusText.textContent = 'Pausado (Humano)';
                            aiControlStatusText.className = 'status-paused';
                        }
                    }

                    const advisors = getRegisteredAdvisors();
                    const newAdvisorObj = advisors.find(a => a.uuid === newAssignee) || { name: 'Sin Asignar' };

                    if (!activeLead.activity_log) {
                        activeLead.activity_log = [];
                    }
                    activeLead.activity_log.unshift({
                        time: 'Justo ahora',
                        author: 'Sistema',
                        content: `Lead reasignado a: ${newAdvisorObj.name}.`
                    });

                    renderInbox();
                    renderKanban();
                }
            }
        });
    }

    // ----------------------------------------------------------------------
    // 9. Panel de Gestión de Etiquetas
    // ----------------------------------------------------------------------
    const tagsManagementContainer = document.getElementById('tags-management-container');

    function renderTagsPanel() {
        if (!tagsManagementContainer) return;
        tagsManagementContainer.innerHTML = '';

        const customTags = JSON.parse(localStorage.getItem('spoke_custom_tags') || '[]');
        const systemTags = [
            { name: 'Alta Prioridad', color: 'var(--neon-green)' },
            { name: 'Seguimiento', color: 'var(--neon-purple)' },
            { name: 'Nuevo', color: 'var(--neon-cyan)' },
            { name: 'Pendiente', color: 'var(--neon-orange)' },
            { name: 'Conversión', color: 'var(--neon-magenta)' }
        ];

        // Combina ambas listas para el listado general
        const allTags = [...systemTags, ...customTags];

        // 1. Renderizar Listado de Etiquetas (Izquierda)
        allTags.forEach(t => {
            // Calcular métricas analíticas por tag
            const matchedLeads = leadsList.filter(l => l.tags.some(tag => tag.name === t.name));
            const count = matchedLeads.length;
            const totalVal = matchedLeads.reduce((sum, l) => {
                const leadValue = l.quoted_value > 0 ? l.quoted_value : l.estimated_budget;
                return sum + leadValue;
            }, 0);

            const isCustom = customTags.some(ct => ct.name === t.name);

            const card = document.createElement('div');
            card.className = 'tag-manage-card';
            card.style.display = 'flex';
            card.style.justifyContent = 'space-between';
            card.style.alignItems = 'center';
            card.style.padding = '12px 15px';
            card.style.border = '1px solid var(--border-color)';
            card.style.borderRadius = '8px';
            card.style.background = 'var(--bg-card)';

            card.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:6px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span class="lead-tag-badge" style="background-color: #000000; color:#FFFFFF; border: 1px solid #000000; display:inline-block; width:fit-content; font-size:11px;">${t.name}</span>
                        ${isCustom ? '<span style="font-size:9px; background-color:#111; color:var(--neon-green); border:1px solid var(--neon-green); padding:1px 4px; border-radius:3px; font-weight:600;">Personalizada</span>' : ''}
                    </div>
                    <span style="font-size:11px; color:var(--text-muted);">${count} ${count === 1 ? 'lead asociado' : 'leads asociados'}</span>
                </div>
                <div style="text-align:right; display:flex; flex-direction:column; align-items:flex-end; gap:4px;">
                    <div style="font-weight:700; color:var(--text-primary); font-size:13px;">${formatFinancialValue(totalVal)}</div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        ${isCustom ? `
                            <button class="delete-tag-btn" data-name="${t.name}" style="background:transparent; border:none; color:var(--neon-magenta); font-size:11px; cursor:pointer; font-weight:600; padding:0;"><i class="fa-solid fa-trash"></i> Eliminar</button>
                        ` : `
                            <span style="font-size:10px; color:var(--text-muted); font-weight:600;">Sistema</span>
                        `}
                    </div>
                </div>
            `;

            if (isCustom) {
                const deleteBtn = card.querySelector('.delete-tag-btn');
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm(`¿Estás seguro de que deseas eliminar la etiqueta "${t.name}"? Se removerá también de todos los leads.`)) {
                        deleteCustomTag(t.name);
                    }
                });
            }

            tagsManagementContainer.appendChild(card);
        });

        // 2. Renderizar Dashboard de Impacto por Etiquetas (Derecha)
        const pipelineDashboard = document.getElementById('tags-pipeline-dashboard');
        const pipelineTotalValEl = document.getElementById('pipeline-total-value');

        if (pipelineDashboard && pipelineTotalValEl) {
            pipelineDashboard.innerHTML = '';

            // Total Pipeline General
            const totalPipelineVal = leadsList.reduce((sum, l) => {
                const leadValue = l.quoted_value > 0 ? l.quoted_value : l.estimated_budget;
                return sum + leadValue;
            }, 0);

            pipelineTotalValEl.textContent = totalPipelineVal.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }) + ' COP';

            // Para cada etiqueta, pintar barra de progreso
            allTags.forEach(t => {
                const matchedLeads = leadsList.filter(l => l.tags.some(tag => tag.name === t.name));
                const totalVal = matchedLeads.reduce((sum, l) => {
                    const leadValue = l.quoted_value > 0 ? l.quoted_value : l.estimated_budget;
                    return sum + leadValue;
                }, 0);

                const percentage = totalPipelineVal > 0 ? ((totalVal / totalPipelineVal) * 100).toFixed(1) : 0;

                const progressItem = document.createElement('div');
                progressItem.className = 'tag-progress-item';
                progressItem.innerHTML = `
                    <div class="tag-progress-header">
                        <span style="font-weight:600; color:var(--text-primary); display:flex; align-items:center; gap:6px;">
                            <span style="width:8px; height:8px; border-radius:50%; background-color:${t.color}; display:inline-block;"></span>
                            ${t.name}
                        </span>
                        <span style="font-weight:700; color:var(--text-secondary);">${formatFinancialValue(totalVal)} <span style="font-size:10px; color:var(--text-muted); font-weight:400; margin-left:4px;">(${percentage}%)</span></span>
                    </div>
                    <div class="tag-progress-bar-bg">
                        <div class="tag-progress-bar-fill" style="width: ${percentage}%; background-color: ${t.color}; box-shadow: 0 0 8px ${t.color};"></div>
                    </div>
                `;
                pipelineDashboard.appendChild(progressItem);
            });
        }
    }

    // ----------------------------------------------------------------------
    // 10. Dashboard Stats
    // ----------------------------------------------------------------------
    function renderDashboardStats() {
        // Actualizar dinámicamente si es necesario
    }

    // ----------------------------------------------------------------------
    // 11. Notificaciones y Audio (Web Audio API fallback)
    // ----------------------------------------------------------------------
    const modal = document.getElementById('premium-notification-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const takeControlBtn = document.getElementById('take-control-btn');
    const simulateLeadBtn = document.getElementById('simulate-lead-btn');
    const notifNameElement = document.getElementById('notif-name');
    const notifBudgetElement = document.getElementById('notif-budget');
    const notificationSound = document.getElementById('notification-sound');

    function playNotificationSound() {
        if (notificationSound) {
            notificationSound.currentTime = 0;
            notificationSound.play().catch(e => {
                console.log('Autoplay o archivo bloqueado, usando sintetizador Web Audio.');
                playSynthesizedDing();
            });
        } else {
            playSynthesizedDing();
        }
    }

    function playSynthesizedDing() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, ctx.currentTime);

            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.6);
        } catch (error) {
            console.warn('La síntesis de audio Web Audio API falló:', error);
        }
    }

    function closeModal() {
        modal.classList.add('hidden');
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (takeControlBtn) {
        takeControlBtn.addEventListener('click', () => {
            closeModal();
            const lastSimulatedLead = leadsList[0];
            if (lastSimulatedLead) {
                activeInboxLeadId = lastSimulatedLead.id;
                document.querySelector('[data-target="view-inbox"]').click();
            }
        });
    }

    // Simular webhook analítico de n8n para Lead Premium
    if (simulateLeadBtn) {
        simulateLeadBtn.addEventListener('click', () => {
            const simLeadId = 'lead-' + Date.now();
            const newLead = {
                id: simLeadId,
                name: 'Cliente Premium Stiven',
                phone: '+573159998811',
                channel_source: 'whatsapp',
                ai_chat_status: 'human_paused', // Handover inmediato
                commercial_stage: 'nuevo',
                estimated_budget: 3500000.00,
                quoted_value: 0.00,
                avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100',
                assigned_to: 'advisor-vendedora-uuid',
                time_in_stage: 'hace 1m',
                delivery_date: '',
                observations: '',
                attachments: [],
                activity_log: [
                    { time: 'Hace 1m', author: 'n8n AI', content: 'Lead Premium Stiven detectado con alta intención de compra.' }
                ],
                tags: [
                    { name: 'Alta Prioridad', color: 'var(--neon-green)' },
                    { name: 'Nuevo', color: '#03DAC6' }
                ]
            };

            chatsHistory[simLeadId] = [
                { sender: 'customer', content: 'Quiero ordenar la mesa industrial de comedor ya. ¿Cómo hago el pago?', time: 'Hace un momento' }
            ];

            notifNameElement.textContent = newLead.name;
            notifBudgetElement.textContent = `$${newLead.estimated_budget.toLocaleString('es-CO')} COP`;

            modal.classList.remove('hidden');
            playNotificationSound();

            leadsList.unshift(newLead);
            renderKanban();
        });
    }

    // Helper para nombre legible de estado
    function getStageDisplayName(stage) {
        const stages = {
            nuevo: 'Nuevo',
            seguimiento: 'En Seguimiento',
            cotizado: 'Cotizado',
            ganado: 'Ganado',
            perdido: 'Perdido'
        };
        return stages[stage] || stage;
    }

    // ----------------------------------------------------------------------
    // 12. Lógica del Modal Jira Task (V2.7)
    // ----------------------------------------------------------------------
    const jiraModal = document.getElementById('jira-task-modal');
    const closeJiraModalBtn = document.getElementById('close-jira-modal-btn');
    const jiraSaveBtn = document.getElementById('jira-save-btn');
    const jiraObservations = document.getElementById('jira-observations');
    const jiraDeliveryDate = document.getElementById('jira-delivery-date');
    const jiraQuotedValue = document.getElementById('jira-quoted-value');
    const jiraPriorityToggle = document.getElementById('jira-priority-toggle');
    const jiraDropzone = document.getElementById('jira-dropzone');
    const jiraFileInput = document.getElementById('jira-file-input');
    const jiraAttachmentsList = document.getElementById('jira-attachments-list');
    const jiraTimeline = document.getElementById('jira-timeline');

    let currentJiraLead = null;

    function openJiraModal(lead) {
        currentJiraLead = lead;

        // Cargar campos básicos
        document.getElementById('jira-modal-title').textContent = `Ficha: ${lead.name}`;
        document.getElementById('jira-avatar').src = lead.avatar_url;
        document.getElementById('jira-client-name').textContent = lead.name;
        document.getElementById('jira-client-phone').textContent = lead.phone;
        document.getElementById('jira-stage-badge').textContent = getStageDisplayName(lead.commercial_stage);
        document.getElementById('jira-time-in-stage').textContent = lead.time_in_stage;

        // Canal
        const channelBadge = document.getElementById('jira-channel');
        channelBadge.className = `channel-indicator ${lead.channel_source}`;
        channelBadge.innerHTML = `${getChannelSVGHTML(lead.channel_source, '14px')} ${lead.channel_source}`;

        // Presupuesto y cotizado
        document.getElementById('jira-budget').textContent = formatFinancialValue(lead.estimated_budget);
        jiraQuotedValue.value = lead.quoted_value > 0 ? lead.quoted_value : '';

        // Formulario editable
        jiraObservations.value = lead.observations || '';
        jiraDeliveryDate.value = lead.delivery_date || '';

        // Cargar fecha de pedido (creación) (V3.5)
        const jiraOrderDate = document.getElementById('jira-order-date');
        if (jiraOrderDate) {
            jiraOrderDate.value = lead.created_at || 'Sin registrar';
        }

        // Prioridad (Alta Prioridad tag check)
        const hasHighPriority = lead.tags.some(t => t.name === 'Alta Prioridad');
        jiraPriorityToggle.checked = hasHighPriority;

        // Conversión tag check
        const hasConversion = lead.tags.some(t => t.name === 'Conversión');
        const conversionToggle = document.getElementById('jira-conversion-toggle');
        if (conversionToggle) {
            conversionToggle.checked = hasConversion;
        }

        // Cargar asesor asignado dinámicamente (V3.5)
        const jiraAssigneeSelect = document.getElementById('jira-assignee');
        if (jiraAssigneeSelect) {
            jiraAssigneeSelect.innerHTML = '';

            const optUnassigned = document.createElement('option');
            optUnassigned.value = 'unassigned';
            optUnassigned.textContent = 'Sin Asignar';
            jiraAssigneeSelect.appendChild(optUnassigned);

            const advisors = getRegisteredAdvisors();
            advisors.forEach(adv => {
                const opt = document.createElement('option');
                opt.value = adv.uuid;
                opt.textContent = adv.name;
                jiraAssigneeSelect.appendChild(opt);
            });

            const currentAssigned = lead.assigned_to || (lead.ai_chat_status === 'ai_active' ? 'advisor-ia-uuid' : 'advisor-vendedora-uuid');
            jiraAssigneeSelect.value = currentAssigned;
        }

        // Renderizar checkboxes de etiquetas personalizadas
        const jiraCustomTagsContainer = document.getElementById('jira-custom-tags-container');
        if (jiraCustomTagsContainer) {
            jiraCustomTagsContainer.innerHTML = '';
            const customTags = JSON.parse(localStorage.getItem('spoke_custom_tags') || '[]');
            if (customTags.length === 0) {
                jiraCustomTagsContainer.innerHTML = '<span style="font-size:11px; color:var(--text-muted);">Sin etiquetas personalizadas. Créalas en la sección de Etiquetas.</span>';
            } else {
                customTags.forEach(tag => {
                    const hasTag = lead.tags.some(t => t.name === tag.name);
                    const label = document.createElement('label');
                    label.style.display = 'flex';
                    label.style.alignItems = 'center';
                    label.style.gap = '6px';
                    label.style.fontSize = '11px';
                    label.style.cursor = 'pointer';
                    label.style.background = '#000000';
                    label.style.border = `1px solid ${tag.color}`;
                    label.style.padding = '3px 8px';
                    label.style.borderRadius = '4px';
                    label.style.color = '#ffffff';
                    label.style.boxShadow = hasTag ? `0 0 5px ${tag.color}33` : 'none';
                    label.style.transition = 'all 0.2s ease';

                    label.innerHTML = `
                        <input type="checkbox" class="jira-custom-tag-checkbox" data-name="${tag.name}" data-color="${tag.color}" ${hasTag ? 'checked' : ''} style="cursor:pointer;" />
                        <span style="font-weight:600;">${tag.name}</span>
                    `;

                    // Actualizar estilo visual cuando cambia el checkbox
                    const checkbox = label.querySelector('input');
                    checkbox.addEventListener('change', () => {
                        label.style.boxShadow = checkbox.checked ? `0 0 5px ${tag.color}33` : 'none';
                    });

                    jiraCustomTagsContainer.appendChild(label);
                });
            }
        }

        // Renderizar adjuntos
        renderJiraAttachments();

        // Renderizar timeline
        renderJiraTimeline();

        // Mostrar modal
        jiraModal.classList.remove('hidden');
    }

    function renderJiraAttachments() {
        if (!jiraAttachmentsList || !currentJiraLead) return;
        jiraAttachmentsList.innerHTML = '';

        if (currentJiraLead.attachments.length === 0) {
            jiraAttachmentsList.innerHTML = '<p style="font-size:11px; color:var(--text-muted); text-align:center;">Sin archivos adjuntos.</p>';
            return;
        }

        currentJiraLead.attachments.forEach((att, index) => {
            const div = document.createElement('div');
            div.className = 'jira-attachment-item';
            div.innerHTML = `
                <div class="jira-attachment-info">
                    <i class="fa-solid fa-file-pdf"></i>
                    <div>
                        <span class="jira-attachment-name">${att.name}</span>
                        <span class="jira-attachment-size">${att.size}</span>
                    </div>
                </div>
                <button class="jira-attachment-remove" data-index="${index}">&times;</button>
            `;

            div.querySelector('.jira-attachment-remove').addEventListener('click', () => {
                currentJiraLead.attachments.splice(index, 1);
                currentJiraLead.activity_log.push({
                    time: 'Ahora',
                    author: 'Vendedora',
                    content: `Archivo ${att.name} eliminado.`
                });
                renderJiraAttachments();
                renderJiraTimeline();
            });

            jiraAttachmentsList.appendChild(div);
        });
    }

    function renderJiraTimeline() {
        if (!jiraTimeline || !currentJiraLead) return;
        jiraTimeline.innerHTML = '';

        currentJiraLead.activity_log.slice().reverse().forEach((log, index) => {
            const div = document.createElement('div');
            div.className = 'jira-timeline-item';
            div.innerHTML = `
                <span class="jira-timeline-dot ${index === 0 ? 'active' : ''}"></span>
                <div class="jira-timeline-meta">
                    <span class="jira-timeline-author">${log.author}</span>
                    <span>&bull;</span>
                    <span>${log.time}</span>
                </div>
                <div class="jira-timeline-content">${log.content}</div>
            `;
            jiraTimeline.appendChild(div);
        });
    }

    // Guardar cambios del modal Jira
    if (jiraSaveBtn) {
        jiraSaveBtn.addEventListener('click', () => {
            if (!currentJiraLead) return;

            const oldQuotedValue = currentJiraLead.quoted_value;
            const newQuotedValue = parseFloat(jiraQuotedValue.value) || 0.00;
            const oldDeliveryDate = currentJiraLead.delivery_date;
            const newDeliveryDate = jiraDeliveryDate.value;
            const oldObservations = currentJiraLead.observations;
            const newObservations = jiraObservations.value;

            // Registrar cambios en el log
            let changeMade = false;

            // Guardar asignación del asesor (V3.5)
            const jiraAssigneeSelect = document.getElementById('jira-assignee');
            if (jiraAssigneeSelect) {
                const oldAssignedTo = currentJiraLead.assigned_to || (currentJiraLead.ai_chat_status === 'ai_active' ? 'advisor-ia-uuid' : 'advisor-vendedora-uuid');
                const newAssignedTo = jiraAssigneeSelect.value;
                if (newAssignedTo !== oldAssignedTo) {
                    currentJiraLead.assigned_to = newAssignedTo;
                    if (newAssignedTo === 'advisor-ia-uuid') {
                        currentJiraLead.ai_chat_status = 'ai_active';
                    } else {
                        currentJiraLead.ai_chat_status = 'human_paused';
                    }
                    const assigneeInfo = resolveAssigneeDetails(newAssignedTo);
                    currentJiraLead.activity_log.push({
                        time: 'Ahora',
                        author: 'Sistema',
                        content: `Lead reasignado a ${assigneeInfo.name}.`
                    });
                    changeMade = true;
                }
            }

            // Guardar etiquetas personalizadas
            const jiraCustomTagsContainer = document.getElementById('jira-custom-tags-container');
            if (jiraCustomTagsContainer) {
                const checkboxes = jiraCustomTagsContainer.querySelectorAll('.jira-custom-tag-checkbox');
                checkboxes.forEach(cb => {
                    const tagName = cb.getAttribute('data-name');
                    const tagColor = cb.getAttribute('data-color');
                    const isChecked = cb.checked;
                    const hasTag = currentJiraLead.tags.some(t => t.name === tagName);

                    if (isChecked && !hasTag) {
                        currentJiraLead.tags.push({ name: tagName, color: tagColor });
                        currentJiraLead.activity_log.push({
                            time: 'Ahora',
                            author: 'Vendedora',
                            content: `Etiqueta personalizada "${tagName}" añadida.`
                        });
                        changeMade = true;
                    } else if (!isChecked && hasTag) {
                        currentJiraLead.tags = currentJiraLead.tags.filter(t => t.name !== tagName);
                        currentJiraLead.activity_log.push({
                            time: 'Ahora',
                            author: 'Vendedora',
                            content: `Etiqueta personalizada "${tagName}" eliminada.`
                        });
                        changeMade = true;
                    }
                });
            }

            if (newQuotedValue !== oldQuotedValue) {
                currentJiraLead.quoted_value = newQuotedValue;
                currentJiraLead.activity_log.push({
                    time: 'Ahora',
                    author: 'Vendedora',
                    content: `Valor cotizado actualizado a $${newQuotedValue.toLocaleString('es-CO')} COP.`
                });
                changeMade = true;
            }
            if (newDeliveryDate !== oldDeliveryDate) {
                currentJiraLead.delivery_date = newDeliveryDate;
                currentJiraLead.activity_log.push({
                    time: 'Ahora',
                    author: 'Vendedora',
                    content: `Fecha de despacho establecida para ${newDeliveryDate || 'Sin definir'}.`
                });
                changeMade = true;
            }
            if (newObservations !== oldObservations) {
                currentJiraLead.observations = newObservations;
                currentJiraLead.activity_log.push({
                    time: 'Ahora',
                    author: 'Vendedora',
                    content: `Observaciones del pedido actualizadas.`
                });
                changeMade = true;
            }

            // Gestionar prioridad
            const isPriorityChecked = jiraPriorityToggle.checked;
            const hasPriorityTag = currentJiraLead.tags.some(t => t.name === 'Alta Prioridad');

            if (isPriorityChecked && !hasPriorityTag) {
                currentJiraLead.tags.unshift({ name: 'Alta Prioridad', color: 'var(--neon-green)' });
                currentJiraLead.activity_log.push({
                    time: 'Ahora',
                    author: 'Vendedora',
                    content: 'Prioridad cambiada a ALTA.'
                });
                changeMade = true;
            } else if (!isPriorityChecked && hasPriorityTag) {
                currentJiraLead.tags = currentJiraLead.tags.filter(t => t.name !== 'Alta Prioridad');
                currentJiraLead.activity_log.push({
                    time: 'Ahora',
                    author: 'Vendedora',
                    content: 'Prioridad reducida a Normal.'
                });
                changeMade = true;
            }

            // Gestionar conversión (Meta CAPI)
            const conversionToggle = document.getElementById('jira-conversion-toggle');
            const isConversionChecked = conversionToggle ? conversionToggle.checked : false;
            const hasConversionTag = currentJiraLead.tags.some(t => t.name === 'Conversión');

            if (isConversionChecked && !hasConversionTag) {
                currentJiraLead.tags.push({ name: 'Conversión', color: 'var(--neon-magenta)' });
                changeMade = true;
            } else if (!isConversionChecked && hasConversionTag) {
                currentJiraLead.tags = currentJiraLead.tags.filter(t => t.name !== 'Conversión');
                changeMade = true;
            }

            if (changeMade) {
                // Actualizar Kanban
                renderKanban();
                renderDashboardStats();
            }

            jiraModal.classList.add('hidden');
        });
    }

    if (closeJiraModalBtn) {
        closeJiraModalBtn.addEventListener('click', () => {
            jiraModal.classList.add('hidden');
        });
    }

    const goToChatBtn = document.getElementById('jira-go-to-chat-btn');
    if (goToChatBtn) {
        goToChatBtn.addEventListener('click', () => {
            if (currentJiraLead) {
                // Cerrar modal
                jiraModal.classList.add('hidden');

                // Seleccionar lead activo
                activeInboxLeadId = currentJiraLead.id;

                // Restablecer filtros de Inbox
                currentInboxPertenenciaFilter = 'all';
                currentInboxFilter = 'all';
                currentInboxTagFilter = 'all';

                // Actualizar interfaz visual de filtros
                const filterMyLeadsBtn = document.getElementById('inbox-filter-my-leads');
                const filterAllLeadsBtn = document.getElementById('inbox-filter-all-leads');
                if (filterMyLeadsBtn && filterAllLeadsBtn) {
                    filterAllLeadsBtn.classList.add('active');
                    filterMyLeadsBtn.classList.remove('active');
                }

                const filterBtns = document.querySelectorAll('.inbox-filter-btn');
                filterBtns.forEach(btn => {
                    if (btn.getAttribute('data-filter') === 'all') {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });

                const tagFilterInbox = document.getElementById('inbox-tag-filter');
                if (tagFilterInbox) {
                    tagFilterInbox.value = 'all';
                }

                // Cambiar vista SPA al Inbox
                const inboxTab = document.querySelector('[data-target="view-inbox"]');
                if (inboxTab) {
                    inboxTab.click();
                } else {
                    const sections = document.querySelectorAll('.content-section');
                    sections.forEach(section => {
                        if (section.id === 'view-inbox') {
                            section.classList.add('active');
                        } else {
                            section.classList.remove('active');
                        }
                    });
                }

                // Activar el chat del cliente seleccionado
                activateChatForLead(currentJiraLead.id);
            }
        });
    }

    // Cerrar modal al hacer click fuera del contenido del modal
    window.addEventListener('click', (e) => {
        if (e.target === jiraModal) {
            jiraModal.classList.add('hidden');
        }
    });

    // Simulador de Drag & Drop
    if (jiraDropzone) {
        jiraDropzone.addEventListener('click', () => {
            jiraFileInput.click();
        });

        jiraFileInput.addEventListener('change', (e) => {
            handleSimulatedFiles(e.target.files);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            jiraDropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                jiraDropzone.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            jiraDropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                jiraDropzone.classList.remove('dragover');
            }, false);
        });

        jiraDropzone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            handleSimulatedFiles(files);
        });
    }

    function handleSimulatedFiles(files) {
        if (!currentJiraLead || files.length === 0) return;

        Array.from(files).forEach(file => {
            const sizeStr = file.size > 1024 * 1024
                ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
                : (file.size / 1024).toFixed(0) + ' KB';

            currentJiraLead.attachments.push({
                name: file.name,
                size: sizeStr
            });

            currentJiraLead.activity_log.push({
                time: 'Ahora',
                author: 'Vendedora',
                content: `Archivo adjunto subido: ${file.name}.`
            });
        });

        renderJiraAttachments();
        renderJiraTimeline();
    }

    // ----------------------------------------------------------------------
    // V2.8 - NUEVAS INTERACCIONES AVANZADAS Y LOGS CAPI CORE
    // ----------------------------------------------------------------------

    // 1. Kanban Drag & Drop
    const kanbanColumnsList = document.querySelectorAll('.kanban-column');
    kanbanColumnsList.forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault();
            column.classList.add('drag-over');
        });

        column.addEventListener('dragleave', () => {
            column.classList.remove('drag-over');
        });

        column.addEventListener('drop', (e) => {
            e.preventDefault();
            column.classList.remove('drag-over');

            const leadId = e.dataTransfer.getData('text/plain');
            const lead = leadsList.find(l => l.id === leadId);
            const targetStage = column.getAttribute('data-stage');

            if (lead && lead.commercial_stage !== targetStage) {
                const oldStage = lead.commercial_stage;
                lead.commercial_stage = targetStage;
                lead.time_in_stage = 'Ahora';

                lead.activity_log.push({
                    time: 'Ahora',
                    author: 'Sistema',
                    content: `Movido de ${getStageDisplayName(oldStage)} a ${getStageDisplayName(targetStage)} vía Drag & Drop.`
                });

                // Notificar en el feed de la IA
                if (targetStage === 'ganado') {
                    const saleValue = lead.quoted_value > 0 ? lead.quoted_value : lead.estimated_budget;
                    if (typeof addAINotification === 'function') {
                        addAINotification('venta', `¡Nuevo cierre de venta! ${lead.name} por $${saleValue.toLocaleString('es-CO')} COP.`);
                    }
                    window.playSpokeSound('sale_won');
                } else {
                    if (typeof addAINotification === 'function') {
                        addAINotification('estado', `La IA movió a ${lead.name} a la columna ${getStageDisplayName(targetStage)}.`);
                    }
                }

                renderKanban();
            }
        });
    });

    // 2. Crear Cliente In-line
    const leadCreationModal = document.getElementById('lead-creation-modal');
    const closeCreationModalBtn = document.getElementById('close-creation-modal-btn');
    const leadCreationForm = document.getElementById('lead-creation-form');

    // Asignar clicks a los botones de añadir inline
    document.querySelectorAll('.btn-add-lead-inline').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const stage = btn.getAttribute('data-stage');
            document.getElementById('creation-stage-input').value = stage;
            if (leadCreationForm) leadCreationForm.reset();
            if (leadCreationModal) leadCreationModal.classList.remove('hidden');
        });
    });

    if (closeCreationModalBtn) {
        closeCreationModalBtn.addEventListener('click', () => {
            if (leadCreationModal) leadCreationModal.classList.add('hidden');
        });
    }

    if (leadCreationForm) {
        leadCreationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const stage = document.getElementById('creation-stage-input').value;
            const name = document.getElementById('creation-name').value.trim();
            const phone = document.getElementById('creation-phone').value.trim();
            const channel = document.getElementById('creation-channel').value;
            const budget = parseFloat(document.getElementById('creation-budget').value) || 0.00;

            const newLeadId = 'lead-' + Date.now();
            const avatars = [
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100',
                'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100&h=100',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100',
                'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100&h=100'
            ];
            const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

            const newLead = {
                id: newLeadId,
                name: name,
                phone: phone,
                channel_source: channel,
                ai_chat_status: 'ai_active',
                commercial_stage: stage,
                estimated_budget: budget,
                quoted_value: 0.00,
                avatar_url: randomAvatar,
                assigned_to: getCurrentAgent().uuid || 'advisor-vendedora-uuid',
                time_in_stage: 'Ahora',
                delivery_date: '',
                observations: '',
                attachments: [],
                activity_log: [
                    { time: 'Ahora', author: 'Sistema', content: 'Lead creado manualmente desde la columna.' }
                ],
                tags: [
                    { name: 'Nuevo', color: '#03DAC6' }
                ]
            };

            chatsHistory[newLeadId] = [
                { sender: 'customer', content: 'Hola, inicié una conversación.', time: 'Ahora' }
            ];

            leadsList.push(newLead);
            renderKanban();
            if (leadCreationModal) leadCreationModal.classList.add('hidden');
        });
    }

    // (Handlers de archivos eliminados aquí — los definitivos con Supabase Storage
    //  están consolidados arriba en el bloque de enviarAlWebhook)


    // 4. Meta Capi Conversion Toggle Listener
    const conversionToggle = document.getElementById('jira-conversion-toggle');
    if (conversionToggle) {
        conversionToggle.addEventListener('change', () => {
            if (conversionToggle.checked && currentJiraLead) {
                // Loguear evento
                console.log("%c[Meta CAPI] Enviando evento de conversión a Meta CAPI vía n8n workflow...", "color: #FF0266; font-weight: bold; font-size: 13px; text-shadow: 0 0 4px rgba(255, 2, 102, 0.4);");

                const capiPayload = {
                    event_name: "Purchase",
                    event_time: Math.floor(Date.now() / 1000),
                    user_data: {
                        client_name: currentJiraLead.name,
                        phone: currentJiraLead.phone,
                        external_id: currentJiraLead.id
                    },
                    custom_data: {
                        currency: "COP",
                        value: currentJiraLead.quoted_value > 0 ? currentJiraLead.quoted_value : currentJiraLead.estimated_budget
                    },
                    action_source: "physical_store",
                    opt_out: false
                };

                console.log("CAPI Payload Sent (JSON):", JSON.stringify(capiPayload, null, 2));

                // Agregar entrada de log inmediata al timeline
                currentJiraLead.activity_log.push({
                    time: 'Ahora',
                    author: 'Meta CAPI',
                    content: 'Enviando evento de conversión a Meta CAPI vía n8n workflow.'
                });

                // Notificar en el feed de la IA
                if (typeof addAINotification === 'function') {
                    addAINotification('prioridad', `La IA registró un evento de Conversión para ${currentJiraLead.name}.`);
                }

                renderJiraTimeline();
            }
        });
    }

    // 5. Centro de Notificaciones de la IA (V2.9)
    let aiNotifications = [
        { id: 'noti-1', type: 'prioridad', message: 'La IA ha etiquetado a Carlos Giraldo como Conversión.', time: 'Hace 5m' },
        { id: 'noti-2', type: 'estado', message: 'La IA movió a Cliente Anónimo a la columna Cotizado.', time: 'Hace 20m' },
        { id: 'noti-3', type: 'venta', message: '¡Nuevo cierre de venta! Carlos Giraldo por $4,200,000 COP.', time: 'Hace 1h' }
    ];

    const notiBellBtn = document.getElementById('noti-bell-btn');
    const notificationsPanel = document.getElementById('notifications-panel');
    const closeNotiPanelBtn = document.getElementById('close-noti-panel-btn');
    const notiPanelList = document.getElementById('noti-panel-list');
    const notiBadge = notiBellBtn ? notiBellBtn.querySelector('.noti-badge') : null;

    function renderNotifications() {
        if (!notiPanelList) return;
        notiPanelList.innerHTML = '';

        aiNotifications.forEach(noti => {
            const div = document.createElement('div');
            div.className = `noti-item ${noti.type}`;
            div.innerHTML = `
                <p style="margin-bottom: 2px;"><strong>${noti.type === 'venta' ? '🎉 Venta' : noti.type === 'prioridad' ? '🤖 Intención IA' : '🔄 Cambio Estado'}</strong></p>
                <p style="font-size: 11px; color: var(--text-secondary);">${noti.message}</p>
                <span class="noti-item-time">${noti.time}</span>
            `;
            notiPanelList.appendChild(div);
        });

        // Actualizar badge rojo si hay notificaciones
        if (notiBadge) {
            if (aiNotifications.length > 0) {
                notiBadge.classList.add('active');
            } else {
                notiBadge.classList.remove('active');
            }
        }
    }

    function addAINotification(type, message) {
        const newNoti = {
            id: 'noti-' + Date.now(),
            type: type,
            message: message,
            time: 'Ahora'
        };
        aiNotifications.unshift(newNoti);
        renderNotifications();

        // Efecto visual en la campana
        if (notiBellBtn) {
            notiBellBtn.style.transform = 'scale(1.2)';
            setTimeout(() => { notiBellBtn.style.transform = 'none'; }, 200);
            playNotificationSound();
        }
    }

    if (notiBellBtn && notificationsPanel) {
        notiBellBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationsPanel.classList.toggle('hidden');
            if (!notificationsPanel.classList.contains('hidden') && notiBadge) {
                notiBadge.classList.remove('active');
            }
        });
    }

    if (closeNotiPanelBtn && notificationsPanel) {
        closeNotiPanelBtn.addEventListener('click', () => {
            notificationsPanel.classList.add('hidden');
        });
    }

    // 6. Notas de Voz — MediaRecorder Real (reescritura completa)
    let mediaRecorder = null;
    let audioChunks = [];
    let micStream = null;

    if (chatBtnMic) {
        chatBtnMic.disabled = false; // habilitar el botón

        chatBtnMic.addEventListener('click', async () => {

            // ── DETENER grabación en curso ────────────────────────────────
            if (isRecording) {
                isRecording = false;
                clearInterval(recordingInterval);

                // Pedir al MediaRecorder que pare (dispara onstop)
                if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                    mediaRecorder.stop();
                }

                // Restaurar UI del botón
                chatBtnMic.classList.remove('recording');
                chatBtnMic.style.color = '';
                chatBtnMic.style.borderColor = '';
                chatBtnMic.innerHTML = '<i class="fa-solid fa-microphone"></i>';
                if (chatInputField) chatInputField.classList.remove('hidden');
                if (chatRecordingStatus) chatRecordingStatus.classList.add('hidden');
                if (chatSendBtn) chatSendBtn.disabled = false;
                return;
            }

            // ── INICIAR grabación ─────────────────────────────────────────
            try {
                micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            } catch (err) {
                alert('No se pudo acceder al micrófono. Verifica los permisos del navegador.\n' + err.message);
                return;
            }

            // Elegir el MIME type más compatible
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : MediaRecorder.isTypeSupported('audio/webm')
                    ? 'audio/webm'
                    : MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
                        ? 'audio/ogg;codecs=opus'
                        : '';

            audioChunks = [];
            mediaRecorder = new MediaRecorder(micStream, mimeType ? { mimeType } : {});

            // Recolectar datos cada 250 ms → garantiza audioChunks llenos
            mediaRecorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) audioChunks.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                // Liberar el micrófono
                micStream.getTracks().forEach(t => t.stop());

                const finalMime = mediaRecorder.mimeType || mimeType || 'audio/webm';
                const blob = new Blob(audioChunks, { type: finalMime });
                const blobUrl = URL.createObjectURL(blob);
                const finalDuration = recordingTimer ? recordingTimer.textContent : '00:00';
                const timeStr = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
                const targetLeadId = activeInboxLeadId;

                // 1. Preview inmediato en el chat (el asesor escucha antes de enviar)
                if (!chatsHistory[targetLeadId]) chatsHistory[targetLeadId] = [];
                chatsHistory[targetLeadId].push({
                    sender: 'human',
                    type: 'audio',
                    audioUrl: blobUrl,   // URL temporal para preview
                    duration: finalDuration,
                    time: timeStr
                });
                renderInbox();

                // 2. Subir a Supabase Storage en segundo plano
                const ext = finalMime.includes('ogg') ? 'ogg' : 'webm';
                const audioFile = new File([blob], `voice-note-${Date.now()}.${ext}`, { type: finalMime });
                const mediaUrl = await uploadToSupabaseStorage(audioFile);

                // 3. Guardar en Supabase DB
                guardarMensajeEnSupabase(targetLeadId, 'human', '', 'audio', { mediaUrl, duration: finalDuration });

                // 4. Disparar webhook n8n
                await enviarAlWebhook({ sessionId: targetLeadId, mensaje: '', tipo: 'audio', mediaUrl });
            };

            // Iniciar captura con timeslice de 250 ms
            mediaRecorder.start(250);
            isRecording = true;
            handoverToHuman();

            // UI de grabación activa
            chatBtnMic.classList.add('recording');
            chatBtnMic.style.color = 'var(--neon-magenta)';
            chatBtnMic.style.borderColor = 'var(--neon-magenta)';
            chatBtnMic.innerHTML = '<i class="fa-solid fa-square"></i>';
            if (chatInputField) chatInputField.classList.add('hidden');
            if (chatRecordingStatus) chatRecordingStatus.classList.remove('hidden');
            if (chatSendBtn) chatSendBtn.disabled = true;

            // Cronómetro visual
            recordingSeconds = 0;
            if (recordingTimer) recordingTimer.textContent = '00:00';
            recordingInterval = setInterval(() => {
                recordingSeconds++;
                const m = Math.floor(recordingSeconds / 60).toString().padStart(2, '0');
                const s = (recordingSeconds % 60).toString().padStart(2, '0');
                if (recordingTimer) recordingTimer.textContent = `${m}:${s}`;
            }, 1000);
        });
    }

    // Ajustar clics fuera para el modal de creación y drawer de notificaciones
    window.addEventListener('click', (e) => {
        if (e.target === leadCreationModal) {
            leadCreationModal.classList.add('hidden');
        }
        if (notificationsPanel && !notificationsPanel.classList.contains('hidden') && !notificationsPanel.contains(e.target) && e.target !== notiBellBtn) {
            notificationsPanel.classList.add('hidden');
        }
    });

    // Reloj dinámico en el Sidebar (V2.9.3)
    function updateSidebarClock() {
        const timeTextEl = document.getElementById('sidebar-time-text');
        if (!timeTextEl) return;

        const now = new Date();
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

        const dayName = days[now.getDay()];
        const dayNum = now.getDate();
        const monthName = months[now.getMonth()];

        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // 0 debe ser 12
        const hourStr = hours.toString().padStart(2, '0');

        timeTextEl.textContent = `${dayName}, ${dayNum} ${monthName} • ${hourStr}:${minutes} ${ampm}`;
    }

    updateSidebarClock();
    setInterval(updateSidebarClock, 60000);

    // Actualizar dinámicamente los selectores de filtros con las etiquetas existentes (sistema + personalizadas)
    function updateTagFilterDropdowns() {
        const tagFilterSelect = document.getElementById('tag-filter');
        const tagFilterInbox = document.getElementById('inbox-tag-filter');

        const systemTags = ['Alta Prioridad', 'Seguimiento', 'Nuevo', 'Pendiente', 'Conversión'];
        const customTags = JSON.parse(localStorage.getItem('spoke_custom_tags') || '[]');
        const allTagNames = [...systemTags, ...customTags.map(t => t.name)];

        [tagFilterSelect, tagFilterInbox].forEach(selectEl => {
            if (!selectEl) return;
            const currentValue = selectEl.value;
            selectEl.innerHTML = '<option value="all">Etiquetas (Todas)</option>';
            allTagNames.forEach(name => {
                const opt = document.createElement('option');
                opt.value = name;
                opt.textContent = name;
                selectEl.appendChild(opt);
            });
            // Restaurar valor anterior si aún es válido y actualizar la variable interna de filtro
            if (allTagNames.includes(currentValue)) {
                selectEl.value = currentValue;
                if (selectEl === tagFilterInbox) {
                    currentInboxTagFilter = currentValue;
                }
            } else {
                selectEl.value = 'all';
                if (selectEl === tagFilterInbox) {
                    currentInboxTagFilter = 'all';
                }
            }
        });
    }

    // Eliminar etiquetas personalizadas de la memoria y leads
    function deleteCustomTag(name) {
        let customTags = JSON.parse(localStorage.getItem('spoke_custom_tags') || '[]');
        customTags = customTags.filter(ct => ct.name !== name);
        localStorage.setItem('spoke_custom_tags', JSON.stringify(customTags));

        // Remover de los leads
        leadsList.forEach(lead => {
            lead.tags = lead.tags.filter(t => t.name !== name);
        });

        renderTagsPanel();
        renderKanban();
        updateTagFilterDropdowns();
    }

    // Manejar envío del formulario de creación de etiquetas
    const createTagForm = document.getElementById('create-tag-form');
    if (createTagForm) {
        createTagForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const tagNameInput = document.getElementById('new-tag-name');
            const tagColorInput = document.getElementById('new-tag-color');
            const tagName = tagNameInput.value.trim();
            const tagColor = tagColorInput.value;

            if (!tagName) return;

            const systemTags = ['Alta Prioridad', 'Seguimiento', 'Nuevo', 'Pendiente', 'Conversión'];
            const customTags = JSON.parse(localStorage.getItem('spoke_custom_tags') || '[]');
            const existsInSystem = systemTags.includes(tagName);
            const existsInCustom = customTags.some(ct => ct.name.toLowerCase() === tagName.toLowerCase());

            if (existsInSystem || existsInCustom) {
                alert('Ya existe una etiqueta con este nombre.');
                return;
            }

            customTags.push({ name: tagName, color: tagColor });
            localStorage.setItem('spoke_custom_tags', JSON.stringify(customTags));

            tagNameInput.value = '';
            renderTagsPanel();
            updateTagFilterDropdowns();
        });
    }

    // ==========================================================================
    // SECCIÓN DE NUEVOS PARÁMETROS DEL CORE V3.5
    // ==========================================================================

    // 1. Simulación de Respuestas de la Inteligencia Artificial (System Prompt & Model) (V3.5)
    function simulateAIResponse(leadId) {
        const lead = leadsList.find(l => l.id === leadId);
        if (!lead || lead.ai_chat_status !== 'ai_active') return;

        // Recuperar configuración de LLM en localStorage
        const savedConfig = localStorage.getItem('spoke_ai_config');
        const defaultConfig = {
            model: 'claude-3-5',
            prompt: 'Eres un asesor de ventas de Muebleo. Responde de manera profesional y empática.'
        };
        const aiConfig = savedConfig ? JSON.parse(savedConfig) : defaultConfig;
        const modelName = aiConfig.model === 'gpt-4o' ? 'GPT-4o' : aiConfig.model === 'gemini-1-5' ? 'Gemini 1.5 Pro' : 'Claude 3.5 Sonnet';
        const systemPrompt = aiConfig.prompt;

        // Simular tiempo de respuesta (1.5 segundos)
        setTimeout(() => {
            // Verificar si sigue activo
            if (lead.ai_chat_status !== 'ai_active') return;

            const messages = chatsHistory[leadId] || [];
            const lastMsg = messages[messages.length - 1];
            if (lastMsg && lastMsg.sender === 'ai') return; // Evitar respuestas dobles

            let responseText = '';
            const customerMsg = lastMsg ? lastMsg.content : '';

            // Lógica conversacional básica
            if (customerMsg.toLowerCase().includes('precio') || customerMsg.toLowerCase().includes('cuesta') || customerMsg.toLowerCase().includes('cuánto')) {
                responseText = `[Simulado con ${modelName}] ¡Hola! De acuerdo con mis instrucciones de sistema (${systemPrompt.substring(0, 30)}...), te confirmo que el precio y stock están disponibles.`;
            } else if (customerMsg.toLowerCase().includes('pago') || customerMsg.toLowerCase().includes('comprar') || customerMsg.toLowerCase().includes('ordenar')) {
                responseText = `[Simulado con ${modelName}] ¡Excelente! Tomando en cuenta las reglas configuradas en mi prompt de sistema, he procesado tu solicitud. Te enviaremos el link de pago por SMS.`;
            } else {
                responseText = `[Simulado con ${modelName}] He recibido tu consulta. Basado en el prompt de sistema: "${systemPrompt.substring(0, 45)}...", te atenderemos de inmediato. ¿Deseas saber algo más?`;
            }

            const timeStr = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
            if (!chatsHistory[leadId]) chatsHistory[leadId] = [];
            chatsHistory[leadId].push({
                sender: 'ai',
                content: responseText,
                time: timeStr
            });

            if (leadId === activeInboxLeadId) {
                renderInbox();
            }
        }, 1500);
    }

    // Cargar y Guardar Configuración de IA
    const aiModelSelect = document.getElementById('ai-model-select');
    const aiSystemPrompt = document.getElementById('ai-system-prompt');
    const saveAiConfigBtn = document.getElementById('save-ai-config-btn');

    function loadAIConfig() {
        const savedConfig = localStorage.getItem('spoke_ai_config');
        const defaultConfig = {
            model: 'claude-3-5',
            prompt: 'Eres un asesor de ventas experto de Muebleo. Ayudas a los clientes a elegir los mejores muebles para su hogar, respondiendo con amabilidad, dando detalles del stock de product_cache, y guiándolos al cierre de la venta.'
        };
        const config = savedConfig ? JSON.parse(savedConfig) : defaultConfig;

        if (aiModelSelect) aiModelSelect.value = config.model;
        if (aiSystemPrompt) aiSystemPrompt.value = config.prompt;
    }

    if (saveAiConfigBtn) {
        saveAiConfigBtn.addEventListener('click', () => {
            const model = aiModelSelect ? aiModelSelect.value : 'claude-3-5';
            const prompt = aiSystemPrompt ? aiSystemPrompt.value : '';

            const config = { model, prompt };
            localStorage.setItem('spoke_ai_config', JSON.stringify(config));

            alert(`¡Configuración de IA guardada con éxito!\n\nModelo: ${model === 'gpt-4o' ? 'GPT-4o' : model === 'gemini-1-5' ? 'Gemini 1.5 Pro' : 'Claude 3.5 Sonnet'}\nSystem Prompt actualizado.`);
        });
    }

    // 2. Hub de Canales Omnicanal e Interacciones de Webhooks (V3.5)
    const channelModal = document.getElementById('channel-connection-modal');
    const closeChannelModalBtn = document.getElementById('close-channel-modal-btn');
    const channelForm = document.getElementById('channel-connection-form');
    const channelLoadingSpinner = document.getElementById('channel-loading-spinner');
    const channelSubmitBtn = document.getElementById('channel-submit-btn');

    const channelNames = {
        whatsapp: 'WhatsApp Cloud API',
        messenger: 'FB Messenger',
        tiktok: 'TikTok Business',
        webchat: 'Webchat Widget'
    };

    function loadChannelsStatus() {
        const defaultStatus = { whatsapp: false, messenger: false, tiktok: false, webchat: false };
        const status = JSON.parse(localStorage.getItem('spoke_channels_status') || JSON.stringify(defaultStatus));

        Object.keys(status).forEach(key => {
            const badge = document.getElementById(`status-${key}`);
            const btn = document.querySelector(`.btn-channel-vincular[data-channel="${key}"]`);

            if (badge) {
                if (status[key]) {
                    badge.className = 'channel-status-badge connected';
                    badge.textContent = 'Conectado';
                } else {
                    badge.className = 'channel-status-badge disconnected';
                    badge.textContent = 'Desconectado';
                }
            }

            if (btn) {
                btn.textContent = status[key] ? 'Desvincular' : 'Vincular';
                if (status[key]) {
                    btn.style.backgroundColor = 'var(--border-color)';
                    btn.style.color = 'var(--text-primary)';
                } else {
                    btn.style.backgroundColor = 'var(--dark-accent)';
                    btn.style.color = '#ffffff';
                }
            }
        });
    }

    // Delegación de clics en vincular/desvincular de canales
    document.querySelectorAll('.btn-channel-vincular').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const channel = btn.getAttribute('data-channel');
            const status = JSON.parse(localStorage.getItem('spoke_channels_status') || '{"whatsapp":false,"messenger":false,"tiktok":false,"webchat":false}');

            if (status[channel]) {
                // Desvincular
                if (confirm(`¿Estás seguro de que deseas desvincular el canal ${channelNames[channel]}?`)) {
                    status[channel] = false;
                    localStorage.setItem('spoke_channels_status', JSON.stringify(status));
                    loadChannelsStatus();
                }
            } else {
                // Abrir Modal de Vinculación
                document.getElementById('channel-modal-type').value = channel;
                document.getElementById('channel-modal-name').value = channelNames[channel];
                document.getElementById('channel-endpoint-url').value = `https://n8n.spoke-ia.com/webhook/v1/${channel}/muebleo`;

                // Limpiar inputs
                document.getElementById('channel-api-key').value = '';

                if (channelLoadingSpinner) channelLoadingSpinner.classList.add('hidden');
                if (channelSubmitBtn) {
                    channelSubmitBtn.disabled = false;
                    channelSubmitBtn.textContent = 'Vincular Canal';
                }

                if (channelModal) channelModal.classList.remove('hidden');
            }
        });
    });

    if (closeChannelModalBtn) {
        closeChannelModalBtn.addEventListener('click', () => {
            if (channelModal) channelModal.classList.add('hidden');
        });
    }

    if (channelForm) {
        channelForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const channel = document.getElementById('channel-modal-type').value;

            // Simular vinculación con spinner
            if (channelLoadingSpinner) channelLoadingSpinner.classList.remove('hidden');
            if (channelSubmitBtn) {
                channelSubmitBtn.disabled = true;
                channelSubmitBtn.textContent = 'Vinculando...';
            }

            setTimeout(() => {
                const status = JSON.parse(localStorage.getItem('spoke_channels_status') || '{"whatsapp":false,"messenger":false,"tiktok":false,"webchat":false}');
                status[channel] = true;
                localStorage.setItem('spoke_channels_status', JSON.stringify(status));

                if (channelModal) channelModal.classList.add('hidden');
                loadChannelsStatus();

                alert(`¡Canal ${channelNames[channel]} conectado con éxito!\nWebhook configurado y validado en n8n.`);
            }, 1500);
        });
    }

    // ----------------------------------------------------------------------
    // Sincronización Simultánea de Orígenes de Datos (Catálogo) (V3.6)
    // ----------------------------------------------------------------------
    const catalogStatusBadges = {
        shopify: document.getElementById('catalog-status-shopify'),
        woocommerce: document.getElementById('catalog-status-woocommerce'),
        apirest: document.getElementById('catalog-status-apirest')
    };

    function loadCatalogConnections() {
        const defaultConns = { shopify: false, woocommerce: false, apirest: false };
        const conns = JSON.parse(localStorage.getItem('spoke_catalog_connections') || JSON.stringify(defaultConns));

        Object.keys(conns).forEach(platform => {
            const badge = catalogStatusBadges[platform];
            const btn = document.querySelector(`.btn-catalog-connect[data-platform="${platform}"]`);

            if (badge) {
                if (conns[platform]) {
                    badge.className = 'catalog-status-badge connected';
                    badge.textContent = 'Conectado';
                    badge.style.color = '#10B981'; // Green
                } else {
                    badge.className = 'catalog-status-badge disconnected';
                    badge.textContent = 'Desconectado';
                    badge.style.color = 'var(--text-muted)';
                }
            }

            if (btn) {
                btn.textContent = conns[platform] ? 'Desconectar' : 'Conectar';
                if (conns[platform]) {
                    btn.style.backgroundColor = 'var(--border-color)';
                    btn.style.color = 'var(--text-primary)';
                } else {
                    btn.style.backgroundColor = 'var(--dark-accent)';
                    btn.style.color = '#ffffff';
                }
            }
        });
    }

    document.querySelectorAll('.btn-catalog-connect').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const platform = btn.getAttribute('data-platform');
            const defaultConns = { shopify: false, woocommerce: false, apirest: false };
            const conns = JSON.parse(localStorage.getItem('spoke_catalog_connections') || JSON.stringify(defaultConns));

            // Toggle connection status
            conns[platform] = !conns[platform];
            localStorage.setItem('spoke_catalog_connections', JSON.stringify(conns));
            loadCatalogConnections();

            const platformNames = { shopify: 'Shopify', woocommerce: 'WooCommerce', apirest: 'API REST Custom' };
            const actionStr = conns[platform] ? 'conectado' : 'desconectado';
            console.log(`Origen de datos ${platformNames[platform]} ${actionStr}.`);
        });
    });

    // ----------------------------------------------------------------------
    // Gráfico de Distribución del Pipeline (V3.8)
    // ----------------------------------------------------------------------
    function renderizarGraficoPipeline() {
        const ctx = document.getElementById('pipelineChart');
        if (!ctx) return;

        // Datos simulados (valores en millones para el ejemplo)
        const chartData = {
            labels: ['Alta Prioridad', 'Seguimiento', 'Nuevo / Info', 'Pendiente', 'Conversión (CAPI)'],
            datasets: [{
                data: [4.5, 3.2, 2.1, 0.9, 4.5], // Suma: 15.2M
                backgroundColor: [
                    '#FF0266', // Magenta
                    '#BB86FC', // Púrpura
                    '#03DAC6', // Cian
                    '#FFAB40', // Naranja
                    '#4ADE80'  // Verde (Nueva Conversión)
                ],
                borderWidth: 0,
                hoverOffset: 10 // Efecto de expansión al pasar el mouse
            }]
        };

        // Calcular el total
        const totalValue = chartData.datasets[0].data.reduce((a, b) => a + b, 0).toFixed(1);

        const config = {
            type: 'doughnut',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '82%', // Hueco más grande para texto holgado
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#4B5563', font: { family: "'Inter', sans-serif", size: 12 }, usePointStyle: true, padding: 20 }
                    },
                    tooltip: { enabled: false } // Desactivamos el tooltip clásico
                },
                onHover: (event, elements) => {
                    const labelEl = document.getElementById('chart-center-label');
                    const valueEl = document.getElementById('chart-center-value');

                    if (elements && elements.length > 0) {
                        // El ratón está sobre un segmento
                        const index = elements[0].index;
                        labelEl.innerText = chartData.labels[index];
                        valueEl.innerText = '$' + chartData.datasets[0].data[index] + 'M';
                        valueEl.style.color = chartData.datasets[0].backgroundColor[index]; // Cambia el color del texto!
                    } else {
                        // El ratón salió, vuelve al total
                        labelEl.innerText = 'Pipeline Total';
                        valueEl.innerText = '$' + totalValue + 'M';
                        valueEl.style.color = '#111827';
                    }
                }
            }
        };

        // Si existe un gráfico previo, lo destruimos para evitar solapamientos
        if (window.myPipelineChart) {
            window.myPipelineChart.destroy();
        }
        window.myPipelineChart = new Chart(ctx, config);
    }

    // ----------------------------------------------------------------------
    // Divisor arrastrable (Resizable Sidebar) tipo WhatsApp Web
    // ----------------------------------------------------------------------
    const resizer = document.getElementById('resizer');
    const leftPanel = document.querySelector('.inbox-sidebar');

    if (resizer && leftPanel) {
        // Cargar el ancho guardado de localStorage para persistencia premium
        const savedWidth = localStorage.getItem('spoke_sidebar_width');
        if (savedWidth) {
            leftPanel.style.width = savedWidth + 'px';
        }

        resizer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const startX = e.clientX;
            const startWidth = leftPanel.offsetWidth;

            resizer.classList.add('is-dragging');
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'col-resize';

            const onMouseMove = (e) => {
                const newWidth = startWidth + (e.clientX - startX);
                const minW = 240;
                const maxW = 480;
                const clampedWidth = Math.min(maxW, Math.max(minW, newWidth));

                leftPanel.style.width = clampedWidth + 'px';
                localStorage.setItem('spoke_sidebar_width', clampedWidth);
            };

            const onMouseUp = () => {
                resizer.classList.remove('is-dragging');
                document.body.style.userSelect = '';
                document.body.style.cursor = '';

                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }

    // ----------------------------------------------------------------------
    // 19. Live Web Chat Widget (Refactored to widget-loader.js)
    // ----------------------------------------------------------------------
    window.spokeCRM = {
        get chatsHistory() { return chatsHistory; },
        set chatsHistory(val) { chatsHistory = val; },
        get leadsList() { return leadsList; },
        set leadsList(val) { leadsList = val; },
        get activeInboxLeadId() { return activeInboxLeadId; },
        set activeInboxLeadId(val) { activeInboxLeadId = val; },
        renderInbox: () => {
            if (typeof renderInbox === 'function') renderInbox();
        },
        renderActiveChat: () => {
            if (typeof renderActiveChat === 'function') renderActiveChat();
        },
        guardarMensajeEnSupabase: async (leadId, sender, content, msgType, metadata) => {
            if (typeof guardarMensajeEnSupabase === 'function') {
                await guardarMensajeEnSupabase(leadId, sender, content, msgType, metadata);
            }
        }
    };

    // Inicializar sesión de Supabase y luego hacer checkAuth
    // ⚡ Guard de re-entrada: evita que inicializarDashboardConDatos se ejecute más
    // de una vez si getSession() y onAuthStateChange('SIGNED_IN') compiten.
    let dashboardYaInicializado = false;

    function inicializarDashboardConDatos(session) {
        if (!session || !session.user) return;

        if (dashboardYaInicializado) {
            console.log('🛡️ [Guard] inicializarDashboardConDatos ya ejecutado — ignorando invocación duplicada.');
            return;
        }
        dashboardYaInicializado = true;

        currentSession = session; // Guardar en caché local
        const user = session.user;
        const agentName = user.user_metadata?.name || user.email.split('@')[0];
        const agentPhoto = user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100&h=100';

        if (agentDisplayName) agentDisplayName.textContent = agentName;
        if (dashboardWelcome) dashboardWelcome.textContent = `¡Hola, ${agentName.split(' ')[0]}!`;

        const avatarImg = document.getElementById('agent-profile-img');
        if (avatarImg) {
            avatarImg.src = agentPhoto;
        }

        // Cargar Presencia Asesor
        const savedPresence = localStorage.getItem('spoke_presence') || 'active';
        if (presenceSelect) {
            presenceSelect.value = savedPresence;
            updatePresenceUI(savedPresence);
        }

        // Renderizar datos del Dashboard (datos locales, sin red)
        renderDashboardStats();
        renderKanban();
        if (typeof renderNotifications === 'function') renderNotifications();
        if (typeof updateTagFilterDropdowns === 'function') updateTagFilterDropdowns();
        if (typeof loadAIConfig === 'function') loadAIConfig();
        if (typeof loadChannelsStatus === 'function') loadChannelsStatus();
        if (typeof loadCatalogConnections === 'function') loadCatalogConnections();

        // Cargar conversaciones desde Supabase (Promise Cache garantiza 1 sola petición)
        cargarConversacionesDesdeSupabase();
        renderizarGraficoPipeline();
    }

    function cambiarPantallaSegunSesion(session) {
        currentSession = session; // Guardar en caché local

        if (session && session.user) {
            // Mostrar CRM
            if (loginScreen) {
                loginScreen.classList.add('hidden');
                loginScreen.style.setProperty('display', 'none', 'important');
            }
            if (crmLayout) {
                crmLayout.classList.remove('hidden');
                crmLayout.style.setProperty('display', 'flex', 'important');
            }
            inicializarDashboardConDatos(session);
        } else {
            // Mostrar Login
            if (crmLayout) {
                crmLayout.classList.add('hidden');
                crmLayout.style.setProperty('display', 'none', 'important');
            }
            if (loginScreen) {
                loginScreen.classList.remove('hidden');
                loginScreen.style.removeProperty('display');
            }
        }
    }

    // Inicializar sesión de Supabase y luego hacer checkAuth
    async function inicializarSesionAuth() {
        try {
            // Ocultar contenedores de inmediato antes del fetch para evitar destellos (Race Condition)
            if (loginScreen) {
                loginScreen.classList.add('hidden');
                loginScreen.style.setProperty('display', 'none', 'important');
            }
            if (crmLayout) {
                crmLayout.classList.add('hidden');
                crmLayout.style.setProperty('display', 'none', 'important');
            }

            const { data, error } = await supabaseClient.auth.getSession();
            if (error) throw error;
            console.log("Estado de sesión:", data.session);
            cambiarPantallaSegunSesion(data.session);
        } catch (err) {
            console.error("Error al obtener sesión de Supabase:", err.message);
            cambiarPantallaSegunSesion(null);
        }
    }

    // Configurar listener para cambios de autenticación en Supabase
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        console.log(`🔑 Evento de Auth de Supabase: ${event}`);
        console.log("Estado de sesión:", session);

        if (event === 'SIGNED_IN' && session) {
            cambiarPantallaSegunSesion(session);
        } else if (event === 'SIGNED_OUT') {
            cambiarPantallaSegunSesion(null);
        }
    });

    await inicializarSesionAuth();
});
