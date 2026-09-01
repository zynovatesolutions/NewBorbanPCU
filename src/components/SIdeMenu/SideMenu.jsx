import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaPowerOff, FaCaretDown, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ChangePasswordModal from "../Modals/ChangePasswordModal";
import { useSidebar } from "../../context/SidebarContext";

const SideMenuItem = ({
  item,
  index,
  currentPathname,
  openItem,
  toggleSubItems,
  handleNavigation,
  isCollapsed,
  isMobile,
  closeMobile,
}) => {
  const [OpenModal, setOpenModal] = useState(false);
  const isSubItemActive = useMemo(() => {
    if (!item.subItems?.length) return false;
    return item.subItems.some((s) => s.link === currentPathname);
  }, [currentPathname, item.subItems]);

  const isActive = currentPathname === item.link || isSubItemActive;
  const isExpanded = item.subItems && openItem === index;

  const runAction = () => {
    if (item.subItems) {
      toggleSubItems(index);
      return;
    }
    if (item.title === "Logout") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("branch");
      window.location.reload();
      return;
    }
    if (item.title === "Change Password") {
      setOpenModal(true);
      return;
    }
    if (item.link) {
      handleNavigation(item.link);
      if (isMobile) closeMobile();
    }
  };

  return (
    <div className="relative">
      <motion.button
        type="button"
        whileHover={{ x: isCollapsed ? 0 : 2 }}
        whileTap={{ scale: 0.985 }}
        title={isCollapsed ? item.title : undefined}
        className={[
          "relative w-full flex items-center gap-3 rounded-xl px-3 py-2.5",
          "text-sm font-semibold transition-colors",
          isActive
            ? "bg-white text-slate-900 shadow-sm"
            : "text-white/85 hover:bg-white/10 hover:text-white",
          isCollapsed ? "justify-center px-2" : "",
        ].join(" ")}
        onClick={runAction}
      >
        <span className={["shrink-0 text-lg", isActive ? "text-accent" : "text-white/80"].join(" ")}>
          {item.icon}
        </span>
        {!isCollapsed && (
          <>
            <span className="flex-1 text-left truncate">{item.title}</span>
            {item.subItems && (
              <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.18 }}>
                <FaCaretDown />
              </motion.span>
            )}
          </>
        )}
      </motion.button>

      {!isCollapsed && (
        <AnimatePresence initial={false}>
          {item.subItems && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="mt-1 ml-4 space-y-1 border-l border-white/10 pl-3">
                {item.subItems.map((subItem) => {
                  const isSubActive = currentPathname === subItem.link;
                  return (
                    <button
                      key={subItem.link ?? subItem.title}
                      type="button"
                      className={[
                        "w-full text-left px-2 py-1.5 rounded-lg text-sm font-medium",
                        isSubActive
                          ? "text-white bg-white/10"
                          : "text-white/70 hover:text-white hover:bg-white/5",
                      ].join(" ")}
                      onClick={() => {
                        if (subItem.link) {
                          handleNavigation(subItem.link);
                          if (isMobile) closeMobile();
                        }
                      }}
                    >
                      {subItem.title}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {OpenModal && (
        <ChangePasswordModal open={OpenModal} setOpen={setOpenModal} />
      )}
    </div>
  );
};

const sideMenuItemsBottom = [{ title: "Logout", icon: <FaPowerOff />, link: "/logout" }];

const SideMenu = ({ sideMenuItems }) => {
  const [openItem, setOpenItem] = useState(null);
  const [currentPathname, setCurrentPathname] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const {
    isMobileOpen,
    closeMobile,
    isCollapsed,
    toggleCollapsed,
    isMobile,
  } = useSidebar();

  useEffect(() => {
    setCurrentPathname(location.pathname);
  }, [location.pathname]);

  // Close drawer on route change (mobile)
  useEffect(() => {
    closeMobile();
  }, [location.pathname, closeMobile]);

  const toggleSubItems = (index) => {
    setOpenItem(openItem === index ? null : index);
  };

  const handleNavigation = (link) => navigate(link);

  const collapsedDesktop = isCollapsed && !isMobile;

  return (
    <>
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-[1px] lg:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-950 text-white shadow-panel",
          "border-r border-white/10 transition-[transform,width] duration-300 ease-out",
          collapsedDesktop ? "w-[76px]" : "w-[280px]",
          // Mobile: off-canvas unless open. Desktop (lg+): always visible.
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <div
          className={[
            "flex items-center border-b border-white/10 px-4 py-4",
            collapsedDesktop ? "justify-center" : "justify-between",
          ].join(" ")}
        >
          {!collapsedDesktop ? (
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                <img
                  src={
                    "/GoldenPCU.svg"
                  }
                  alt="Logo"
                  className="h-9 w-9 object-contain"
                />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold">Golden Plus</div>
                <div className="truncate text-xs text-white/60">PCU Management</div>
              </div>
            </div>
          ) : (
            <img
              src="/GoldenPCU.svg"
              alt="Logo"
              className="h-8 w-8 object-contain"
            />
          )}

          <button
            type="button"
            onClick={toggleCollapsed}
            className="hidden h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 lg:inline-flex"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>

          <button
            type="button"
            onClick={closeMobile}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 lg:hidden"
            aria-label="Close menu"
          >
            <FaChevronLeft />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {sideMenuItems.map((item, index) => (
              <SideMenuItem
                key={item.link ?? item.title ?? index}
                item={item}
                index={index}
                currentPathname={currentPathname}
                openItem={openItem}
                toggleSubItems={toggleSubItems}
                handleNavigation={handleNavigation}
                isCollapsed={collapsedDesktop}
                isMobile={isMobile}
                closeMobile={closeMobile}
              />
            ))}

            <div className="my-3 h-px bg-white/10" />

            {sideMenuItemsBottom.map((item, index) => (
              <SideMenuItem
                key={item.link ?? item.title ?? `bottom-${index}`}
                item={item}
                index={1000 + index}
                currentPathname={currentPathname}
                openItem={openItem}
                toggleSubItems={toggleSubItems}
                handleNavigation={handleNavigation}
                isCollapsed={collapsedDesktop}
                isMobile={isMobile}
                closeMobile={closeMobile}
              />
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};

export default SideMenu;
