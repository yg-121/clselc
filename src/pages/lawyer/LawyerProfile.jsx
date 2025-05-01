import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  MapPin,
  Star,
  Clock,
  MessageSquare,
  Globe,
  DollarSign, // Added missing import
} from "lucide-react";

export default function LawyerProfile() {
  const [lawyerData, setLawyerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Loading started:", loading); // Debug log
    setTimeout(() => {
      const mockLawyer = {
        username: "AbebeKebede",
        email: "abebe@example.com",
        phone: "+251912345678",
        specialization: ["Corporate Law", "Tax Law"],
        location: "Addis Ababa, Ethiopia",
        yearsOfExperience: "10",
        bio: "Experienced corporate lawyer with a focus on mergers and acquisitions.",
        certifications: "Bar Certified, Mediation",
        hourlyRate: "150",
        languages: "English, Amharic",
        licenseFile: "license.pdf",
        profilePicture: null,
        availability: "Accepting New Cases",
        rating: 4.5,
        reviewCount: 25,
        recentCases: [
          { id: 1, title: "Corporate Merger Review", status: "Completed" },
          { id: 2, title: "Tax Compliance Audit", status: "In Progress" },
        ],
        socialLinks: {
          linkedin: "https://linkedin.com/in/abebekebede",
          website: "https://abebelaw.com",
        },
        lastActive: "2 hours ago",
      };

      setLawyerData(mockLawyer);
      setLoading(false);
      console.log("Loading finished:", loading); // Debug log
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "16rem",
        }}
      >
        <div
          style={{
            border: "4px solid #3B82F6",
            borderTop: "4px solid transparent",
            borderRadius: "50%",
            width: "3rem",
            height: "3rem",
            animation: "spin 1s linear infinite",
          }}
        ></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "Inter, sans-serif",
        backgroundColor: "#F3F4F6",
        color: "#111827",
        minHeight: "100vh",
      }}
    >


      <div
        style={{ maxWidth: "64rem", margin: "0 auto", padding: "1.5rem 1rem" }}
      >
        <div
          style={{
            backgroundColor: "#FFFFFF",
            color: "#111827",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            padding: "1.5rem",
            transition: "all 300ms",
          }}
        >
          {/* Profile Header */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
              borderBottom: "1px solid #E5E7EB",
              paddingBottom: "1.5rem",
            }}
          >
            <div
              style={{
                height: "6rem",
                width: "6rem",
                borderRadius: "50%",
                backgroundColor: "#E5E7EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#4B5563",
                fontSize: "1.5rem",
                fontWeight: "500",
              }}
            >
              {lawyerData.username.charAt(0)}
            </div>
            <div style={{ textAlign: "center", flex: 1 }}>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#111827",
                }}
              >
                {lawyerData.username}
              </h2>
              <p style={{ color: "#6B7280", marginTop: "0.25rem" }}>
                {lawyerData.specialization.join(", ")}
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: "0.5rem",
                }}
              >
                <Star
                  style={{
                    height: "1.25rem",
                    width: "1.25rem",
                    color: "#FBBF24",
                    marginRight: "0.25rem",
                  }}
                />
                <span style={{ color: "#111827" }}>{lawyerData.rating}/5</span>
                <span style={{ color: "#6B7280", marginLeft: "0.25rem" }}>
                  ({lawyerData.reviewCount} reviews)
                </span>
              </div>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#6B7280",
                  marginTop: "0.25rem",
                }}
              >
                {lawyerData.availability}
              </p>
            </div>
            <Link
              to={`/messages?lawyer=${lawyerData.username}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "0.5rem 1rem",
                border: "none",
                fontSize: "0.875rem",
                fontWeight: "500",
                borderRadius: "0.5rem",
                color: "#FFFFFF",
                backgroundColor: "#3B82F6",
                transition: "all 300ms",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#2563EB")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "#3B82F6")
              }
            >
              <MessageSquare
                style={{ height: "1rem", width: "1rem", marginRight: "0.5rem" }}
              />
              Contact Lawyer
            </Link>
          </div>

          {/* Profile Details */}
          <div
            style={{
              marginTop: "1.5rem",
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "1.5rem",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: "0.75rem",
                }}
              >
                Professional Details
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "0.875rem",
                    color: "#6B7280",
                  }}
                >
                  <Briefcase
                    style={{
                      flexShrink: 0,
                      marginRight: "0.375rem",
                      height: "1.25rem",
                      width: "1.25rem",
                      color: "#9CA3AF",
                    }}
                  />
                  <span>
                    Experience:{" "}
                    <span style={{ fontWeight: "500" }}>
                      {lawyerData.yearsOfExperience} years
                    </span>
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "0.875rem",
                    color: "#6B7280",
                  }}
                >
                  <MapPin
                    style={{
                      flexShrink: 0,
                      marginRight: "0.375rem",
                      height: "1.25rem",
                      width: "1.25rem",
                      color: "#9CA3AF",
                    }}
                  />
                  <span>
                    Location:{" "}
                    <span style={{ fontWeight: "500" }}>
                      {lawyerData.location}
                    </span>
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "0.875rem",
                    color: "#6B7280",
                  }}
                >
                  <DollarSign
                    style={{
                      flexShrink: 0,
                      marginRight: "0.375rem",
                      height: "1.25rem",
                      width: "1.25rem",
                      color: "#9CA3AF",
                    }}
                  />
                  <span>
                    Hourly Rate:{" "}
                    <span style={{ fontWeight: "500" }}>
                      ${lawyerData.hourlyRate}
                    </span>
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "0.875rem",
                    color: "#6B7280",
                  }}
                >
                  <Globe
                    style={{
                      flexShrink: 0,
                      marginRight: "0.375rem",
                      height: "1.25rem",
                      width: "1.25rem",
                      color: "#9CA3AF",
                    }}
                  />
                  <span>
                    Languages:{" "}
                    <span style={{ fontWeight: "500" }}>
                      {lawyerData.languages}
                    </span>
                  </span>
                </div>
                <div style={{ fontSize: "0.875rem", color: "#6B7280" }}>
                  <span>Certifications: </span>
                  <span style={{ fontWeight: "500" }}>
                    {lawyerData.certifications}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: "0.75rem",
                }}
              >
                About
              </h3>
              <p style={{ color: "#4B5563" }}>{lawyerData.bio}</p>
              <div style={{ marginTop: "1rem" }}>
                <p style={{ fontSize: "0.875rem", color: "#6B7280" }}>
                  Last Active:{" "}
                  <span style={{ fontWeight: "500" }}>
                    {lawyerData.lastActive}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div
            style={{
              marginTop: "1.5rem",
              borderTop: "1px solid #E5E7EB",
              paddingTop: "1.5rem",
            }}
          >
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: "600",
                color: "#111827",
                marginBottom: "0.75rem",
              }}
            >
              Contact Information
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <p style={{ fontSize: "0.875rem", color: "#6B7280" }}>
                Email:{" "}
                <span style={{ fontWeight: "500" }}>{lawyerData.email}</span>
              </p>
              <p style={{ fontSize: "0.875rem", color: "#6B7280" }}>
                Phone:{" "}
                <span style={{ fontWeight: "500" }}>{lawyerData.phone}</span>
              </p>
              {lawyerData.socialLinks && (
                <div style={{ display: "flex", gap: "1rem" }}>
                  {lawyerData.socialLinks.linkedin && (
                    <a
                      href={lawyerData.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#3B82F6" }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.color = "#2563EB")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.color = "#3B82F6")
                      }
                    >
                      LinkedIn
                    </a>
                  )}
                  {lawyerData.socialLinks.website && (
                    <a
                      href={lawyerData.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#3B82F6" }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.color = "#2563EB")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.color = "#3B82F6")
                      }
                    >
                      Website
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Recent Cases */}
          <div
            style={{
              marginTop: "1.5rem",
              borderTop: "1px solid #E5E7EB",
              paddingTop: "1.5rem",
            }}
          >
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: "600",
                color: "#111827",
                marginBottom: "0.75rem",
              }}
            >
              Recent Cases
            </h3>
            {lawyerData.recentCases.length > 0 ? (
              <ul style={{ borderTop: "1px solid #E5E7EB" }}>
                {lawyerData.recentCases.map((caseItem) => (
                  <li
                    key={caseItem.id}
                    style={{
                      padding: "0.75rem 0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "0.875rem", color: "#111827" }}>
                      {caseItem.title}
                    </span>
                    <span
                      style={{
                        fontSize: "0.875rem",
                        color:
                          caseItem.status === "Completed"
                            ? "#10B981"
                            : "#F59E0B",
                      }}
                    >
                      {caseItem.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: "#6B7280" }}>No recent cases available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
