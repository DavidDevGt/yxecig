/**
 * "Para ti, Mi Amorcito" — Viaje Estelar & Interactivo
 * Cielo estrellado dinámico, estrellas fugaces, portal cósmico
 * y orquestación del clímax de amor incondicional.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elementos principales de la UI
  const scrollContainer = document.getElementById('scrollContainer');
  const btnActivateCamera = document.getElementById('btnActivateCamera');
  const cameraControls = document.getElementById('cameraControls');
  const mirrorFrame = document.getElementById('mirrorFrame');
  const mirrorVideo = document.getElementById('mirrorVideo');
  const mirrorPlaceholder = document.getElementById('mirrorPlaceholder');
  const fallbackView = document.getElementById('fallbackView');
  const climaxMessage = document.getElementById('climaxMessage');
  const mirrorBadge = document.getElementById('mirrorBadge');
  const starfieldCanvas = document.getElementById('starfieldCanvas');

  let mediaStream = null;
  let climaxTimer = null;

  // =========================================================================
  // 1. CIELO ESTRELLADO DINÁMICO & ESTRELLAS FUGACES (CANVAS 60FPS)
  // =========================================================================
  if (starfieldCanvas) {
    const ctx = starfieldCanvas.getContext('2d');
    let width = 0;
    let height = 0;
    let animationFrameId = null;
    let stars = [];
    let shootingStars = [];
    let lastShootingStarTime = Date.now();
    let isTabVisible = true;

    const STAR_COLORS = [
      'rgba(255, 255, 255, ',     // Blanco puro
      'rgba(255, 240, 210, ',     // Oro estelar cálido
      'rgba(180, 235, 255, ',     // Azul cian starlight
      'rgba(240, 210, 255, ',     // Amatista nebulosa suave
    ];

    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      starfieldCanvas.width = width * dpr;
      starfieldCanvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      initStars();
    }

    function initStars() {
      // Ajustar densidad según el tamaño de la pantalla
      const count = Math.floor((width * height) / (width < 600 ? 5500 : 4200));
      stars = [];

      for (let i = 0; i < count; i++) {
        const colorPrefix = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.3 + 0.3,
          colorPrefix: colorPrefix,
          baseAlpha: Math.random() * 0.5 + 0.3,
          twinkleSpeed: Math.random() * 0.03 + 0.008,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
    }

    function spawnShootingStar() {
      const startX = Math.random() * (width * 0.8) + width * 0.1;
      const startY = Math.random() * (height * 0.35);
      const length = Math.random() * 80 + 70;
      const speed = Math.random() * 6 + 7;
      const angle = (Math.PI / 4) + (Math.random() * 0.2 - 0.1); // ~45 grados hacia abajo a la derecha

      shootingStars.push({
        x: startX,
        y: startY,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        length: length,
        life: 1.0,
        decay: Math.random() * 0.015 + 0.012,
      });
    }

    function renderStarfield() {
      if (!isTabVisible) return;

      ctx.clearRect(0, 0, width, height);

      // Dibujar estrellas titilantes
      const now = Date.now();
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        const alpha = star.baseAlpha + Math.sin(now * star.twinkleSpeed + star.twinklePhase) * 0.28;
        const clampedAlpha = Math.max(0.1, Math.min(1, alpha));

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.colorPrefix + clampedAlpha + ')';
        ctx.fill();

        // Destello extra tenue en estrellas más grandes
        if (star.radius > 1.2 && clampedAlpha > 0.7) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = star.colorPrefix + (clampedAlpha * 0.15) + ')';
          ctx.fill();
        }
      }

      // Estrellas fugaces periódicas (cada 7-12 segundos)
      if (now - lastShootingStarTime > 7500 && Math.random() < 0.04) {
        spawnShootingStar();
        lastShootingStarTime = now;
      }

      // Renderizar y actualizar estrellas fugaces
      for (let j = shootingStars.length - 1; j >= 0; j--) {
        const meteor = shootingStars[j];
        meteor.x += meteor.dx;
        meteor.y += meteor.dy;
        meteor.life -= meteor.decay;

        if (meteor.life <= 0 || meteor.x > width + 100 || meteor.y > height + 100) {
          shootingStars.splice(j, 1);
          continue;
        }

        const tailX = meteor.x - (meteor.dx / Math.hypot(meteor.dx, meteor.dy)) * meteor.length;
        const tailY = meteor.y - (meteor.dy / Math.hypot(meteor.dx, meteor.dy)) * meteor.length;

        const gradient = ctx.createLinearGradient(meteor.x, meteor.y, tailX, tailY);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${meteor.life})`);
        gradient.addColorStop(0.3, `rgba(255, 227, 153, ${meteor.life * 0.8})`);
        gradient.addColorStop(1, 'rgba(142, 227, 248, 0)');

        ctx.beginPath();
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Cabeza brillante de la estrella fugaz
        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${meteor.life})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(renderStarfield);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animationFrameId = requestAnimationFrame(renderStarfield);

    // Pausar animación si la pestaña se oculta para ahorrar batería en móviles
    document.addEventListener('visibilitychange', () => {
      isTabVisible = !document.hidden;
      if (isTabVisible && !animationFrameId) {
        animationFrameId = requestAnimationFrame(renderStarfield);
      }
    });
  }

  // =========================================================================
  // 2. NAVEGACIÓN SUAVE POR LAS ESCENAS CELESTIALES
  // =========================================================================
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

  // =========================================================================
  // 3. ACTIVACIÓN DEL PORTAL ESTELAR (CÁMARA ESPEJO)
  // =========================================================================
  async function activateMirror() {
    cameraControls.classList.add('hidden');
    mirrorFrame.classList.add('active');

    const hasMediaSupport = Boolean(
      navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function'
    );

    if (!hasMediaSupport) {
      triggerFallback();
      return;
    }

    try {
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
          console.warn('Auto-play issue, retrying:', playErr);
        }

        mirrorPlaceholder.classList.add('hidden');
        mirrorVideo.classList.add('visible');

        if (mirrorBadge) {
          mirrorBadge.textContent = 'Mírate con amor';
        }

        // Orquestación: tras ~4 segundos de contemplar su luz, revelar la dedicatoria
        climaxTimer = setTimeout(() => {
          const scene5 = document.getElementById('scene-5');
          if (scene5) scene5.classList.add('climax-active');
          climaxMessage.classList.add('revealed');
        }, 4000);
      };

      mirrorVideo.addEventListener('loadedmetadata', startMirror, { once: true });
      mirrorVideo.addEventListener('canplay', startMirror, { once: true });

      if (mirrorVideo.readyState >= 1) {
        startMirror();
      } else {
        setTimeout(startMirror, 1200);
      }
    } catch (err) {
      console.warn('Acceso a cámara no disponible o permiso denegado:', err);
      triggerFallback();
    }
  }

  // =========================================================================
  // 4. FALLBACK ELEGANTE (SIN ERRORES TÉCNICOS)
  // =========================================================================
  function triggerFallback() {
    mirrorPlaceholder.classList.add('hidden');
    fallbackView.classList.add('visible');
    mirrorFrame.classList.add('active');

    if (mirrorBadge) {
      mirrorBadge.textContent = 'Para ti';
    }

    climaxTimer = setTimeout(() => {
      const scene5 = document.getElementById('scene-5');
      if (scene5) scene5.classList.add('climax-active');
      climaxMessage.classList.add('revealed');
    }, 3200);
  }

  if (btnActivateCamera) {
    btnActivateCamera.addEventListener('click', activateMirror);
  }

  // =========================================================================
  // 5. LIMPIEZA DE RECURSOS DE HARDWARE
  // =========================================================================
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

  window.addEventListener('pagehide', stopCameraStream);
  window.addEventListener('beforeunload', stopCameraStream);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopCameraStream();
    }
  });
});
