
import { LoaderCircle } from "lucide-react";

const AuthButton = ({
  children,
  type = "submit",
  loading = false,
  disabled = false,
  className = "",
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`btn btn-primary w-full ${
        disabled || loading ? "cursor-not-allowed opacity-70" : ""
      } ${className}`}
    >
      {loading ? (
        <>
          <LoaderCircle size={19} className="animate-spin" />
          Please wait...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default AuthButton;
