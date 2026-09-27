(function () {
  const card = document.getElementById('scratchCard');
  if (!card) return;
  const canvas = document.getElementById('scratchCanvas');
  const hint = card.querySelector('.scratch-hint');
  const confettiRoot = document.getElementById('confettiRoot');
  const ctx = canvas.getContext('2d');
  const motionSafe = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let revealed = false;
  let drawing = false;
  let lastCheck = 0;

  function paintFoil(w, h) {
    ctx.globalCompositeOperation = 'source-over';
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#caa46a');
    grad.addColorStop(.5, '#dcb377');
    grad.addColorStop(1, '#a97c46');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // subtle foil fleck texture
    ctx.fillStyle = 'rgba(255,255,255,.16)';
    for (let i = 0; i < 45; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.4 + .3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(249,244,236,.92)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = "600 11px 'DM Sans', sans-serif";
    ctx.fillText('✦', w / 2, h / 2 - 16);
    ctx.font = "700 13px 'DM Sans', sans-serif";
    ctx.save();
    ctx.letterSpacing = '2px';
    ctx.fillText('SCRATCH TO REVEAL', w / 2, h / 2 + 6);
    ctx.restore();
    ctx.font = "600 11px 'DM Sans', sans-serif";
    ctx.fillText('✦', w / 2, h / 2 + 26);
  }

  function sizeCanvas() {
    const rect = card.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paintFoil(rect.width, rect.height);
  }

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    return { x: point.clientX - rect.left, y: point.clientY - rect.top };
  }

  function scratchAt(x, y) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.fill();
  }

  function checkProgress() {
    const w = canvas.width, h = canvas.height;
    if (!w || !h) return;
    const data = ctx.getImageData(0, 0, w, h).data;
    let cleared = 0, total = 0;
    for (let i = 3; i < data.length; i += 4 * 41) {
      total++;
      if (data[i] < 40) cleared++;
    }
    if (total && cleared / total > .55) reveal();
  }

  function reveal() {
    if (revealed) return;
    revealed = true;
    canvas.classList.add('revealed');
    hint.classList.add('hide');
    burstConfetti();
  }

  function burstConfetti() {
    if (!motionSafe || !confettiRoot) return;
    const colors = ['#bd8f52', '#efd2cb', '#4a1426', '#f7cdc2'];
    for (let i = 0; i < 26; i++) {
      const el = document.createElement('i');
      el.className = 'confetti-piece';
      const angle = Math.random() * Math.PI * 2;
      const dist = 55 + Math.random() * 95;
      el.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
      el.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
      el.style.setProperty('--rot', (Math.random() * 360 - 180) + 'deg');
      el.style.background = colors[i % colors.length];
      el.style.animationDelay = (Math.random() * .15) + 's';
      confettiRoot.appendChild(el);
      requestAnimationFrame(() => el.classList.add('play'));
      setTimeout(() => el.remove(), 1500);
    }
  }

  function handleMove(e) {
    if (!drawing || revealed) return;
    const pos = getPos(e);
    scratchAt(pos.x, pos.y);
    const now = Date.now();
    if (now - lastCheck > 150) { lastCheck = now; checkProgress(); }
    e.preventDefault();
  }

  canvas.addEventListener('pointerdown', e => { drawing = true; handleMove(e); });
  window.addEventListener('pointerup', () => { drawing = false; });
  canvas.addEventListener('pointermove', handleMove);

  window.addEventListener('resize', () => { if (!revealed) sizeCanvas(); });
  sizeCanvas();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { if (!revealed) sizeCanvas(); });
  }

  const calendarBtn = document.getElementById('addToCalendar');
  if (calendarBtn) {
    calendarBtn.addEventListener('click', function (e) {
      e.preventDefault();
      const ics = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT',
        'SUMMARY:Yash & Divya’s Wedding',
        'DTSTART:20261213T130000Z',
        'DTEND:20261213T170000Z',
        'LOCATION:Vijaya Lakshmi Sabhagruha, Risama, Amgaon, Gondia, 441902',
        'DESCRIPTION:Join us as we celebrate the wedding of Yash & Divya.',
        'END:VEVENT', 'END:VCALENDAR'
      ].join('\r\n');
      const blob = new Blob([ics], { type: 'text/calendar' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'Yash-Divya-Wedding.ics';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    });
  }
})();
