import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  MessageSquare,
  Calendar,
  CheckSquare,
  User,
} from 'lucide-react';

interface MobileNavItemProps {
  icon: React.ReactNode;
  href: string;
  isActive: boolean;
}

const MobileNavItem: React.FC<MobileNavItemProps> = ({
  icon,
  href,
  isActive,
}) => {
  return (
    <Link
      to={href}
      className={`w-8 h-8 flex items-center justify-center transition-all duration-200 ${
        isActive
          ? 'text-indigo-neon-600 shadow-glow-indigo'
          : 'text-gray-400 hover:text-indigo-neon-600'
      }`}
    >
      {icon}
    </Link>
  );
};

export const MobileNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { icon: <Home size={20} />, href: '/dashboard' },
    { icon: <MessageSquare size={20} />, href: '/chat' },
    { icon: <Calendar size={20} />, href: '/calendar' },
    { icon: <CheckSquare size={20} />, href: '/planner' },
    { icon: <User size={20} />, href: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 sm:hidden">
      <div className="glass-strong rounded-full px-4 py-3 flex gap-8 items-center">
        {navItems.map((item) => (
          <MobileNavItem
            key={item.href}
            icon={item.icon}
            href={item.href}
            isActive={location.pathname === item.href}
          />
        ))}
      </div>
    </nav>
  );
};
