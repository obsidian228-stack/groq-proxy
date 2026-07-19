export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Если FlutterFlow почему-то прислал пустой Body, собираем дефолтный JSON
    const requestBody = (req.body && Object.keys(req.body).length > 0) 
      ? req.body 
      : {
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: "Напиши один короткий факт." }]
        };

    const response = await fetch('https://groq.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization || ''
      },
      body: JSON.stringify(requestBody)
    });

    const text = await response.text();
    
    // Проверяем, что Groq вообще хоть что-то вернул
    if (!text) {
      return res.status(400).json({ error: "Groq вернул пустой ответ. Проверь свой API-ключ!" });
    }

    const data = JSON.parse(text);
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
