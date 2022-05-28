/**
 * Reference author: Antfu
 * Reference github: https://github.com/antfu/plum-demo/blob/main/src/App.vue
 */
import * as React from "react"
import "./bg-canvas.css"

const BackgroundCanvas = () => {
  const canvasRef = React.useRef(null)
  let animationFrame = null

  function init() {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
    }

    let pendingTasks = []

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.canvas.width = window.innerWidth
    ctx.canvas.height = document.body.clientHeight

    ctx.strokeStyle = "rgba(214, 213, 209, 0.5)"
    ctx.lineWidth = 0.5

    step({
      start: { x: 0, y: 0 },
      length: 1,
      theta: Math.PI / 4,
    })

    function lineTo(p1, p2) {
      ctx.beginPath()
      ctx.moveTo(p1.x, p1.y)
      ctx.lineTo(p2.x, p2.y)
      ctx.stroke()
    }

    function getEndPoint(b) {
      return {
        x: b.start.x + b.length * Math.cos(b.theta),
        y: b.start.y + b.length * Math.sin(b.theta),
      }
    }

    function drawBranch(b) {
      lineTo(b.start, getEndPoint(b))
    }

    function step(b, depth = 0) {
      const end = getEndPoint(b)
      drawBranch(b)
      if (depth < 4 || Math.random() < 0.5) {
        pendingTasks.push(() =>
          step(
            {
              start: end,
              length: b.length + (Math.random() * 2 - 1),
              theta: b.theta - 0.2 * Math.random(),
            },
            depth + 1
          )
        )
      }
      if (depth < 4 || Math.random() < 0.5) {
        pendingTasks.push(() =>
          step(
            {
              start: end,
              length: b.length + (Math.random() * 2 - 1),
              theta: b.theta + 0.2 * Math.random(),
            },
            depth + 1
          )
        )
      }
    }

    function frame() {
      const tasks = []
      pendingTasks = pendingTasks.filter(i => {
        if (Math.random() > 0.3) {
          tasks.push(i)
          return false
        }
        return true
      })
      tasks.forEach(fn => fn())
    }

    let framesCount = 0
    function startFrame() {
      animationFrame = requestAnimationFrame(() => {
        framesCount += 1
        if (framesCount % 3 === 0) frame()
        startFrame()
      })
    }
    startFrame()
  }

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("resize", () => init())
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", () => init())
      }
    }
  })

  return <canvas ref={canvasRef} className="canvas" />
}

export default BackgroundCanvas
