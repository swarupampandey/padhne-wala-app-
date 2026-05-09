import { createContext, useContext, useEffect, useState } from "react"

export type AppTheme = "cockpit" | "galaxy" | "matrix" | "sakura"

export const THEMES: { id: AppTheme; label: string; color: string; dark: boolean }[] = [
  { id: "cockpit", label: "Cockpit", color: "#00d4b4", dark: true },
  { id: "galaxy", label: "Galaxy", color: "#8b5cf6", dark: true },
  { id: "matrix", label: "Matrix", color: "#00ff41", dark: true },
  { id: "sakura", label: "Sakura", color: "#e83e8c", dark: false },
]

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: AppTheme
  storageKey?: string
}

type ThemeProviderState = {
  theme: AppTheme
  setTheme: (theme: AppTheme) => void
}

const initialState: ThemeProviderState = {
  theme: "cockpit",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "cockpit",
  storageKey = "zenith-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<AppTheme>(
    () => (localStorage.getItem(storageKey) as AppTheme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    const themeConfig = THEMES.find(t => t.id === theme)
    if (themeConfig?.dark) {
      root.classList.add("dark")
    } else {
      root.classList.add("light")
    }

    root.setAttribute("data-theme", theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (t: AppTheme) => {
      localStorage.setItem(storageKey, t)
      setTheme(t)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")
  return context
}
