// Este código se ejecutará en un servidor seguro, no en el navegador del usuario.
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(request, response) {
  // Solo permitir que el frontend le hable a este intermediario
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Obtiene la clave API de forma segura desde las variables de entorno del servidor
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('La variable de entorno GEMINI_API_KEY no está configurada.');
    }

    // Obtiene el mensaje del usuario y el contexto del CV que envió el frontend
    const { userMessage, resumeContext } = request.body;
    if (!userMessage || !resumeContext) {
        return response.status(400).json({ error: 'Faltan datos en la solicitud.' });
    }

    // Configura la IA con el contexto y el mensaje
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const fullPrompt = `${resumeContext}\n\nUsuario: ${userMessage}`;

    // Llama a la API de Google y obtiene la respuesta
    const result = await model.generateContent(fullPrompt);
    const text = result.response.text();

    // Envía la respuesta de la IA de vuelta al frontend
    return response.status(200).json({ reply: text });

  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: 'Error interno del servidor.' });
  }
}