(() => {
  const canvas = document.getElementById("bg-anim");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let w = 0;
  let h = 0;
  let dpr = 1;
  let t = 0;
  let raf = 0;
  let running = true;

  const blobs = [
    { x: 0.78, y: 0.18, r: 0.42, a: 0.2, s: 0.35, p: 0 },
    { x: 0.18, y: 0.72, r: 0.34, a: 0.13, s: 0.28, p: 1.7 },
    { x: 0.62, y: 0.82, r: 0.26, a: 0.1, s: 0.42, p: 3.1 },
    { x: 0.4, y: 0.22, r: 0.18, a: 0.08, s: 0.5, p: 4.4 },
  ];

  const flakes = Array.from({ length: 68 }, (_, i) => ({
    x: Math.random(),
    y: Math.random(),
    z: 0.3 + Math.random() * 0.7,
    tw: Math.random() * Math.PI * 2,
    sp: 0.1 + Math.random() * 0.22,
    kind: i % 6 === 0 ? "crystal" : "dot",
  }));

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function blob(x, y, r, alpha) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(125, 211, 252, ${alpha})`);
    g.addColorStop(0.45, `rgba(43, 143, 196, ${alpha * 0.45})`);
    g.addColorStop(1, "rgba(125, 211, 252, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function crystal(x, y, size, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * 0.4);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = "#e8f7ff";
    ctx.shadowColor = "rgba(125, 211, 252, 0.9)";
    ctx.shadowBlur = 8;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(0, size);
    ctx.moveTo(-size, 0);
    ctx.lineTo(size, 0);
    ctx.moveTo(-size * 0.7, -size * 0.7);
    ctx.lineTo(size * 0.7, size * 0.7);
    ctx.moveTo(size * 0.7, -size * 0.7);
    ctx.lineTo(-size * 0.7, size * 0.7);
    ctx.stroke();
    ctx.restore();
  }

  function frame() {
    if (!running) return;

    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";

    blobs.forEach((b, i) => {
      const nx = (b.x + Math.sin(t * b.s + b.p) * 0.08) * w;
      const ny = (b.y + Math.cos(t * b.s * 0.85 + b.p) * 0.07) * h;
      const nr = Math.min(w, h) * b.r * (0.9 + Math.sin(t * 0.4 + i) * 0.08);
      blob(nx, ny, nr, b.a);
    });

    flakes.forEach((s) => {
      s.y += s.sp * 0.0016;
      s.tw += 0.025;
      if (s.y > 1.04) {
        s.y = -0.04;
        s.x = Math.random();
      }
      const x = s.x * w + Math.sin(s.tw) * 12;
      const y = s.y * h;
      const pulse = 0.28 + (Math.sin(s.tw * 1.6) + 1) * 0.28;
      if (s.kind === "crystal") {
        crystal(x, y, 3.4 + s.z * 2.8, pulse * 0.75);
      } else {
        ctx.globalAlpha = pulse * 0.6 * s.z;
        ctx.fillStyle = s.z > 0.7 ? "#f0fbff" : "#7dd3fc";
        ctx.beginPath();
        ctx.arc(x, y, 1 + s.z, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    });

    ctx.globalCompositeOperation = "source-over";
    t += 0.012;
    raf = requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running && !reduce) {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    }
  });

  resize();
  if (reduce) {
    blobs.forEach((b) => {
      blob(b.x * w, b.y * h, Math.min(w, h) * b.r, b.a);
    });
  } else {
    raf = requestAnimationFrame(frame);
  }
})();

(() => {
  const buttons = document.querySelectorAll("[data-copy]");
  if (!buttons.length) return;

  async function copyCode(btn) {
    const code = btn.getAttribute("data-copy");
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const input = document.createElement("textarea");
      input.value = code;
      input.setAttribute("readonly", "");
      input.style.position = "absolute";
      input.style.left = "-9999px";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }

    const prev = btn.textContent;
    btn.textContent = "Skopiowano";
    btn.classList.add("is-copied");
    window.setTimeout(() => {
      btn.textContent = prev;
      btn.classList.remove("is-copied");
    }, 1800);
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => copyCode(btn));
  });
})();
