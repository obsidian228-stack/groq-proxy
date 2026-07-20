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
          temperature: 0.3, // ТЕМПЕРАТУРА ТЕПЕРЬ ТУТ (для дефолтных запросов)
          messages: [{ role: "user", content: "Напиши ОДИН случайный, безумно интересный, парадоксальный и очень необычный факт на русском языке. Темы любые: рекорды, люди, животные. Строго ОДНО или ДВА коротких преложений, не длиннее 30 слов! Пиши сразу сам факт, без начального формата цифры: и без приветствий и вводных слов." }]
        };

    const response = await fetch('https://groq.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Не забудь вставить свой gsk_... ключ вместо заглушки:
        'Authorization': 'Bearer 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'
      },
      body: JSON.stringify(requestBody)
    });

    const text = await response.text();
    
    if (!text) {
      return res.status(400).json({ error: "Groq вернул пустой ответ. Возможно, лимиты ключа закончились." });
    }

    const data = JSON.parse(text);

    // Безопасная очистка мусорных цифр только в самом начале строки
    if (data?.choices?.[0]?.message?.content) {
      data.choices[0].message.content = data.choices[0].message.content.replace(/^[\s\d:]+/, '').trim();
    }

    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
