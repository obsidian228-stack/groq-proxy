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
          messages: [{ role: "user", content: "Напиши ОДИН случайный, безумно интересный, парадоксальный и очень необычный факт на русском языке. Темы любые: рекорды, люди, животные. Строго ОДНО или ДВА коротких преложений, не длиннее 30 слов! Пиши сразу сам факт, без начального формата цифры: и без приветствий и вводных слов." }]
        };

    const response = await fetch('https://groq.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Твой оригинальный рабочий токен gsk_...
        'Authorization': 'Bearer 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'
      },
      body: JSON.stringify(requestBody)
    });

    let text = await response.text();
    
    if (!text) {
      return res.status(400).json({ error: "Groq вернул пустой ответ. Возможно, лимиты ключа закончились." });
    }

    // ТУТ МЫ ЧИСТИМ СЫРОЙ ТЕКСТ: Находим блок "content": " ... " и вырезаем из начала текста цифры и двоеточия.
    // Это работает прямо внутри текстового ответа, не затрагивая структуру JSON.
    text = text.replace(/"content"\s*:\s*"[\s\d:]+/, (match) => {
      return match.replace(/[\s\d:]+$/, ''); 
    });

    const data = JSON.parse(text);
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
