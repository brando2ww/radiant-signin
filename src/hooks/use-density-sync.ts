import { useEffect } from "react";
import { useSettings } from "./use-settings";

export function useDensitySync() {
  const { settings, loading } = useSettings();

  useEffect(() => {
    if (!loading && settings?.general?.density) {
      const density = settings.general.density;
      document.documentElement.classList.remove(
        'density-compact',
        'density-normal',
        'density-comfortable'
      );
      document.documentElement.classList.add(`density-${density}`);
    }
  }, [settings?.general?.density, loading]);
}
