import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Input, Button } from "../../components";
import { useAuth } from "../../hooks/useAuth";

export const SignInPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [touched, setTouched] = useState({ email: false, password: false });

  const validateEmail = (value: string): string => {
    if (!value) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (value: string): string => {
    if (!value) return "Password is required";
    if (value.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (touched.email) {
      setEmailError(validateEmail(value));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (touched.password) {
      setPasswordError(validatePassword(value));
    }
  };

  const handleEmailBlur = () => {
    setTouched(prev => ({ ...prev, email: true }));
    setEmailError(validateEmail(email));
  };

  const handlePasswordBlur = () => {
    setTouched(prev => ({ ...prev, password: true }));
    setPasswordError(validatePassword(password));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    setTouched({ email: true, password: true });
    
    if (emailErr || passwordErr) {
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Unable to sign in. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Input
          label="University email"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          onBlur={handleEmailBlur}
          error={touched.email ? emailError : ""}
        />
        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => handlePasswordChange(e.target.value)}
          onBlur={handlePasswordBlur}
          error={touched.password ? passwordError : ""}
        />
      </div>
      {error && (
        <div className="rounded-xl border border-danger-500/60 bg-danger-500/10 px-4 py-3 text-sm text-danger-200">
          {error}
        </div>
      )}
      <Button type="submit" className="w-full" loading={loading}>
        Sign in
      </Button>
      <p className="text-center text-xs text-slate-400">
        Don&apos;t have an account?{" "}
        <Link
          to="/auth/sign-up"
          className="font-medium text-primary-300 hover:text-primary-200"
        >
          Create one
        </Link>
      </p>
    </form>
  );
};


