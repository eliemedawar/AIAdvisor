import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  MessageSquare,
  Calendar,
  CheckSquare,
  User,
  LogOut,
  Zap,
} from 'lucide-react';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
  expanded: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  href,
  isActive,
  expanded,
}) => {
  return (
    <Link
      to={href}
      className="group relative w-12 flex items-center justify-center"
    >
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 ${
          isActive
            ? 'bg-indigo-neon-600 text-void-950 shadow-glow-indigo'
            : 'bg-glass text-gray-400 group-hover:text-indigo-neon-600 group-hover:bg-glass-strong'
        }`}
      >
        {icon}
      </div>

      {/* Label appears on hover */}
      {!expanded && (
        <span className="absolute left-16 px-3 py-2 bg-glass-strong rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none text-gray-200 z-50">
          {label}
        </span>
      )}

      {/* Label visible when expanded */}
      {expanded && (
        <span className="absolute left-16 px-3 py-2 text-sm font-medium whitespace-nowrap text-gray-200">
          {label}
        </span>
      )}
    </Link>
  );
};

export const DesktopNav: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();

  const navItems = [
    { icon: <Home size={20} />, label: 'Dashboard', href: '/dashboard' },
    { icon: <MessageSquare size={20} />, label: 'Chat', href: '/chat' },
    { icon: <Calendar size={20} />, label: 'Calendar', href: '/calendar' },
    { icon: <CheckSquare size={20} />, label: 'Planner', href: '/planner' },
    { icon: <User size={20} />, label: 'Profile', href: '/profile' },
  ];

  return (
    <nav
      className={`hidden sm:flex fixed left-0 top-0 h-screen flex-col items-center py-8 gap-4 transition-all duration-200 bg-void-900 border-r border-indigo-neon-600/10 z-40 ${
        expanded ? 'w-56' : 'w-16'
      }`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Logo */}
      <div className="w-12 h-12 rounded-lg bg-glass flex items-center justify-center shadow-glow-indigo mb-4">
        <Zap size={24} className="text-indigo-neon-600" />
      </div>

      {/* Nav Items */}
      {navItems.map((item) => (
        <NavItem
          key={item.href}
          icon={item.icon}
          label={item.label}
          href={item.href}
          isActive={location.pathname === item.href}
          expanded={expanded}
        />
      ))}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Logout */}
      <NavItem
        icon={<LogOut size={20} />}
        label="Logout"
        href="/logout"
        isActive={location.pathname === '/logout'}
        expanded={expanded}
      />
    </nav>
  );
};
