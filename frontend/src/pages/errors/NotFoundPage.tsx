import { Link } from "react-router-dom";
import { Heading, Text, Overline, Button } from "../../components";

export const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-center text-slate-100 px-4">
      <div className="max-w-md space-y-6">
        <Overline className="text-primary-300">404</Overline>
        <Heading level="h1">We couldn&apos;t find that page</Heading>
        <Text variant="body" color="muted">
          The link may be broken, or the page may have been moved. Choose where
          to go next.
        </Text>
        <div className="flex justify-center gap-3 pt-2">
          <Link to="/dashboard">
            <Button>Go to dashboard</Button>
          </Link>
          <Link to="/auth/sign-in">
            <Button variant="secondary">Sign in</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};


