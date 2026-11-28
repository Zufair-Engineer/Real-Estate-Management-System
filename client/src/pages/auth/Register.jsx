
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  LockKeyhole,
  Phone,
  Building2,
  ArrowRight,
  ImagePlus,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { useAuth } from "../../hooks/useAuth";
import AuthInput from "../../components/auth/AuthInput";
import AuthButton from "../../components/auth/AuthButton";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

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

  // Handle avatar selection
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // Remove avatar
  const removeAvatar = () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatar(null);
    setAvatarPreview(null);
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = "Name must contain at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Handle registration
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const data = new FormData();

      data.append("fullName", formData.fullName.trim());
      data.append("email", formData.email.trim());
      data.append("phone", formData.phone.trim());
      data.append("password", formData.password);

      if (avatar) {
        data.append("avatar", avatar);
      }

      await register(data);

      toast.success("Account created successfully!");

      navigate("/", { replace: true });

    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Registration failed. Please try again.";

      toast.error(message);

    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary px-4 py-10">

      <div className="w-full max-w-lg">

        {/* Branding */}
        <div className="text-center mb-8">

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-white shadow-lg mb-4">
            <Building2 size={32} />
          </div>

          <h1 className="text-3xl font-bold text-text-main">
            Join Our Community
          </h1>

          <p className="text-text-muted mt-2">
            Create your Real Estate account
          </p>

        </div>

        {/* Registration Card */}
        <div className="card-premium p-6 sm:p-8 rounded-2xl">

          <div className="mb-7">
            <h2 className="text-2xl font-semibold text-text-main">
              Create Account
            </h2>

            <p className="text-sm text-text-muted mt-2">
              Fill in your details to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Avatar Upload */}
            <div className="flex flex-col items-center mb-6">

              <div className="relative">

                <div className="w-24 h-24 rounded-full overflow-hidden bg-secondary border-2 border-dashed border-border flex items-center justify-center">

                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImagePlus
                      size={30}
                      className="text-text-muted"
                    />
                  )}

                </div>

                {avatarPreview && (
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    aria-label="Remove avatar"
                  >
                    <X size={14} />
                  </button>
                )}

              </div>

              <label className="mt-3 text-sm font-medium text-primary cursor-pointer hover:underline">
                Upload Profile Picture

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>

              <p className="text-xs text-text-muted mt-1">
                Optional · Maximum 5MB
              </p>

            </div>

            {/* Full Name */}
            <AuthInput
              label="Full Name"
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
              icon={User}
              autoComplete="name"
            />

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

            {/* Phone */}
            <AuthInput
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              icon={Phone}
              autoComplete="tel"
            />

            {/* Password */}
            <AuthInput
              label="Password"
              name="password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              icon={LockKeyhole}
              autoComplete="new-password"
            />

            {/* Confirm Password */}
            <AuthInput
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              icon={LockKeyhole}
              autoComplete="new-password"
            />

            {/* Submit */}
            <AuthButton
              type="submit"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}

              {!isSubmitting && (
                <ArrowRight size={18} className="ml-2" />
              )}
            </AuthButton>

          </form>

          {/* Login Link */}
          <div className="mt-7 text-center border-t border-border pt-6">

            <p className="text-sm text-text-muted">
              Already have an account?{" "}

              <Link
                to="/login"
                className="font-semibold text-primary hover:text-primary-dark transition-colors"
              >
                Login
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

export default Register;
