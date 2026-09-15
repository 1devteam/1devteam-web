import { useEffect, type ReactNode } from "react";
import { dropStaleProductStorage, useProductStore } from "@/lib/product/store";

export function GraftSession({ children }: { children: ReactNode }) {
  const ensureSeeds = useProductStore((s) => s.ensureSeeds);
  const markHydrated = useProductStore((s) => s.markHydrated);

  useEffect(() => {
    dropStaleProductStorage();
    ensureSeeds();
    markHydrated();
  }, [ensureSeeds, markHydrated]);

  return <>{children}</>;
}
