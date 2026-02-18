import { makeCanvas, rafLoop } from './util_canvas.js';

// Slide 8 artifact: Data flow — training data → model → generated code.
// Clean diagram: dot particles follow curved paths from sources into model.
// Click types a real prompt, then code fragments stream out in staggered rows.

const SOURCES = [
  { label: 'GitHub' },
  { label: 'Stack Overflow' },
  { label: 'Docs' },
];

const PROMPTS = [
  '"sort an array by date"',
  '"draw circles on canvas"',
  '"fetch JSON from an API"',
];

const CODE_LINES = [
  ['arr.sort((a, b) =>', '  a.date - b.date', ');'],
  ['ctx.beginPath();', 'ctx.arc(x, y, r);', 'ctx.stroke();'],
  ['const res = fetch(url);', 'const json = res.json();', 'return json;'],
];

function bezAt(x0, y0, cx, cy, x1, y1, t) {
  const u = 1 - t;
  return {
    x: u * u * x0 + 2 * u * t * cx + t * t * x1,
    y: u * u * y0 + 2 * u * t * cy + t * t * y1,
  };
}

export function dataFlow(container) {
  while (container.firstChild) container.removeChild(container.firstChild);

  const root = document.createElement('div');
  root.style.cssText = 'position:relative;width:100%;height:100%;overflow:hidden;';
  container.appendChild(root);

  const { ctx, resize, destroy } = makeCanvas(root, { pixelRatioCap: 2 });

  // Dots traveling along input paths.
  const dots = [];
  // Output code lines.
  const outLines = [];

  let promptActive = false;
  let promptStartT = 0;
  let promptIdx = -1;
  let autoTimer = 0;
  let firstFrame = true;
  let lastDotSpawn = 0;

  function triggerPrompt(t) {
    promptActive = true;
    promptStartT = t;
    promptIdx = (promptIdx + 1) % PROMPTS.length;
    outLines.length = 0;
  }

  function onClick() { triggerPrompt(performance.now()); }
  container.addEventListener('pointerup', onClick);

  const stop = rafLoop((t) => {
    if (firstFrame) { autoTimer = t + 3000; firstFrame = false; }
    const { width: W, height: H } = resize();

    // --- Layout ---
    const labelX = W * 0.18;
    const modelCX = W * 0.44;
    const modelCY = H * 0.50;
    const modelR = Math.min(W, H) * 0.08;
    const srcYs = [H * 0.17, H * 0.50, H * 0.83];
    const outX = modelCX + modelR + W * 0.04;
    const labelSz = Math.max(13, W * 0.024);
    const monoSz = Math.max(11, W * 0.018);

    // Bezier paths from each source → model edge.
    const paths = srcYs.map((sy, i) => {
      const endAngle = -Math.PI * 0.6 + i * Math.PI * 0.6;
      return {
        x0: labelX + 14,
        y0: sy,
        cx: labelX + (modelCX - labelX) * 0.5,
        cy: sy,
        x1: modelCX + Math.cos(endAngle) * (modelR + 4),
        y1: modelCY + Math.sin(endAngle) * (modelR + 4),
      };
    });

    ctx.fillStyle = '#05070b';
    ctx.fillRect(0, 0, W, H);

    // --- Path lines ---
    ctx.lineWidth = 1;
    for (const p of paths) {
      ctx.strokeStyle = 'rgba(192,192,192,0.06)';
      ctx.beginPath();
      ctx.moveTo(p.x0, p.y0);
      ctx.quadraticCurveTo(p.cx, p.cy, p.x1, p.y1);
      ctx.stroke();
    }

    // Output line.
    ctx.strokeStyle = 'rgba(192,192,192,0.06)';
    ctx.beginPath();
    ctx.moveTo(modelCX + modelR + 4, modelCY);
    ctx.lineTo(W * 0.96, modelCY);
    ctx.stroke();

    // --- Source labels ---
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.font = `600 ${labelSz}px ui-sans-serif, system-ui, sans-serif`;
    for (let i = 0; i < SOURCES.length; i++) {
      ctx.fillStyle = 'rgba(192,192,192,0.55)';
      ctx.fillText(SOURCES[i].label, labelX, srcYs[i]);
    }

    // --- Spawn dots ---
    if (t - lastDotSpawn > 500 && dots.length < 9) {
      const si = Math.floor(Math.random() * 3);
      dots.push({
        pathIdx: si,
        progress: 0,
        speed: 0.003 + Math.random() * 0.002,
        radius: 2 + Math.random() * 1.5,
      });
      lastDotSpawn = t;
    }

    // --- Auto-prompt ---
    if (t > autoTimer && !promptActive) {
      triggerPrompt(t);
      autoTimer = t + 7000;
    }

    // --- Draw dots ---
    for (let i = dots.length - 1; i >= 0; i--) {
      const d = dots[i];
      d.progress += d.speed;
      if (d.progress >= 1) { dots.splice(i, 1); continue; }

      const p = paths[d.pathIdx];
      const pos = bezAt(p.x0, p.y0, p.cx, p.cy, p.x1, p.y1, d.progress);

      // Fade in/out at endpoints.
      const fadeIn = Math.min(1, d.progress * 4);
      const fadeOut = Math.min(1, (1 - d.progress) * 4);
      const alpha = 0.6 * fadeIn * fadeOut;

      ctx.fillStyle = `rgba(192,192,192,${alpha})`;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, d.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Model node ---
    const grd = ctx.createRadialGradient(modelCX, modelCY, modelR * 0.2, modelCX, modelCY, modelR * 1.5);
    grd.addColorStop(0, 'rgba(192,192,192,0.08)');
    grd.addColorStop(1, 'rgba(192,192,192,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(modelCX, modelCY, modelR * 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(192,192,192,0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(modelCX, modelCY, modelR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `600 ${Math.max(12, W * 0.020)}px ui-sans-serif, system-ui, sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('MODEL', modelCX, modelCY);

    // --- Prompt & output ---
    if (promptActive) {
      const elapsed = t - promptStartT;
      const promptText = PROMPTS[promptIdx];
      const codeLines = CODE_LINES[promptIdx];
      const typeDur = 1800;

      // Phase 1: Type the prompt above the model.
      const charsShown = Math.min(promptText.length, Math.floor((elapsed / typeDur) * promptText.length));
      const typed = promptText.slice(0, charsShown);
      const doneTyping = charsShown >= promptText.length;

      const promptFade = doneTyping ? Math.max(0, 1 - (elapsed - typeDur - 2000) / 1500) : 1;
      const promptY = modelCY - modelR - Math.max(24, H * 0.055);

      ctx.font = `${monoSz}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';

      // ">" prefix.
      const fullW = ctx.measureText(promptText).width;
      ctx.fillStyle = `rgba(192,192,192,${0.4 * promptFade})`;
      ctx.fillText('>', modelCX - fullW * 0.5 - 10, promptY);
      // Typed text.
      ctx.fillStyle = `rgba(255,255,255,${0.85 * promptFade})`;
      ctx.fillText(typed, modelCX, promptY);

      // Blink cursor.
      if (!doneTyping && Math.floor(t / 480) % 2 === 0) {
        const cX = modelCX + ctx.measureText(typed).width * 0.5 + 3;
        ctx.fillStyle = `rgba(255,255,255,${0.7})`;
        ctx.fillRect(cX, promptY - monoSz, 1.5, monoSz);
      }

      // Pulse on complete.
      if (doneTyping) {
        const pa = (elapsed - typeDur) / 1000;
        if (pa > 0 && pa < 0.8) {
          const pr = modelR * (1 + pa * 0.5);
          ctx.strokeStyle = `rgba(255,255,255,${0.2 * (1 - pa / 0.8)})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(modelCX, modelCY, pr, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Phase 2: Code lines appear one by one to the right.
      if (doneTyping) {
        const codeDelay = 400;
        const codeStart = typeDur + 300;
        const codeSz = Math.max(9, W * 0.015);
        ctx.font = `${codeSz}px ui-monospace, SFMono-Regular, Menlo, monospace`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        const lineH = monoSz * 2.2;
        const codeTopY = modelCY - ((codeLines.length - 1) * lineH) * 0.5;

        for (let li = 0; li < codeLines.length; li++) {
          const lineStart = codeStart + li * codeDelay;
          if (elapsed < lineStart) continue;

          const lineAge = elapsed - lineStart;
          const lineChars = Math.min(
            codeLines[li].length,
            Math.floor(lineAge / 800 * codeLines[li].length)
          );
          const lineText = codeLines[li].slice(0, lineChars);

          const fadeIn = Math.min(1, lineAge / 300);
          const fadeOut = Math.max(0, 1 - (elapsed - typeDur - 3500) / 1500);
          const alpha = 0.8 * fadeIn * Math.max(0, fadeOut);

          const ly = codeTopY + li * lineH;
          ctx.fillStyle = `rgba(255,255,255,${alpha})`;
          ctx.fillText(lineText, outX, ly);
        }
      }

      // End prompt cycle.
      if (elapsed > typeDur + 5500) {
        promptActive = false;
      }
    }

    // --- Bottom labels ---
    ctx.textBaseline = 'bottom';
    ctx.font = `${Math.max(10, W * 0.014)}px ui-sans-serif, system-ui, sans-serif`;
    ctx.fillStyle = 'rgba(192,192,192,0.22)';
    ctx.textAlign = 'left';
    ctx.fillText('\u2190  training data', W * 0.04, H * 0.97);
    ctx.textAlign = 'right';
    ctx.fillText('inference  \u2192', W * 0.96, H * 0.97);

    // Hint.
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillText('click to send a prompt', modelCX, H * 0.97);
    ctx.textAlign = 'left';
  });

  return () => {
    stop();
    container.removeEventListener('pointerup', onClick);
    destroy();
    root.remove();
  };
}
