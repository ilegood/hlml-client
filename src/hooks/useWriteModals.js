import { useCallback, useState } from "react";

export default function useWriteModals() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const closeAll = useCallback(() => {
    setIsSearchOpen(false);
    setIsDatePickerOpen(false);
    setIsTimePickerOpen(false);
  }, []);
  return {
    isSearchOpen,
    setIsSearchOpen,
    isDatePickerOpen,
    setIsDatePickerOpen,
    isTimePickerOpen,
    setIsTimePickerOpen,
    closeAll,
  };
}
