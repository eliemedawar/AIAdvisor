import { Link } from "react-router-dom";
import { Menu, LogOut, GraduationCap } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../core/Button";
import { Avatar } from "../core/Avatar";

interface TopBarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

/**
 * TopBar - Header navigation with user actions
 * Uses 8pt spacing and core components
 */
export const TopBar = ({ onToggleSidebar, isSidebarOpen }: TopBarProps) => {
  const { user, logout } = useAuth();

  const userInitials = user?.first_name?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800/50 bg-surface-base px-4 shadow-elevation-mid backdrop-blur-xl lg:px-8">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/60 bg-surface-base shadow-elevation-low text-slate-200 transition-all duration-quick ease-snappy hover:bg-surface-elevated hover:border-slate-600/80 hover:shadow-elevation-mid hover:scale-105 focus-visible:outline-none lg:hidden"
            aria-label={isSidebarOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-controls="mobile-sidebar"
            aria-expanded={isSidebarOpen ?? false}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-accent-500">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-semibold tracking-tight text-slate-50">
            AI Advisor
          </span>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="hidden text-sm text-slate-300 md:block">
          <span className="text-slate-500">Welcome back, </span>
          <span className="font-semibold text-slate-100">
            {user?.first_name || user?.email?.split("@")[0] || "Student"}
          </span>
        </div>

        {/* Profile Button - 8pt spacing (gap-2, px-3, py-2) */}
        <Link
          to="/profile"
          className="group hidden items-center gap-2 rounded-xl border border-slate-700/60 bg-surface-base shadow-elevation-low px-3 py-2 text-xs text-slate-200 transition-all duration-quick ease-snappy hover:bg-surface-elevated hover:border-slate-600/80 hover:shadow-elevation-mid sm:flex"
        >
          <Avatar text={userInitials} size="sm" />
          <span className="font-medium">Profile</span>
        </Link>

        {/* Logout Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          icon={<LogOut className="h-4 w-4" />}
          className="hidden sm:inline-flex"
        >
          Sign out
        </Button>

        {/* Mobile logout - icon only */}
        <button
          type="button"
          onClick={logout}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all duration-quick ease-snappy hover:bg-surface-elevated hover:text-slate-200 focus-visible:outline-none sm:hidden"
          aria-label="Sign out"
        >
          <LogOut className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
};


