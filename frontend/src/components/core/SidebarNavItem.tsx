import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";

interface SidebarNavItemProps {
  to: string;
  label: string;
  icon: ReactNode;
  onClick?: () => void;
}

/**
 * SidebarNavItem - Navigation link for sidebar
 * 
 * Uses 8pt spacing and design system styling with active state
 * 
 * Usage:
 * ```tsx
 * <SidebarNavItem 
 *   to="/dashboard"
 *   label="Dashboard"
 *   icon={<LayoutDashboard className="h-5 w-5" />}
 * />
 * ```
 */
export const SidebarNavItem = ({ to, label, icon, onClick }: SidebarNavItemProps) => {
  const isCollapsed = !label;
  
  return (
    <NavLink
      data-sidebar-nav-link="true"
      to={to}
      onClick={onClick}
      title={isCollapsed ? label : undefined}
      className={({ isActive }) =>
        clsx(
          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
          "transition-all duration-150 ease-out",
          "hover:bg-slate-800/60",
          !isCollapsed && "hover:translate-x-0.5",
          isCollapsed && "justify-center",
          "active:scale-[0.98]",
          "focus-visible:outline-none",
          "focus-visible:shadow-[0_0_0_2px_#a855f7,0_0_0_7px_rgba(168,85,247,0.25)]",
          isActive
            ? "bg-gradient-to-r from-primary-500/20 to-primary-500/10 text-primary-100 border border-primary-500/30 shadow-glow"
            : "text-slate-300 border border-transparent hover:border-slate-700/40"
        )
      }
    >
      <span className="transition-colors duration-150 group-hover:text-primary-300 flex-shrink-0">
        {icon}
      </span>
      {label && <span className="whitespace-nowrap overflow-hidden">{label}</span>}
    </NavLink>
  );
};

