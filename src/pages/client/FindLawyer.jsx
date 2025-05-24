import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, User, Star, MapPin, Briefcase, Clock, DollarSign } from "lucide-react";

export default function FindLawyers({ userRole }) {
  const [lawyers, setLawyers] = useState([]);
  const [filteredLawyers, setFilteredLawyers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    specialization: "",
    location: "",
    minRating: "",
    available: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Practice areas for dropdown
  const practiceAreas = [
    "Property Law", "Contract Law", "Family Law", 
    "Criminal Law", "Corporate Law"
  ];

  // Fetch lawyers data
  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token not found. Please log in.");
      
        const response = await fetch("http://localhost:5000/api/users/lawyers", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to fetch lawyers (${response.status})`);
        }

        const data = await response.json();
        console.log("Lawyers data:", data); 
        
        // Log availability status for debugging
        if (Array.isArray(data.lawyers)) {
          data.lawyers.forEach(lawyer => {
            console.log(`Lawyer ${lawyer.username} availability:`, lawyer.isAvailable, typeof lawyer.isAvailable);
          });
        }
        
        if (Array.isArray(data)) {
          setLawyers(data);
        } else if (data.lawyers && Array.isArray(data.lawyers)) {
          setLawyers(data.lawyers);
        } else {
          console.error("Unexpected data structure:", data);
          setLawyers([]);
        }
      } catch (err) {
        console.error("Error:", err);
        setError(err.message);
        if (err.message.includes("log in")) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLawyers();
  }, []);

  // Filter lawyers based on search term and filters
  useEffect(() => {
    console.log("Filtering lawyers with filters:", filters);
    console.log("Available filter is:", filters.available, typeof filters.available);
    
    const filtered = lawyers.filter((lawyer) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = (
        (lawyer.username?.toLowerCase() || "").includes(searchLower) ||
        lawyer.specialization?.some((spec) => 
          (spec?.toLowerCase() || "").includes(searchLower)
        )
      );
      
      // Apply additional filters
      const matchesSpecialization = !filters.specialization || 
        (lawyer.specialization && lawyer.specialization.includes(filters.specialization));
      
      const matchesLocation = !filters.location || 
        lawyer.location === filters.location;
      
      const matchesRating = !filters.minRating || 
        (lawyer.averageRating && lawyer.averageRating >= parseInt(filters.minRating));
      
      // Debug availability matching
      console.log(`Lawyer ${lawyer.username} isAvailable:`, lawyer.isAvailable);
      console.log(`Filter available:`, filters.available);
      console.log(`Matches availability:`, !filters.available || lawyer.isAvailable === true);
      
      const matchesAvailability = !filters.available || lawyer.isAvailable === true;
      
      return matchesSearch && matchesSpecialization && 
             matchesLocation && matchesRating && matchesAvailability;
    });
    
    console.log("Filtered lawyers:", filtered.length);
    setFilteredLawyers(filtered);
  }, [lawyers, searchTerm, filters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-8 p-6 bg-red-50 rounded-lg max-w-xl mx-auto">
        <p className="text-red-600 mb-2">{error}</p>
        {error.includes("log in") && (
          <Link to="/login" className="text-primary hover:underline">
            Click here to log in
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Find a Lawyer</h1>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Discover experienced lawyers to assist with your legal needs
        </p>
        
        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg shadow-sm p-4 mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <select
            name="specialization"
            value={filters.specialization}
            onChange={(e) => setFilters({...filters, specialization: e.target.value})}
            className="w-full p-2 rounded border"
            aria-label="Filter by specialization"
          >
            <option value="">All Specializations</option>
            {practiceAreas.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>
        
        <div>
          <select
            name="location"
            value={filters.location}
            onChange={(e) => setFilters({...filters, location: e.target.value})}
            className="w-full p-2 rounded border"
            aria-label="Filter by location"
          >
            <option value="">All Locations</option>
            
            <option value="Addis Ababa">Addis Ababa</option>
            <option value="Dire Dawa">Dire Dawa</option>
            <option value="Bahir Dar">Bahir Dar</option> 
            <option value="Hawassa">Hawassa</option>     
            <option value="Adama">Adama</option>         
            <option value="Asosa">Asosa</option>         
            <option value="Gambela">Gambela</option>     
            <option value="Jigjiga">Jigjiga</option>     
            <option value="Mekele">Mekele</option>       
            <option value="Semera">Semera</option>       
            <option value="Dessie">Dessie</option>       
            <option value="Bonga">Bonga</option> 
            <option value="Wolaita Sodo">Wolaita Sodo</option>
            <option value="Hossana">Hossana</option>                 
          </select>
        </div>
        
        <div>
          <select
            name="minRating"
            value={filters.minRating}
            onChange={(e) => setFilters({...filters, minRating: e.target.value})}
            className="w-full p-2 rounded border"
            aria-label="Filter by rating"
          >
            <option value="">Any Rating</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
          </select>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="available"
            checked={filters.available}
            onChange={(e) => setFilters({...filters, available: e.target.checked})}
            className="h-4 w-4 text-primary rounded"
          />
          <label htmlFor="available" className="ml-2 text-sm">
            Available Only
          </label>
        </div>
      </div>

      {/* Lawyers List */}
      {filteredLawyers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLawyers.map((lawyer) => (
            <div
              key={lawyer._id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md border border-gray-100 p-4 transition-all"
            >
              <div className="flex items-start mb-3">
                <img
                  src={
                    lawyer.profile_photo 
                      ? lawyer.profile_photo.includes('/')
                        ? `http://localhost:5000/${lawyer.profile_photo}`
                        : `http://localhost:5000/uploads/${lawyer.profile_photo}`
                      : "/assets/default-avatar.png" // Use a local asset instead of via.placeholder.com
                  }
                  alt={lawyer.username}
                  className="h-14 w-14 rounded-full object-cover mr-3"
                  onError={(e) => {
                    console.log("Image failed to load:", e.target.src);
                    // Try alternative paths as fallback
                    if (e.target.src.includes('/uploads/')) {
                      e.target.src = `http://localhost:5000/Uploads/${lawyer.profile_photo}`;
                    } else if (e.target.src.includes('/Uploads/')) {
                      e.target.src = `http://localhost:5000/uploads/${lawyer.profile_photo}`;
                    } else {
                      e.target.src = "/assets/default-avatar.png";
                    }
                  }}
                />
                <div>
                  <h3 className="font-semibold">{lawyer.username || "Unknown"}</h3>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < (lawyer.averageRating || 0) ? "text-yellow-400 fill-current" : "text-gray-300"}
                      />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">
                      ({lawyer.ratingCount || 0})
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1 text-sm text-gray-600 mb-3">
                <div className="flex items-center">
                  <Briefcase size={14} className="mr-2 text-primary" />
                  <span>{lawyer.specialization?.join(", ") || "Not specified"}</span>
                </div>

                <div className="flex items-center">
                  <MapPin size={14} className="mr-2 text-primary" />
                  <span>{lawyer.location || "Not specified"}</span>
                </div>
                
                <div className="flex items-center">
                  <Clock size={14} className="mr-2 text-primary" />
                  <span className={lawyer.isAvailable === true ? "text-green-600" : "text-red-500"}>
                    {lawyer.isAvailable === true ? "Available" : "Unavailable"}
                  </span>
                </div>
              
              </div>  
              <Link
                to={`/client/lawyer/${lawyer._id}`}
                className="block w-full text-center py-2 bg-primary text-white rounded hover:bg-primary/90 text-sm"
              >
                View Profile
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No lawyers found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
