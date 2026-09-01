import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, useSidebar } from "./context/SidebarContext";
import AdminSideMenu from "./components/SIdeMenu/AdminSideMenu";
import { HiMenuAlt2 } from "react-icons/hi";

function MobileTopBar() {
  const { toggleMobile } = useSidebar();
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden">
      <button
        type="button"
        onClick={toggleMobile}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100"
        aria-label="Open menu"
      >
        <HiMenuAlt2 className="text-2xl" />
      </button>
      <div>
        <div className="text-sm font-bold text-slate-900">Golden Plus PCU</div>
        <div className="text-xs text-slate-500">Business Management</div>
      </div>
    </header>
  );
}

function LayoutContent() {
  const { isCollapsed } = useSidebar();
  const { pathname } = useLocation();
  const isPosShell = /\/counter-sale\/?$/.test(pathname);

  return (
    <div className="flex h-dvh max-h-dvh w-full overflow-hidden bg-surface-muted">
      <AdminSideMenu />
      <div
        className={[
          "flex min-h-0 min-w-0 flex-1 flex-col transition-[margin] duration-300",
          isCollapsed ? "lg:ml-[76px]" : "lg:ml-[280px]",
        ].join(" ")}
      >
        <MobileTopBar />
        <main
          className={
            isPosShell
              ? "page-shell-pos"
              : "page-shell min-h-0 flex-1 overflow-x-hidden overflow-y-auto"
          }
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const Layout = () => (
  <SidebarProvider>
    <LayoutContent />
  </SidebarProvider>
);

export default Layout;
