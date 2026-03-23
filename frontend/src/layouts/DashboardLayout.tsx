import { useState, useEffect, useRef, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "../components/navigation/Sidebar";
import { TopBar } from "../components/navigation/TopBar";
import { useBreakpoint } from "../hooks/useBreakpoint";
import clsx from "clsx";

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 }
};

const pageTransition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2
};

/**
 * DashboardLayout - Main authenticated layout
 * Manages page transitions and responsive navigation
 */
export const DashboardLayout = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const viewport = useBreakpoint();
  const mobileSidebarRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isChatRoute = location.pathname.startsWith("/chat");

  const clearCloseTimeout = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const closeMobileNavAfter = useCallback(
    (delay = 0) => {
      if (!mobileNavOpen) return;

      clearCloseTimeout();

      if (delay <= 0) {
        setMobileNavOpen(false);
        return;
      }

      closeTimeoutRef.current = setTimeout(() => {
        setMobileNavOpen(false);
        closeTimeoutRef.current = null;
      }, delay);
    },
    [mobileNavOpen, clearCloseTimeout]
  );

  const openMobileNav = useCallback(() => {
    clearCloseTimeout();
    setMobileNavOpen(true);
  }, [clearCloseTimeout]);

  const handleToggleSidebar = useCallback(() => {
    if (mobileNavOpen) {
      closeMobileNavAfter();
    } else {
      openMobileNav();
    }
  }, [mobileNavOpen, closeMobileNavAfter, openMobileNav]);

  useEffect(() => {
    return () => {
      clearCloseTimeout();
    };
  }, [clearCloseTimeout]);

  // Close mobile nav on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileNavOpen) {
        setMobileNavOpen(false);
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileNavOpen]);

  // Prevent body scroll when mobile nav is open
  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  // Close mobile nav when viewport expands to desktop
  useEffect(() => {
    if (viewport.isLgUp && mobileNavOpen) {
      clearCloseTimeout();
      setMobileNavOpen(false);
    }
  }, [viewport.isLgUp, mobileNavOpen, clearCloseTimeout]);

  const previousPathRef = useRef(location.pathname);

  // Close mobile nav after route changes (covers cases where onItemClick isn't triggered)
  useEffect(() => {
    if (location.pathname === previousPathRef.current) {
      return;
    }

    previousPathRef.current = location.pathname;

    if (!viewport.isLgUp) {
      closeMobileNavAfter(160);
    }
  }, [location.pathname, viewport.isLgUp, closeMobileNavAfter]);

  // Close the mobile nav when clicking outside of the drawer
  useEffect(() => {
    if (!mobileNavOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      if (mobileSidebarRef.current?.contains(target)) {
        return;
      }

      if (menuButtonRef.current?.contains(target)) {
        return;
      }

      closeMobileNavAfter(100);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [mobileNavOpen, closeMobileNavAfter]);

  // Focus the drawer container when it opens for keyboard users
  useEffect(() => {
    if (mobileNavOpen && mobileSidebarRef.current) {
      mobileSidebarRef.current.focus();
    }
  }, [mobileNavOpen]);

  return (
    <div className="min-h-screen bg-bg text-slate-50">
      {/* Skip to content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[60] focus:m-4 focus:rounded-lg focus:bg-primary-500 focus:px-4 focus:py-2 focus:text-white focus:shadow-lg"
      >
        Skip to main content
      </a>
      <Sidebar />
      <div className="flex min-h-screen flex-col lg:ml-[var(--sidebar-desktop-width,16rem)] lg:h-screen lg:transition-[margin-left] lg:duration-300">
        <TopBar
          onToggleSidebar={handleToggleSidebar}
          isSidebarOpen={mobileNavOpen}
          menuButtonRef={menuButtonRef}
        />
        <main
          id="main-content"
          className="relative flex-1 min-h-0 overflow-hidden border-t border-slate-900/40 lg:border-t-0 lg:border-l lg:border-slate-900/50"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-bg via-slate-900 to-bg" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-900/10 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent-900/5 via-transparent to-transparent" />

          {/* Content with AnimatePresence for smooth page transitions */}
          <div
            className={clsx(
              "relative z-10 h-full min-h-0",
              isChatRoute ? "flex flex-col overflow-hidden" : "overflow-y-auto"
            )}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
                className={clsx(isChatRoute && "flex h-full min-h-0 flex-1 flex-col")}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileNavOpen && (
          <div className="fixed inset-0 z-40 flex lg:hidden" role="dialog" aria-modal="true" aria-label="Mobile navigation">
            <motion.button
              type="button"
              aria-label="Close navigation menu"
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm cursor-pointer"
              onClick={() => setMobileNavOpen(false)}
              onKeyDown={(e) => e.key === 'Escape' && setMobileNavOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.div
              ref={mobileSidebarRef}
              className="relative z-50 h-full focus:outline-none"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
              tabIndex={-1}
            >
              <Sidebar
                variant="mobile"
                onItemClick={() => closeMobileNavAfter(140)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};


