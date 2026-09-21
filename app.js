/**
 * "Para ti, Mi Amorcito" — Lógica interactiva
 * Manejo de navegación por escenas, cámara en vivo espejada,
 * orquestación del clímax y fallback elegante.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elementos principales
  const scrollContainer = document.getElementById('scrollContainer');
  const btnActivateCamera = document.getElementById('btnActivateCamera');
  const cameraControls = document.getElementById('cameraControls');
  const mirrorFrame = document.getElementById('mirrorFrame');
  const mirrorVideo = document.getElementById('mirrorVideo');
  const mirrorPlaceholder = document.getElementById('mirrorPlaceholder');
  const fallbackView = document.getElementById('fallbackView');
  const climaxMessage = document.getElementById('climaxMessage');
  const mirrorBadge = document.getElementById('mirrorBadge');

  let mediaStream = null;
  let climaxTimer = null;

  // 1. Navegación fluida al pulsar las indicaciones de scroll
  const scrollHints = [
    { buttonId: 'scrollHint1', targetId: 'scene-2' },
    { buttonId: 'scrollHint2', targetId: 'scene-3' },
    { buttonId: 'scrollHint3', targetId: 'scene-4' },
    { buttonId: 'scrollHint4', targetId: 'scene-5' },
  ];

  scrollHints.forEach(({ buttonId, targetId }) => {
    const btn = document.getElementById(buttonId);
    const target = document.getElementById(targetId);
    if (btn && target) {
      btn.addEventListener('click', () => {
        target.scrollIntoView({ behavior: 'smooth' });
      });
    }
  });

  // 2. Activación de la cámara (Espejo)
  async function activateMirror() {
    // Ocultar controles de inmediato para dar protagonismo al espejo
    cameraControls.classList.add('hidden');
    mirrorFrame.classList.add('active');

    // Verificar si el navegador soporta getUserMedia
    const hasMediaSupport = Boolean(
      navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function'
    );

    if (!hasMediaSupport) {
      triggerFallback();
      return;
    }

    try {
      // Pedir video de cámara frontal
      const constraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStream = stream;

      mirrorVideo.srcObject = stream;

      let started = false;
      const startMirror = async () => {
        if (started) return;
        started = true;

        try {
          await mirrorVideo.play();
        } catch (playErr) {
          console.warn('Auto-play issue, attempting retry:', playErr);
        }

        // Revelar video y ocultar placeholder
        mirrorPlaceholder.classList.add('hidden');
        mirrorVideo.classList.add('visible');

        if (mirrorBadge) {
          mirrorBadge.textContent = 'Mírate con amor';
        }

        // Orquestación: tras ~4 segundos de verse reflejada, revelar el mensaje final
        climaxTimer = setTimeout(() => {
          climaxMessage.classList.add('revealed');
        }, 4000);
      };

      mirrorVideo.addEventListener('loadedmetadata', startMirror, { once: true });
      mirrorVideo.addEventListener('canplay', startMirror, { once: true });

      if (mirrorVideo.readyState >= 1) {
        startMirror();
      } else {
        // Fallback de seguridad por si el evento ya ocurrió o tarda en emitirse
        setTimeout(startMirror, 1200);
      }
    } catch (err) {
      console.warn('No se pudo acceder a la cámara o permiso denegado:', err);
      triggerFallback();
    }
  }

  // 3. Fallback elegante (sin alertas ni errores técnicos)
  function triggerFallback() {
    mirrorPlaceholder.classList.add('hidden');
    fallbackView.classList.add('visible');
    mirrorFrame.classList.add('active');

    if (mirrorBadge) {
      mirrorBadge.textContent = 'Para ti';
    }

    // El mensaje final aparece tras una breve pausa contemplativa
    climaxTimer = setTimeout(() => {
      climaxMessage.classList.add('revealed');
    }, 3200);
  }

  // 4. Listener para el botón de activación
  if (btnActivateCamera) {
    btnActivateCamera.addEventListener('click', activateMirror);
  }

  // 5. Limpieza de recursos de hardware
  function stopCameraStream() {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          // No-op
        }
      });
      mediaStream = null;
    }
  }

  // Detener cámara al salir de la página o cambiar de pestaña
  window.addEventListener('pagehide', stopCameraStream);
  window.addEventListener('beforeunload', stopCameraStream);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopCameraStream();
    }
  });
});
