"use client"

import { useEffect, useRef, useState } from "react"

export function LuxuryCursor() {
  const [isHovering, setIsHovering] = useState(false)
  const cursorRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  
  // Coordonnées cibles (souris)
  const mousePos = useRef({ x: 0, y: 0 })
  // Coordonnées actuelles du cercle (pour l'effet retard)
  const ringPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const updateMousePos = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
      
      // Le point (curseur principal) suit instantanément
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`
        cursorRef.current.style.top = `${e.clientY}px`
      }
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName.toLowerCase() === "a" ||
        target.tagName.toLowerCase() === "button" ||
        target.closest("a") ||
        target.closest("button") ||
        target.classList.contains("cursor-pointer")
      ) {
        setIsHovering(true)
      } else {
        setIsHovering(false)
      }
    }

    // Animation loop pour l'effet élastique du cercle
    let animationId: number
    const animate = () => {
      // Interpolation linéaire (LERP) : Accéléré à 0.20 pour plus de réactivité
      const lerpFactor = 0.20
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * lerpFactor
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * lerpFactor

      if (ringRef.current) {
        ringRef.current.style.left = `${ringPos.current.x}px`
        ringRef.current.style.top = `${ringPos.current.y}px`
      }

      animationId = requestAnimationFrame(animate)
    }

    window.addEventListener("mousemove", updateMousePos)
    window.addEventListener("mouseover", handleMouseOver)
    animate()

    return () => {
      window.removeEventListener("mousemove", updateMousePos)
      window.removeEventListener("mouseover", handleMouseOver)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <>
      <div
        ref={cursorRef}
        className="cursor"
        style={{
          width: isHovering ? "14px" : "8px",
          height: isHovering ? "14px" : "8px",
          opacity: 1,
        }}
      />
      <div
        ref={ringRef}
        className="cursor-ring"
        style={{
          width: isHovering ? "52px" : "36px",
          height: isHovering ? "52px" : "36px",
        }}
      />
    </>
  )
}
