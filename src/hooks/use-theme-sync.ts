import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useSettings } from "./use-settings";

export function useThemeSync() {
  const { setTheme } = useTheme();
  const { settings, loading } = useSettings();

  useEffect(() => {
    if (!loading && settings?.general?.theme) {
      setTheme(settings.general.theme);
    }
  }, [settings?.general?.theme, loading, setTheme]);
}
