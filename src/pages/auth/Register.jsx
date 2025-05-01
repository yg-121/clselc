import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "Client",
    phone: "",
    specialization: [],
    location: "",
    yearsOfExperience: "",
    bio: "",
    certifications: "",
    hourlyRate: "",
    languages: "",
    license_file: null,
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const specializationOptions = [
    "Criminal Law",
    "Family Law",
    "Corporate Law",
    "Immigration",
    "Personal Injury",
    "Real Estate",
    "Civil law",
    "Marriage law",
    "Intellectual Property",
    "Employment Law",
    "Bankruptcy",
    "Tax Law",
  ];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSpecializationChange = (e) => {
    const selected = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setFormData((prev) => ({ ...prev, specialization: selected }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "specialization" && value.length > 0) {
        value.forEach((spec) => data.append("specialization[]", spec));
      } else if (value && value !== "" && value !== null) {
        data.append(key, value);
      }
    });

    const result = await register(data);

    setIsLoading(false);

    if (result.success) {
      const { role } = result.user;
      if (role === "Client") {
        navigate("/client/home");
      } else if (role === "Lawyer") {
        navigate("/lawyer/home");
      } else if (role === "Admin") {
        navigate("/admin");
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
          Register
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
          {/* Username Input */}
          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                color: "#111827",
                marginBottom: "0.5rem",
              }}
            >
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
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
              Password (min 8 characters)
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

          {/* Role Select */}
          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                color: "#111827",
                marginBottom: "0.5rem",
              }}
            >
              Role <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <select
              name="role"
              value={formData.role}
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
            >
              <option value="Client">Client</option>
              <option value="Lawyer">Lawyer</option>
            </select>
          </div>

          {formData.role === "Lawyer" && (
            <>
              {/* Phone Input */}
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    color: "#111827",
                    marginBottom: "0.5rem",
                  }}
                >
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
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
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#3B82F6")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "#E5E7EB")
                  }
                />
              </div>

              {/* Specialization Select */}
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    color: "#111827",
                    marginBottom: "0.5rem",
                  }}
                >
                  Specialization <span style={{ color: "#EF4444" }}>*</span>{" "}
                  (select multiple)
                </label>
                <select
                  name="specialization"
                  multiple
                  value={formData.specialization}
                  onChange={handleSpecializationChange}
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
                    height: "10rem",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#3B82F6")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "#E5E7EB")
                  }
                >
                  {specializationOptions.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Input */}
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    color: "#111827",
                    marginBottom: "0.5rem",
                  }}
                >
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
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
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#3B82F6")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "#E5E7EB")
                  }
                />
              </div>

              {/* Years of Experience Input */}
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    color: "#111827",
                    marginBottom: "0.5rem",
                  }}
                >
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                  min="0"
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
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#3B82F6")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "#E5E7EB")
                  }
                />
              </div>

              {/* Bio Textarea */}
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    color: "#111827",
                    marginBottom: "0.5rem",
                  }}
                >
                  Bio (max 500 characters)
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  maxLength="500"
                  rows="4"
                  style={{
                    width: "100%",
                    padding: "0.5rem 1rem",
                    border: "1px solid #E5E7EB",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                    color: "#111827",
                    outline: "none",
                    transition: "all 300ms",
                    resize: "vertical",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#3B82F6")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "#E5E7EB")
                  }
                />
              </div>

              {/* Certifications Input */}
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    color: "#111827",
                    marginBottom: "0.5rem",
                  }}
                >
                  Certifications (comma-separated)
                </label>
                <input
                  type="text"
                  name="certifications"
                  value={formData.certifications}
                  onChange={handleChange}
                  placeholder="e.g., Bar Certified, Mediation"
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
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#3B82F6")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "#E5E7EB")
                  }
                />
              </div>

              {/* Hourly Rate Input */}
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    color: "#111827",
                    marginBottom: "0.5rem",
                  }}
                >
                  Hourly Rate ($)
                </label>
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
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
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#3B82F6")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "#E5E7EB")
                  }
                />
              </div>

              {/* Languages Input */}
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    color: "#111827",
                    marginBottom: "0.5rem",
                  }}
                >
                  Languages (comma-separated)
                </label>
                <input
                  type="text"
                  name="languages"
                  value={formData.languages}
                  onChange={handleChange}
                  placeholder="e.g., English, Amharic"
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
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#3B82F6")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "#E5E7EB")
                  }
                />
              </div>

              {/* License File Input */}
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    color: "#111827",
                    marginBottom: "0.5rem",
                  }}
                >
                  License File (PDF/JPG/PNG){" "}
                  <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  type="file"
                  name="license_file"
                  accept=".pdf,.jpg,.png"
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "0.5rem 1rem",
                    border: "1px solid #E5E7EB",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                    color: "#111827",
                  }}
                />
              </div>
            </>
          )}

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
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Login Link */}
        <p
          style={{
            marginTop: "1rem",
            textAlign: "center",
            color: "#111827",
            fontSize: "0.875rem",
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
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
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
