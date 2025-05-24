import React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Briefcase,
  Calendar,
  MessageSquare,
  ArrowRight,
  Shield,
  FileText,
  HomeIcon,
  Users,
  Building,
  Gavel,
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
} from "lucide-react";

export default function ClientHome() {
  const navigate = useNavigate();
  const [topLawyers, setTopLawyers] = useState([]);
  const [allLawyers, setAllLawyers] = useState([]); // Add this to store all lawyers
  const [filteredLawyers, setFilteredLawyers] = useState([]); // Add this for search results
  const [hasSearched, setHasSearched] = useState(false); // Track if user has searched
  const [articles, setArticles] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [legalAreas, setLegalAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);

  useEffect(() => {
    // Add CSS for animations
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      @keyframes timeline {
        from { width: 0; }
        to { width: 100%; }
      }
      
      .animate-fadeIn {
        opacity: 0;
        animation: fadeIn 0.8s ease-out forwards;
      }
      
      .timeline-line {
        animation: timeline 3s ease-out forwards 0.5s;
      }
      
      .timeline-dot {
        animation: pulse 2s infinite;
      }
      
      .step-item {
        opacity: 0;
        animation: fadeIn 0.8s ease-out forwards;
      }
      
      .step-item:nth-child(1) {
        animation-delay: 0.3s;
      }
      
      .step-item:nth-child(2) {
        animation-delay: 1.3s;
      }
      
      .step-item:nth-child(3) {
        animation-delay: 2.3s;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch Lawyers
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found. Please log in.");
        }

        const response = await fetch(
          "http://localhost:5000/api/users/lawyers",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 401 || response.status === 403) {
            throw new Error("Session expired. Please log in again.");
          }
          if (response.status === 500) {
            throw new Error(errorData.message || "Failed to fetch lawyers");
          }
          throw new Error(
            errorData.message ||
              `Failed to fetch lawyers (Status: ${response.status})`
          );
        }

        const lawyerData = await response.json();
        const allLawyersList = lawyerData.lawyers || [];
        
        // Store all lawyers
        setAllLawyers(allLawyersList);
        
        // Get top rated lawyers for the top section
        const sortedLawyers = [...allLawyersList]
          .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
          .slice(0, 4); // Get top 4 lawyers by rating
        setTopLawyers(sortedLawyers);

        // Mock data for other sections (unchanged)
        const mockArticles = [
          {
            id: 1,
            title: "Understanding Ethiopian Business Registration Process",
            excerpt:
              "A comprehensive guide to registering your business in Ethiopia, including required documents and procedures.",
            author: "Abebe Kebede",
            date: "2025-03-15",
            category: "Business Law",
            imageUrl: "/placeholder.svg?height=200&width=300",
            readTime: "8 min read",
          },
          {
            id: 2,
            title: "Ethiopian Family Law: Marriage and Divorce",
            excerpt:
              "Learn about the legal aspects of marriage and divorce under Ethiopian family law.",
            author: "Tigist Haile",
            date: "2025-03-10",
            category: "Family Law",
            imageUrl: "/placeholder.svg?height=200&width=300",
            readTime: "6 min read",
          },
          {
            id: 3,
            title: "Property Rights in Ethiopia: What You Need to Know",
            excerpt:
              "An overview of property rights, land ownership, and real estate regulations in Ethiopia.",
            author: "Solomon Tesfaye",
            date: "2025-03-05",
            category: "Property Law",
            imageUrl: "/placeholder.svg?height=200&width=300",
            readTime: "10 min read",
          },
          {
            id: 4,
            title: "Navigating Criminal Law in Ethiopia",
            excerpt:
              "Key insights into criminal defense, legal procedures, and your rights under Ethiopian law.",
            author: "Lidya Worku",
            date: "2025-03-01",
            category: "Criminal Law",
            imageUrl: "/placeholder.svg?height=200&width=300",
            readTime: "7 min read",
          },
          {
            id: 5,
            title: "Labor Law in Ethiopia: Employee Rights",
            excerpt:
              "Understand your rights as an employee, including contracts, wages, and dispute resolution.",
            author: "Mulugeta Assefa",
            date: "2025-02-25",
            category: "Labor Law",
            imageUrl: "/placeholder.svg?height=200&width=300",
            readTime: "9 min read",
          },
          {
            id: 6,
            title: "Protecting Intellectual Property in Ethiopia",
            excerpt:
              "A guide to safeguarding your patents, trademarks, and copyrights in Ethiopia.",
            author: "Eyerusalem Bekele",
            date: "2025-02-20",
            category: "Intellectual Property",
            imageUrl: "/placeholder.svg?height=200&width=300",
            readTime: "5 min read",
          },
          {
            id: 7,
            title: "Tax Law Basics for Ethiopian Businesses",
            excerpt:
              "Essential information on tax obligations, filings, and compliance for businesses in Ethiopia.",
            author: "Yonas Gebeyehu",
            date: "2025-02-15",
            category: "Tax Law",
            imageUrl: "/placeholder.svg?height=200&width=300",
            readTime: "8 min read",
          },
        ];

        const mockTestimonials = [
          {
            id: 1,
            name: "Henok Girma",
            role: "Business Owner",
            content:
              "I found an excellent business lawyer through this platform. The process was smooth and the legal advice I received was invaluable for my company.",
            imageUrl: "/placeholder.svg?height=60&width=60",
          },
          {
            id: 2,
            name: "Sara Tadesse",
            role: "Client",
            content:
              "The family lawyer I connected with helped me navigate a complex divorce case with professionalism and empathy. Highly recommended!",
            imageUrl: "/placeholder.svg?height=60&width=60",
          },
          {
            id: 3,
            name: "Dawit Mengistu",
            role: "Entrepreneur",
            content:
              "Finding a lawyer specialized in intellectual property was crucial for my tech startup. This platform made it easy to find the right expert.",
            imageUrl: "/placeholder.svg?height=60&width=60",
          },
        ];

        const mockLegalAreas = [
          {
            id: 1,
            name: "Business Law",
            icon: "Building",
            description:
              "Business registration, contracts, commercial disputes",
          },
          {
            id: 2,
            name: "Family Law",
            icon: "Users",
            description: "Marriage, divorce, child custody, inheritance",
          },
          {
            id: 3,
            name: "Criminal Law",
            icon: "Gavel",
            description: "Criminal defense, investigations, appeals",
          },
          {
            id: 4,
            name: "Property Law",
            icon: "HomeIcon",
            description: "Land rights, real estate, property disputes",
          },
          {
            id: 5,
            name: "Labor Law",
            icon: "Briefcase",
            description:
              "Employment contracts, workplace disputes, compensation",
          },
          {
            id: 6,
            name: "Intellectual Property",
            icon: "Shield",
            description: "Patents, trademarks, copyrights, IP protection",
          },
        ];

        setArticles(mockArticles);
        setTestimonials(mockTestimonials);
        setLegalAreas(mockLegalAreas);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        if (err.message.includes("log in")) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-rotate articles every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentArticleIndex((prevIndex) => (prevIndex + 3) % articles.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [articles]);

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case "Building":
        return <Building className="h-8 w-8 text-primary" />;
      case "Users":
        return <Users className="h-8 w-8 text-primary" />;
      case "Gavel":
        return <Gavel className="h-8 w-8 text-primary" />;
      case "HomeIcon":
        return <HomeIcon className="h-8 w-8 text-primary" />;
      case "Briefcase":
        return <Briefcase className="h-8 w-8 text-primary" />;
      case "Shield":
        return <Shield className="h-8 w-8 text-primary" />;
      default:
        return <FileText className="h-8 w-8 text-primary" />;
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Filter lawyers based on search criteria
    let results = [...allLawyers];
    
    // Filter by search query (name or specialization)
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      results = results.filter(lawyer => 
        lawyer.username?.toLowerCase().includes(query) || 
        lawyer.specialization?.some(spec => spec.toLowerCase().includes(query))
      );
    }
    
    // Filter by category
    if (selectedCategory) {
      results = results.filter(lawyer => 
        lawyer.specialization?.some(spec => 
          spec.toLowerCase() === selectedCategory.toLowerCase()
        )
      );
    }
    
    // Update state with filtered results
    setFilteredLawyers(results);
    setHasSearched(true);
    
    // Scroll to results section
    setTimeout(() => {
      document.getElementById('search-results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleNextArticles = () => {
    setCurrentArticleIndex((prev) => 
      (prev + 3 >= articles.length) ? 0 : prev + 3
    );
  };

  const handlePreviousArticles = () => {
    setCurrentArticleIndex((prev) => 
      (prev - 3 < 0) ? Math.max(0, articles.length - 3) : prev - 3
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-8">
        <p className="text-red-600">{error}</p>
        {error.includes("log in") && (
          <p className="mt-2">
            <Link to="/login" className="text-primary hover:underline">
              Click here to log in
            </Link>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-fadeIn">
      {/* Hero Section with subtle animation */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 hover:bg-blue-50 transition-colors duration-500 ease-in-out">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 animate-fadeIn">
              Find the Right Lawyer
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fadeIn" style={{animationDelay: "0.2s"}}>
              Connect with experienced lawyers for your legal needs. Get
              professional advice and representation.
            </p>

            {/* Search Form */}
            <form
              onSubmit={handleSearch}
              className="bg-card rounded-lg shadow-md p-4 md:flex items-center space-y-4 md:space-y-0 md:space-x-4 hover:shadow-lg transition-shadow duration-300 animate-fadeIn"
              style={{animationDelay: "0.4s"}}
            >
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search by legal issue or lawyer name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 bg-card text-card-foreground placeholder-muted-foreground"
                  />
                </div>
              </div>
              <div className="flex-1">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 bg-card text-card-foreground"
                >
                  <option value="">All Practice Areas</option>
                  <option value="Business Law">Business Law</option>
                  <option value="Family Law">Family Law</option>
                  <option value="Criminal Law">Criminal Law</option>
                  <option value="Property Law">Property Law</option>
                  <option value="Labor Law">Labor Law</option>
                  <option value="Intellectual Property">Intellectual Property</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-6 rounded-md transition-all duration-300 hover:shadow-md flex items-center justify-center"
              >
                <Search className="h-4 w-4 mr-2" /> Find a Lawyer
              </button>
            </form>
          </div>
        </div>
      </div>
      {/* Add this after the hero section */}
      {hasSearched && (
        <div id="search-results" className="bg-gradient-to-r from-gray-50 to-gray-100 py-16 animate-fadeIn">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground">
                Search Results
                {searchQuery && <span className="text-primary"> for "{searchQuery}"</span>}
                {selectedCategory && <span className="text-primary"> in {selectedCategory}</span>}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Found {filteredLawyers.length} lawyer{filteredLawyers.length !== 1 ? 's' : ''} matching your criteria
              </p>
              <button 
                onClick={() => {
                  setHasSearched(false);
                  setSearchQuery("");
                  setSelectedCategory("");
                }}
                className="mt-2 text-primary hover:text-primary/80 font-medium flex items-center"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Clear search
              </button>
            </div>

            {filteredLawyers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLawyers.map((lawyer, index) => (
                  <Link
                    key={lawyer._id}
                    to={`/client/lawyer/${lawyer._id}`}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden animate-fadeIn"
                    style={{animationDelay: `${0.1 + index * 0.05}s`}}
                  >
                    <div className="p-6">
                      <div className="flex items-start space-x-4">
                        <img
                          src={
                            lawyer.profile_photo
                              ? lawyer.profile_photo.includes('/')
                                ? `http://localhost:5000/${lawyer.profile_photo}`
                                : `http://localhost:5000/uploads/${lawyer.profile_photo}`
                              : "/placeholder.svg?height=80&width=80"
                          }
                          alt={lawyer.username}
                          className="h-16 w-16 rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = "/placeholder.svg?height=80&width=80";
                          }}
                        />
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {lawyer.username || "Unknown Lawyer"}
                          </h3>
                          <div className="flex items-center mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={14}
                                className={
                                  star <= (lawyer.averageRating || 0)
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }
                              />
                            ))}
                            <span className="text-xs text-gray-500 ml-1">
                              ({lawyer.ratingCount || 0})
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {lawyer.specialization?.slice(0, 3).map((spec, i) => (
                            <span 
                              key={i}
                              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                            >
                              {spec}
                            </span>
                          ))}
                          {lawyer.specialization?.length > 3 && (
                            <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded-full">
                              +{lawyer.specialization.length - 3}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600 mb-3">
                          <MapPin size={14} className="mr-1 text-gray-400" />
                          <span>{lawyer.location || "Not specified"}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Rate:</span>
                            <span className="text-primary font-bold ml-1">
                              {lawyer.hourlyRate ? `${lawyer.hourlyRate} ETB` : "Not specified"}
                            </span>
                          </div>
                          <div className={lawyer.isAvailable ? "text-green-600 text-sm font-medium" : "text-red-500 text-sm font-medium"}>
                            {lawyer.isAvailable ? "Available" : "Unavailable"}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <button className="w-full py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors duration-300 flex items-center justify-center">
                          View Profile <ArrowRight size={16} className="ml-2" />
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No lawyers found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or browse all available lawyers.
                </p>
                <Link
                  to="/client/lawyer"
                  className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
                >
                  View all lawyers <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Top Rated Lawyers with hover effect */}
      <div className="bg-muted hover:bg-blue-50 transition-colors duration-500 ease-in-out py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-foreground animate-fadeIn">
                Top Rated Lawyers
              </h2>
              <p className="mt-4 text-lg text-muted-foreground animate-fadeIn" style={{animationDelay: "0.2s"}}>
                Experienced professionals ready to help with your legal matters
              </p>
            </div>
            <Link
              to="/client/lawyer"
              className="hidden md:flex items-center text-primary hover:text-primary/80 font-medium transition duration-300 ease-in-out group animate-fadeIn"
              style={{animationDelay: "0.3s"}}
            >
              View All Lawyers <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>

          <div className="flex overflow-x-auto space-x-6 pb-6 scrollbar-thin scrollbar-thumb-primary scrollbar-track-muted">
            {topLawyers.length > 0 ? (
              topLawyers.map((lawyer, index) => (
                <Link
                  key={lawyer._id}
                  to={`/client/lawyer/${lawyer._id}`}
                  className="flex-none w-72 bg-gradient-to-b from-white to-gray-50 text-gray-800 rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out border border-gray-200 overflow-hidden group animate-fadeIn"
                  style={{animationDelay: `${0.2 + index * 0.1}s`}}
                >
                  <div className="relative">
                    {/* Background header gradient */}
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-90"></div>
                    
                    {/* Content with proper padding */}
                    <div className="relative p-5 pt-16">
                      {/* Profile photo with ring effect */}
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <div className="p-1 bg-white rounded-full shadow-lg">
                          <img
                            src={
                              lawyer.profile_photo
                                ? lawyer.profile_photo.includes('/')
                                  ? `http://localhost:5000/${lawyer.profile_photo}`
                                  : `http://localhost:5000/uploads/${lawyer.profile_photo}`
                                : "/placeholder.svg?height=80&width=80"
                            }
                            alt={lawyer.username}
                            className="h-20 w-20 rounded-full object-cover border-2 border-primary/20 group-hover:border-primary transition-all duration-300"
                            onError={(e) => {
                              console.log("Image failed to load:", e.target.src);
                              if (e.target.src.includes('/uploads/')) {
                                e.target.src = `http://localhost:5000/Uploads/${lawyer.profile_photo}`;
                              } else if (e.target.src.includes('/Uploads/')) {
                                e.target.src = `http://localhost:5000/uploads/${lawyer.profile_photo}`;
                              } else {
                                e.target.src = "/placeholder.svg?height=80&width=80";
                              }
                            }}
                          />
                        </div>
                      </div>
                      
                      {/* Name and rating - centered below photo */}
                      <div className="text-center mt-16 mb-4">
                        <h3 className="text-xl font-bold text-gray-800 group-hover:text-primary transition-colors duration-300">
                          {lawyer.username || "Unknown Lawyer"}
                        </h3>
                        <div className="flex items-center justify-center mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={16}
                              className={
                                star <= (lawyer.averageRating || 0)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                          <span className="text-xs text-gray-500 ml-1 font-medium">
                            ({lawyer.ratingCount || 0})
                          </span>
                        </div>
                      </div>
                      
                      {/* Specialization tags */}
                      <div className="flex flex-wrap justify-center gap-2 mb-4">
                        {lawyer.specialization?.slice(0, 2).map((spec, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100 shadow-sm"
                          >
                            {spec}
                          </span>
                        ))}
                        {lawyer.specialization?.length > 2 && (
                          <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded-full border border-gray-100">
                            +{lawyer.specialization.length - 2}
                          </span>
                        )}
                      </div>
                      
                      {/* Location with icon */}
                      <div className="flex items-center justify-center text-sm text-gray-600 mb-4">
                        <MapPin size={14} className="mr-1 text-gray-400" />
                        <span>{lawyer.location || "Not specified"}</span>
                      </div>
                      
                      {/* Divider */}
                      <div className="border-t border-gray-200 my-3"></div>
                      
                      {/* Rate and availability */}
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Rate:</span>
                          <span className="text-primary font-bold ml-1">
                            {lawyer.hourlyRate ? `${lawyer.hourlyRate} ETB` : "Not specified"}
                          </span>
                        </div>
                        <div className={lawyer.isAvailable ? "text-green-600 text-sm font-medium" : "text-red-500 text-sm font-medium"}>
                          {lawyer.isAvailable ? "Available" : "Unavailable"}
                        </div>
                      </div>
                      
                      {/* View profile button */}
                      <button className="w-full mt-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors duration-300 flex items-center justify-center group-hover:shadow-md">
                        View Profile <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </button>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8 w-full">
                <p className="text-muted-foreground">
                  No top-rated lawyers found.
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link
              to="/client/lawyer"
              className="inline-block border border-primary text-primary hover:bg-primary/10 font-medium py-2 px-6 rounded-md transition duration-300"
            >
              View All Lawyers
            </Link>
          </div>
        </div>
      </div>
      {/* Practice Areas with hover effects */}
      <div className="bg-background hover:bg-gray-50 transition-colors duration-500 ease-in-out py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground animate-fadeIn">
              Legal Practice Areas
            </h2>
            <p className="mt-4 text-lg text-muted-foreground animate-fadeIn" style={{animationDelay: "0.2s"}}>
              Find lawyers specialized in various areas of Ethiopian law
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {legalAreas.map((area, index) => (
              <div
                key={area.id}
                onClick={() => {
                  // Navigate to lawyer listing with the selected category
                  navigate(`/client/lawyer?category=${encodeURIComponent(area.name)}`);
                }}
                className="bg-card rounded-lg p-6 flex flex-col items-center text-center shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out animate-fadeIn cursor-pointer"
                style={{animationDelay: `${0.2 + index * 0.1}s`}}
              >
                <div className="bg-primary/10 text-primary p-4 rounded-full mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                  {getIconComponent(area.icon)}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {area.name}
                </h3>
                <p className="text-muted-foreground">{area.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works with timeline animation */}
      <div className="bg-muted hover:bg-blue-50 transition-colors duration-500 ease-in-out py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground animate-fadeIn">How It Works</h2>
            <p className="mt-4 text-lg text-muted-foreground animate-fadeIn" style={{animationDelay: "0.2s"}}>
              Simple steps to connect with the right legal professional
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gray-200">
              <div className="timeline-line h-0.5 bg-primary w-0"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="step-item relative text-center">
                <div className="timeline-dot bg-primary text-white rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4 shadow-md z-10 relative">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  1. Search
                </h3>
                <p className="text-muted-foreground">
                  Search for lawyers based on your legal needs, location, and
                  budget in Ethiopia.
                </p>
              </div>

              {/* Step 2 */}
              <div className="step-item relative text-center">
                <div className="timeline-dot bg-primary text-white rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4 shadow-md z-10 relative">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  2. Connect
                </h3>
                <p className="text-muted-foreground">
                  Review profiles, ratings, and experience before connecting
                  with your chosen lawyer.
                </p>
              </div>

              {/* Step 3 */}
              <div className="step-item relative text-center">
                <div className="timeline-dot bg-primary text-white rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4 shadow-md z-10 relative">
                  <Calendar className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  3. Consult
                </h3>
                <p className="text-muted-foreground">
                  Schedule appointments, discuss your case, and get the legal
                  help you need.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Resources with card hover effects */}
      <div className="bg-background hover:bg-purple-50 transition-colors duration-500 ease-in-out py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-foreground animate-fadeIn">
                Legal Resources
              </h2>
              <p className="mt-4 text-lg text-muted-foreground animate-fadeIn" style={{animationDelay: "0.2s"}}>
                Helpful articles and guides on Ethiopian law
              </p>
            </div>
            {/* <Link
              to="#"
              className="hidden md:flex items-center text-primary hover:text-primary/80 hover:underline font-medium transition duration-300 ease-in-out"
            >
              View All Resources <ArrowRight className="ml-2 h-5 w-5" />
            </Link> */}
          </div>

          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {articles
                .slice(currentArticleIndex, currentArticleIndex + 3)
                .map((article) => (
                  <div
                    key={article.id}
                    className="bg-card rounded-lg shadow-sm overflow-hidden hover:shadow-lg hover:scale-105 hover:bg-muted/80 transition duration-300 ease-in-out"
                  >
                    <img
                      src="/Legal.jpg"
                      alt={article.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                          {article.category}
                        </span>
                        <span className="mx-2">•</span>
                        <span>{article.readTime}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {article.excerpt}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          By {article.author} •{" "}
                          {new Date(article.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <Link
                          to="#"
                          className="text-primary hover:text-primary/80 hover:underline font-medium text-sm transition duration-300 ease-in-out"
                        >
                          Read More
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            <div className="flex justify-between mt-4">
              <button
                onClick={handlePreviousArticles}
                className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition duration-200"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={handleNextArticles}
                className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition duration-200"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link
              to="/resources"
              className="inline-block border border-primary text-primary hover:bg-primary/10 hover:underline font-medium py-2 px-6 rounded-md transition duration-200"
            >
              View All Resources
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="rotating-border bg-background hover:bg-yellow-100 transition duration-300 ease-in-out py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">
              What Our Clients Say
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Hear from people who have found legal help through our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-card rounded-lg shadow-md p-6 hover:shadow-lg hover:scale-105 hover:bg-muted/80 transition duration-300 ease-in-out"
              >
                <p className="text-muted-foreground mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <img
                    src={testimonial.imageUrl}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="rotating-border bg-muted hover:bg-orange-100 transition duration-300 ease-in-out py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary rounded-xl shadow-xl overflow-hidden hover:shadow-2xl hover:scale-102 transition duration-300 ease-in-out">
            <div className="px-6 py-12 md:p-12 text-center md:text-left md:flex md:items-center md:justify-between">
              <div className="md:flex-1">
                <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
                  Need Legal Help in Ethiopia?
                </h2>
                <p className="text-primary-foreground/80 text-lg mb-6 md:mb-0 md:pr-16">
                  Connect with experienced Ethiopian lawyers who can help with
                  your specific legal needs.
                </p>
              </div>
              <div className="md:flex-shrink-0">
                <Link
                  to="/client/lawyer"
                  className="inline-block bg-background hover:bg-muted text-foreground font-bold py-3 px-8 rounded-md shadow-md transition duration-200 hover:underline"
                >
                  Find a Lawyer Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
