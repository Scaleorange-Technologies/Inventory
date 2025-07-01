


// import React, { useState, useEffect } from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
//   useNavigate,
// } from "react-router-dom";

// import Login from "./components/login";
// import RetailerDashboard from "./components/RetailerDashboard";

// export default function App() {
//   const [user, setUser] = useState(null);

//   // On app load, check localStorage for token and set user
//   useEffect(() => {
//     const token = localStorage.getItem("accesstoken");
//     if (token) {
//       setUser({ token });
//     }
//   }, []);

//   return (
//     <Router>
//       <Routes>
//         <Route
//           path="/"
//           element={
//             user ? (
//               <Navigate to="/retailerdashboard" replace />
//             ) : (
//               <LoginWrapper setUser={setUser} />
//             )
//           }
//         />
//         <Route
//           path="/retailerdashboard"
//           element={
//             user ? (
//               <RetailerDashboard user={user} />
//             ) : (
//               <Navigate to="/" replace />
//             )
//           }
//         />
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </Router>
//   );
// }

// // Wrapper to use useNavigate inside Login component's callback
// function LoginWrapper({ setUser }) {
//   const navigate = useNavigate();

//   return (
//     <Login
//       onLoginSuccess={(userData) => {
//         localStorage.setItem("accesstoken", userData.access_token);
//         setUser(userData);
//         navigate("/retailerdashboard", { replace: true }); // Prevent back button to login
//       }}
//     />
//   );
// }


import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import Login from "./components/login";
import RetailerDashboard from "./components/RetailerDashboard";

export default function App() {
  const [user, setUser] = useState(null);

  // On app load, check localStorage for token and set user
  useEffect(() => {
    const token = localStorage.getItem("accesstoken");
    if (token) {
      setUser({ token });
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/retailerdashboard" replace />
            ) : (
              <LoginWrapper setUser={setUser} />
            )
          }
        />
        <Route
          path="/retailerdashboard"
          element={
            user ? (
              <RetailerDashboard user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

// Wrapper to use useNavigate inside Login component's callback
function LoginWrapper({ setUser }) {
  const navigate = useNavigate();

  return (
    <Login
      onLoginSuccess={(userData) => {
        localStorage.setItem("accesstoken", userData.access_token);
        setUser(userData);
        navigate("/retailerdashboard", { replace: true });
      }}
    />
  );
}