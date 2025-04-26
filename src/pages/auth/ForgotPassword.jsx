import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setMessage(res.data.message);
    } catch (error) {
      setError(error.response?.data?.message || 'Request failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Forgot Password</h2>
      {message && <p className="text-green-500 text-center mb-4">{message}</p>}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <Input
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" className="w-full mt-4">Send Reset Link</Button>
      </form>
      <p className="mt-4 text-center text-gray-600">
        Back to <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
      </p>
    </div>
  );
}

export default ForgotPassword;