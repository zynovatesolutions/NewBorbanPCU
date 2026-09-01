import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 1023px)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => {
      const mobile = mq.matches;
      setIsMobile(mobile);
      if (!mobile) setIsMobileOpen(false);
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const toggleMobile = useCallback(() => {
    setIsMobileOpen((v) => !v);
  }, []);

  const closeMobile = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((v) => !v);
  }, []);

  const value = useMemo(
    () => ({
      isMobileOpen,
      setIsMobileOpen,
      isCollapsed,
      setIsCollapsed,
      isMobile,
      toggleMobile,
      closeMobile,
      toggleCollapsed,
    }),
    [
      isMobileOpen,
      isCollapsed,
      isMobile,
      toggleMobile,
      closeMobile,
      toggleCollapsed,
    ]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}
