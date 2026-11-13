import { Moon, Sun, ChevronDown, Palette, Check } from "lucide-react";
import { useEffect, useState, useRef } from "react";

export interface ThemePalette {
  id: string;
  name: string;
  preview: string;
  light: {
    background: string;
    card: string;
    secondary: string;
    border: string;
    primary: string;
    primaryFg: string;
    accent: string;
    ring: string;
  };
  dark: {
    background: string;
    card: string;
    secondary: string;
    border: string;
    primary: string;
    primaryFg: string;
    accent: string;
    ring: string;
  };
}

export const THEME_PALETTES: ThemePalette[] = [
  {
    id: "dark-green",
    name: "To'q Yashil",
    preview: "#059669",
    light: {
      background: "oklch(0.96 0.025 155)",
      card: "oklch(0.995 0.01 155)",
      secondary: "oklch(0.92 0.035 155)",
      border: "oklch(0.88 0.04 155)",
      primary: "oklch(0.38 0.17 150)",
      primaryFg: "oklch(0.99 0 0)",
      accent: "oklch(0.90 0.18 150)",
      ring: "oklch(0.52 0.18 150)",
    },
    dark: {
      background: "oklch(0.13 0.045 155)", // To'q yashil orqa fon
      card: "oklch(0.18 0.055 155)",
      secondary: "oklch(0.23 0.06 155)",
      border: "oklch(0.35 0.06 155 / 45%)",
      primary: "oklch(0.82 0.22 150)",
      primaryFg: "oklch(0.13 0.045 155)",
      accent: "oklch(0.82 0.22 150)",
      ring: "oklch(0.72 0.22 150)",
    },
  },
  {
    id: "red",
    name: "Qizil",
    preview: "#dc2626",
    light: {
      background: "oklch(0.97 0.02 25)",
      card: "oklch(0.995 0.008 25)",
      secondary: "oklch(0.93 0.03 25)",
      border: "oklch(0.89 0.035 25)",
      primary: "oklch(0.50 0.23 25)",
      primaryFg: "oklch(0.99 0 0)",
      accent: "oklch(0.88 0.18 25)",
      ring: "oklch(0.60 0.22 25)",
    },
    dark: {
      background: "oklch(0.14 0.05 25)", // To'q qizil orqa fon
      card: "oklch(0.19 0.06 25)",
      secondary: "oklch(0.24 0.065 25)",
      border: "oklch(0.35 0.07 25 / 45%)",
      primary: "oklch(0.78 0.22 25)",
      primaryFg: "oklch(0.14 0.05 25)",
      accent: "oklch(0.80 0.20 25)",
      ring: "oklch(0.70 0.22 25)",
    },
  },
  {
    id: "blue",
    name: "To'q Ko'k",
    preview: "#2563eb",
    light: {
      background: "oklch(0.965 0.02 250)",
      card: "oklch(0.995 0.008 250)",
      secondary: "oklch(0.92 0.03 250)",
      border: "oklch(0.88 0.035 250)",
      primary: "oklch(0.48 0.22 250)",
      primaryFg: "oklch(0.99 0 0)",
      accent: "oklch(0.88 0.18 250)",
      ring: "oklch(0.60 0.22 250)",
    },
    dark: {
      background: "oklch(0.13 0.045 255)", // To'q ko'k / Midnight orqa fon
      card: "oklch(0.18 0.055 255)",
      secondary: "oklch(0.23 0.06 255)",
      border: "oklch(0.35 0.065 255 / 45%)",
      primary: "oklch(0.80 0.20 250)",
      primaryFg: "oklch(0.13 0.045 255)",
      accent: "oklch(0.80 0.18 250)",
      ring: "oklch(0.70 0.20 250)",
    },
  },
  {
    id: "purple",
    name: "Binafsha",
    preview: "#9333ea",
    light: {
      background: "oklch(0.97 0.02 305)",
      card: "oklch(0.995 0.008 305)",
      secondary: "oklch(0.93 0.03 305)",
      border: "oklch(0.89 0.035 305)",
      primary: "oklch(0.48 0.23 300)",
      primaryFg: "oklch(0.99 0 0)",
      accent: "oklch(0.88 0.18 300)",
      ring: "oklch(0.62 0.22 300)",
    },
    dark: {
      background: "oklch(0.13 0.05 305)", // To'q binafsha orqa fon
      card: "oklch(0.18 0.06 305)",
      secondary: "oklch(0.23 0.065 305)",
      border: "oklch(0.35 0.07 305 / 45%)",
      primary: "oklch(0.82 0.22 300)",
      primaryFg: "oklch(0.13 0.05 305)",
      accent: "oklch(0.82 0.20 300)",
      ring: "oklch(0.72 0.22 300)",
    },
  },
  {
    id: "orange",
    name: "Olovrang",
    preview: "#ea580c",
    light: {
      background: "oklch(0.97 0.02 55)",
      card: "oklch(0.995 0.008 55)",
      secondary: "oklch(0.93 0.03 55)",
      border: "oklch(0.89 0.035 55)",
      primary: "oklch(0.55 0.21 45)",
      primaryFg: "oklch(0.99 0 0)",
      accent: "oklch(0.90 0.18 55)",
      ring: "oklch(0.65 0.20 45)",
    },
    dark: {
      background: "oklch(0.14 0.045 48)", // To'q olovrang / shokolad fon
      card: "oklch(0.19 0.055 48)",
      secondary: "oklch(0.24 0.06 48)",
      border: "oklch(0.35 0.065 48 / 45%)",
      primary: "oklch(0.82 0.20 50)",
      primaryFg: "oklch(0.14 0.045 48)",
      accent: "oklch(0.82 0.19 50)",
      ring: "oklch(0.72 0.19 50)",
    },
  },
  {
    id: "gold",
    name: "Oltin / Qora",
    preview: "#ca8a04",
    light: {
      background: "oklch(0.975 0.015 88)",
      card: "oklch(1 0 0)",
      secondary: "oklch(0.93 0.025 88)",
      border: "oklch(0.88 0.03 88)",
      primary: "oklch(0.55 0.18 85)",
      primaryFg: "oklch(0.99 0 0)",
      accent: "oklch(0.88 0.18 85)",
      ring: "oklch(0.68 0.18 85)",
    },
    dark: {
      background: "oklch(0.11 0.012 90)", // Chuqur qora / grafit orqa fon
      card: "oklch(0.16 0.022 90)",
      secondary: "oklch(0.21 0.028 90)",
      border: "oklch(0.32 0.04 90 / 45%)",
      primary: "oklch(0.85 0.19 88)",
      primaryFg: "oklch(0.12 0.02 90)",
      accent: "oklch(0.85 0.19 88)",
      ring: "oklch(0.75 0.19 88)",
    },
  },
];

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);
  const [activePaletteId, setActivePaletteId] = useState<string>("dark-green");
  const panelRef = useRef<HTMLDivElement>(null);

  const applyColors = (isDark: boolean, paletteId: string) => {
    const palette = THEME_PALETTES.find((p) => p.id === paletteId) || THEME_PALETTES[0];
    const colors = isDark ? palette.dark : palette.light;
    const root = document.documentElement;

    // Orqa fon va kartalar (Background & Cards)
    root.style.setProperty("--background", colors.background);
    root.style.setProperty("--color-background", colors.background);
    root.style.setProperty("--card", colors.card);
    root.style.setProperty("--color-card", colors.card);
    root.style.setProperty("--popover", colors.card);
    root.style.setProperty("--color-popover", colors.card);

    // Ikkilamchi va chegara ranglari (Secondary & Border)
    root.style.setProperty("--secondary", colors.secondary);
    root.style.setProperty("--color-secondary", colors.secondary);
    root.style.setProperty("--border", colors.border);
    root.style.setProperty("--color-border", colors.border);

    // Asosiy va aksent ranglar (Primary & Accent)
    root.style.setProperty("--primary", colors.primary);
    root.style.setProperty("--color-primary", colors.primary);
    root.style.setProperty("--primary-foreground", colors.primaryFg);
    root.style.setProperty("--color-primary-foreground", colors.primaryFg);
    root.style.setProperty("--accent", colors.accent);
    root.style.setProperty("--color-accent", colors.accent);
    root.style.setProperty("--ring", colors.ring);
    root.style.setProperty("--color-ring", colors.ring);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("ph_theme");
    const isDark = savedTheme === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);

    const savedPalette = localStorage.getItem("ph_theme_palette") || "dark-green";
    setActivePaletteId(savedPalette);
    applyColors(isDark, savedPalette);
  }, []);

  // Close panel on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const toggleTheme = () => {
    const nextDark = !dark;
    setDark(nextDark);
    localStorage.setItem("ph_theme", nextDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", nextDark);
    applyColors(nextDark, activePaletteId);
  };

  const selectPalette = (paletteId: string) => {
    setActivePaletteId(paletteId);
    localStorage.setItem("ph_theme_palette", paletteId);
    applyColors(dark, paletteId);
  };

  const currentPalette = THEME_PALETTES.find((p) => p.id === activePaletteId) || THEME_PALETTES[0];

  return (
    <div className="relative inline-block text-left" ref={panelRef}>
      {/* Slide Switch & Palette Trigger */}
      <div className="flex items-center gap-1.5 rounded-full border border-border/80 bg-card/90 p-1 shadow-sm backdrop-blur-md">
        {/* Slide Switch Control (surish orqali rejim) */}
        <button
          type="button"
          onClick={toggleTheme}
          role="switch"
          aria-checked={dark}
          title={dark ? "Kunduzgi rejimga o'tish (surish)" : "Tungi rejimga o'tish (surish)"}
          className={`relative flex h-7 w-13 cursor-pointer items-center rounded-full p-0.5 transition-all duration-300 ${
            dark
              ? "bg-slate-800 ring-1 ring-white/10"
              : "bg-amber-100 ring-1 ring-amber-300/50"
          }`}
        >
          <div className="absolute inset-0 flex items-center justify-between px-1.5 text-[11px] pointer-events-none">
            <Sun className={`h-3 w-3 text-amber-500 transition-opacity ${dark ? "opacity-30" : "opacity-100"}`} />
            <Moon className={`h-3 w-3 text-indigo-400 transition-opacity ${dark ? "opacity-100" : "opacity-30"}`} />
          </div>

          <div
            className={`z-10 flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300 ${
              dark ? "translate-x-6 bg-slate-900 text-indigo-300" : "translate-x-0 bg-white text-amber-500"
            }`}
          >
            {dark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
          </div>
        </button>

        {/* Expand Palette Button */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label="Ranglar va orqa fon paneli"
          title="Ranglar va orqa fonni tanlash"
          className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${
            open
              ? "bg-primary text-primary-foreground rotate-180"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          <ChevronDown className="h-4 w-4 transition-transform duration-200" />
        </button>
      </div>

      {/* Sliding Dropdown with Colors and Background preview */}
      <div
        className={`absolute right-0 top-full z-50 mt-2 w-72 origin-top-right transition-all duration-200 ${
          open
            ? "scale-100 opacity-100 pointer-events-auto"
            : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        <div className="rounded-3xl border border-border bg-card p-4 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-secondary text-xs">
                {dark ? "🌙" : "☀️"}
              </span>
              <div>
                <p className="text-xs font-bold text-foreground">
                  {dark ? "Tungi rejim" : "Kunduzgi rejim"}
                </p>
                <p className="text-[10px] text-muted-foreground">Orqa fon rangi o'zgaradi</p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-xl bg-secondary px-2.5 py-1 text-[11px] font-bold text-foreground hover:bg-secondary/80 transition-colors"
            >
              {dark ? "Kunduzgi" : "Tungi"}
            </button>
          </div>

          {/* Color & Background Selection */}
          <div className="pt-3">
            <div className="mb-2.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <Palette className="h-3.5 w-3.5 text-primary" />
                <span>Orqa fon & Mavzu</span>
              </div>
              <span className="text-[10px] text-primary font-semibold">
                {currentPalette.name}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {THEME_PALETTES.map((preset) => {
                const isSelected = activePaletteId === preset.id;
                const colors = dark ? preset.dark : preset.light;

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => selectPalette(preset.id)}
                    className={`group flex items-center gap-2 rounded-2xl p-2 text-left transition-all ${
                      isSelected
                        ? "bg-secondary ring-2 ring-primary shadow-sm"
                        : "hover:bg-secondary/60 border border-border/40"
                    }`}
                  >
                    {/* Background & Accent swatch */}
                    <div
                      className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-xs ring-1 ring-border transition-transform group-hover:scale-105"
                      style={{ backgroundColor: colors.background }}
                    >
                      <div
                        className="h-4 w-4 rounded-full shadow-xs"
                        style={{ backgroundColor: preset.preview }}
                      />
                      {isSelected && (
                        <Check className="absolute h-3.5 w-3.5 text-white drop-shadow stroke-[3]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-foreground truncate">
                        {preset.name}
                      </p>
                      <p className="text-[9px] text-muted-foreground">
                        {dark ? "To'q fon" : "Och fon"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
