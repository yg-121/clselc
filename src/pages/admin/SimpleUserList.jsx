import { useState, useEffect } from "react";
import { useApi } from "../../hooks/useApi";
import { toast } from "react-toastify";
import { Trash2, Shield } from "react-feather"; // Using react-feather to match the admin dashboard

const SimpleUserList = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const api = useApi();

  useEffect(() => {
    fetchUsers();
  }, [api]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/users");
      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await api.delete(`/api/users/${userId}`);
      setUsers(users.filter(user => user._id !== userId));
      toast.success("User deleted successfully");
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user");
    }
  };

  const handleAssignReviewer = async (userId) => {
    if (!window.confirm("Are you sure you want to assign this user as a Legal Reviewer?")) {
      return;
    }

    try {
      await api.patch(`/api/users/${userId}/role`, { role: "LegalReviewer" });
      
      // Update the user in the list
      setUsers(users.map(user => 
        user._id === userId ? {...user, role: "LegalReviewer"} : user
      ));
      
      toast.success("User assigned as Legal Reviewer");
    } catch (error) {
      console.error("Failed to assign reviewer:", error);
      toast.error("Failed to assign reviewer");
    }
  };

  if (isLoading) {
    return <div className="text-center p-8">Loading users...</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No users found</td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === "Admin" ? "bg-purple-100 text-purple-800" :
                      user.role === "Lawyer" ? "bg-blue-100 text-blue-800" :
                      user.role === "LegalReviewer" ? "bg-yellow-100 text-yellow-800" :
                      user.role === "Client" ? "bg-green-100 text-green-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === "Active" ? "bg-green-100 text-green-800" :
                      user.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {user.status || "Unknown"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {user.role !== "Admin" && (
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="flex items-center text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      )}
                      
                      {user.role !== "Admin" && user.role !== "LegalReviewer" && (
                        <button
                          onClick={() => handleAssignReviewer(user._id)}
                          className="flex items-center text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50"
                        >
                          <Shield className="h-4 w-4 mr-1" />
                          Assign as Reviewer
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SimpleUserList;
