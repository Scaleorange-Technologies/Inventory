// import React, { useState } from 'react';

// export default function WholesalerRegister({ onRegisterSuccess }) {
//   const [form, setForm] = useState({
//     username: '',
//     email: '',
//     phone: '',
//     location: '',
//     address: '',
//     password: '',
//     business_name: '',
//     supply_category: '',
//     territory: '',
//     referral_code: '',
//   });

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [paymentMessage, setPaymentMessage] = useState('');

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);
//     setPaymentMessage('');

//     try {
//       const response = await fetch('http://localhost:5000/api/auth/register-wholesaler', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(form),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         setError(data.error || 'Something went wrong');
//       } else {
//         setPaymentMessage(data.message || 'Registration successful');
//         // Simulate payment delay then redirect to login
//         setTimeout(() => {
//           onRegisterSuccess();
//         }, 2000);
//       }
//     } catch (err) {
//       setError('Network error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-xl mx-auto mt-10 p-6 border rounded-md shadow-md bg-white">
//       <h2 className="text-2xl font-semibold mb-6 text-center">Wholesaler Registration</h2>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         {/* User Info */}
//         <input
//           required
//           type="text"
//           name="username"
//           placeholder="Username"
//           value={form.username}
//           onChange={handleChange}
//           className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         />
//         <input
//           required
//           type="email"
//           name="email"
//           placeholder="Email"
//           value={form.email}
//           onChange={handleChange}
//           className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         />
//         <input
//           required
//           type="tel"
//           name="phone"
//           placeholder="Phone Number"
//           value={form.phone}
//           onChange={handleChange}
//           className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         />
//         <input
//           type="text"
//           name="location"
//           placeholder="Location"
//           value={form.location}
//           onChange={handleChange}
//           className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         />
//         <input
//           type="text"
//           name="address"
//           placeholder="Address"
//           value={form.address}
//           onChange={handleChange}
//           className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         />
//         <input
//           required
//           type="password"
//           name="password"
//           placeholder="Password"
//           value={form.password}
//           onChange={handleChange}
//           className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         />

//         {/* Business Info */}
//         <input
//           required
//           type="text"
//           name="business_name"
//           placeholder="Business Name"
//           value={form.business_name}
//           onChange={handleChange}
//           className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         />
//         <input
//           type="text"
//           name="supply_category"
//           placeholder="Supply Category"
//           value={form.supply_category}
//           onChange={handleChange}
//           className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         />
//         <input
//           type="text"
//           name="territory"
//           placeholder="Territory"
//           value={form.territory}
//           onChange={handleChange}
//           className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         />
//         <input
//           type="text"
//           name="referral_code"
//           placeholder="Referral Code (optional)"
//           value={form.referral_code}
//           onChange={handleChange}
//           className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         />

//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition"
//         >
//           {loading ? 'Registering...' : 'Pay ₹500 & Register'}
//         </button>

//         {error && <p className="text-red-600 mt-2">{error}</p>}
//         {paymentMessage && <p className="text-green-600 mt-2">{paymentMessage}</p>}
//       </form>
//     </div>
//   );
// }




import React, { useState } from 'react';

export default function WholesalerRegister({ onRegisterSuccess }) {
  const [form, setForm] = useState({
    username: '',
    email: '',
    phone: '',
    location: '',
    address: '',
    password: '',
    business_name: '',
    supply_category: '',
    territory: '',
    referral_code: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setPaymentMessage('');

    try {
      const response = await fetch('http://localhost:4000/api/register-wholesaler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Something went wrong');
      } else {
        setPaymentMessage(data.message || 'Registration successful');
        setTimeout(() => {
          onRegisterSuccess();
        }, 2000);
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-8 border rounded-lg shadow-lg bg-white">
      <h2 className="text-3xl font-bold mb-8 text-center text-indigo-700">Wholesaler Registration</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Username */}
        <input
          required
          type="text"
          name="username"
          placeholder="Wholesalername"
          value={form.username}
          onChange={handleChange}
          className="w-full px-5 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {/* Email */}
        <input
          required
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full px-5 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {/* Phone */}
        <input
          required
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
          className="w-full px-5 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {/* Password with eye icon */}
        <div className="relative">
          <input
            required
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-5 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute top-4 right-3 text-gray-500 hover:text-indigo-600 transition focus:outline-none"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              // Eye open icon (visible)
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              // Eye closed icon (hidden)
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.965 9.965 0 012.014-3.407m1.48-1.57A9.965 9.965 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.963 9.963 0 01-4.194 5.031M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
              </svg>
            )}
          </button>
        </div>

        {/* Business Name */}
        <input
          required
          type="text"
          name="business_name"
          placeholder="Business Name"
          value={form.business_name}
          onChange={handleChange}
          className="w-full px-5 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="text"
          name="supply_category"
          placeholder="Supply Category"
          value={form.supply_category}
          onChange={handleChange}
          className="w-full px-5 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {/* Register Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition duration-300"
        >
          {loading ? 'Registering...' : 'Register Now for ₹500'}
        </button>

        {error && <p className="text-red-600 mt-2 text-center">{error}</p>}
        {paymentMessage && <p className="text-green-600 mt-2 text-center">{paymentMessage}</p>}
        <p className="mt-4 text-center text-sm text-indigo-600 cursor-pointer hover:underline"
          onClick={onRegisterSuccess} // or create a separate handler if needed
          role="button"
          tabIndex={0}
          onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') onRegisterSuccess(); }}
        >
          Already registered? <span className="font-semibold">Login here</span>
        </p>
      </form>
    </div>
  );
}
