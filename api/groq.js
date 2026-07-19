export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const requestBody = (req.body && Object.keys(req.body).length > 0) 
      ? req.body 
      : {
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: "Напиши один короткий факт." }]
        };

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Зашиваем твой ключ прямо сюда, чтобы FlutterFlow не мог его стереть:
        'Authorization': 'Bearer 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'
      },
      body: JSON.stringify(requestBody)
    });

    const text = await response.text();
    
    if (!text) {
      return res.status(400).json({ error: "Groq вернул пустой ответ. Возможно, лимиты ключа закончились." });
    }

    const data = JSON.parse(text);
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
