


// import React, { useState, useEffect } from "react";
// import {
//   FaUserCircle,
//   FaTimes,
//   FaBoxOpen,
//   FaUsers,
//   FaChartPie,
//   FaSignOutAlt,
// } from "react-icons/fa";
// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
// import RetailersTable from "./RetailersTable";
// import ManageCustomersForm from "./ManageCustomersForm";
// import ManageProducts from "./ManageProducts";
// import ManageOrders from './ManageOrders'

// export default function WholesalerDashboard({ user }) {
//   const [activeTab, setActiveTab] = useState("analytics"); // default tab
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [analyticsData, setAnalyticsData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const token = localStorage.getItem("accesstoken");

//   useEffect(() => {
//     function handleResize() {
//       if (window.innerWidth < 640) setSidebarOpen(false);
//       else setSidebarOpen(true);
//     }
//     handleResize();
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   useEffect(() => {
//     console.log("hiii")
//     console.log("")
//     if (activeTab === "analytics") {
//       setLoading(true);
//       fetch("http://localhost:4000/api/analytics", {
//         headers: {
//             Authorization: `Bearer ${token}`
//         },
//       })
//         .then((res) => res.json())
//         .then((data) => {
//           setAnalyticsData(data);
//           console.log(data)
//           setLoading(false);
//         })
//         .catch(() => setLoading(false));
//     }
//   }, [activeTab, token]);

//   const handleLogout = () => {
//     // Remove token from localStorage
//     localStorage.removeItem("accesstoken");
//     // You can also remove other stored user data if needed
//     localStorage.removeItem("user");
    
//     // Redirect to login page or refresh the page
//     window.location.href = "/login"; // Adjust the path as needed
//     // Or if you're using React Router: navigate("/login");
//   };

//   const tabs = [
//     { id: "analytics", label: "Analytics", icon: <FaChartPie size={20} /> },
//     { id: "retailers", label: "Customer Details", icon: <FaUsers size={20} /> },
//     { id: "products", label: "Manage Products", icon: <FaBoxOpen size={20} /> },
//     { id: "customers", label: "Add Customers", icon: <FaUsers size={20} /> },
//     { id: "orders", label: "Manage Orders", icon: <FaUsers size={20} /> },
//   ];

//   // Prepare data for charts if analyticsData is available
//   const productCountsOverTime = analyticsData && analyticsData.products && Array.isArray(analyticsData.products)
//     ? analyticsData.products
//         .reduce((acc, product) => {
//           const month = new Date(product.created_at).toLocaleString("default", {
//             month: "short",
//             year: "numeric",
//           });
//           acc[month] = (acc[month] || 0) + 1;
//           return acc;
//         }, {})
//     : {};

//   const productChartData = Object.entries(productCountsOverTime).map(
//     ([month, count]) => ({ month, count })
//   );

//   const retailerCountsOverTime = analyticsData && analyticsData.retailers && Array.isArray(analyticsData.retailers)
//     ? analyticsData.retailers
//         .reduce((acc, retailer) => {
//           const month = new Date(retailer.created_at).toLocaleString("default", {
//             month: "short",
//             year: "numeric",
//           });
//           acc[month] = (acc[month] || 0) + 1;
//           return acc;
//         }, {})
//     : {};

//   const retailerChartData = Object.entries(retailerCountsOverTime).map(
//     ([month, count]) => ({ month, count })
//   );

//   return (
//     <div className="flex h-screen bg-gray-50 font-sans">
//       <button
//         onClick={() => setSidebarOpen((prev) => !prev)}
//         aria-label="Toggle sidebar"
//         className="fixed top-4 left-4 z-50 text-indigo-600 focus:outline-none"
//       >
//         <FaUserCircle size={36} />
//       </button>

//       <aside
//         className={`
//           fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 shadow-lg
//           transform transition-transform duration-300 ease-in-out
//           ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
//         `}
//       >
//         <div className="flex items-center justify-between p-6 border-b border-gray-200">
//           <h2 className="text-xl font-bold text-indigo-600 ml-15">Dashboard</h2>
//           <button
//             aria-label="Close sidebar"
//             onClick={() => setSidebarOpen(false)}
//             className="text-gray-600 hover:text-indigo-600 focus:outline-none"
//           >
//             <FaTimes size={24} />
//           </button>
//         </div>

//         <nav className="mt-6 flex flex-col space-y-1 px-4 flex-1">
//           {tabs.map(({ id, label, icon }) => (
//             <button
//               key={id}
//               onClick={() => setActiveTab(id)}
//               className={`flex items-center gap-3 px-4 py-3 rounded-md text-gray-700 hover:bg-indigo-100 transition-colors ${
//                 activeTab === id
//                   ? "bg-indigo-600 text-white font-semibold"
//                   : "font-medium"
//               }`}
//             >
//               <span className="text-lg">{icon}</span>
//               <span className="text-sm">{label}</span>
//             </button>
//           ))}
//         </nav>

//         {/* Logout Button */}
//         <div className="p-4 border-t border-gray-200">
//           <button
//             onClick={handleLogout}
//             className="flex items-center gap-3 px-4 py-3 rounded-md text-red-600 hover:bg-red-50 transition-colors w-full font-medium"
//           >
//             <FaSignOutAlt size={20} />
//             <span className="text-sm">Logout</span>
//           </button>
//         </div>
//       </aside>

//       {sidebarOpen && window.innerWidth < 640 && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-30 z-30"
//           onClick={() => setSidebarOpen(false)}
//           aria-hidden="true"
//         />
//       )}

//       <main
//         className={`flex-1 overflow-auto p-8 md:p-12 transition-all duration-300 ${
//           sidebarOpen ? "ml-72" : "ml-0"
//         }`}
//       >
//         {activeTab === "analytics" && (
//           <>
//             <h2 className="text-3xl font-bold text-indigo-600 mb-8">Analytics</h2>
//             {loading && <p>Loading...</p>}
//             {!loading && analyticsData && (
//               <>
//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
//                   <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
//                     <p className="text-gray-600 font-semibold uppercase tracking-wider text-sm">
//                       Total Retailers
//                     </p>
//                     <p className="mt-4 text-indigo-600 text-4xl font-extrabold">
//                       {analyticsData.totalRetailers || 0}
//                     </p>
//                   </div>
//                   <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
//                     <p className="text-gray-600 font-semibold uppercase tracking-wider text-sm">
//                       Total Products
//                     </p>
//                     <p className="mt-4 text-indigo-600 text-4xl font-extrabold">
//                       {analyticsData.totalProducts || 0}
//                     </p>
//                   </div>
//                   <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
//                     <p className="text-gray-600 font-semibold uppercase tracking-wider text-sm">
//                       Total Orders
//                     </p>
//                     <p className="mt-4 text-indigo-600 text-4xl font-extrabold">
//                       {analyticsData.orders || 0}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Charts */}
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                   <div className="bg-white p-6 rounded-xl shadow-md">
//                     <h3 className="text-lg font-semibold mb-4 text-indigo-600">
//                       Retailers Added Over Time
//                     </h3>
//                     <ResponsiveContainer width="100%" height={250}>
//                       <BarChart data={retailerChartData}>
//                         <XAxis dataKey="month" />
//                         <YAxis />
//                         <Tooltip />
//                         <Bar dataKey="count" fill="#6366f1" />
//                       </BarChart>
//                     </ResponsiveContainer>
//                   </div>

//                   <div className="bg-white p-6 rounded-xl shadow-md">
//                     <h3 className="text-lg font-semibold mb-4 text-indigo-600">
//                       Products Added Over Time
//                     </h3>
//                     <ResponsiveContainer width="100%" height={250}>
//                       <BarChart data={productChartData}>
//                         <XAxis dataKey="month" />
//                         <YAxis />
//                         <Tooltip />
//                         <Bar dataKey="count" fill="#6366f1" />
//                       </BarChart>
//                     </ResponsiveContainer>
//                   </div>
//                 </div>
//               </>
//             )}
//           </>
//         )}
//         {activeTab === "retailers" && (
//           <>
//             <RetailersTable />
//           </>
//         )}
//         {activeTab === "products" && (
//           <>
//             <ManageProducts />
//           </>
//         )}
//         {activeTab === "customers" && (
//           <>
//             <ManageCustomersForm />
//           </>
//         )}
//            {activeTab === "orders" && (
//           <>
//             <ManageOrders />
//           </>
//         )}
//       </main>
//     </div>
//   );
// }





import React, { useState, useEffect } from "react";
import {
  FaUserCircle,
  FaTimes,
  FaBoxOpen,
  FaUsers,
  FaChartPie,
  FaSignOutAlt,
} from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import RetailersTable from "./RetailersTable";
import ManageCustomersForm from "./ManageCustomersForm";
import ManageProducts from "./ManageProducts";
import ManageOrders from './ManageOrders'

export default function WholesalerDashboard({ user }) {
  const [activeTab, setActiveTab] = useState("analytics"); // default tab
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("accesstoken");

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 640) setSidebarOpen(false);
      else setSidebarOpen(true);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    console.log("hiii")
    console.log("")
    if (activeTab === "analytics") {
      setLoading(true);
      fetch("http://localhost:4000/api/analytics", {
        headers: {
            Authorization: `Bearer ${token}`
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setAnalyticsData(data);
          console.log(data)
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [activeTab, token]);

  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem("accesstoken");
    // You can also remove other stored user data if needed
    localStorage.removeItem("user");
    
    // Redirect to login page or refresh the page
    window.location.href = "/login"; // Adjust the path as needed
    // Or if you're using React Router: navigate("/login");
  };

  const tabs = [
    { id: "analytics", label: "Analytics", icon: <FaChartPie size={20} /> },
    { id: "retailers", label: "Customer Details", icon: <FaUsers size={20} /> },
    { id: "products", label: "Manage Products", icon: <FaBoxOpen size={20} /> },
    { id: "customers", label: "Add Customers", icon: <FaUsers size={20} /> },
    { id: "orders", label: "Manage Orders", icon: <FaUsers size={20} /> },
  ];

  // Colors for pie chart
  const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4'];

  // Prepare data for charts if analyticsData is available
  const pieChartData = analyticsData ? [
    { name: 'Retailers', value: analyticsData.totalRetailers || 0 },
    { name: 'Products', value: analyticsData.totalProducts || 0 },
    { name: 'Orders', value: analyticsData.orders || 0 }
  ] : [];

  const barChartData = analyticsData ? [
    { category: 'Retailers', count: analyticsData.totalRetailers || 0 },
    { category: 'Products', count: analyticsData.totalProducts || 0 },
    { category: 'Orders', count: analyticsData.orders || 0 }
  ] : [];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <button
        onClick={() => setSidebarOpen((prev) => !prev)}
        aria-label="Toggle sidebar"
        className="fixed top-4 left-4 z-50 text-indigo-600 focus:outline-none"
      >
        <FaUserCircle size={36} />
      </button>

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-indigo-600 ml-15">Dashboard</h2>
          <button
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="text-gray-600 hover:text-indigo-600 focus:outline-none"
          >
            <FaTimes size={24} />
          </button>
        </div>

        <nav className="mt-6 flex flex-col space-y-1 px-4 flex-1">
          {tabs.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-md text-gray-700 hover:bg-indigo-100 transition-colors ${
                activeTab === id
                  ? "bg-indigo-600 text-white font-semibold"
                  : "font-medium"
              }`}
            >
              <span className="text-lg">{icon}</span>
              <span className="text-sm">{label}</span>
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-md text-red-600 hover:bg-red-50 transition-colors w-full font-medium"
          >
            <FaSignOutAlt size={20} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && window.innerWidth < 640 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <main
        className={`flex-1 overflow-auto p-8 md:p-12 transition-all duration-300 ${
          sidebarOpen ? "ml-72" : "ml-0"
        }`}
      >
        {activeTab === "analytics" && (
          <>
            <h2 className="text-3xl font-bold text-indigo-600 mb-8">Analytics</h2>
            {loading && <p>Loading...</p>}
            {!loading && analyticsData && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
                  <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                    <p className="text-gray-600 font-semibold uppercase tracking-wider text-sm">
                      Total Retailers
                    </p>
                    <p className="mt-4 text-indigo-600 text-4xl font-extrabold">
                      {analyticsData.totalRetailers || 0}
                    </p>
                  </div>
                  <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                    <p className="text-gray-600 font-semibold uppercase tracking-wider text-sm">
                      Total Products
                    </p>
                    <p className="mt-4 text-indigo-600 text-4xl font-extrabold">
                      {analyticsData.totalProducts || 0}
                    </p>
                  </div>
                  <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                    <p className="text-gray-600 font-semibold uppercase tracking-wider text-sm">
                      Total Orders
                    </p>
                    <p className="mt-4 text-indigo-600 text-4xl font-extrabold">
                      {analyticsData.orders || 0}
                    </p>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold mb-4 text-indigo-600">
                      Distribution Overview (Pie Chart)
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold mb-4 text-indigo-600">
                      Total Counts Comparison (Bar Chart)
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={barChartData}>
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#6366f1" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
          </>
        )}
        {activeTab === "retailers" && (
          <>
            <RetailersTable />
          </>
        )}
        {activeTab === "products" && (
          <>
            <ManageProducts />
          </>
        )}
        {activeTab === "customers" && (
          <>
            <ManageCustomersForm />
          </>
        )}
           {activeTab === "orders" && (
          <>
            <ManageOrders />
          </>
        )}
      </main>
    </div>
  );
}