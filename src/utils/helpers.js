/**
 * Format a date string to a more readable format
 * @param {string} dateString - The date string to format
 * @returns {string} - The formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @returns {string} - The formatted currency string
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return "N/A";
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

/**
 * Check if a date is overdue (before current date)
 * @param {string} dateString - The date string to check
 * @returns {boolean} - True if the date is overdue
 */
export const isOverdue = (dateString) => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  const now = new Date();
  
  return date < now;
};

/**
 * Truncate text to a specified length
 * @param {string} text - The text to truncate
 * @param {number} length - The maximum length
 * @returns {string} - The truncated text
 */
export const truncateText = (text, length = 100) => {
  if (!text) return "";
  if (text.length <= length) return text;
  
  return text.substring(0, length) + "...";
};

/**
 * Get a color based on status
 * @param {string} status - The status
 * @returns {string} - The color class
 */
export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "posted":
    case "pending":
      return "text-amber-500";
    case "assigned":
    case "active":
    case "in progress":
      return "text-primary";
    case "completed":
    case "closed":
      return "text-green-600";
    case "cancelled":
    case "rejected":
      return "text-red-500";
    default:
      return "text-gray-500";
  }
};