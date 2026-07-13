export default async function handler(req, res) {
    const targetUrl = `https://luyeqpcqhdngaisfzdnl.supabase.co/rest/v1/chat_history?${new URLSearchParams(req.query).toString()}`;

    const response = await fetch(targetUrl, {
        method: req.method,
        headers: {
            'apikey': process.env.SUPABASE_ANON_KEY,
            'Authorization': req.headers.authorization || '',
            'Content-Type': 'application/json',
        },
        body: req.method !== 'GET' ? JSON.stringify(req.body) : null,
    });

    const data = await response.json();
    res.status(response.status).json(data);
}