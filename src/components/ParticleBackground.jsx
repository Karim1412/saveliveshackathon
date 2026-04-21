import { useEffect, useRef } from 'react'

/**
 * Full-screen canvas particle field with cyberpunk aesthetics.
 * Particles drift slowly; nearby particles are connected by thin cyan lines.
 * A few brighter red "glitch" particles add IEEE vibes.
 */
export default function ParticleBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId

    /* ── Resize ─────────────────────────────────────────── */
    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    /* ── Particle class ─────────────────────────────────── */
    class Particle {
      constructor() { this.init() }
      init() {
        this.x  = Math.random() * canvas.width
        this.y  = Math.random() * canvas.height
        this.vx = (Math.random() - 0.5) * 0.25
        this.vy = (Math.random() - 0.5) * 0.25
        this.r  = Math.random() * 1.6 + 0.4
        this.alpha = Math.random() * 0.4 + 0.1

        const roll = Math.random()
        if (roll < 0.15)      this.color = '#ff1a35'  // IEEE red
        else if (roll < 0.40) this.color = '#00f5ff'  // cyan accent
        else                  this.color = '#ffffff'  // white
      }
      update() {
        this.x += this.vx
        this.y += this.vy
        if (this.x < -10 || this.x > canvas.width + 10 ||
            this.y < -10 || this.y > canvas.height + 10) {
          this.init()
          // Re-enter from a random edge
          const edge = Math.floor(Math.random() * 4)
          if (edge === 0) { this.x = Math.random() * canvas.width;  this.y = -5 }
          if (edge === 1) { this.x = canvas.width + 5;              this.y = Math.random() * canvas.height }
          if (edge === 2) { this.x = Math.random() * canvas.width;  this.y = canvas.height + 5 }
          if (edge === 3) { this.x = -5;                            this.y = Math.random() * canvas.height }
        }
      }
      draw() {
        ctx.save()
        ctx.globalAlpha = this.alpha
        ctx.shadowBlur  = 6
        ctx.shadowColor = this.color
        ctx.fillStyle   = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    }

    const COUNT = Math.min(140, Math.floor((window.innerWidth * window.innerHeight) / 10000))
    const particles = Array.from({ length: COUNT }, () => new Particle())

    /* ── Connection lines ───────────────────────────────── */
    const MAX_DIST = 110
    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const d  = Math.hypot(dx, dy)
          if (d < MAX_DIST) {
            const a = (1 - d / MAX_DIST) * 0.08
            ctx.save()
            ctx.globalAlpha = a
            ctx.strokeStyle = '#00f5ff'
            ctx.lineWidth   = 0.6
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
            ctx.restore()
          }
        }
      }
    }

    /* ── Animated grid overlay ──────────────────────────── */
    let gridOffset = 0
    function drawGrid() {
      const spacing = 60
      ctx.save()
      ctx.strokeStyle = 'rgba(0,245,255,0.025)'
      ctx.lineWidth = 0.5
      // Vertical lines
      for (let x = (gridOffset % spacing); x < canvas.width; x += spacing) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke()
      }
      // Horizontal lines
      for (let y = 0; y < canvas.height; y += spacing) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke()
      }
      ctx.restore()
      gridOffset += 0.15
    }

    /* ── Radial vignette ────────────────────────────────── */
    function drawBackground() {
      const grad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.75
      )
      grad.addColorStop(0,   '#0d0d22')
      grad.addColorStop(0.5, '#080814')
      grad.addColorStop(1,   '#020208')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    /* ── Corner decorative accent ───────────────────────── */
    function drawAccents() {
      // Bottom-right red gradient accent
      const g = ctx.createRadialGradient(canvas.width, canvas.height, 0, canvas.width, canvas.height, 350)
      g.addColorStop(0, 'rgba(255,26,53,0.06)')
      g.addColorStop(1, 'rgba(255,26,53,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    /* ── Main loop ──────────────────────────────────────── */
    const loop = () => {
      drawBackground()
      drawGrid()
      drawAccents()
      drawConnections()
      particles.forEach(p => { p.update(); p.draw() })
      animId = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  )
}
