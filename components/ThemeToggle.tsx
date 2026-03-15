"use client"

import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"

const ICONS = {
  light: "☀️",
  dark: "🌙",
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const currentTheme = (theme as "light" | "dark") || "light"
  const nextTheme = currentTheme === "light" ? "dark" : "light"

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(nextTheme)}
      className="inline-flex items-center justify-center rounded-full border border-[#4A4A4A]/20 bg-white/50 px-3 py-2 text-sm text-[#4A4A4A] shadow-sm transition hover:border-[#A5B867] hover:text-[#A5B867] dark:border-white/20 dark:bg-black/30 dark:text-white/80 dark:hover:border-[#c4d677] dark:hover:text-[#c4d677]"
    >
      {mounted ? ICONS[currentTheme] : "···"}
      <span className="ml-2 text-xs uppercase tracking-wide">
        {mounted ? (currentTheme === "light" ? "Light" : "Dark") : "Theme"}
      </span>
    </button>
  )
}
