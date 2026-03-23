import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heading, Text, Overline, Button } from "../../components";

export const NotFoundPage = () => {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-center text-slate-100 px-4 overflow-hidden">
      {/* Animated Background Orbs */}
      <motion.div
        className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-primary-500/10 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-accent-500/10 blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.15, 0.3, 0.15]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-md space-y-6"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <Overline className="text-primary-300 text-2xl font-bold">404</Overline>
        </motion.div>
        
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Heading level="h1" className="text-4xl sm:text-5xl">We couldn&apos;t find that page</Heading>
        </motion.div>
        
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Text variant="body" color="muted" className="text-base">
            The link may be broken, or the page may have been moved. Choose where
            to go next.
          </Text>
        </motion.div>
        
        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="flex justify-center gap-3 pt-4"
        >
          <Link to="/dashboard">
            <Button className="px-6">Go to dashboard</Button>
          </Link>
          <Link to="/auth/sign-in">
            <Button variant="secondary" className="px-6">Sign in</Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};
