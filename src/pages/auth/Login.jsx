import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import { useAuth } from "../../hooks/authHooks";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const { email, password } = formData;
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      const { role } = result.user;
      if (role === "Client") {
        navigate("/client/home");
      } else if (role === "Lawyer") {
        navigate("/lawyer/home");
      } else if (role === "Admin") {
        navigate("/dashboard/admin");
      } else if (role === "LegalReviewer") {
        navigate("/dashboard/reviewer");
      } else {
        // Fallback for unknown roles
        console.warn("Unknown user role:", role);
        navigate("/login");
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <div
      style={{
        fontFamily: "Inter, sans-serif",
        backgroundColor: "#F3F4F6",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "1.5rem 1rem",
      }}
    >
      <div
        style={{
          maxWidth: "28rem",
          width: "100%",
          backgroundColor: "#FFFFFF",
          borderRadius: "0.5rem",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          padding: "1.5rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            textAlign: "center",
            color: "#111827",
            marginBottom: "1.5rem",
          }}
        >
          Login
        </h2>
        {error && (
          <p
            style={{
              color: "#EF4444",
              textAlign: "center",
              marginBottom: "1rem",
            }}
          >
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                color: "#111827",
                marginBottom: "0.5rem",
              }}
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "0.5rem 1rem",
                border: "1px solid #E5E7EB",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                color: "#111827",
                outline: "none",
                transition: "all 300ms",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
          </div>

          {/* Password Input */}
          <div style={{ position: "relative", marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                color: "#111827",
                marginBottom: "0.5rem",
              }}
            >
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "0.5rem 1rem",
                border: "1px solid #E5E7EB",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                color: "#111827",
                outline: "none",
                transition: "all 300ms",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "0.5rem",
                top: "2.25rem",
                color: "#111827",
              }}
              aria-label="Toggle password visibility"
            >
              {showPassword ? (
                <EyeSlashIcon style={{ height: "1.25rem", width: "1.25rem" }} />
              ) : (
                <EyeIcon style={{ height: "1.25rem", width: "1.25rem" }} />
              )}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "0.75rem 1.5rem",
              border: "none",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "#FFFFFF",
              backgroundColor: isLoading ? "#9CA3AF" : "#3B82F6",
              boxShadow: isLoading ? "none" : "0 2px 4px rgba(0, 0, 0, 0.1)",
              transition: "all 300ms",
              cursor: isLoading ? "not-allowed" : "pointer",
              transform: isLoading ? "none" : "scale(1)",
            }}
            onMouseOver={(e) =>
              !isLoading &&
              ((e.currentTarget.style.backgroundColor = "#2563EB"),
              (e.currentTarget.style.boxShadow =
                "0 4px 8px rgba(0, 0, 0, 0.15)"),
              (e.currentTarget.style.transform = "scale(1.05)"))
            }
            onMouseOut={(e) =>
              !isLoading &&
              ((e.currentTarget.style.backgroundColor = "#3B82F6"),
              (e.currentTarget.style.boxShadow =
                "0 2px 4px rgba(0, 0, 0, 0.1)"),
              (e.currentTarget.style.transform = "scale(1)"))
            }
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Forgot Password Link */}
        <div style={{ marginTop: "1rem", textAlign: "center" }}>
          <Link
            to="/forgot-password"
            style={{
              color: "#3B82F6",
              fontSize: "0.875rem",
              textDecoration: "none",
              transition: "all 300ms",
            }}
            onMouseOver={(e) => (
              (e.currentTarget.style.color = "#2563EB"),
              (e.currentTarget.style.textDecoration = "underline")
            )}
            onMouseOut={(e) => (
              (e.currentTarget.style.color = "#3B82F6"),
              (e.currentTarget.style.textDecoration = "none")
            )}
          >
            Forgot Password?
          </Link>
        </div>

        {/* Register Link */}
        <p
          style={{
            marginTop: "1rem",
            textAlign: "center",
            color: "#111827",
            fontSize: "0.875rem",
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{
              color: "#3B82F6",
              textDecoration: "none",
              transition: "all 300ms",
            }}
            onMouseOver={(e) => (
              (e.currentTarget.style.color = "#2563EB"),
              (e.currentTarget.style.textDecoration = "underline")
            )}
            onMouseOut={(e) => (
              (e.currentTarget.style.color = "#3B82F6"),
              (e.currentTarget.style.textDecoration = "none")
            )}
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}


