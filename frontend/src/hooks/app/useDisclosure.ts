import { useState } from "react";

/** Open state for a section that expands and collapses in place. */
export function useDisclosure() {
  const [open, setOpen] = useState(false);

  return {
    open,
    toggle: () => setOpen((current) => !current),
  };
}
