/// <reference types="astro/client" />

import "../.astro/types.d.ts";

declare global {
  interface Window {
    theme?: {
      themeValue: string;
      setPreference: () => void;
      reflectPreference: () => void;
      getTheme: () => string;
      setTheme: (val: string) => void;
    };
  }
}

export {};
