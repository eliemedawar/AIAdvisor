import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import clsx from "clsx";
import {
  LayoutDashboard,
  MessageCircle,
  CalendarDays,
  User,
  GraduationCap,
  ChevronsLeft,
  ChevronsRight,
  ListTodo,
} from "lucide-react";
import { SidebarNavItem } from "../core/SidebarNavItem";
import { useBreakpoint } from "../../hooks/useBreakpoint";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { to: "/chat", label: "AI Advisor", icon: <MessageCircle className="h-5 w-5" /> },
  { to: "/calendar", label: "Calendar", icon: <CalendarDays className="h-5 w-5" /> },
  { to: "/planner", label: "Planner", icon: <ListTodo className="h-5 w-5" /> },
  { to: "/profile", label: "Profile", icon: <User className="h-5 w-5" /> }
];

const SIDEBAR_WIDTHS = {
  expandedLg: "16rem",
  expandedXl: "18rem",
  collapsed: "5rem"
};

interface SidebarProps {
  variant?: "desktop" | "mobile";
  onItemClick?: () => void;
}

/**
 * Sidebar - Main navigation component with collapse/expand
 * Uses 8pt spacing, interaction tokens, and motion safeguards
 */
export const Sidebar = ({ variant = "desktop", onItemClick }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isLgUp, isXlUp } = useBreakpoint();
  const autoCollapsedRef = useRef(false);
  const shouldForceCollapse = variant === "desktop" && isLgUp && !isXlUp;
  
  // Check for reduced motion
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  const baseClasses =
    "flex flex-col border-r border-slate-800/50 bg-surface-base shadow-elevation-mid backdrop-blur-xl";

  const handleNavClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (variant !== "mobile" || !onItemClick) return;

    const target = event.target as HTMLElement | null;
    if (!target) return;

    if (target.closest("[data-sidebar-nav-link='true']")) {
      onItemClick();
    }
  };

  useEffect(() => {
    if (variant !== "desktop") return;

    if (shouldForceCollapse) {
      autoCollapsedRef.current = true;
      if (!isCollapsed) {
        setIsCollapsed(true);
      }
      return;
    }

    if (autoCollapsedRef.current) {
      autoCollapsedRef.current = false;
      setIsCollapsed(false);
    }
  }, [shouldForceCollapse, variant, isCollapsed]);

  useEffect(() => {
    if (variant !== "desktop" || typeof document === "undefined") return;
    const root = document.documentElement;
    const widthValue = isCollapsed
      ? SIDEBAR_WIDTHS.collapsed
      : isXlUp
        ? SIDEBAR_WIDTHS.expandedXl
        : SIDEBAR_WIDTHS.expandedLg;
    root.style.setProperty("--sidebar-desktop-width", widthValue);
  }, [variant, isCollapsed, isXlUp]);

  const variantClasses =
    variant === "desktop"
      ? clsx(
          "hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:top-0 lg:z-50 lg:h-screen lg:overflow-y-auto transition-all duration-slow ease-smooth",
          isCollapsed ? "lg:w-20" : "lg:w-64 xl:w-72"
        )
      : "flex w-64 h-full overflow-y-auto shadow-elevation-high";

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      id={variant === "mobile" ? "mobile-sidebar" : "desktop-sidebar"}
      className={clsx(baseClasses, variantClasses)}
      aria-label="Main navigation"
      role="navigation"
      tabIndex={variant === "mobile" ? -1 : undefined}
      data-collapsed={isCollapsed ? "true" : "false"}
    >
      {/* Logo/Brand - 8pt spacing (h-16, gap-3, px-6) */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-800/50 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-elevation-mid flex-shrink-0" aria-hidden="true">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        {!isCollapsed && variant === "desktop" && (
          <div className={clsx(
            "flex flex-col overflow-hidden",
            prefersReducedMotion ? "" : "transition-opacity duration-quick"
          )}>
            <span className="text-sm font-semibold tracking-tight text-slate-50 whitespace-nowrap">
              AI Advisor
            </span>
            <span className="text-[10px] text-slate-400 whitespace-nowrap">Academic Assistant</span>
          </div>
        )}
        {variant === "mobile" && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-slate-50">
              AI Advisor
            </span>
            <span className="text-[10px] text-slate-400">Academic Assistant</span>
          </div>
        )}
      </div>

      {/* Navigation - 8pt spacing (space-y-1, px-3, py-6) */}
      <nav
        className="flex-1 space-y-1 px-3 py-6 overflow-x-hidden overflow-y-auto pr-2"
        onClickCapture={handleNavClickCapture}
      >
        {navItems.map((item) => (
          <div key={item.to} className="relative group">
            <SidebarNavItem
              to={item.to}
              label={isCollapsed && variant === "desktop" ? "" : item.label}
              icon={item.icon}
              onClick={onItemClick}
            />
            {/* Tooltip on hover when collapsed */}
            {isCollapsed && variant === "desktop" && (
              <div 
                className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 rounded-lg bg-surface-elevated text-slate-100 text-sm whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-quick z-50 shadow-elevation-high border border-slate-700/60"
                role="tooltip"
                aria-hidden="true"
              >
                {item.label}
              </div>
            )}
          </div>
        ))}
      </nav>
      
      {/* Collapse toggle button - only on desktop */}
      {variant === "desktop" && (
        <div className="border-t border-slate-800/50 px-3 py-3">
          <button
            onClick={toggleCollapse}
            className="w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition-all duration-quick ease-snappy hover:bg-surface-elevated hover:text-slate-100 focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_#a855f7,0_0_0_7px_rgba(168,85,247,0.25)]"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? (
              <ChevronsRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronsLeft className="h-5 w-5" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Footer - 8pt spacing (px-6, py-4) */}
      {!isCollapsed && variant === "desktop" && (
        <div className={clsx(
          "border-t border-slate-800/50 px-6 py-4",
          prefersReducedMotion ? "" : "transition-opacity duration-quick"
        )}>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="h-2 w-2 rounded-full bg-success-500 animate-pulse" />
            <span>System Active</span>
          </div>
          <p className="mt-2 text-[10px] text-slate-600">
            © {new Date().getFullYear()} AI Academic Advisor
          </p>
        </div>
      )}
      {variant === "mobile" && (
        <div className="border-t border-slate-800/50 px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="h-2 w-2 rounded-full bg-success-500 animate-pulse" />
            <span>System Active</span>
          </div>
          <p className="mt-2 text-[10px] text-slate-600">
            © {new Date().getFullYear()} AI Academic Advisor
          </p>
        </div>
      )}
    </aside>
  );
};


