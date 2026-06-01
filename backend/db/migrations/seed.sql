-- Datos Semilla de Prueba para spoke!

-- 1. Insertar Compañía de Prueba (Cliente Cero: Muebleo Mobiliario)
INSERT INTO companies (id, name, subdomain, api_credentials, ai_provider_config)
VALUES (
    'a2b9d031-13a8-485c-a5b6-681c623be871',
    'Muebleo Mobiliario',
    'muebleo',
    '{"client_id": "mock_id", "client_secret": "mock_secret"}',
    '{"provider": "openai", "model": "gpt-4o", "tier": "premium"}'
) ON CONFLICT DO NOTHING;

-- 2. Insertar Usuarios (Asesores Comerciales)
-- Contraseña encriptada para 'muebleo123' usando bcrypt
INSERT INTO users (id, company_id, name, email, password_hash, role, status)
VALUES (
    'e5c026d3-2f08-410a-8bf8-22ee5cb785fa',
    'a2b9d031-13a8-485c-a5b6-681c623be871',
    'Vendedora Activa',
    'vendedora@muebleo.com',
    '$2a$10$e0myzXyOiF3tQ0v/8YcT/egfX76.U0BwK9u5l7rS2V2gGkQfQvG2K', -- hash bcrypt para 'muebleo123'
    'agent',
    'available'
) ON CONFLICT DO NOTHING;

-- 3. Insertar Etiquetas Inteligentes (tags)
INSERT INTO tags (id, company_id, tag_name, color_code)
VALUES 
    (1, 'a2b9d031-13a8-485c-a5b6-681c623be871', 'Alta Intención', '#00E676'),
    (2, 'a2b9d031-13a8-485c-a5b6-681c623be871', 'Interés Sala', '#3B82F6'),
    (3, 'a2b9d031-13a8-485c-a5b6-681c623be871', 'Pregunta Stock', '#8B5CF6'),
    (4, 'a2b9d031-13a8-485c-a5b6-681c623be871', 'Comedor 6 Puestos', '#F59E0B')
ON CONFLICT (company_id, tag_name) DO UPDATE SET color_code = EXCLUDED.color_code;

-- Ajustar la secuencia del serial de tags
SELECT setval(pg_get_serial_sequence('tags', 'id'), coalesce(max(id), 1)) FROM tags;

-- 4. Insertar Leads (Oportunidades)
INSERT INTO leads (id, company_id, assigned_user_id, name, phone, channel_source, ai_chat_status, commercial_stage, estimated_budget, quoted_value)
VALUES 
    (
        'b7d9036c-94cf-46d5-bc44-5d55fa4fb72d', 
        'a2b9d031-13a8-485c-a5b6-681c623be871', 
        'e5c026d3-2f08-410a-8bf8-22ee5cb785fa', 
        'Cliente Anónimo', 
        '+573115551234', 
        'whatsapp', 
        'ai_active', 
        'nuevo', 
        2500000.00, 
        0.00
    ),
    (
        'c4e69d7b-bc43-4e89-9a1b-e522f7b8b4f2', 
        'a2b9d031-13a8-485c-a5b6-681c623be871', 
        'e5c026d3-2f08-410a-8bf8-22ee5cb785fa', 
        'María Rodríguez', 
        '+573004445678', 
        'instagram', 
        'ai_active', 
        'nuevo', 
        0.00, 
        0.00
    ),
    (
        'f9a5d1b3-4f90-48e0-bb12-9c1a5b8f642a', 
        'a2b9d031-13a8-485c-a5b6-681c623be871', 
        'e5c026d3-2f08-410a-8bf8-22ee5cb785fa', 
        'Carlos Giraldo', 
        '+573209998877', 
        'webchat', 
        'human_paused', 
        'seguimiento', 
        0.00, 
        4200000.00
    )
ON CONFLICT DO NOTHING;

-- 5. Relacionar Leads con Etiquetas
INSERT INTO lead_tags (lead_id, tag_id)
VALUES 
    ('b7d9036c-94cf-46d5-bc44-5d55fa4fb72d', 1), -- Anónimo -> Alta Intención
    ('b7d9036c-94cf-46d5-bc44-5d55fa4fb72d', 2), -- Anónimo -> Interés Sala
    ('c4e69d7b-bc43-4e89-9a1b-e522f7b8b4f2', 3), -- María -> Pregunta Stock
    ('f9a5d1b3-4f90-48e0-bb12-9c1a5b8f642a', 4)  -- Carlos -> Comedor 6 Puestos
ON CONFLICT DO NOTHING;

-- 6. Insertar Inventario Sincronizado (product_cache)
INSERT INTO product_cache (id, company_id, ecommerce_platform, external_product_id, title, price, stock_status, semantic_description, image_url, product_url)
VALUES 
    (
        'd0d1a49a-bbce-45c1-8408-251f043fa38b',
        'a2b9d031-13a8-485c-a5b6-681c623be871',
        'woocommerce',
        '304',
        'Sofá Nórdico Escandinavo',
        2200000.00,
        'instock',
        'Sofá de 3 puestos de diseño nórdico minimalista con patas de madera clara de roble. Ideal para apartamentos pequeños o salas modernas de estilo escandinavo. Tapizado en lino gris claro antimanchas.',
        'https://muebleo.spoke-ia.com/wp-content/uploads/sofa-nordico.jpg',
        'https://muebleo.spoke-ia.com/product/sofa-nordico-escandinavo'
    ),
    (
        'e8f7a634-1122-3344-5566-778899aabbcc',
        'a2b9d031-13a8-485c-a5b6-681c623be871',
        'woocommerce',
        '305',
        'Comedor Industrial Minimalista',
        3800000.00,
        'instock',
        'Mesa de comedor de 6 puestos hecha de madera maciza de pino recuperado con base metálica negra. Estilo industrial ideal para lofts, oficinas o salas rústico-urbanas.',
        'https://muebleo.spoke-ia.com/wp-content/uploads/comedor-industrial.jpg',
        'https://muebleo.spoke-ia.com/product/comedor-industrial-minimalista'
    ),
    (
        'f9e8d7c6-b5a4-9382-7160-594837261504',
        'a2b9d031-13a8-485c-a5b6-681c623be871',
        'shopify',
        'shop_9921',
        'Lámpara de Pie Vintage Cobre',
        450000.00,
        'instock',
        'Lámpara de pie de brazo ajustable de metal con acabado en cobre cepillado. Estilo vintage ideal para luz de lectura al lado del sofá en la sala o en un estudio.',
        'https://muebleo.spoke-ia.com/wp-content/uploads/lampara-vintage.jpg',
        'https://muebleo.spoke-ia.com/product/lampara-pie-vintage-cobre'
    )
ON CONFLICT DO NOTHING;

-- 7. Insertar Mensajes de Prueba
INSERT INTO messages (id, lead_id, sender_type, user_id, message_content)
VALUES 
    ('a9b8c7d6-e5f4-3a2b-1c0d-9e8f7a6b5c4d', 'b7d9036c-94cf-46d5-bc44-5d55fa4fb72d', 'customer', NULL, 'Hola, estoy buscando un sofá para mi nuevo apartamento. No tengo mucho espacio.'),
    ('b9c8d7e6-f5a4-4b3c-2d1e-0f9e8d7c6b5a', 'b7d9036c-94cf-46d5-bc44-5d55fa4fb72d', 'ai', NULL, '¡Hola! Qué gusto saludarte. Con gusto te ayudo a encontrar la pieza perfecta para tu nuevo hogar. ¿Qué estilo o colores tienes en mente para tu sala? ¿Te gusta más el estilo nórdico moderno o algo industrial?'),
    ('c9d8e7f6-a5b4-5c3d-3e2f-1f0e9d8c7b6a', 'b7d9036c-94cf-46d5-bc44-5d55fa4fb72d', 'customer', NULL, 'Me gusta el estilo nórdico, con patas de madera clara. Mi presupuesto es de unos 2.5 millones.')
ON CONFLICT DO NOTHING;
