function Button({ type = 'button', className = '', children, ...props }) {
    return (
      <button
        type={type}
        className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
  
  export default Button;