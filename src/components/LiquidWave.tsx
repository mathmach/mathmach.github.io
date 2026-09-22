import { useEffect, useRef } from 'react';

interface LiquidWaveProps {
  className?: string;
  baseRadius?: number;
  maxRadius?: number;
}

export function LiquidWave({ className = '', baseRadius = 32, maxRadius }: LiquidWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId: number | null = null;
    let isHovering = false;

    let targetX = -100;
    let targetY = -100;
    let posX = -100;
    let posY = -100;
    let prevPosX = -100;
    let prevPosY = -100;
    let waveIntensity = 0;
    let wavePhase = 0;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.floor(rect.width);
      height = Math.floor(rect.height);
      if (width <= 0 || height <= 0) return;
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

    const isDarkMode = () => document.documentElement.classList.contains('dark');

    const render = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);

      const dx = targetX - posX;
      const dy = targetY - posY;
      posX += dx * 0.16;
      posY += dy * 0.16;

      const vx = posX - prevPosX;
      const vy = posY - prevPosY;
      prevPosX = posX;
      prevPosY = posY;
      const speed = Math.hypot(vx, vy);

      if (isHovering) {
        waveIntensity += (1 - waveIntensity) * 0.15;
      } else {
        waveIntensity += (0 - waveIntensity) * 0.08;
      }

      wavePhase += 0.07 + Math.min(speed, 20) * 0.015;

      const dark = isDarkMode();
      const waveColor = dark ? '0, 242, 254' : '3, 105, 161';
      const specularColor = '255, 255, 255';

      if (waveIntensity > 0.01 && posX > -50 && posY > -50) {
        const centerGrad = ctx.createRadialGradient(posX, posY, 0, posX, posY, baseRadius * 1.1);
        centerGrad.addColorStop(0, `rgba(${specularColor}, ${waveIntensity * (dark ? 0.22 : 0.4)})`);
        centerGrad.addColorStop(0.35, `rgba(${waveColor}, ${waveIntensity * (dark ? 0.15 : 0.12)})`);
        centerGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = centerGrad;
        ctx.beginPath();
        ctx.arc(posX, posY, baseRadius * 1.1, 0, Math.PI * 2);
        ctx.fill();

        const crest1R = baseRadius * 1.0 + Math.sin(wavePhase) * 3 + Math.min(speed * 0.4, 10);
        const crest1Width = 14 + Math.min(speed * 0.2, 6);
        const inner1 = Math.max(0.1, crest1R - crest1Width * 0.5);
        const outer1 = crest1R + crest1Width * 0.5;

        const grad1 = ctx.createRadialGradient(posX, posY, inner1, posX, posY, outer1);
        grad1.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad1.addColorStop(0.3, `rgba(${waveColor}, ${waveIntensity * 0.3})`);
        grad1.addColorStop(0.5, `rgba(${specularColor}, ${waveIntensity * 0.55})`);
        grad1.addColorStop(0.7, `rgba(${waveColor}, ${waveIntensity * 0.3})`);
        grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad1;
        ctx.beginPath();
        ctx.arc(posX, posY, outer1, 0, Math.PI * 2);
        ctx.fill();

        const trailX = posX - vx * 1.5;
        const trailY = posY - vy * 1.5;
        const crest2R = baseRadius * 1.7 + Math.sin(wavePhase - 1.2) * 5 + Math.min(speed * 0.6, 14);
        const crest2Width = 18;
        const inner2 = Math.max(0.1, crest2R - crest2Width * 0.5);
        const outer2 = crest2R + crest2Width * 0.5;
        const opacity2 = waveIntensity * 0.35;

        const grad2 = ctx.createRadialGradient(trailX, trailY, inner2, trailX, trailY, outer2);
        grad2.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad2.addColorStop(0.3, `rgba(${waveColor}, ${opacity2 * 0.3})`);
        grad2.addColorStop(0.5, `rgba(${specularColor}, ${opacity2 * 0.45})`);
        grad2.addColorStop(0.7, `rgba(${waveColor}, ${opacity2 * 0.3})`);
        grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad2;
        ctx.beginPath();
        ctx.arc(trailX, trailY, outer2, 0, Math.PI * 2);
        ctx.fill();

        const crest3R = baseRadius * 2.3 + Math.sin(wavePhase - 2.4) * 6;
        const crest3Width = 22;
        const inner3 = Math.max(0.1, crest3R - crest3Width * 0.5);
        const outer3 = crest3R + crest3Width * 0.5;
        const opacity3 = waveIntensity * 0.16;

        const grad3 = ctx.createRadialGradient(trailX, trailY, inner3, trailX, trailY, outer3);
        grad3.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad3.addColorStop(0.3, `rgba(${waveColor}, ${opacity3 * 0.25})`);
        grad3.addColorStop(0.5, `rgba(${specularColor}, ${opacity3 * 0.35})`);
        grad3.addColorStop(0.7, `rgba(${waveColor}, ${opacity3 * 0.25})`);
        grad3.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad3;
        ctx.beginPath();
        ctx.arc(trailX, trailY, outer3, 0, Math.PI * 2);
        ctx.fill();
      }

      if (isHovering || waveIntensity > 0.01) {
        rafId = requestAnimationFrame(render);
      } else {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        rafId = null;
      }
    };

    const startLoop = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(render);
      }
    };

    const handlePointerEnter = (e: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
      posX = targetX;
      posY = targetY;
      prevPosX = posX;
      prevPosY = posY;
      isHovering = true;
      startLoop();
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
      isHovering = true;
      startLoop();
    };

    const handlePointerLeave = () => {
      isHovering = false;
      startLoop();
    };

    parent.addEventListener('pointerenter', handlePointerEnter, { passive: true });
    parent.addEventListener('pointermove', handlePointerMove, { passive: true });
    parent.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    return () => {
      resizeObserver.disconnect();
      parent.removeEventListener('pointerenter', handlePointerEnter);
      parent.removeEventListener('pointermove', handlePointerMove);
      parent.removeEventListener('pointerleave', handlePointerLeave);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [baseRadius, maxRadius]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 z-0 rounded-[inherit] overflow-hidden ${className}`}
      aria-hidden="true"
    />
  );
}
