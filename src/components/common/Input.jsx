function Input({ type, label, className = '', ...props }) {
    return (
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">{label}</label>
        <input
          type={type}
          className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
          {...props}
        />
      </div>
    );
  }
  
  export default Input;