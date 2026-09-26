// api/chat.js
export default async function handler(req, res) {
  // Apenas permite pedidos POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // A Vercel vai injetar a variável GEMINI_API_KEY automaticamente
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'A chave da API Gemini não está configurada no servidor Vercel.' });
  }

  try {
    // 1. Recebe a mensagem (o prompt) do teu index.html
    const { systemPrompt, userPrompt } = req.body;

    // 2. Faz o pedido à API do Gemini usando a chave secreta
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: systemPrompt + "\n\n" + userPrompt }]
        }]
      })
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      throw new Error(`Erro Gemini: ${JSON.stringify(errorData)}`);
    }

    const data = await geminiResponse.json();

    // 3. Devolve a resposta do Gemini para o teu frontend
    if (data.candidates && data.candidates.length > 0) {
       res.status(200).json({ text: data.candidates[0].content.parts[0].text });
    } else {
       res.status(500).json({ error: 'O Gemini não devolveu texto.' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno no servidor', details: error.message });
  }
}
