


import React, { useState, useEffect } from "react";
import { Package, Phone, Users, DollarSign, ArrowLeft, Calendar, Eye, Truck, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp } from "lucide-react";

const MyOrders = ({ onBack, addNotification }) => {
    const [orders, setOrders] = useState([]);
    const [orderDetails, setOrderDetails] = useState({}); // Store details for each order
    const [expandedOrders, setExpandedOrders] = useState({}); // Track which orders are expanded
    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState({});

    // Fetch Orders Function
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            if (!token) {
                addNotification("Please login first", "error");
                return;
            }

            const response = await fetch('http://localhost:4000/api/my-orders', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                setOrders(data.orders);
                console.log("length", data.orders.length)
            } else {
                addNotification("Failed to load orders", "error");
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            addNotification("Error loading orders", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderDetails = async (orderId) => {
        try {
            setDetailsLoading(prev => ({ ...prev, [orderId]: true }));
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            const response = await fetch(`http://localhost:4000/api/order/${orderId}/details`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                setOrderDetails(prev => ({ ...prev, [orderId]: data.orderDetails }));
            } else {
                addNotification("Failed to load order details", "error");
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
            addNotification("Error loading order details", "error");
        } finally {
            setDetailsLoading(prev => ({ ...prev, [orderId]: false }));
        }
    };

    const toggleOrderDetails = async (orderId) => {
        const isExpanded = expandedOrders[orderId];
        
        if (isExpanded) {
            // Close the details
            setExpandedOrders(prev => ({ ...prev, [orderId]: false }));
        } else {
            // Open the details
            setExpandedOrders(prev => ({ ...prev, [orderId]: true }));
            
            // Fetch details if not already loaded
            if (!orderDetails[orderId]) {
                await fetchOrderDetails(orderId);
            }
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return <Clock className="w-5 h-5" />;
            case 'confirmed': 
            case 'accepted': return <CheckCircle className="w-5 h-5" />;
            case 'shipped': return <Truck className="w-5 h-5" />;
            case 'delivered': return <Package className="w-5 h-5" />;
            default: return <XCircle className="w-5 h-5" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'confirmed':
            case 'accepted': return 'bg-green-100 text-green-700 border-green-200';
            case 'shipped': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'delivered': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-red-100 text-red-700 border-red-200';
        }
    };

    const getStatusText = (status) => {
        if (!status) return 'Unknown';
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    };

    const LoadingSpinner = () => (
        <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            {/* Header */}
            <div className="bg-white shadow-xl border-b-4 border-gradient-to-r from-purple-500 to-pink-500">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={onBack}
                            className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 font-medium transition-colors bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Back to Dashboard</span>
                        </button>
                        <div className="flex-1 text-center">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                My Orders
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {loading ? (
                    <LoadingSpinner />
                ) : orders.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="bg-white rounded-3xl p-12 shadow-xl max-w-md mx-auto">
                            <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                            <h3 className="text-2xl font-bold text-gray-600 mb-4">No Orders Yet</h3>
                            <p className="text-gray-500 mb-6">Start shopping to see your orders here!</p>
                            <button
                                onClick={onBack}
                                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                            >
                                Start Shopping
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map(order => (
                            console.log("Order:", order),
                            <div
                                key={order.order_id}
                                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-purple-200"
                            >
                                {/* Order Header */}
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b border-gray-100">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                                        <div className="flex items-center space-x-4">
                                            <div className="bg-white p-3 rounded-full shadow-md">
                                                <Package className="w-8 h-8 text-purple-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-800">
                                                    Order #{order.order_id}
                                                </h3>
                                                <div className="flex items-center space-x-2 text-gray-600">
                                                    <Calendar className="w-4 h-4" />
                                                    <span className="text-sm">
                                                        {new Date(order.order_date).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center space-x-4">
                                            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border-2 font-semibold ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                <span>{getStatusText(order.status)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <Users className="w-5 h-5 text-blue-600" />
                                                <span className="text-sm font-medium text-blue-700">Wholesaler</span>
                                            </div>
                                            <p className="font-bold text-gray-800 text-lg">{order.wholesaler_name || 'N/A'}</p>
                                        </div>

                                      

                                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <span className="text-sm font-medium text-purple-700"> Total Amount</span>
                                            </div>
                                            <p className="font-bold text-2xl text-purple-600">₹{Math.round(order.total_amount || 0)}</p>
                                        </div>

                                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-xl border border-indigo-200">
                                            <button
                                                onClick={() => toggleOrderDetails(order.order_id)}
                                                disabled={detailsLoading[order.order_id]}
                                                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 px-4 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
                                            >
                                                {detailsLoading[order.order_id] ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                ) : (
                                                    <>
                                                        <Eye className="w-4 h-4" />
                                                        <span>{expandedOrders[order.order_id] ? 'Hide Details' : 'View Details'}</span>
                                                        {expandedOrders[order.order_id] ? 
                                                            <ChevronUp className="w-4 h-4" /> : 
                                                            <ChevronDown className="w-4 h-4" />
                                                        }
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Details - Expandable Section */}
                                {expandedOrders[order.order_id] && orderDetails[order.order_id] && (
                                    <div className="border-t border-gray-200 bg-gray-50 p-6">
                                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {orderDetails[order.order_id].map(item => (
                                                <div
                                                    key={item.order_detail_id}
                                                    className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow"
                                                >
                                                    <div className="text-center mb-3">
                                                        <div className="text-3xl mb-2">{item.image || '📦'}</div>
                                                        <h5 className="font-semibold text-gray-800">{item.product_name || item.name}</h5>
                                                        {item.category && (
                                                            <span className="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full">
                                                                {item.category}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600">Quantity:</span>
                                                            <span className="font-semibold">{item.quantity}</span>
                                                        </div>
                                                        
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600">Unit Price:</span>
                                                            <span className="font-semibold text-green-600">₹{item.price}</span>
                                                        </div>
                                                        
                                                        <div className="flex justify-between text-sm bg-green-50 p-2 rounded">
                                                            <span className="text-green-700 font-medium">Total:</span>
                                                            <span className="font-bold text-green-600">₹{Math.round(item.price * item.quantity)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Order Summary */}
                                        <div className="mt-6 bg-white rounded-xl p-4 border-l-4 border-purple-500">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h5 className="font-semibold text-gray-800">Order Summary</h5>
                                                    <p className="text-gray-600 text-sm">Total items: {orderDetails[order.order_id].length}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-600">Grand Total</p>
                                                    <p className="text-2xl font-bold text-purple-600">
                                                        ₹{Math.round(orderDetails[order.order_id].reduce((sum, item) => sum + (item.price * item.quantity), 0))}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;