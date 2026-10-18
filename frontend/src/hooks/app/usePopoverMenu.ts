import { useEffect, useRef, useState } from "react";

/** Open state for a popover menu that closes on any click outside it. */
export function usePopoverMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [open]);

  return {
    open,
    menuRef,
    toggle: () => setOpen((current) => !current),
    close: () => setOpen(false),
  };
}
