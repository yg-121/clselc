import { useState, useEffect } from "react";
import { getSocket, connectSocket, disconnectSocket } from "../../Socket";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const userId = localStorage.getItem("userId"); // Assuming userId is stored in localStorage after login

  useEffect(() => {
    if (!userId) {
      console.error("User ID not found in localStorage");
      return;
    }

    // Connect to Socket.IO
    const socket = connectSocket(userId);

    // Listen for new_notification events
    socket.on("new_notification", (notification) => {
      console.log("Received new notification:", notification);
      setNotifications((prev) => [
        { id: Date.now(), message: notification.message },
        ...prev,
      ]);
    });

    // Cleanup on component unmount
    return () => {
      disconnectSocket();
    };
  }, [userId]);

  // Remove a notification by id
  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-green-500 text-white p-4 rounded-lg shadow-md flex justify-between items-center max-w-sm animate-fade-in"
        >
          <p className="text-sm">{notification.message}</p>
          <button
            onClick={() => removeNotification(notification.id)}
            className="ml-4 text-white hover:text-gray-200"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

// Optional: Add this to your tailwind.config.js to enable the fade-in animation
// module.exports = {
//   theme: {
//     extend: {
//       animation: {
//         "fade-in": "fadeIn 0.3s ease-in-out",
//       },
//       keyframes: {
//         fadeIn: {
//           "0%": { opacity: "0", transform: "translateY(-10px)" },
//           "100%": { opacity: "1", transform: "translateY(0)" },
//         },
//       },
//     },
//   },
// };
