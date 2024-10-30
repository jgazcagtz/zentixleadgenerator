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
    }, 500);
  } else {
    setTimeout(() => addMessage('bot', 'Si tienes más preguntas, no dudes en consultarme.'), 500);
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
    const message = userInput.value;
    sendMessage(message);
  }
});

// Inicia la conversación con un mensaje de bienvenida
window.onload = () => {
  setTimeout(() => {
    addMessage('bot', '¡Hola! Soy, Zentix, el asistente virtual de <strong>MiniTienda Express</strong>. Estoy aquí para ayudarte.');
    setTimeout(() => {
      addMessage('bot', questions[step]);
      step++;
    }, 1000);
  }, 500);
};

// Función para enviar datos a Google Sheets
async function sendDataToGoogleSheet(data) {
  const scriptURL = 'TU_URL_DEL_WEB_APP_DE_GOOGLE_APPS_SCRIPT';

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
