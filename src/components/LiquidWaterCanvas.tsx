import { useEffect, useRef } from 'react';

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  opacity: number;
  strength: number;
}

export function LiquidWaterCanvas({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let animationFrameId: number | null = null;
    let isRunning = false;

    const ripples: Ripple[] = [];
    let lastX = -1000;
    let lastY = -1000;
    let lastTime = 0;
    let pointerX = -1000;
    let pointerY = -1000;
    let isPointerInside = false;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    resize();

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(parent);

    const addRipple = (x: number, y: number, strength = 1.0) => {
      const maxRadius = Math.max(width, height) * 0.85 + 40;
      ripples.push({
        x,
        y,
        radius: 2,
        maxRadius,
        speed: 2.6 + strength * 0.4,
        opacity: 0.95 * strength,
        strength,
      });
      if (ripples.length > 25) {
        ripples.shift();
      }
      startLoop();
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      pointerX = x;
      pointerY = y;
      isPointerInside = true;

      const now = performance.now();
      const dist = Math.hypot(x - lastX, y - lastY);
      if (dist >= 12 || (dist > 4 && now - lastTime > 70)) {
        addRipple(x, y, Math.min(1.3, 0.7 + dist * 0.02));
        lastX = x;
        lastY = y;
        lastTime = now;
      }
      startLoop();
    };

    const handlePointerDown = (e: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      pointerX = x;
      pointerY = y;
      isPointerInside = true;
      addRipple(x, y, 1.6);
      setTimeout(() => {
        addRipple(x, y, 1.2);
      }, 90);
    };

    const handlePointerLeave = () => {
      isPointerInside = false;
      lastX = -1000;
      lastY = -1000;
    };

    parent.addEventListener('pointermove', handlePointerMove, { passive: true });
    parent.addEventListener('pointerdown', handlePointerDown, { passive: true });
    parent.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    const render = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      const isDark = document.documentElement.classList.contains('dark');

      if (isPointerInside && pointerX >= 0 && pointerY >= 0) {
        const meniscusRadius = 30;
        const meniscusGrad = ctx.createRadialGradient(
          pointerX,
          pointerY,
          0,
          pointerX,
          pointerY,
          meniscusRadius
        );

        if (isDark) {
          meniscusGrad.addColorStop(0, 'rgba(0, 242, 254, 0.18)');
          meniscusGrad.addColorStop(0.5, 'rgba(79, 172, 254, 0.08)');
          meniscusGrad.addColorStop(1, 'rgba(0, 242, 254, 0)');
        } else {
          meniscusGrad.addColorStop(0, 'rgba(3, 105, 161, 0.15)');
          meniscusGrad.addColorStop(0.5, 'rgba(3, 105, 161, 0.06)');
          meniscusGrad.addColorStop(1, 'rgba(3, 105, 161, 0)');
        }

        ctx.fillStyle = meniscusGrad;
        ctx.beginPath();
        const points = 12;
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const wobble =
            Math.sin(angle * 3 + time * 0.006) * 3 +
            Math.cos(angle * 2 - time * 0.005) * 2;
          const r = meniscusRadius + wobble;
          const px = pointerX + Math.cos(angle) * r;
          const py = pointerY + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = isDark
          ? 'rgba(255, 255, 255, 0.22)'
          : 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed;
        r.opacity *= 0.965;

        if (r.opacity < 0.015 || r.radius > r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        const waveCount = 2;
        const waveSpacing = 14;

        for (let w = 0; w < waveCount; w++) {
          const currentRadius = r.radius - w * waveSpacing;
          if (currentRadius <= 1) continue;

          const waveFade = Math.max(0, 1 - w * 0.35);
          const alpha = r.opacity * waveFade;

          const grad = ctx.createLinearGradient(
            r.x - currentRadius,
            r.y - currentRadius,
            r.x + currentRadius,
            r.y + currentRadius
          );

          if (isDark) {
            grad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.85})`);
            grad.addColorStop(0.35, `rgba(0, 242, 254, ${alpha * 0.55})`);
            grad.addColorStop(0.7, `rgba(79, 172, 254, ${alpha * 0.3})`);
            grad.addColorStop(1, `rgba(0, 15, 40, ${alpha * 0.25})`);
          } else {
            grad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.95})`);
            grad.addColorStop(0.4, `rgba(3, 105, 161, ${alpha * 0.45})`);
            grad.addColorStop(0.8, `rgba(3, 105, 161, ${alpha * 0.2})`);
            grad.addColorStop(1, `rgba(0, 0, 0, ${alpha * 0.15})`);
          }

          ctx.strokeStyle = grad;
          ctx.lineWidth = Math.max(0.8, (2.4 - w * 0.7) * (r.opacity + 0.2));
          ctx.beginPath();
          ctx.arc(r.x, r.y, currentRadius, 0, Math.PI * 2);
          ctx.stroke();

          if (w === 0 && currentRadius > 10) {
            ctx.beginPath();
            ctx.arc(r.x, r.y, currentRadius, -Math.PI * 0.85, -Math.PI * 0.15);
            ctx.strokeStyle = isDark
              ? `rgba(255, 255, 255, ${alpha * 0.95})`
              : `rgba(255, 255, 255, ${alpha * 1.0})`;
            ctx.lineWidth = Math.max(1, 2.8 * r.opacity);
            ctx.stroke();
          }
        }
      }

      ctx.restore();

      if (ripples.length > 0 || isPointerInside) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        isRunning = false;
        animationFrameId = null;
      }
    };

    const startLoop = () => {
      if (!isRunning) {
        isRunning = true;
        animationFrameId = requestAnimationFrame(render);
      }
    };

    return () => {
      parent.removeEventListener('pointermove', handlePointerMove);
      parent.removeEventListener('pointerdown', handlePointerDown);
      parent.removeEventListener('pointerleave', handlePointerLeave);
      resizeObserver.disconnect();
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 w-full h-full rounded-[inherit] overflow-hidden z-0 ${className}`}
    />
  );
}
