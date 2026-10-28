"use client";

import { App, ConfigProvider } from "antd";
import { useEffect, useSyncExternalStore } from "react";

export type ThemeName = "pink" | "blue";

export const THEME_COLORS: Record<ThemeName, string> = {
  pink: "#eb2f96",
  blue: "#1677ff",
};

const STORAGE_KEY = "trackme-theme";
const listeners = new Set<() => void>();
let current: ThemeName | null = null;

function readTheme(): ThemeName {
  if (current) return current;
  try {
    if (localStorage.getItem(STORAGE_KEY) === "blue") return "blue";
  } catch {
    // storage unavailable, fall back to the default
  }
  return "pink";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setTheme(theme: ThemeName) {
  current = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // theme still applies for this visit
  }
  listeners.forEach((listener) => listener());
}

export function useThemeName() {
  return useSyncExternalStore(subscribe, readTheme, () => "pink" as ThemeName);
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const theme = useThemeName();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: THEME_COLORS[theme],
          borderRadius: 12,
          fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif",
        },
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
}
