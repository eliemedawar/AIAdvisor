// Neural Canvas UI components
export * from './ui/Button';
export * from './ui/Card';
export * from './ui/Input';
export * from './ui/Badge';
export * from './ui/Modal';
export * from './ui/Select';
export * from './ui/Spinner';

// Stubs for legacy imports from old component tree
// (keeps any Manus-generated pages from crashing at import time)
export const PageShell = ({ children }: any) => children;
export const PageSection = ({ children }: any) => children;
export const SectionHeader = () => null;
export const StatCard = () => null;
export const EmptyState = ({ action }: any) => action ?? null;
export const SkeletonCard = () => null;
export const SkeletonList = () => null;
export const SkeletonStatCard = () => null;
export const SkeletonChatMessage = () => null;
export const Heading = ({ children }: any) => children;
export const Text = ({ children }: any) => children;
