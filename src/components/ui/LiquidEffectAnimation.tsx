"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

interface LiquidEffectAnimationProps {
  imageUrl?: string
  displacementScale?: number
  viscosity?: number
  rain?: boolean
  className?: string
}

export function LiquidEffectAnimation({
  imageUrl = "/images/liquid-effect.jpg",
  displacementScale = 4.0,
  viscosity = 0.98,
  rain = false,
  className = "",
}: LiquidEffectAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let animationFrameId: number | null = null
    let disposed = false

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: "high-performance",
      })
    } catch {
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

    const baseSimH = 256
    const renderTargetOptions = {
      type: renderer.capabilities.isWebGL2 ? THREE.HalfFloatType : THREE.UnsignedByteType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
      stencilBuffer: false,
    }

    let targetA = new THREE.WebGLRenderTarget(baseSimH, baseSimH, renderTargetOptions)
    let targetB = new THREE.WebGLRenderTarget(baseSimH, baseSimH, renderTargetOptions)
    let targetC = new THREE.WebGLRenderTarget(baseSimH, baseSimH, renderTargetOptions)

    let current = targetA
    let previous = targetB
    let next = targetC

    const simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const quadGeom = new THREE.PlaneGeometry(2, 2)

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `

    const dropShader = `
      uniform sampler2D uTexture;
      uniform vec2 uCenter;
      uniform float uRadius;
      uniform float uStrength;
      uniform float uAspect;
      varying vec2 vUv;

      void main() {
        vec4 color = texture2D(uTexture, vUv);
        vec2 diff = vUv - uCenter;
        diff.x *= uAspect;
        float dist = length(diff);
        if (dist < uRadius) {
          float factor = (cos(dist / uRadius * 3.14159265) + 1.0) * 0.5;
          color.r += factor * uStrength;
        }
        gl_FragColor = color;
      }
    `

    const simShader = `
      uniform sampler2D uCurrent;
      uniform sampler2D uPrevious;
      uniform vec2 uDelta;
      uniform float uViscosity;
      varying vec2 vUv;

      void main() {
        vec4 left  = texture2D(uCurrent, vUv - vec2(uDelta.x, 0.0));
        vec4 right = texture2D(uCurrent, vUv + vec2(uDelta.x, 0.0));
        vec4 up    = texture2D(uCurrent, vUv + vec2(0.0, uDelta.y));
        vec4 down  = texture2D(uCurrent, vUv - vec2(0.0, uDelta.y));
        float prev = texture2D(uPrevious, vUv).r;

        float val = (left.r + right.r + up.r + down.r) * 0.5 - prev;
        val *= uViscosity;

        gl_FragColor = vec4(val, 0.0, 0.0, 1.0);
      }
    `

    const displayShader = `
      uniform sampler2D uTexture;
      uniform sampler2D uImage;
      uniform vec2 uDelta;
      uniform float uDisplacement;
      uniform vec2 uImageAspect;
      uniform float uAspect;
      varying vec2 vUv;

      void main() {
        float left  = texture2D(uTexture, vUv - vec2(uDelta.x, 0.0)).r;
        float right = texture2D(uTexture, vUv + vec2(uDelta.x, 0.0)).r;
        float down  = texture2D(uTexture, vUv - vec2(0.0, uDelta.y)).r;
        float up    = texture2D(uTexture, vUv + vec2(0.0, uDelta.y)).r;

        vec2 normal = vec2(left - right, down - up);

        vec2 uv = (vUv - 0.5) * uImageAspect + 0.5;
        vec2 dispVec = normal * uDisplacement * 0.03;
        dispVec.x /= uAspect;
        vec2 displacedUv = uv + dispVec;

        vec4 color = texture2D(uImage, displacedUv);

        vec2 specNormal = vec2(normal.x * uAspect, normal.y);
        vec3 N = normalize(vec3(specNormal * 2.5, 1.0));
        vec3 L = normalize(vec3(-0.35, 0.55, 0.75));
        vec3 V = vec3(0.0, 0.0, 1.0);
        vec3 H = normalize(L + V);
        float spec = pow(max(0.0, dot(N, H)), 24.0);

        gl_FragColor = color + vec4(vec3(spec * 0.4), 0.0);
      }
    `

    const dropMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader: dropShader,
      uniforms: {
        uTexture: { value: null },
        uCenter: { value: new THREE.Vector2(0.5, 0.5) },
        uRadius: { value: 0.03 },
        uStrength: { value: 0.02 },
        uAspect: { value: 1.0 },
      },
    })
    const dropScene = new THREE.Scene()
    dropScene.add(new THREE.Mesh(quadGeom, dropMaterial))

    const simMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader: simShader,
      uniforms: {
        uCurrent: { value: null },
        uPrevious: { value: null },
        uDelta: { value: new THREE.Vector2(1 / baseSimH, 1 / baseSimH) },
        uViscosity: { value: viscosity },
      },
    })
    const simScene = new THREE.Scene()
    simScene.add(new THREE.Mesh(quadGeom, simMaterial))

    const displayMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader: displayShader,
      uniforms: {
        uTexture: { value: null },
        uImage: { value: null },
        uDelta: { value: new THREE.Vector2(1 / baseSimH, 1 / baseSimH) },
        uDisplacement: { value: displacementScale },
        uImageAspect: { value: new THREE.Vector2(1, 1) },
        uAspect: { value: 1.0 },
      },
    })
    const displayScene = new THREE.Scene()
    displayScene.add(new THREE.Mesh(quadGeom, displayMaterial))

    let imageAspect = 1.0
    const textureLoader = new THREE.TextureLoader()
    textureLoader.crossOrigin = "anonymous"
    textureLoader.load(imageUrl, (tex) => {
      if (disposed) {
        tex.dispose()
        return
      }
      tex.colorSpace = THREE.SRGBColorSpace
      tex.wrapS = THREE.ClampToEdgeWrapping
      tex.wrapT = THREE.ClampToEdgeWrapping
      displayMaterial.uniforms.uImage.value = tex
      if (tex.image && tex.image.width && tex.image.height) {
        imageAspect = tex.image.width / tex.image.height
        updateAspect()
      }
    })

    const updateAspect = () => {
      const canvasAspect = canvas.width / canvas.height
      if (canvasAspect > imageAspect) {
        displayMaterial.uniforms.uImageAspect.value.set(1.0, canvasAspect / imageAspect)
      } else {
        displayMaterial.uniforms.uImageAspect.value.set(imageAspect / canvasAspect, 1.0)
      }
    }

    const resize = () => {
      const parent = canvas.parentElement || document.body
      const width = parent.clientWidth || window.innerWidth
      const height = parent.clientHeight || window.innerHeight
      renderer.setSize(width, height)

      const aspect = Math.max(0.001, width / height)
      const simH = 256
      const simW = Math.max(128, Math.min(1024, Math.round(256 * aspect)))

      targetA.setSize(simW, simH)
      targetB.setSize(simW, simH)
      targetC.setSize(simW, simH)

      dropMaterial.uniforms.uAspect.value = aspect
      simMaterial.uniforms.uDelta.value.set(1 / simW, 1 / simH)
      displayMaterial.uniforms.uDelta.value.set(1 / simW, 1 / simH)
      displayMaterial.uniforms.uAspect.value = aspect

      updateAspect()
    }

    resize()
    window.addEventListener("resize", resize)

    const pendingDrops: Array<{ x: number; y: number; radius: number; strength: number }> = []

    const addDrop = (x: number, y: number, radius = 0.035, strength = 0.02) => {
      pendingDrops.push({ x, y, radius, strength })
    }

    let lastX = -1
    let lastY = -1
    let lastTime = 0

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = 1.0 - (e.clientY - rect.top) / rect.height

      const now = performance.now()
      const dist = Math.hypot(x - lastX, y - lastY)

      if (dist > 0.008 || (dist > 0.002 && now - lastTime > 60)) {
        lastX = x
        lastY = y
        lastTime = now
        addDrop(x, y, 0.03 + Math.min(dist * 0.5, 0.02), 0.015 + Math.min(dist * 0.4, 0.03))
      }
    }

    const handlePointerDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = 1.0 - (e.clientY - rect.top) / rect.height
      addDrop(x, y, 0.05, 0.06)
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerdown", handlePointerDown, { passive: true })

    let lastRainTime = 0

    const animate = (time: number) => {
      if (disposed) return

      if (rain && time - lastRainTime > 120) {
        lastRainTime = time
        addDrop(Math.random(), Math.random(), 0.02 + Math.random() * 0.015, 0.01 + Math.random() * 0.015)
      }

      while (pendingDrops.length > 0) {
        const drop = pendingDrops.shift()
        if (!drop) break
        dropMaterial.uniforms.uTexture.value = current.texture
        dropMaterial.uniforms.uCenter.value.set(drop.x, drop.y)
        dropMaterial.uniforms.uRadius.value = drop.radius
        dropMaterial.uniforms.uStrength.value = drop.strength

        renderer.setRenderTarget(next)
        renderer.render(dropScene, simCamera)

        const tmp = current
        current = next
        next = tmp
      }

      simMaterial.uniforms.uCurrent.value = current.texture
      simMaterial.uniforms.uPrevious.value = previous.texture

      renderer.setRenderTarget(next)
      renderer.render(simScene, simCamera)

      const oldPrev = previous
      previous = current
      current = next
      next = oldPrev

      displayMaterial.uniforms.uTexture.value = current.texture
      renderer.setRenderTarget(null)
      renderer.render(displayScene, simCamera)

      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      disposed = true
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }
      window.removeEventListener("resize", resize)
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerdown", handlePointerDown)

      const imageTex = displayMaterial.uniforms.uImage.value
      if (imageTex) imageTex.dispose()

      targetA.dispose()
      targetB.dispose()
      targetC.dispose()

      quadGeom.dispose()
      dropMaterial.dispose()
      simMaterial.dispose()
      displayMaterial.dispose()
      renderer.dispose()
    }
  }, [imageUrl, displacementScale, viscosity, rain])

  return (
    <div className={`fixed inset-0 m-0 w-full h-full overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full" />
    </div>
  )
}
