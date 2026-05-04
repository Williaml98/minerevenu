"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

function getResolvedTheme(): Theme {
  try {
    const saved = localStorage.getItem("theme") as Theme | null;
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "dark";
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  if (theme === "dark") document.documentElement.classList.add("dark");
  else document.documentElement.classList.remove("dark");
  try { localStorage.setItem("theme", theme); } catch { /* noop */ }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(getResolvedTheme());
    setMounted(true);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  if (!mounted) {
    return <div className="w-10 h-10 rounded-full" style={{ background: "var(--navbar-toggle-bg)" }} />;
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200"
      style={{
        background: "var(--navbar-toggle-bg)",
        border: "1px solid var(--navbar-toggle-border)",
        color: "var(--navbar-toggle-color)",
      }}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun size={17} className="transition-transform duration-300 hover:rotate-12" />
      ) : (
        <Moon size={17} className="transition-transform duration-300" />
      )}
    </button>
  );
}

/* Utility so Settings page can use the same logic */
export { getResolvedTheme, applyTheme };
