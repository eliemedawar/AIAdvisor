import { useState, useRef, useEffect, type RefObject } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  LogOut,
  GraduationCap,
  Bell,
  BookOpen,
  Clock,
  CheckSquare,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Info,
  CheckCheck,
  Trash2,
  Inbox,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import {
  useNotifications,
  type AppNotification,
  type NotificationType,
} from "../../hooks/useNotifications";
import { Button } from "../core/Button";
import { Avatar } from "../core/Avatar";
import { Modal } from "../core/Modal";

interface TopBarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  menuButtonRef?: RefObject<HTMLButtonElement>;
}

// ── Notification type config ──────────────────────────────────────────────────

type TypeConfig = {
  icon: React.ComponentType<{ className?: string }>;
  bg: string;
  iconCls: string;
  label: string;
};

const TYPE_CONFIG: Record<NotificationType, TypeConfig> = {
  deadline: {
    icon: Clock,
    bg: "bg-orange-500/15",
    iconCls: "text-orange-400",
    label: "Deadline",
  },
  task: {
    icon: CheckSquare,
    bg: "bg-blue-500/15",
    iconCls: "text-blue-400",
    label: "Task",
  },
  study: {
    icon: BookOpen,
    bg: "bg-teal-500/15",
    iconCls: "text-teal-400",
    label: "Study",
  },
  academic_warning: {
    icon: TrendingUp,
    bg: "bg-emerald-500/15",
    iconCls: "text-emerald-400",
    label: "Academic",
  },
  motivation: {
    icon: Sparkles,
    bg: "bg-violet-500/15",
    iconCls: "text-violet-400",
    label: "Tip",
  },
  system_reminder: {
    icon: Info,
    bg: "bg-slate-500/15",
    iconCls: "text-slate-400",
    label: "Reminder",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatNotifTime(notif: AppNotification): string {
  const now = new Date();

  if (notif.type === "deadline") {
    const diff = notif.time.getTime() - now.getTime();
    if (diff < 0)
      return `Overdue · ${notif.time.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
    if (diff < 86_400_000)
      return `Due at ${notif.time.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
    return `Due ${notif.time.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}`;
  }

  const ago = now.getTime() - notif.time.getTime();
  if (ago < 60_000) return "Just now";
  if (ago < 3_600_000) return `${Math.floor(ago / 60_000)}m ago`;
  if (ago < 86_400_000) return `${Math.floor(ago / 3_600_000)}h ago`;
  return notif.time.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// ── Notification row ──────────────────────────────────────────────────────────

function NotificationRow({
  notif,
  onRead,
}: {
  notif: AppNotification;
  onRead: (id: string) => void;
}) {
  const cfg = TYPE_CONFIG[notif.type];
  const Icon = cfg.icon;

  // academic_warning can also be a "low GPA" alert — use AlertTriangle in that case
  const EffectiveIcon =
    notif.type === "academic_warning" && notif.id.includes("low")
      ? AlertTriangle
      : Icon;
  const effectiveBg =
    notif.type === "academic_warning" && notif.id.includes("low")
      ? "bg-yellow-500/15"
      : cfg.bg;
  const effectiveIconCls =
    notif.type === "academic_warning" && notif.id.includes("low")
      ? "text-yellow-400"
      : cfg.iconCls;

  return (
    <button
      type="button"
      onClick={() => !notif.read && onRead(notif.id)}
      className={`group w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-800/50 ${
        !notif.read ? "bg-slate-900/40" : ""
      }`}
    >
      {/* Type icon */}
      <div
        className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${effectiveBg}`}
      >
        <EffectiveIcon className={`h-4 w-4 ${effectiveIconCls}`} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm leading-snug truncate ${
              notif.read
                ? "font-normal text-slate-300"
                : "font-semibold text-slate-100"
            }`}
          >
            {notif.title}
          </p>
          {!notif.read && (
            <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-violet-400" />
          )}
        </div>
        <p className="mt-0.5 text-xs text-slate-400 leading-snug line-clamp-2">
          {notif.message}
        </p>
        <p className="mt-1.5 text-[10px] text-slate-500 tracking-wide">
          {formatNotifTime(notif)}
        </p>
      </div>
    </button>
  );
}

// ── TopBar ────────────────────────────────────────────────────────────────────

export const TopBar = ({ onToggleSidebar, isSidebarOpen, menuButtonRef }: TopBarProps) => {
  const { user, logout } = useAuth();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const { notifications, unreadCount, markAllRead, markRead, clearAll } =
    useNotifications();

  // Close panel when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    };
    if (bellOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [bellOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBellOpen(false);
    };
    if (bellOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [bellOpen]);

  const handleOpenBell = () => {
    setBellOpen((v) => !v);
  };

  const handleMarkAllRead = () => {
    markAllRead();
  };

  const handleClearAll = () => {
    clearAll();
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

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800/50 bg-surface-base px-4 shadow-elevation-mid backdrop-blur-xl lg:px-8">
      {/* Left: hamburger + logo */}
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

      {/* Right: welcome + bell + profile + logout */}
      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="hidden text-sm text-slate-300 md:block">
          <span className="text-slate-500">Welcome back, </span>
          <span className="font-semibold text-slate-100">
            {user?.first_name || user?.email?.split("@")[0] || "Student"}
          </span>
        </div>

        {/* ── Notifications Bell ─────────────────────────────────────────── */}
        <div ref={bellRef} className="relative">
          <button
            type="button"
            onClick={handleOpenBell}
            aria-label="Open notifications"
            aria-expanded={bellOpen}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/60 bg-surface-base shadow-elevation-low text-slate-300 transition-all duration-quick ease-snappy hover:bg-surface-elevated hover:border-slate-600/80 hover:text-slate-100 focus-visible:outline-none"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-[10px] font-bold text-white shadow-sm">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* ── Notifications Panel ──────────────────────────────────────── */}
          {bellOpen && (
            <div className="absolute right-0 top-12 z-50 flex w-[340px] max-h-[520px] flex-col rounded-2xl border border-slate-800/70 bg-slate-950/95 shadow-[0_24px_64px_rgba(2,6,23,0.92)] backdrop-blur-2xl">
              {/* Panel header — stays fixed at top */}
              <div className="flex shrink-0 items-center justify-between border-b border-slate-800/60 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-100">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-semibold text-violet-300">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-0.5">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      title="Mark all as read"
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-slate-200"
                    >
                      <CheckCheck className="h-3 w-3" />
                      Mark read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAll}
                      title="Clear all notifications"
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium text-slate-500 transition-colors hover:bg-slate-800/60 hover:text-slate-300"
                    >
                      <Trash2 className="h-3 w-3" />
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Notification list — scrolls independently */}
              <div className="min-h-0 flex-1 overflow-y-auto divide-y divide-slate-800/40">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center gap-2.5 px-4 py-10 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800/50">
                      <Inbox className="h-6 w-6 text-slate-500" />
                    </div>
                    <p className="text-sm font-medium text-slate-400">
                      All clear!
                    </p>
                    <p className="text-xs text-slate-500">
                      No notifications right now. Check back later.
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <NotificationRow
                      key={notif.id}
                      notif={notif}
                      onRead={markRead}
                    />
                  ))
                )}
              </div>

              {/* Panel footer — stays fixed at bottom */}
              {notifications.length > 0 && (
                <div className="flex shrink-0 items-center gap-1.5 border-t border-slate-800/60 px-4 py-2">
                  <span className="text-[10px] text-slate-600">
                    {notifications.length} notification{notifications.length !== 1 ? "s" : ""} · updates every 5 min
                  </span>
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

      {/* Logout confirmation modal */}
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
