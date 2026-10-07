import { useEffect, type ReactNode } from "react";
import { dropStaleProductStorage, useProductStore } from "@/lib/product/store";

export function GraftSession({ children }: { children: ReactNode }) {
  const ensureSeeds = useProductStore((s) => s.ensureSeeds);
  const markHydrated = useProductStore((s) => s.markHydrated);
  const resetSession = useProductStore((s) => s.resetSession);

  useEffect(() => {
    dropStaleProductStorage();
    ensureSeeds();
    markHydrated();

    return () => {
      resetSession();
    };
  }, [ensureSeeds, markHydrated, resetSession]);

  return <>{children}</>;
}
