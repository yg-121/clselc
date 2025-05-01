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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function ClientHome() {
  const [topLawyers, setTopLawyers] = useState([]);
  const [articles, setArticles] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [legalAreas, setLegalAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);

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
          imageUrl: "/placeholder.svg?height=80&width=80",
        },
        {
          _id: "2",
          username: "Tigist Haile",
          specialization: ["Family Law", "Divorce"],
          location: "Adama",
          averageRating: 4.5,
          ratingCount: 95,
          hourlyRate: 180,
          imageUrl: "/placeholder.svg?height=80&width=80",
        },
        {
          _id: "3",
          username: "Solomon Tesfaye",
          specialization: ["Property Law", "Real Estate"],
          location: "Bahir Dar",
          averageRating: 4.7,
          ratingCount: 110,
          hourlyRate: 220,
          imageUrl: "/placeholder.svg?height=80&width=80",
        },
        {
          _id: "4",
          username: "Lidya Worku",
          specialization: ["Criminal Law", "Defense"],
          location: "Hawassa",
          averageRating: 4.6,
          ratingCount: 85,
          hourlyRate: 190,
          imageUrl: "/placeholder.svg?height=80&width=80",
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
    console.log("Search query:", searchQuery);
    console.log("Selected category:", selectedCategory);
  };

  const handlePreviousArticles = () => {
    setCurrentArticleIndex((prevIndex) =>
      prevIndex === 0 ? articles.length - 3 : prevIndex - 3
    );
  };

  const handleNextArticles = () => {
    setCurrentArticleIndex((prevIndex) => (prevIndex + 3) % articles.length);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="font-inter bg-background text-foreground">
      {/* Hero Section */}
      <div className="rotating-border bg-gradient-to-r from-gray-50 to-gray-100 hover:bg-blue-100 transition duration-300 ease-in-out">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Find the Right Lawyer
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Connect with experienced lawyers for your legal needs. Get
              professional advice and representation.
            </p>

            {/* Search Form */}
            <form
              onSubmit={handleSearch}
              className="bg-card rounded-lg shadow-md p-4 md:flex items-center space-y-4 md:space-y-0 md:space-x-4"
            >
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search by legal issue or lawyer name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary bg-card text-card-foreground placeholder-muted-foreground"
                  />
                </div>
              </div>
              <div className="flex-1">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary bg-card text-card-foreground"
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
                className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-6 rounded-md transition duration-200"
              >
                Find a Lawyer
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Practice Areas */}
      <div className="rotating-border bg-background hover:bg-gray-100 transition duration-300 ease-in-out py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">
              Legal Practice Areas
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Find lawyers specialized in various areas of Ethiopian law
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {legalAreas.map((area) => (
              <Link
                key={area.id}
                to={`/client/lawyers?category=${encodeURIComponent(area.name)}`}
                className="bg-card rounded-lg p-6 flex flex-col items-center text-center shadow-sm hover:shadow-lg hover:scale-105 transition duration-300 ease-in-out"
              >
                <div className="bg-primary/10 text-primary p-4 rounded-full mb-4">
                  {getIconComponent(area.icon)}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {area.name}
                </h3>
                <p className="text-muted-foreground">{area.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Top Rated Lawyers */}
      <div className="rotating-border bg-muted hover:bg-blue-100 transition duration-300 ease-in-out py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-foreground">
                Top Rated Lawyers
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Experienced professionals ready to help with your legal matters
              </p>
            </div>
            <Link
              to="/client/lawyers"
              className="hidden md:flex items-center text-primary hover:text-primary/80 hover:underline font-medium transition duration-300 ease-in-out"
            >
              View All Lawyers <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

          <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-thin scrollbar-thumb-primary scrollbar-track-muted">
            {topLawyers.map((lawyer) => (
              <Link
                key={lawyer._id}
                to={`/client/lawyers/${lawyer._id}`}
                className="flex-none w-72 bg-[#1E3A8A] text-white rounded-lg shadow-sm hover:shadow-lg hover:scale-105 transition duration-300 ease-in-out"
              >
                <div className="p-6 flex flex-col h-96">
                  <span className="text-xs uppercase text-gray-300 mb-4">
                    Lawyer Profile
                  </span>
                  <h3 className="text-lg font-semibold mb-2">
                    {lawyer.username}
                  </h3>
                  <p className="text-sm mb-4">
                    {lawyer.specialization.join(", ")} - {lawyer.location}
                  </p>
                  <p className="text-sm mb-4">
                    Rating: {lawyer.averageRating} ({lawyer.ratingCount}{" "}
                    reviews)
                  </p>
                  <p className="text-sm mb-4">
                    Hourly Rate: ${lawyer.hourlyRate}/hr
                  </p>
                  <div className="mt-auto flex justify-center">
                    <img
                      src={lawyer.imageUrl}
                      alt={lawyer.username}
                      className="h-20 w-20 rounded-full object-cover filter grayscale"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link
              to="/client/lawyers"
              className="inline-block border border-primary text-primary hover:bg-primary/10 hover:underline font-medium py-2 px-6 rounded-md transition duration-200"
            >
              View All Lawyers
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="rotating-border bg-background hover:bg-blue-100 transition duration-300 ease-in-out py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">How It Works</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Simple steps to connect with the right legal professional
            </p>
          </div>

          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="step-item relative text-center opacity-0">
                <div className="bg-gray-100 text-gray-600 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
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
              <div className="step-item relative text-center opacity-0">
                <div className="bg-gray-100 text-gray-600 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
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
              <div className="step-item relative text-center opacity-0">
                <div className="bg-gray-100 text-gray-600 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
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

      {/* Legal Resources */}
      <div className="rotating-border bg-muted hover:bg-purple-100 transition duration-300 ease-in-out py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-foreground">
                Legal Resources
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Helpful articles and guides on Ethiopian law
              </p>
            </div>
            <Link
              to="#"
              className="hidden md:flex items-center text-primary hover:text-primary/80 hover:underline font-medium transition duration-300 ease-in-out"
            >
              View All Resources <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
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
                  to="/client/lawyers"
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
