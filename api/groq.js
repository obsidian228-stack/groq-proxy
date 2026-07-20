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
          temperature: 0.3, // 1. ТВОЯ ТЕМПЕРАТУРА ТУТ (на случай пустого тела)
          messages: [{ role: "user", content: "Напиши ОДИН реально существующий, случайный, безумно интересный и очень необычный факт на русском языке. Темы любые: рекорды, люди, животные. Строго ОДНО или ДВА коротких преложений, не длиннее 30 слов! Пиши сразу сам факт без приветствий и вводных слов." }]
        };

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Твой ключ здесь:
        'Authorization': 'Bearer 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'
      },
      body: JSON.stringify(requestBody)
    });

    const text = await response.text();
    
    if (!text) {
      return res.status(400).json({ error: "Groq вернул пустой ответ. Возможно, лимиты ключа закончились." });
    }

    let data = JSON.parse(text);

    // БЛОК ОЧИСТКИ ТЕКСТА ОТ ЦИФР В НАЧАЛЕ СТРОКИ
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      let originalContent = data.choices[0].message.content;
      
      // 2. ОБНОВЛЕННАЯ РЕГУЛЯРКА: удаляет слова "факт", двоеточия, пробелы и длинные цифры в самом начале
      let cleanContent = originalContent
        .replace(/^(факт|интересный факт|случайный факт)[:\s\d]*/i, '') // убирает слово "Факт:"
        .replace(/^[\s\d:]+/, '') // убирает цифры, если они идут сразу
        .trim();
      
      // Записываем очищенный текст обратно в структуру JSON
      data.choices[0].message.content = cleanContent;
    }

    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
