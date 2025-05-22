import React from "react";

const ConversationList = ({
  role,
  conversations,
  unreadChats,
  onSelectUser,
}) => {
  return (
    <div
      style={{ width: "30%", borderRight: "1px solid #ccc", padding: "10px" }}
    >
      <h3>{role === "Client" ? "Lawyers" : "Clients"}</h3>
      <ul>
        {conversations.map((user) => {
          const unreadCount = unreadChats.filter(
            (chat) => chat.sender._id === user._id
          ).length;
          return (
            <li
              key={user._id}
              onClick={() => onSelectUser(user)}
              style={{ cursor: "pointer", padding: "5px" }}
            >
              {user.username}{" "}
              {unreadCount > 0 && <span>({unreadCount} unread)</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ConversationList;
