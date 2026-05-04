import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Input, Button } from "../../components";
import {
  FormFieldWrapper,
  baseInputClasses,
  errorInputClasses,
  defaultInputClasses,
} from "../../components/core/FormField";
import { useAuth } from "../../hooks/useAuth";
import clsx from "clsx";

export const SignUpPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
  });

  const validateEmail = (value: string): string => {
    if (!value) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (value: string): string => {
    if (!value) return "Password is required";
    if (value.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(value)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(value)) return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(value)) return "Password must contain at least one number";
    return "";
  };

  const validateName = (value: string, field: string): string => {
    if (!value.trim()) return `${field} is required`;
    if (value.length < 2) return `${field} must be at least 2 characters`;
    return "";
  };

  const handleFieldChange = (field: keyof typeof errors, value: string) => {
    if (field === "firstName") setFirstName(value);
    if (field === "lastName") setLastName(value);
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);

    if (touched[field]) {
      let err = "";
      if (field === "email") err = validateEmail(value);
      else if (field === "password") err = validatePassword(value);
      else if (field === "firstName") err = validateName(value, "First name");
      else if (field === "lastName") err = validateName(value, "Last name");
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  const handleFieldBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const value =
      field === "firstName" ? firstName :
      field === "lastName"  ? lastName  :
      field === "email"     ? email     : password;

    let err = "";
    if (field === "email") err = validateEmail(value);
    else if (field === "password") err = validatePassword(value);
    else if (field === "firstName") err = validateName(value, "First name");
    else if (field === "lastName") err = validateName(value, "Last name");
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const newErrors = {
      firstName: validateName(firstName, "First name"),
      lastName: validateName(lastName, "Last name"),
      email: validateEmail(email),
      password: validatePassword(password),
    };

    setErrors(newErrors);
    setTouched({ firstName: true, lastName: true, email: true, password: true });

    if (Object.values(newErrors).some((err) => err !== "")) return;

    setError(null);
    setLoading(true);
    try {
      await registerUser({ email, password, first_name: firstName, last_name: lastName });
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Unable to sign up. Please check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="First name"
          name="firstName"
          required
          placeholder="First name"
          value={firstName}
          onChange={(e) => handleFieldChange("firstName", e.target.value)}
          onBlur={() => handleFieldBlur("firstName")}
          error={touched.firstName ? errors.firstName : ""}
        />
        <Input
          label="Last name"
          name="lastName"
          required
          placeholder="Last name"
          value={lastName}
          onChange={(e) => handleFieldChange("lastName", e.target.value)}
          onBlur={() => handleFieldBlur("lastName")}
          error={touched.lastName ? errors.lastName : ""}
        />
      </div>

      <div className="space-y-4">
        <Input
          label="University email"
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder="username@aub.edu.lb"
          value={email}
          onChange={(e) => handleFieldChange("email", e.target.value)}
          onBlur={() => handleFieldBlur("email")}
          error={touched.email ? errors.email : ""}
        />

        {/* Password with visibility toggle */}
        <FormFieldWrapper
          label="Password"
          error={touched.password ? errors.password : ""}
          helperText={
            !(touched.password && errors.password)
              ? "Must be at least 8 characters with uppercase, lowercase, and number"
              : undefined
          }
          htmlFor="password"
          required
        >
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              placeholder="Create a password"
              value={password}
              onChange={(e) => handleFieldChange("password", e.target.value)}
              onBlur={() => handleFieldBlur("password")}
              className={clsx(
                baseInputClasses,
                touched.password && errors.password
                  ? errorInputClasses
                  : defaultInputClasses,
                "pr-10"
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 transition-colors hover:text-slate-300 focus-visible:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </FormFieldWrapper>
      </div>

      {error && (
        <div className="rounded-xl border border-danger-500/60 bg-danger-500/10 px-4 py-3 text-sm text-danger-200">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" loading={loading}>
        Sign up
      </Button>

      <p className="text-center text-xs text-slate-400">
        Already have an account?{" "}
        <Link
          to="/auth/sign-in"
          className="font-medium text-primary-300 hover:text-primary-200"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
};
