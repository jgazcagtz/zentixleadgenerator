// api/chat.js

const { Configuration, OpenAIApi } = require('openai');

module.exports = async (req, res) => {
  const { conversation } = req.body;

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY, // Asegúrate de configurar esta variable de entorno en Vercel
  });

  const openai = new OpenAIApi(configuration);

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4', // Puedes usar 'gpt-4' si tienes acceso
      messages: conversation,
    });

    const reply = completion.data.choices[0].message.content;

    res.status(200).json({ reply });
  } catch (error) {
    console.error('Error al llamar a la API de OpenAI:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};