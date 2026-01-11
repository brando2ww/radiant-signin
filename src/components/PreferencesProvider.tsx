import { useThemeSync } from "@/hooks/use-theme-sync";
import { useDensitySync } from "@/hooks/use-density-sync";

interface PreferencesProviderProps {
  children: React.ReactNode;
}

export function PreferencesProvider({ children }: PreferencesProviderProps) {
  useThemeSync();
  useDensitySync();
  return <>{children}</>;
}
