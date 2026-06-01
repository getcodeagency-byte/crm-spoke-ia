-- Habilitar la extensión para generar UUIDs de forma automática si no está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla: companies (Inquilinos / Marcas)
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    api_credentials TEXT NULL, -- Para tokens y credenciales cifradas de WooCommerce, Shopify, etc.
    ai_provider_config JSONB NULL, -- Proveedor y modelo asignado (ej: {"provider": "openai", "model": "gpt-4o"})
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice para búsquedas por subdominio
CREATE INDEX IF NOT EXISTS idx_companies_subdomain ON companies(subdomain);

-- 2. Tabla: users (Asesores Comerciales)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'agent')),
    status VARCHAR(50) NOT NULL DEFAULT 'offline' CHECK (status IN ('available', 'away', 'offline')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice para login y búsquedas de inquilino
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);

-- 3. Tabla: leads (Prospectos / Oportunidades)
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NULL,
    phone VARCHAR(50) NOT NULL,
    channel_source VARCHAR(50) NOT NULL CHECK (channel_source IN ('whatsapp', 'tiktok', 'webchat', 'messenger', 'instagram')),
    ai_chat_status VARCHAR(50) NOT NULL DEFAULT 'ai_active' CHECK (ai_chat_status IN ('ai_active', 'human_paused')),
    commercial_stage VARCHAR(50) NOT NULL DEFAULT 'nuevo' CHECK (commercial_stage IN ('nuevo', 'seguimiento', 'cotizado', 'ganado', 'perdido')),
    estimated_budget DECIMAL(12,2) DEFAULT 0.00,
    quoted_value DECIMAL(12,2) DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices frecuentes para búsquedas y enrutamiento
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_company_id ON leads(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(commercial_stage);

-- 4. Tabla: messages (Historial de Conversaciones)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    sender_type VARCHAR(50) NOT NULL CHECK (sender_type IN ('customer', 'ai', 'human')),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Asesor si sender_type es 'human'
    message_content TEXT NOT NULL,
    media_url TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice para ordenación de chats por lead
CREATE INDEX IF NOT EXISTS idx_messages_lead_id_created ON messages(lead_id, created_at ASC);

-- 5. Tabla: tags (Catálogo de Etiquetas Inteligentes)
CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    tag_name VARCHAR(100) NOT NULL,
    color_code VARCHAR(7) DEFAULT '#111827',
    CONSTRAINT unique_tag_company UNIQUE(company_id, tag_name)
);

-- Crear índice para búsquedas de etiquetas por compañía
CREATE INDEX IF NOT EXISTS idx_tags_company_id ON tags(company_id);

-- 6. Tabla de Unión: lead_tags (Asociación entre Prospectos y Etiquetas)
CREATE TABLE IF NOT EXISTS lead_tags (
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    tag_id INT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (lead_id, tag_id)
);

-- 7. Tabla: product_cache (Indexación Semántica de Inventario - Universal)
CREATE TABLE IF NOT EXISTS product_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    ecommerce_platform VARCHAR(50) NOT NULL CHECK (ecommerce_platform IN ('woocommerce', 'shopify', 'vtex', 'magento', 'tiendanube', 'custom_api')),
    external_product_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    stock_status VARCHAR(50) NOT NULL CHECK (stock_status IN ('instock', 'outofstock')),
    semantic_description TEXT NOT NULL,
    image_url TEXT NULL,
    product_url TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice para buscar productos por empresa
CREATE INDEX IF NOT EXISTS idx_products_company ON product_cache(company_id);
