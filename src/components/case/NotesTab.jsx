import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Plus, Send, Paperclip, User, Clock } from "lucide-react";

const NotesTab = ({
  caseDetail,
  formatDate,
  onAddNote,
  addNoteLoading,
  addNoteError,
  addNoteSuccess,
  caseId, // Add caseId prop
}) => {
  const [newNote, setNewNote] = useState("");
  const [visibility, setVisibility] = useState("Both");
  const endOfMessagesRef = useRef(null);
  const [currentUser, setCurrentUser] = useState({});
  
  // Get user data from localStorage safely
  useEffect(() => {
    try {
      // Try to get user from localStorage
      const userStr = localStorage.getItem("user");
      if (userStr && userStr !== "undefined") {
        const parsedUser = JSON.parse(userStr);
        setCurrentUser(parsedUser);
      } else {
        // If no user in localStorage, try to get from token
        const token = localStorage.getItem("token");
        if (token) {
          // If we have a token but no user, we could potentially decode the token
          // or make an API call to get the user info
          console.log("No user data in localStorage, but token exists");
        }
      }
    } catch (error) {
      console.error("Error getting user data:", error);
    }
  }, []);

  // Scroll to bottom of messages when new notes are added
  useEffect(() => {
    scrollToBottom();
  }, [caseDetail?.notes?.length]);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found. Please log in.");
      
      // Call the API directly from the component
      const response = await fetch(
        `http://localhost:5000/api/cases/${caseId}/notes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: newNote,
            visibility: visibility,
          }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add note");
      }
      
      // Clear the input field after submission
      setNewNote("");
      
      // If onAddNote is provided, call it to refresh the case details
      if (typeof onAddNote === 'function') {
        onAddNote();
      }
    } catch (error) {
      console.error("Error adding note:", error);
      // If there's an error handler in the parent, call it
      // if (typeof onAddNoteError === 'function') {
      //   onAddNoteError(error.message);
      // }
    }
  };

  // Function to determine if a note was created by the current user
  const isCurrentUserNote = (note) => {
    if (!currentUser || !note.createdBy) return false;
    
    return note.createdBy?._id === currentUser.id || 
           note.createdBy?.id === currentUser.id;
  };

  // Function to determine if a note was created by a lawyer
  const isLawyerNote = (note) => {
    if (!note.createdBy) return false;
    return note.createdBy.role === 'Lawyer' || 
           (currentUser.role === 'Lawyer' && isCurrentUserNote(note));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden flex flex-col h-[calc(100vh-250px)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white p-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center">
          <MessageSquare className="mr-2 h-5 w-5" /> Case Notes
        </h2>
        <div className="flex items-center space-x-2">
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="bg-gray-600 text-white border-none rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-gray-400 focus:outline-none"
          >
            <option value="Both">Visible to All</option>
            <option value="Client">Client Only</option>
            <option value="Lawyer">Lawyer Only</option>
          </select>
        </div>
      </div>

      {/* Messages/Notes Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {caseDetail.notes && caseDetail.notes.length > 0 ? (
          <div className="space-y-4">
            {caseDetail.notes.map((note) => (
              <div
                key={note._id}
                className={`flex ${isLawyerNote(note) ? "justify-end" : "justify-start"}`}
              >
                {!isLawyerNote(note) && (
                  <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white self-end mr-2">
                    {note.createdBy?.username?.charAt(0) || "C"}
                  </div>
                )}
                
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isLawyerNote(note)
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-green-500 text-white rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{note.content}</p>
                  <div className="flex items-center justify-end mt-1 text-xs text-white opacity-80">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{formatDate(note.createdAt)}</span>
                    
                    {note.visibility !== "Both" && (
                      <span className="ml-2 px-1.5 py-0.5 rounded bg-black bg-opacity-20 text-white text-xs">
                        {note.visibility} Only
                      </span>
                    )}
                  </div>
                </div>
                
                {isLawyerNote(note) && (
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white self-end ml-2">
                    {note.createdBy?.username?.charAt(0) || "L"}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageSquare className="h-12 w-12 mb-2 text-gray-400" />
            <p className="text-center">No notes yet. Start the conversation!</p>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-200">
        {addNoteError && (
          <div className="mb-2 p-2 bg-red-100 text-red-600 rounded-lg text-sm">
            {addNoteError}
          </div>
        )}
        {addNoteSuccess && (
          <div className="mb-2 p-2 bg-green-100 text-green-600 rounded-lg text-sm">
            {addNoteSuccess}
          </div>
        )}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Type your note here..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={addNoteLoading}
          />
          <button
            type="submit"
            disabled={addNoteLoading || !newNote.trim()}
            className={`p-2 rounded-full ${
              addNoteLoading || !newNote.trim()
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {addNoteLoading ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotesTab;








