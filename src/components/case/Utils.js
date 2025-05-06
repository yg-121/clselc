export const getStatusBadge = (status) => {
  switch (status?.toLowerCase()) {
    case "posted":
      return (
        <span className="px-3 py-1 text-xs text-white rounded-full bg-amber-500">
          Posted
        </span>
      );
    case "assigned":
      return (
        <span className="px-3 py-1 text-xs text-white rounded-full bg-primary">
          Assigned
        </span>
      );
    case "closed":
      return (
        <span className="px-3 py-1 text-xs text-white rounded-full bg-green-600">
          Closed
        </span>
      );
    default:
      return (
        <span className="px-3 py-1 text-xs text-white rounded-full bg-gray-500">
          Unknown
        </span>
      );
  }
};