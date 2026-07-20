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
          temperature: 0.3,
          messages: [{ role: "user", content: "Напиши ОДИН случайный, безумно интересный, парадоксальный и очень необычный факт на русском языке. Темы любые: рекорды, люди, животные. Строго ОДНО или ДВА коротких преложений, не длиннее 30 слов! Пиши сразу сам факт без приветствий и вводных слов." }]
        };

    const response = await fetch('https://groq.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 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'
      },
      body: JSON.stringify(requestBody)
    });

    const text = await response.text();
    
    if (!text) {
      return res.status(400).json({ error: "Groq вернул пустой ответ. Возможно, лимиты ключа закончились." });
    }

    let data = JSON.parse(text);

    // Если Groq сам вернул ошибку (например, лимиты), прокидываем её во FlutterFlow, чтобы увидеть проблему
    if (data.error) {
      return res.status(400).json({ errorFromGroq: data.error.message });
    }

    // ИСПРАВЛЕННЫЙ БЛОК ОЧИСТКИ ТЕКСТА
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      let content = data.choices[0].message.content;

      // 1. Удаляем слова вроде "Факт", "Интересный факт", цифры и двоеточия в начале
      content = content.replace(/^(факт|интересный факт|случайный факт)[:\s\d]*/i, '');

      // 2. Срезаем любые длинные цепочки цифр (от 5 знаков и более), двоеточия и переносы строк в начале
      content = content.replace(/^[\s\D]*\d{5,}[\s\D]*/, '');

      // 3. Финально зачищаем оставшиеся пробелы, переносы строк и знаки препинания в самом начале
      content = content.trim().replace(/^[:,\-–—.\s]+/, '');

      // Записываем чистый текст обратно в первый элемент массива
      data.choices[0].message.content = content;
    }

    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
