import { useState, useEffect } from "react"

// Retorna true si el ancho de pantalla es menor a 768px (tailwind "md")
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Función para chequear el ancho actual
    const checkMobile = () => setIsMobile(window.innerWidth < breakpoint)
    checkMobile()

    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [breakpoint])

  return isMobile
}