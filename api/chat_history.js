// /api/chat_history.js
export default async function handler(req, res) {
    // 1. Obtener la URL de Supabase y la clave desde las variables de entorno de Vercel
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    // 2. Hacer la petición a Supabase desde el servidor de Vercel
    const { select } = req.query;
    const url = `${supabaseUrl}/rest/v1/chat_history?select=${select || '*'}&order=created_at.asc`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'apikey': supabaseKey,
                'Authorization': req.headers.authorization || '',
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            }
        });

        const data = await response.json();

        // 3. Devolver la respuesta al CRM
        res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor proxy', details: error.message });
    }
}
