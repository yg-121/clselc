import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Client',
    specialization: '',
    license_file: null,
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) data.append(key, formData[key]);
    });

    const result = await register(data);
    if (result.success) {
      navigate(result.user.role === 'Client' ? '/dashboard/client' :
              result.user.role === 'Lawyer' ? '/dashboard/lawyer' :
              '/admin');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Register</h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <Input
          type="email"
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <Input
          type="password"
          label="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Client">Client</option>
            <option value="Lawyer">Lawyer</option>
          </select>
        </div>
        {formData.role === 'Lawyer' && (
          <>
            <Input
              type="text"
              label="Specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
            />
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">License File (PDF/JPG/PNG)</label>
              <input
                type="file"
                name="license_file"
                accept=".pdf,.jpg,.png"
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </>
        )}
        <Button type="submit" className="w-full mt-4">Register</Button>
      </form>
      <p className="mt-4 text-center text-gray-600">
        Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
      </p>
    </div>
  );
}

export default Register;