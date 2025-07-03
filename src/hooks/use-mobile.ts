import { useState, useEffect } from "react"

/**
 * Detect if the viewport width is below the given breakpoint.
 *
 * @param breakpoint Pixel width that marks the mobile cutoff. Defaults to 768.
 * @returns `true` when the window width is smaller than the breakpoint.
 */
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