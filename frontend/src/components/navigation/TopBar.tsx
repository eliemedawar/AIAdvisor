import { useState, useRef, useEffect, type RefObject } from "react";
import { Link } from "react-router-dom";
import { Menu, LogOut, GraduationCap, Bell, BellOff, AlertTriangle, Clock, Calendar } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useDeadlineReminders, type DeadlineItem, type DeadlineUrgency } from "../../hooks/useDeadlineReminders";
import { Button } from "../core/Button";
import { Avatar } from "../core/Avatar";
import { Modal } from "../core/Modal";

interface TopBarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  menuButtonRef?: RefObject<HTMLButtonElement>;
}

const urgencyConfig: Record<DeadlineUrgency, { label: string; color: string; dot: string }> = {
  overdue:  { label: "Overdue",    color: "text-red-400",    dot: "bg-red-500" },
  today:    { label: "Due today",  color: "text-orange-400", dot: "bg-orange-400" },
  soon:     { label: "Due soon",   color: "text-yellow-400", dot: "bg-yellow-400" },
  upcoming: { label: "Upcoming",   color: "text-blue-400",   dot: "bg-blue-400" },
};

function DeadlineRow({ item }: { item: DeadlineItem }) {
  const cfg = urgencyConfig[item.urgency];
  return (
    <div className="flex items-start gap-3 px-4 py-3 hover:bg-slate-800/40 transition-colors">
      <span className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${cfg.dot}`} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-100">{item.title}</p>
        <p className="text-xs text-slate-400">
          {item.courseCode} · {item.dueAt.toLocaleDateString(undefined, {
            weekday: "short", month: "short", day: "numeric",
          })}{" "}
          at{" "}
          {item.dueAt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      <span className={`flex-shrink-0 text-[10px] font-semibold uppercase tracking-wide ${cfg.color}`}>
        {cfg.label}
      </span>
    </div>
  );
}

/**
 * TopBar - Header navigation with user actions and deadline bell
 */
export const TopBar = ({ onToggleSidebar, isSidebarOpen, menuButtonRef }: TopBarProps) => {
  const { user, logout } = useAuth();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const {
    deadlines,
    unreadCount,
    markAllRead,
    notificationPermission,
    requestPermission,
  } = useDeadlineReminders();

  // Close bell dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    };
    if (bellOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [bellOpen]);

  const handleOpenBell = () => {
    setBellOpen((v) => !v);
    if (!bellOpen) markAllRead();
  };

  const handleOpenLogoutConfirm = () => setIsLogoutConfirmOpen(true);
  const handleCloseLogoutConfirm = () => setIsLogoutConfirmOpen(false);
  const handleConfirmLogout = async () => {
    try {
      await logout();
    } finally {
      setIsLogoutConfirmOpen(false);
    }
  };

  const userInitials =
    user?.first_name?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U";

  const overdueCount = deadlines.filter((d) => d.urgency === "overdue").length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800/50 bg-surface-base px-4 shadow-elevation-mid backdrop-blur-xl lg:px-8">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            ref={menuButtonRef}
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

        {/* Deadline Bell */}
        <div ref={bellRef} className="relative">
          <button
            type="button"
            onClick={handleOpenBell}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/60 bg-surface-base shadow-elevation-low text-slate-300 transition-all duration-quick ease-snappy hover:bg-surface-elevated hover:border-slate-600/80 hover:text-slate-100 focus-visible:outline-none"
            aria-label="Deadline reminders"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {bellOpen && (
            <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/95 shadow-[0_20px_60px_rgba(2,6,23,0.9)] backdrop-blur-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800/60 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-100">Upcoming Deadlines</span>
                  {deadlines.length > 0 && (
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                      {deadlines.length}
                    </span>
                  )}
                </div>

                {/* Notification permission toggle */}
                {notificationPermission !== "unsupported" && (
                  notificationPermission === "denied" ? (
                    <span
                      title="Notifications are blocked in your browser settings. To enable, update your browser's site permissions."
                      className="flex cursor-default items-center gap-1 rounded-lg border border-slate-700/40 bg-slate-800/40 px-2 py-1 text-[10px] font-medium text-slate-500"
                    >
                      <BellOff className="h-3 w-3" /> Blocked
                    </span>
                  ) : (
                    <button
                      onClick={requestPermission}
                      title={
                        notificationPermission === "granted"
                          ? "Browser notifications enabled"
                          : "Enable browser notifications"
                      }
                      className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium transition-colors ${
                        notificationPermission === "granted"
                          ? "text-emerald-400 bg-emerald-900/20 border border-emerald-800/40"
                          : "text-slate-400 bg-slate-800/40 border border-slate-700/40 hover:text-slate-200"
                      }`}
                    >
                      {notificationPermission === "granted" ? (
                        <><Bell className="h-3 w-3" /> On</>
                      ) : (
                        <><BellOff className="h-3 w-3" /> Enable alerts</>
                      )}
                    </button>
                  )
                )}
              </div>

              {/* Deadline list */}
              <div className="max-h-80 overflow-y-auto">
                {deadlines.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                    <Calendar className="h-8 w-8 text-slate-600" />
                    <p className="text-sm font-medium text-slate-400">All caught up!</p>
                    <p className="text-xs text-slate-500">No deadlines in the next 7 days.</p>
                  </div>
                ) : (
                  <>
                    {overdueCount > 0 && (
                      <div className="flex items-center gap-2 bg-red-950/30 px-4 py-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                        <p className="text-xs font-medium text-red-400">
                          {overdueCount} overdue assignment{overdueCount > 1 ? "s" : ""}
                        </p>
                      </div>
                    )}
                    <div className="divide-y divide-slate-800/50">
                      {deadlines.map((item) => (
                        <DeadlineRow key={item.id} item={item} />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              {deadlines.length > 0 && (
                <div className="border-t border-slate-800/60 px-4 py-2.5 flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock className="h-3 w-3" />
                  <span>Updates every 5 minutes</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile Button */}
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
          onClick={handleOpenLogoutConfirm}
          icon={<LogOut className="h-4 w-4" />}
          className="hidden sm:inline-flex"
        >
          Sign out
        </Button>

        {/* Mobile logout - icon only */}
        <button
          type="button"
          onClick={handleOpenLogoutConfirm}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all duration-quick ease-snappy hover:bg-surface-elevated hover:text-slate-200 focus-visible:outline-none sm:hidden"
          aria-label="Sign out"
        >
          <LogOut className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <Modal
        isOpen={isLogoutConfirmOpen}
        onClose={handleCloseLogoutConfirm}
        title="Sign out?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={handleCloseLogoutConfirm}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmLogout}>
              Sign out
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-300">
          You&apos;ll need to log back in to access your dashboard. Continue?
        </p>
      </Modal>
    </header>
  );
};
