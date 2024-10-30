// chat.js

const chatWindow = document.getElementById('chat-window');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

let userData = {
  nombre: '',
  telefono: '',
  email: '',
  mensaje: ''
};

let step = 0;
const questions = [
  'Para comenzar, ¿puedes decirme tu nombre?',
  'Gracias, {nombre}. ¿Cuál es tu número de teléfono?',
  'Perfecto. ¿Podrías proporcionarnos tu correo electrónico?',
  'Por último, ¿en qué podemos ayudarte?'
];

// Mantener el historial de la conversación
let conversation = [
  {
    role: 'system',
    content: `Eres Zentix™, un chatbot avanzado desarrollado por MiniTienda Express, diseñado para brindar un servicio eficiente de atención al cliente y soporte informativo a través de una interfaz web accesible en todo tipo de dispositivos. Zentix™ es una herramienta ideal para empresas, negocios y emprendedores que desean ofrecer a sus clientes una experiencia de atención rápida y precisa.

**¿Qué puede hacer Zentix™?**
- **Responde preguntas frecuentes** sobre productos, servicios, y horarios, ofreciendo la información que tus clientes necesitan en segundos.
- **Da sugerencias** basadas en las necesidades del cliente, mejorando la experiencia de búsqueda y elección.
- **Califica leads** mediante preguntas que ayudan a identificar las necesidades de los usuarios e interesarlos en los productos o servicios adecuados.
- **Atención 24/7**: Disponible para responder en cualquier momento, sin importar la hora.

Zentix™ se adapta a una gran variedad de sectores, ofreciendo una solución informativa y eficaz para:
- **Restaurantes y cafeterías**: Responde preguntas sobre menús, horarios y reservaciones.
- **Clínicas y hospitales**: Brinda información sobre servicios médicos y opciones de contacto.
- **Tiendas minoristas**: Ayuda con información sobre productos, precios y políticas.
- **Servicios profesionales** (como firmas legales o consultorios): Proporciona detalles sobre servicios, disponibilidad y primeros pasos para consultas.

**Beneficios Clave**:
- **Automatización de tareas comunes**: Resuelve rápidamente consultas repetitivas, permitiendo que tu equipo se enfoque en tareas más complejas.
- **Mejora la calificación de leads**: Recopila información inicial para entender mejor las necesidades de cada cliente.
- **Accesible desde cualquier dispositivo**: Zentix™ es una web app optimizada para usarse en smartphones, tablets y computadoras, sin requerir instalaciones especiales.

**Precios de Zentix™**:
- **Precio regular**: $5,000 MXN
- **Oferta especial limitada**: $2,500 MXN
- **Tarifa mensual de mantenimiento**: $100 MXN, que incluye actualizaciones y soporte continuo.

**¿Te interesa?**
Si deseas una **cotización personalizada** o tienes preguntas específicas sobre cómo Zentix™ puede adaptarse a tu negocio, contáctanos hoy:
- **WhatsApp**: +52 55 28 50 37 66
- **Sitio web**: [MiniTienda Express](https://minitienda.online/)
- **Correo electrónico**: info@minitienda.online

Zentix™ es la herramienta perfecta para mejorar la atención al cliente en tu negocio. ¡Aprovecha la oferta especial y comienza a transformar la experiencia de tus clientes hoy!`
  }
];

// Función para agregar mensajes al chat
function addMessage(sender, text) {
  const message = document.createElement('div');
  message.classList.add('message', sender);
  const messageText = document.createElement('p');
  messageText.innerHTML = text;
  message.appendChild(messageText);
  chatWindow.appendChild(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Función para enviar mensaje y manejar lógica de preguntas
async function sendMessage(message) {
  if (message.trim() === '') return;
  addMessage('user', message);
  userInput.value = '';

  if (step === 0) {
    userData.nombre = message;
    step++;
    const question = questions[step].replace('{nombre}', userData.nombre);
    setTimeout(() => addMessage('bot', question), 500);
  } else if (step === 1) {
    userData.telefono = message;
    step++;
    setTimeout(() => addMessage('bot', questions[step]), 500);
  } else if (step === 2) {
    userData.email = message;
    step++;
    setTimeout(() => addMessage('bot', questions[step]), 500);
  } else if (step === 3) {
    userData.mensaje = message;
    step++;
    setTimeout(() => {
      addMessage('bot', '¡Gracias por tu información! En breve nos pondremos en contacto contigo.');
      // Enviar datos a Google Sheets
      sendDataToGoogleSheet(userData);
      setTimeout(() => {
        addMessage('bot', 'Si tienes más preguntas, no dudes en consultarme.');
      }, 500);
    }, 500);
  } else {
    // Aquí comienza la interacción con el chatbot usando OpenAI API
    conversation.push({ role: 'user', content: message });

    // Enviar la conversación al backend
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ conversation })
      });

      const data = await response.json();

      if (data.reply) {
        addMessage('bot', data.reply);
        conversation.push({ role: 'assistant', content: data.reply });
      } else {
        addMessage('bot', 'Lo siento, hubo un error al procesar tu solicitud.');
      }
    } catch (error) {
      console.error('Error al llamar al backend:', error);
      addMessage('bot', 'Lo siento, hubo un error al procesar tu solicitud.');
    }
  }
}

// Evento al hacer clic en el botón Enviar
sendBtn.addEventListener('click', () => {
  const message = userInput.value;
  sendMessage(message);
});

// Evento al presionar Enter
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const message = userInput.value;
    sendMessage(message);
  }
});

// Inicia la conversación con un mensaje de bienvenida
window.onload = () => {
  setTimeout(() => {
    addMessage('bot', '¡Hola! Soy Zentix™, el asistente virtual de <strong>MiniTienda Express</strong>. Estoy aquí para ayudarte.');
    setTimeout(() => {
      addMessage('bot', questions[step]);
      // No incrementamos 'step' aquí
    }, 1000);
  }, 500);
};

// Función para enviar datos a Google Sheets
async function sendDataToGoogleSheet(data) {
  const scriptURL = 'https://script.google.com/macros/s/AKfycbw2UnDyS_uw4YeXULc47iKeBeD5XASDJLTBF1VsqL9Q7vK27i-_Fabz1B8GZ-cSsAzU2w/exec';

  try {
    const response = await fetch(scriptURL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    console.log('Datos enviados correctamente a Google Sheets');
  } catch (error) {
    console.error('Error al enviar datos a Google Sheets:', error);
  }
}
