import { useEffect } from "react";

const SUFIJO = " · Distrito Loft";

export function usePageTitle(title: string) {
  useEffect(() => {
    const original = document.title;
    document.title = title + SUFIJO;
    return () => {
      document.title = original;
    };
  }, [title]);
}
