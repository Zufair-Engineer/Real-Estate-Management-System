
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const AuthInput = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  required = true,
  autoComplete,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="w-full space-y-2">
      <label
        htmlFor={name}
        className="block text-sm font-semibold text-[#111827]"
      >
        {label}
      </label>

      <div
        className={`flex items-center gap-3 rounded-xl border bg-white px-4 transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 ${
          error ? "border-red-500" : "border-border"
        }`}
      >
        {Icon && (
          <Icon size={19} className="shrink-0 text-[#6b7280]" />
        )}

        <input
          id={name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          className="w-full bg-transparent py-3.5 text-sm text-[#111827] outline-none placeholder:text-[#9ca3af]"
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="shrink-0 text-[#6b7280] transition-colors hover:text-primary"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs font-medium text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};

export default AuthInput;
