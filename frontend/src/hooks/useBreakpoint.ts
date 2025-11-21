/**
 * useBreakpoint Hook
 * 
 * Detects current viewport breakpoint for responsive calendar layouts.
 * Used to automatically switch to agenda view on narrow screens.
 */

import { useState, useEffect } from "react";
import { breakpoints as breakpointTokens } from "../styles/design-tokens";

/**
 * Viewport breakpoint naming matches the token system (sm/md/lg/xl/2xl)
 * plus a "base" bucket for anything smaller than sm.
 */
export type Breakpoint = "base" | "sm" | "md" | "lg" | "xl" | "2xl";

const parsePxValue = (value: string) => parseInt(value.replace("px", ""), 10);

const BREAKPOINT_VALUES: Record<Breakpoint, number> = {
  base: 0,
  sm: parsePxValue(breakpointTokens.sm),
  md: parsePxValue(breakpointTokens.md),
  lg: parsePxValue(breakpointTokens.lg),
  xl: parsePxValue(breakpointTokens.xl),
  "2xl": parsePxValue(breakpointTokens["2xl"]),
};

const deriveBreakpoint = (width: number): Breakpoint => {
  if (width >= BREAKPOINT_VALUES["2xl"]) return "2xl";
  if (width >= BREAKPOINT_VALUES.xl) return "xl";
  if (width >= BREAKPOINT_VALUES.lg) return "lg";
  if (width >= BREAKPOINT_VALUES.md) return "md";
  if (width >= BREAKPOINT_VALUES.sm) return "sm";
  return "base";
};

const getViewportSnapshot = () => {
  const width =
    typeof window === "undefined" ? BREAKPOINT_VALUES.lg : window.innerWidth;
  return {
    width,
    breakpoint: deriveBreakpoint(width),
  };
};

/**
 * Hook to detect current breakpoint
 * Returns current breakpoint and helper flags
 */
export function useBreakpoint() {
  const [viewport, setViewport] = useState(getViewportSnapshot);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let frame = 0;

    const handleResize = () => {
      cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        setViewport((prev) => {
          const next = getViewportSnapshot();
          if (
            next.breakpoint === prev.breakpoint &&
            next.width === prev.width
          ) {
            return prev;
          }
          return next;
        });
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frame);
    };
  }, []);

  const { width, breakpoint } = viewport;

  const isSmUp = width >= BREAKPOINT_VALUES.sm;
  const isMdUp = width >= BREAKPOINT_VALUES.md;
  const isLgUp = width >= BREAKPOINT_VALUES.lg;
  const isXlUp = width >= BREAKPOINT_VALUES.xl;
  const is2xlUp = width >= BREAKPOINT_VALUES["2xl"];

  const isMobile = width < BREAKPOINT_VALUES.md;
  const isTablet =
    width >= BREAKPOINT_VALUES.md && width < BREAKPOINT_VALUES.lg;
  const isDesktop = width >= BREAKPOINT_VALUES.lg;

  return {
    breakpoint,
    width,
    isBase: breakpoint === "base",
    isSm: breakpoint === "sm",
    isMd: breakpoint === "md",
    isLg: breakpoint === "lg",
    isXl: breakpoint === "xl",
    is2xl: breakpoint === "2xl",
    isSmUp,
    isMdUp,
    isLgUp,
    isXlUp,
    is2xlUp,
    isSmDown: width < BREAKPOINT_VALUES.md,
    isMdDown: width < BREAKPOINT_VALUES.lg,
    isLgDown: width < BREAKPOINT_VALUES.xl,
    isMobile,
    isTablet,
    isDesktop,
    isNarrow: width < BREAKPOINT_VALUES.xl,
  };
}
