
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Mail,
  LockKeyhole,
  Building2,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { useAuth } from "../../hooks/useAuth";
import AuthInput from "../../components/auth/AuthInput";
import AuthButton from "../../components/auth/AuthButton";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // Basic validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Handle login
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      toast.success("Login successful!");

      const redirectTo = location.state?.from?.pathname || "/";

      navigate(redirectTo, { replace: true });

    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please try again.";

      toast.error(message);

    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary px-4 py-10">

      <div className="w-full max-w-md">

        {/* Logo / Branding */}
        <div className="text-center mb-8">

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-white shadow-lg mb-4">
            <Building2 size={32} />
          </div>

          <h1 className="text-3xl font-bold text-text-main">
            Welcome Back
          </h1>

          <p className="text-text-muted mt-2">
            Login to your Real Estate account
          </p>

        </div>

        {/* Login Card */}
        <div className="card-premium p-6 sm:p-8 rounded-2xl">

          <div className="mb-7">
            <h2 className="text-2xl font-semibold text-text-main">
              Login
            </h2>

            <p className="text-sm text-text-muted mt-2">
              Enter your credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <AuthInput
              label="Email Address"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              icon={Mail}
              autoComplete="email"
            />

            {/* Password */}
            <AuthInput
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              icon={LockKeyhole}
              autoComplete="current-password"
            />

            {/* Forgot Password */}
            <div className="flex justify-end">

              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
              >
                Forgot Password?
              </Link>

            </div>

            {/* Submit Button */}
            <AuthButton
              type="submit"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Login"}
              {!isSubmitting && (
                <ArrowRight size={18} className="ml-2" />
              )}
            </AuthButton>

          </form>

          {/* Register Link */}
          <div className="mt-7 text-center border-t border-border pt-6">

            <p className="text-sm text-text-muted">
              Don't have an account?{" "}

              <Link
                to="/register"
                className="font-semibold text-primary hover:text-primary-dark transition-colors"
              >
                Create Account
              </Link>

            </p>

          </div>

        </div>

        {/* Footer */}
        <p className="text-center text-xs text-text-muted mt-6">
          © {new Date().getFullYear()} Real Estate Management System.
          All rights reserved.
        </p>

      </div>

    </div>
  );
};

export default Login;
