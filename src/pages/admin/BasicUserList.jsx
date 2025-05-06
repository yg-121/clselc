import { useState, useEffect } from "react";
import axios from "axios";

const BasicUserList = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simple fetch without any hooks
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/api/users", {
          withCredentials: true
        });
        setUsers(response.data.users || []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError("Failed to load users. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Simple delete function with window.confirm
  const handleDelete = async (userId) => {
    const confirmed = window.confirm("Are you sure you want to delete this user?");
    if (!confirmed) return;

    try {
      await axios.delete(`/api/users/${userId}`, {
        withCredentials: true
      });
      setUsers(users.filter(user => user._id !== userId));
      alert("User deleted successfully");
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert("Failed to delete user");
    }
  };

  // Simple assign reviewer function with window.confirm
  const handleAssignReviewer = async (userId) => {
    const confirmed = window.confirm("Are you sure you want to assign this user as a Legal Reviewer?");
    if (!confirmed) return;

    try {
      await axios.patch(`/api/users/${userId}/role`, { 
        role: "LegalReviewer" 
      }, {
        withCredentials: true
      });
      
      setUsers(users.map(user => 
        user._id === userId ? {...user, role: "LegalReviewer"} : user
      ));
      
      alert("User assigned as Legal Reviewer");
    } catch (err) {
      console.error("Failed to assign reviewer:", err);
      alert("Failed to assign reviewer");
    }
  };

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: "20px" }}>User Management</h1>
      
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "10px", borderBottom: "1px solid #ddd" }}>Username</th>
            <th style={{ textAlign: "left", padding: "10px", borderBottom: "1px solid #ddd" }}>Email</th>
            <th style={{ textAlign: "left", padding: "10px", borderBottom: "1px solid #ddd" }}>Role</th>
            <th style={{ textAlign: "left", padding: "10px", borderBottom: "1px solid #ddd" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: "center", padding: "10px" }}>No users found</td>
            </tr>
          ) : (
            users.map(user => (
              <tr key={user._id}>
                <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>{user.username}</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>{user.email}</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>{user.role}</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                  {user.role !== "Admin" && (
                    <button 
                      onClick={() => handleDelete(user._id)}
                      style={{ 
                        marginRight: "10px", 
                        padding: "5px 10px", 
                        background: "#f44336", 
                        color: "white", 
                        border: "none", 
                        borderRadius: "4px", 
                        cursor: "pointer" 
                      }}
                    >
                      Delete
                    </button>
                  )}
                  
                  {user.role !== "Admin" && user.role !== "LegalReviewer" && (
                    <button 
                      onClick={() => handleAssignReviewer(user._id)}
                      style={{ 
                        padding: "5px 10px", 
                        background: "#2196F3", 
                        color: "white", 
                        border: "none", 
                        borderRadius: "4px", 
                        cursor: "pointer" 
                      }}
                    >
                      Assign as Reviewer
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BasicUserList;