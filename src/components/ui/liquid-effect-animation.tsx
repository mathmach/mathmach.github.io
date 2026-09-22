"use client"

import { useEffect, useRef } from "react"

interface LiquidEffectAnimationProps {
  imageUrl?: string
  metalness?: number
  roughness?: number
  displacementScale?: number
  rain?: boolean
  className?: string
}

export function LiquidEffectAnimation({
  imageUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2160&auto=format&fit=crop',
  metalness = 0.75,
  roughness = 0.25,
  displacementScale = 5,
  rain = false,
  className = '',
}: LiquidEffectAnimationProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const script = document.createElement("script")
    script.type = "module"
    script.textContent = `
      import LiquidBackground from 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.22/build/backgrounds/liquid1.min.js';
      
      const canvas = document.getElementById('liquid-canvas');
      if (canvas) {
        const app = LiquidBackground(canvas);
        app.loadImage('${imageUrl}');
        app.liquidPlane.material.metalness = ${metalness};
        app.liquidPlane.material.roughness = ${roughness};
        app.liquidPlane.uniforms.displacementScale.value = ${displacementScale};
        app.setRain(${rain});
        window.__liquidApp = app;
      }
    `
    document.body.appendChild(script)

    return () => {
      if (window.__liquidApp && window.__liquidApp.dispose) {
        window.__liquidApp.dispose()
      }
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [imageUrl, metalness, roughness, displacementScale, rain])

  return (
    <div
      className={`fixed inset-0 m-0 w-full h-full touch-none overflow-hidden ${className}`}
      style={{ fontFamily: '"Montserrat", serif' }}
    >
      <canvas ref={canvasRef} id="liquid-canvas" className="fixed inset-0 w-full h-full" />
    </div>
  )
}

declare global {
  interface Window {
    __liquidApp?: any
  }
}
