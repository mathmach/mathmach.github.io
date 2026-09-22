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
      const maxRadius = Math.max(width, height) * 0.95 + 60;
      ripples.push({
        x,
        y,
        radius: 4,
        maxRadius,
        speed: 2.8 + strength * 0.5,
        opacity: 0.92 * strength,
        strength,
      });
      if (ripples.length > 20) {
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
      if (dist >= 16 || (dist > 6 && now - lastTime > 65)) {
        addRipple(x, y, Math.min(1.4, 0.75 + dist * 0.02));
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
      addRipple(x, y, 1.8);
      setTimeout(() => {
        addRipple(x, y, 1.3);
      }, 95);
    };

    const handlePointerLeave = () => {
      isPointerInside = false;
      lastX = -1000;
      lastY = -1000;
    };

    parent.addEventListener('pointermove', handlePointerMove, { passive: true });
    parent.addEventListener('pointerdown', handlePointerDown, { passive: true });
    parent.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      const isDark = document.documentElement.classList.contains('dark');
      ctx.globalCompositeOperation = isDark ? 'screen' : 'source-over';

      if (isPointerInside && pointerX >= 0 && pointerY >= 0) {
        const dropRadius = 45;
        const dropGrad = ctx.createRadialGradient(
          pointerX - 8,
          pointerY - 8,
          2,
          pointerX,
          pointerY,
          dropRadius
        );

        if (isDark) {
          dropGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.45)');
          dropGrad.addColorStop(0.2, 'rgba(0, 242, 254, 0.28)');
          dropGrad.addColorStop(0.55, 'rgba(79, 172, 254, 0.12)');
          dropGrad.addColorStop(1.0, 'rgba(0, 242, 254, 0.0)');
        } else {
          dropGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.7)');
          dropGrad.addColorStop(0.25, 'rgba(3, 105, 161, 0.22)');
          dropGrad.addColorStop(0.65, 'rgba(3, 105, 161, 0.08)');
          dropGrad.addColorStop(1.0, 'rgba(3, 105, 161, 0.0)');
        }

        ctx.fillStyle = dropGrad;
        ctx.beginPath();
        ctx.arc(pointerX, pointerY, dropRadius, 0, Math.PI * 2);
        ctx.fill();

        const glintGrad = ctx.createRadialGradient(
          pointerX - 12,
          pointerY - 12,
          0,
          pointerX - 12,
          pointerY - 12,
          10
        );
        glintGrad.addColorStop(0.0, isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.95)');
        glintGrad.addColorStop(0.5, isDark ? 'rgba(0, 242, 254, 0.4)' : 'rgba(255, 255, 255, 0.4)');
        glintGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');

        ctx.fillStyle = glintGrad;
        ctx.beginPath();
        ctx.arc(pointerX - 12, pointerY - 12, 10, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed;
        r.opacity *= 0.962;

        if (r.opacity < 0.012 || r.radius > r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        const waveCount = 2;
        const waveSpacing = 22;

        for (let w = 0; w < waveCount; w++) {
          const waveRadius = r.radius - w * waveSpacing;
          if (waveRadius <= 2) continue;

          const waveBand = Math.max(14, 10 + waveRadius * 0.14);
          const innerR = Math.max(0, waveRadius - waveBand);
          const outerR = waveRadius + waveBand;

          const waveFade = Math.max(0, 1 - w * 0.35);
          const alpha = r.opacity * waveFade;

          const lightOffsetX = -6;
          const lightOffsetY = -6;

          const grad = ctx.createRadialGradient(
            r.x + lightOffsetX,
            r.y + lightOffsetY,
            innerR,
            r.x,
            r.y,
            outerR
          );

          if (isDark) {
            grad.addColorStop(0.0, 'rgba(0, 0, 0, 0.0)');
            grad.addColorStop(0.3, `rgba(0, 25, 60, ${alpha * 0.35})`);
            grad.addColorStop(0.48, `rgba(0, 242, 254, ${alpha * 0.75})`);
            grad.addColorStop(0.54, `rgba(255, 255, 255, ${alpha * 0.92})`);
            grad.addColorStop(0.72, `rgba(79, 172, 254, ${alpha * 0.3})`);
            grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
          } else {
            grad.addColorStop(0.0, 'rgba(255, 255, 255, 0.0)');
            grad.addColorStop(0.3, `rgba(0, 0, 0, ${alpha * 0.15})`);
            grad.addColorStop(0.46, `rgba(3, 105, 161, ${alpha * 0.6})`);
            grad.addColorStop(0.53, `rgba(255, 255, 255, ${alpha * 0.95})`);
            grad.addColorStop(0.72, `rgba(3, 105, 161, ${alpha * 0.25})`);
            grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
          }

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(r.x, r.y, outerR, 0, Math.PI * 2);
          ctx.fill();
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
