import React, { useState, useEffect } from 'react';
import { Search, Users, Mail, Phone, MapPin, Eye, MoreVertical, RefreshCw } from 'lucide-react';

const RetailersTable = () => {
  const [retailers, setRetailers] = useState([]);
  const [filteredRetailers, setFilteredRetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRetailer, setSelectedRetailer] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [animateCards, setAnimateCards] = useState(false);

  useEffect(() => {
    const fetchRetailers = async () => {
      const token = localStorage?.getItem?.('accesstoken');
      try {
        const response = await fetch('http://localhost:4000/api/retailers', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch retailers');
        const data = await response.json();
        setRetailers(data);
        setFilteredRetailers(data);
        // Trigger animation
        setTimeout(() => setAnimateCards(true), 100);
      } catch (error) {
        console.error(error);
        // For demo purposes when API is not available
        setRetailers([]);
        setFilteredRetailers([]);
        setTimeout(() => setAnimateCards(true), 100);
      } finally {
        setLoading(false);
      }
    };

    fetchRetailers();
  }, []);

  // Search functionality
  useEffect(() => {
    const filtered = retailers.filter(retailer =>
      retailer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      retailer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      retailer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      retailer.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRetailers(filtered);
  }, [searchTerm, retailers]);

  // Sorting functionality
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredRetailers].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setFilteredRetailers(sorted);
  };

  const refreshData = async () => {
    setLoading(true);
    setAnimateCards(false);
    // Re-fetch data
    const token = localStorage?.getItem?.('accesstoken');
    try {
      const response = await fetch('http://localhost:4000/api/retailers', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch retailers');
      const data = await response.json();
      setRetailers(data);
      setFilteredRetailers(data);
      setTimeout(() => setAnimateCards(true), 100);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mx-auto mt-2 ml-2" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <p className="text-gray-800 text-xl font-semibold">Loading Retailers Data...</p>
          <p className="text-gray-600 text-sm mt-2">Fetching latest information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 mb-8 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Retailers Dashboard</h1>
                <p className="text-gray-600">Manage your retail partners with style</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-gray-100 rounded-xl px-4 py-2 border border-gray-200">
                <span className="text-gray-800 font-semibold">{filteredRetailers.length}</span>
                <span className="text-gray-600 ml-2">Total Retailers</span>
              </div>
              <button 
                onClick={refreshData}
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl border border-gray-200 transition-all duration-300 hover:scale-105"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search retailers by name, email, phone, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        {filteredRetailers.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white border border-gray-200 rounded-3xl p-12 shadow-lg">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Retailers Found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms' : 'No retailers data available at the moment'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRetailers.map((retailer, index) => (
              <div
                key={retailer.retailer_id || index}
                className={`group bg-white border border-purple-400 hover:border-purple-400 rounded-3xl p-6 transition-all duration-500 hover:scale-105 hover:shadow-xl cursor-pointer ${
                  animateCards ? 'animate-fade-in' : 'opacity-0'
                }`}
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'forwards'
                }}
                onClick={() => setSelectedRetailer(retailer)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                      {retailer.name || 'Unnamed Retailer'}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 text-gray-600">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm truncate">{retailer.email || 'No email'}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-600">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">{retailer.phone || 'No phone'}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-600">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm truncate">{retailer.address || 'No address'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100">
                      <MoreVertical className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
                

              </div>
            ))}
          </div>
        )}

        {/* Modal for selected retailer */}
        {selectedRetailer && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedRetailer(null)}>
            <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-gray-200 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedRetailer.name}</h2>
                <p className="text-gray-600">Retailer Details</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <Mail className="w-5 h-5 text-purple-500" />
                  <span className="text-gray-800">{selectedRetailer.email}</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <Phone className="w-5 h-5 text-purple-500" />
                  <span className="text-gray-800">{selectedRetailer.phone}</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-purple-500" />
                  <span className="text-gray-800">{selectedRetailer.address}</span>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedRetailer(null)}
                className="w-full mt-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-semibold transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default RetailersTable;