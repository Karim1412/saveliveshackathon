import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ──────────────────────────────────────────────────────────
 * GESTURE CLASSIFICATION
 * Uses finger-tip vs PIP-joint Y coords to detect extension.
 * Returns { gesture: 'rock'|'paper'|'scissors'|null, confidence: 0–1 }
 * ────────────────────────────────────────────────────────── */
function classifyGesture(landmarks) {
  if (!landmarks || landmarks.length < 21) return { gesture: null, confidence: 0 }

  const FINGERS = [[8, 6], [12, 10], [16, 14], [20, 18]]
  const extended  = FINGERS.map(([tip, pip]) => landmarks[tip].y < landmarks[pip].y)
  const extCount  = extended.filter(Boolean).length
  const thumbSpread = Math.abs(landmarks[4].x - landmarks[3].x)
  const thumbOut    = thumbSpread > 0.04

  let gesture = null, confidence = 0

  if (extCount === 0) {
    gesture    = 'rock'
    confidence = thumbOut ? 0.82 : 0.95
  } else if (extCount >= 3) {
    gesture    = 'paper'
    confidence = 0.75 + (extCount / 4) * 0.2
  } else if (extended[0] && extended[1] && !extended[2] && !extended[3]) {
    gesture    = 'scissors'
    confidence = 0.90
  }

  return { gesture, confidence: Math.min(confidence, 1) }
}

/* ── Hand skeleton overlay (mirror-aware) ─────────────── */
const CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],
  [5,9],[9,13],[13,17],
]

function drawSkeleton(ctx, landmarks, W, H) {
  const pts = landmarks.map(lm => ({ x: (1 - lm.x) * W, y: lm.y * H }))

  ctx.lineWidth = 2
  ctx.strokeStyle = 'rgba(0,245,255,0.85)'
  ctx.shadowBlur = 7
  ctx.shadowColor = '#00f5ff'
  CONNECTIONS.forEach(([a, b]) => {
    ctx.beginPath(); ctx.moveTo(pts[a].x, pts[a].y); ctx.lineTo(pts[b].x, pts[b].y); ctx.stroke()
  })

  pts.forEach((pt, i) => {
    const isTip = [4, 8, 12, 16, 20].includes(i)
    ctx.fillStyle   = isTip ? '#ff1a35' : i === 0 ? '#ffffff' : '#00f5ff'
    ctx.shadowColor = ctx.fillStyle
    ctx.shadowBlur  = 8
    ctx.beginPath()
    ctx.arc(pt.x, pt.y, isTip ? 5 : 3, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.shadowBlur = 0
}

/* ──────────────────────────────────────────────────────────
 * Wait for window.Hands to be set by the CDN <script> tag.
 * Polls every 150 ms, times out after 15 s.
 * ────────────────────────────────────────────────────────── */
function waitForMediaPipe(timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const t0 = Date.now()
    const check = () => {
      if (typeof window.Hands === 'function') {
        resolve(window.Hands)
      } else if (Date.now() - t0 > timeoutMs) {
        reject(new Error('MediaPipe Hands CDN script did not load in time.'))
      } else {
        setTimeout(check, 150)
      }
    }
    check()
  })
}

/* ──────────────────────────────────────────────────────────
 * CAMERA FEED COMPONENT
 * ────────────────────────────────────────────────────────── */
export default function CameraFeed({ onGestureDetected, gameState }) {
  const videoRef   = useRef(null)
  const canvasRef  = useRef(null)
  const handsRef   = useRef(null)
  const rafRef     = useRef(null)
  const streamRef  = useRef(null)
  const deadRef    = useRef(false)   // tracks whether component is unmounted

  const [camState, setCamState] = useState('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    deadRef.current = false

    async function boot() {
      try {
        /* ── 1. Wait for window.Hands (injected by CDN script in index.html) ── */
        const HandsClass = await waitForMediaPipe()
        if (deadRef.current) return

        /* ── 2. Instantiate MediaPipe Hands ── */
        const hands = new HandsClass({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        })

        hands.setOptions({
          maxNumHands:            1,
          modelComplexity:        1,
          minDetectionConfidence: 0.65,
          minTrackingConfidence:  0.5,
        })

        hands.onResults((results) => {
          if (deadRef.current) return
          const canvas = canvasRef.current
          if (!canvas) return

          const ctx = canvas.getContext('2d')
          const W = canvas.width, H = canvas.height
          ctx.clearRect(0, 0, W, H)

          /* Mirror-draw the video */
          ctx.save()
          ctx.scale(-1, 1)
          ctx.translate(-W, 0)
          ctx.drawImage(results.image, 0, 0, W, H)
          ctx.restore()

          let det = { gesture: null, confidence: 0 }
          if (results.multiHandLandmarks?.length > 0) {
            const lm = results.multiHandLandmarks[0]
            drawSkeleton(ctx, lm, W, H)
            det = classifyGesture(lm)
          }

          onGestureDetected(det.gesture, det.confidence)
        })

        handsRef.current = hands

        /* ── 3. Request camera ── */
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false,
        })
        if (deadRef.current) { stream.getTracks().forEach(t => t.stop()); return }

        streamRef.current = stream
        videoRef.current.srcObject = stream
        await videoRef.current.play()

        /* ── 4. Size canvas to match video ── */
        canvasRef.current.width  = videoRef.current.videoWidth  || 640
        canvasRef.current.height = videoRef.current.videoHeight || 480

        if (!deadRef.current) setCamState('ready')

        /* ── 5. Processing loop ── */
        const loop = async () => {
          if (deadRef.current) return
          const v = videoRef.current
          if (v && !v.paused && !v.ended) {
            try { await hands.send({ image: v }) } catch (_) {}
          }
          rafRef.current = requestAnimationFrame(loop)
        }
        rafRef.current = requestAnimationFrame(loop)

      } catch (err) {
        console.error('[CameraFeed]', err)
        if (!deadRef.current) {
          setCamState('error')
          setErrorMsg(
            err.name === 'NotAllowedError'
              ? 'Camera permission denied.\nAllow camera access in your browser settings.'
              : err.name === 'NotFoundError'
              ? 'No camera found on this device.'
              : `Error: ${err.message}`
          )
        }
      }
    }

    boot()

    return () => {
      deadRef.current = true
      cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
      handsRef.current?.close?.()
    }
  }, []) // mount once

  return (
    <div className="flex flex-col items-center gap-4">

      {/* Glass camera card */}
      <div className="glass-card p-3 relative select-none"
           style={{ border: '1px solid rgba(0,245,255,0.18)' }}>

        {/* Corner brackets */}
        {['top-0 left-0 border-t-2 border-l-2','top-0 right-0 border-t-2 border-r-2',
          'bottom-0 left-0 border-b-2 border-l-2','bottom-0 right-0 border-b-2 border-r-2']
          .map((cls, i) => <div key={i} className={`absolute ${cls} border-red-500 w-5 h-5 z-20`} />)}

        {/* Hidden video + visible canvas */}
        <video ref={videoRef} className="hidden" playsInline muted />
        <canvas
          ref={canvasRef}
          className="camera-canvas rounded block"
          style={{
            width: '100%', maxWidth: 340, aspectRatio: '4/3',
            filter: camState === 'error' ? 'grayscale(1) brightness(0.3)' : 'none',
          }}
        />

        {/* LIVE badge */}
        <AnimatePresence>
          {camState === 'ready' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute top-5 left-5 z-20 flex items-center gap-1.5 glass-card px-2.5 py-1"
              style={{ border: '1px solid rgba(255,26,53,0.4)' }}>
              <motion.span className="w-2 h-2 rounded-full bg-red-500 block"
                animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
              <span className="font-display text-[10px] text-red-400 uppercase tracking-widest">Live</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Capture scan-line */}
        <AnimatePresence>
          {gameState === 'capture' && (
            <motion.div key="scan"
              className="absolute left-3 right-3 h-0.5 z-30 pointer-events-none"
              style={{ background: 'linear-gradient(90deg, transparent, #00f5ff, transparent)',
                       boxShadow: '0 0 12px #00f5ff' }}
              initial={{ top: '12px' }} animate={{ top: 'calc(100% - 12px)' }}
              transition={{ duration: 0.5, ease: 'linear' }} />
          )}
        </AnimatePresence>

        {/* Loading overlay */}
        <AnimatePresence>
          {camState === 'loading' && (
            <motion.div key="loader" initial={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-3 flex flex-col items-center justify-center
                         bg-gray-950/90 rounded z-20 gap-3">
              <motion.div className="w-10 h-10 rounded-full"
                style={{ border: '2px solid rgba(0,245,255,0.15)', borderTopColor: '#00f5ff' }}
                animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
              <p className="font-display text-xs text-cyan-400 uppercase tracking-widest">Loading AI…</p>
              <p className="text-gray-600 text-[10px] text-center px-4">Fetching MediaPipe models…</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error overlay */}
        {camState === 'error' && (
          <div className="absolute inset-3 flex flex-col items-center justify-center
                          bg-gray-950/92 rounded z-20 gap-3 text-center px-4">
            <span className="text-4xl">📷</span>
            <p className="text-red-400 font-display text-xs uppercase tracking-wide leading-relaxed whitespace-pre-line">
              {errorMsg}
            </p>
            <button className="btn-outline-cyan text-xs" onClick={() => window.location.reload()}>
              ↺ Retry
            </button>
          </div>
        )}
      </div>

      <p className="text-gray-600 text-xs tracking-widest uppercase text-center">
        ✊ Rock &nbsp;·&nbsp; ✋ Paper &nbsp;·&nbsp; ✌️ Scissors
      </p>
    </div>
  )
}
