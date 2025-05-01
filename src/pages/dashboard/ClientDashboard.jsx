import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";

export default function ClientHome() {
  const [topLawyers, setTopLawyers] = useState([]);
  const [articles, setArticles] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [legalAreas, setLegalAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    setTimeout(() => {
      const mockLawyers = [
        {
          _id: "1",
          username: "Abebe Kebede",
          specialization: ["Business Law", "Contract Law"],
          location: "Addis Ababa",
          averageRating: 4.8,
          ratingCount: 120,
          hourlyRate: 200,
        },
        {
          _id: "2",
          username: "Tigist Haile",
          specialization: ["Family Law", "Divorce"],
          location: "Adama",
          averageRating: 4.5,
          ratingCount: 95,
          hourlyRate: 180,
        },
        {
          _id: "3",
          username: "Solomon Tesfaye",
          specialization: ["Property Law", "Real Estate"],
          location: "Bahir Dar",
          averageRating: 4.7,
          ratingCount: 110,
          hourlyRate: 220,
        },
        {
          _id: "4",
          username: "Lidya Worku",
          specialization: ["Criminal Law", "Defense"],
          location: "Hawassa",
          averageRating: 4.6,
          ratingCount: 85,
          hourlyRate: 190,
        },
      ];

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
          description: "Business registration, contracts, commercial disputes",
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
          description: "Employment contracts, workplace disputes, compensation",
        },
        {
          id: 6,
          name: "Intellectual Property",
          icon: "Shield",
          description: "Patents, trademarks, copyrights, IP protection",
        },
      ];

      setTopLawyers(mockLawyers);
      setArticles(mockArticles);
      setTestimonials(mockTestimonials);
      setLegalAreas(mockLegalAreas);
      setLoading(false);
    }, 1000);
  }, []);

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case "Building":
        return <Building className="h-8 w-8" />;
      case "Users":
        return <Users className="h-8 w-8" />;
      case "Gavel":
        return <Gavel className="h-8 w-8" />;
      case "HomeIcon":
        return <HomeIcon className="h-8 w-8" />;
      case "Briefcase":
        return <Briefcase className="h-8 w-8" />;
      case "Shield":
        return <Shield className="h-8 w-8" />;
      default:
        return <FileText className="h-8 w-8" />;
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Search query:", searchQuery);
    console.log("Selected category:", selectedCategory);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              Find the Right Lawyer
            </h1>
            <p className="text-lg md:text-xl mb-8">
              Connect with experienced lawyers for your legal needs. Get
              professional advice and representation.
            </p>

            {/* Search Form */}
            <form
              onSubmit={handleSearch}
              className="bg-white rounded-lg shadow-md p-4 md:flex items-center"
            >
              <div className="flex-1 mb-4 md:mb-0 md:mr-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by legal issue or lawyer name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex-1 mb-4 md:mb-0 md:mr-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Practice Areas</option>
                  <option value="Business Law">Business Law</option>
                  <option value="Family Law">Family Law</option>
                  <option value="Criminal Law">Criminal Law</option>
                  <option value="Property Law">Property Law</option>
                  <option value="Labor Law">Labor Law</option>
                  <option value="Intellectual Property">
                    Intellectual Property
                  </option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition duration-200"
              >
                Find a Lawyer
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Practice Areas */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Legal Practice Areas
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Find lawyers specialized in various areas of Ethiopian law
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {legalAreas.map((area) => (
              <Link
                key={area.id}
                to={`/client/lawyers?category=${encodeURIComponent(area.name)}`}
                className="bg-gray-50 hover:bg-gray-100 rounded-lg p-6 transition duration-200 flex flex-col items-center text-center"
              >
                <div className="bg-blue-100 text-blue-600 p-4 rounded-full mb-4">
                  {getIconComponent(area.icon)}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {area.name}
                </h3>
                <p className="text-gray-600">{area.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Top Rated Lawyers */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Top Rated Lawyers
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Experienced professionals ready to help with your legal matters
              </p>
            </div>
            <Link
              to="/client/lawyers"
              className="hidden md:flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              View All Lawyers <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {topLawyers.map((lawyer) => (
              <div
                key={lawyer._id}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col items-center">
                    <h3 className="text-xl font-semibold text-gray-900 text-center">
                      {lawyer.username}
                    </h3>
                    <p className="text-blue-600 mb-2">
                      {lawyer.specialization.join(", ")}
                    </p>

                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(lawyer.averageRating)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 15.585l-7.07 3.715 1.35-7.865L.36 7.13l7.91-1.15L10 0l1.73 5.98 7.91 1.15-5.92 5.305 1.35 7.865z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ))}
                      <span className="ml-2 text-gray-600 text-sm">
                        {lawyer.averageRating}
                      </span>
                    </div>

                    <div className="w-full space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Location:</span>
                        <span className="text-gray-900 font-medium">
                          {lawyer.location}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Hourly Rate:</span>
                        <span className="text-gray-900 font-medium">
                          ${lawyer.hourlyRate}/hr
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Ratings:</span>
                        <span className="text-gray-900 font-medium">
                          {lawyer.ratingCount} reviews
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/client/lawyers/${lawyer._id}`}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-medium py-2 px-4 rounded-md transition duration-200"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link
              to="/client/lawyers"
              className="inline-block bg-white hover:bg-gray-100 text-blue-600 font-medium py-2 px-6 rounded-md border border-blue-600 transition duration-200"
            >
              View All Lawyers
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600">
              Simple steps to connect with the right legal professional
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                1. Search
              </h3>
              <p className="text-gray-600">
                Search for lawyers based on your legal needs, location, and
                budget in Ethiopia.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                2. Connect
              </h3>
              <p className="text-gray-600">
                Review profiles, ratings, and experience before connecting with
                your chosen lawyer.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                3. Consult
              </h3>
              <p className="text-gray-600">
                Schedule appointments, discuss your case, and get the legal help
                you need.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Resources */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Legal Resources
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Helpful articles and guides on Ethiopian law
              </p>
            </div>
            <Link
              to="/resources"
              className="hidden md:flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              View All Resources <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                      {article.category}
                    </span>
                    <span className="mx-2">•</span>
                    <span>{article.readTime}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{article.excerpt}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      By {article.author} •{" "}
                      {new Date(article.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <Link
                      to={`/resources/${article.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link
              to="/resources"
              className="inline-block bg-white hover:bg-gray-100 text-blue-600 font-medium py-2 px-6 rounded-md border border-blue-600 transition duration-200"
            >
              View All Resources
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">What Our Clients Say</h2>
            <p className="mt-4 text-lg text-blue-100">
              Hear from people who have found legal help through our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-lg shadow-md p-6 text-gray-900"
              >
                <p className="text-gray-600 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <img
                    src={testimonial.imageUrl}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-xl overflow-hidden">
            <div className="px-6 py-12 md:p-12 text-center md:text-left md:flex md:items-center md:justify-between">
              <div className="md:flex-1">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Need Legal Help in Ethiopia?
                </h2>
                <p className="text-blue-100 text-lg mb-6 md:mb-0 md:pr-16">
                  Connect with experienced Ethiopian lawyers who can help with
                  your specific legal needs.
                </p>
              </div>
              <div className="md:flex-shrink-0">
                <Link
                  to="/client/lawyers"
                  className="inline-block bg-white hover:bg-gray-100 text-blue-600 font-bold py-3 px-8 rounded-md shadow-md transition duration-200"
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
