import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input, Button } from "../../components";
import { useAuth } from "../../hooks/useAuth";

export const SignUpPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false
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
      let error = "";
      if (field === "email") error = validateEmail(value);
      else if (field === "password") error = validatePassword(value);
      else if (field === "firstName") error = validateName(value, "First name");
      else if (field === "lastName") error = validateName(value, "Last name");
      
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleFieldBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    let error = "";
    const value = field === "firstName" ? firstName : 
                  field === "lastName" ? lastName :
                  field === "email" ? email : password;
    
    if (field === "email") error = validateEmail(value);
    else if (field === "password") error = validatePassword(value);
    else if (field === "firstName") error = validateName(value, "First name");
    else if (field === "lastName") error = validateName(value, "Last name");
    
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {
      firstName: validateName(firstName, "First name"),
      lastName: validateName(lastName, "Last name"),
      email: validateEmail(email),
      password: validatePassword(password)
    };
    
    setErrors(newErrors);
    setTouched({ firstName: true, lastName: true, email: true, password: true });
    
    if (Object.values(newErrors).some(err => err !== "")) {
      return;
    }

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
          value={firstName}
          onChange={(e) => handleFieldChange("firstName", e.target.value)}
          onBlur={() => handleFieldBlur("firstName")}
          error={touched.firstName ? errors.firstName : ""}
        />
        <Input
          label="Last name"
          name="lastName"
          required
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
          value={email}
          onChange={(e) => handleFieldChange("email", e.target.value)}
          onBlur={() => handleFieldBlur("email")}
          error={touched.email ? errors.email : ""}
        />
        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => handleFieldChange("password", e.target.value)}
          onBlur={() => handleFieldBlur("password")}
          error={touched.password ? errors.password : ""}
          helperText="Must be at least 8 characters with uppercase, lowercase, and number"
        />
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


