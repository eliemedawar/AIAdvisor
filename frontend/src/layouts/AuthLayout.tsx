import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Sparkles } from "lucide-react";

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

export const AuthLayout = () => {
  const location = useLocation();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg via-slate-900 to-bg" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-900/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-accent-900/15 via-transparent to-transparent" />

      {/* Floating Orbs */}
      <motion.div
        className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary-500/10 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 mx-4 w-full max-w-md"
      >
        <div className="rounded-3xl border border-slate-800/50 glass-strong p-8 shadow-soft">
          {/* Logo and Title */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-glow">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-50 lg:text-3xl">
              AI Academic Advisor
            </h1>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-slate-400">
              <Sparkles className="h-3.5 w-3.5 text-accent-400" />
              <span>Smart planning. Better semesters.</span>
            </p>
          </div>

          {/* Form Content with AnimatePresence */}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Secure • Private • Built for students
        </p>
      </motion.div>
    </div>
  );
};


