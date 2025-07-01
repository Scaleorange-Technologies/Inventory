


import React, { useState, useEffect } from "react";
import { Search, ShoppingCart, Phone, MapPin, Package, Star, Filter, Trash2, Plus, Minus, CheckCircle, TrendingUp, Users, DollarSign } from "lucide-react";
import MyOrders from "./MyOrders";
import { useNavigate } from 'react-router-dom';

export default function RetailerDashboard() {
    const navigate = useNavigate();

    const [wholesalers, setWholesalers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedWholesaler, setSelectedWholesaler] = useState(null);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [sortBy, setSortBy] = useState("name");
    const [showCart, setShowCart] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [localQuantities, setLocalQuantities] = useState({});
    const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard' or 'orders'
    const [cartError, setCartError] = useState("");
    const [totalOrdersCount, setTotalOrdersCount] = useState(0);
    const categories = ["All", "Vegetables", "Grains", "Oils"];
    const [stockData, setStockData] = useState({});

    // API Functions
    const fetchWholesalers = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                addNotification("Please login first", "error");
                return;
            }

            const response = await fetch('http://localhost:4000/api/my-wholesalers', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                setWholesalers(data.wholesalers);
            } else {
                addNotification("Failed to load wholesalers", "error");
            }
        } catch (error) {
            console.error('Error fetching wholesalers:', error);
            addNotification("Error loading wholesalers", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async (wholesalerId) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');

            const response = await fetch(`http://localhost:4000/api/wholesaler/${wholesalerId}/products`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                setProducts(data.products);
                console.log("Products loaded:", data.products);
            } else {
                addNotification("Failed to load products", "error");
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            addNotification("Error loading products", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchCart = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            const response = await fetch('http://localhost:4000/api/getcart', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            console.log("hii", data)
            if (data.success) {
                setCart(data.cart);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    };

    const incrementQuantity = (productId, maxStock) => {
        setLocalQuantities(prev => ({
            ...prev,
            [productId]: Math.min((prev[productId] || 0) + 1, maxStock)
        }));
    };

    const decrementQuantity = (productId) => {
        setLocalQuantities(prev => ({
            ...prev,
            [productId]: Math.max((prev[productId] || 0) - 1, 0)
        }));
    };

    // 3. Update the addToCartAPI function call:
    const handleAddToCart = (product) => {
        const localQty = localQuantities[product.id] || 0;
        if (localQty > 0) {
            addToCartAPI(product, localQty);
            // Reset local quantity after adding to cart
            setLocalQuantities(prev => ({
                ...prev,
                [product.id]: 0
            }));
        }
    };

    const addToCartAPI = async (product, quantity) => {
        console.log("Adding to cart:", product, "Quantity:", quantity);
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                addNotification("Please login first", "error");
                return;
            }

            const response = await fetch('http://localhost:4000/api/addcart', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ product, quantity })
            });

            const data = await response.json();
            console.log('Add to cart response:', data);
            if (data.success) {
                setCart(data.cart);
                // addNotification(`${product.name} added to cart!`);
            } else {
                addNotification("Failed to add to cart", "error");
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            addNotification("Error adding to cart", "error");
        }
    };

    const updateCartItemAPI = async (productId, quantity) => {
        console.log("Updating cart item:", productId, "Quantity:", quantity);
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            const response = await fetch('http://localhost:4000/api/updatecart', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId, quantity })
            });

            const data = await response.json();
            if (data.success) {
                setCart(data.cart);
                if (quantity === 0) {
                    addNotification("Item removed from cart", "info");
                }
            } else {
                addNotification("Failed to update cart", "error");
            }
        } catch (error) {
            console.error('Error updating cart:', error);
            addNotification("Error updating cart", "error");
        }
    };

    const removeFromCartAPI = async (productId) => {
        try {
            console.log("hiiii")
            const token = localStorage.getItem('accessToken');
            if (!token) return;
            console.log("removing from cart:", productId);
            const response = await fetch(`http://localhost:4000/api/removecart/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            console.log("hiiii", data)
            console.log("hee", data.cart)
            if (data.success) {
                setCart(data.cart);
                addNotification("Item removed from cart", "info");
            } else {
                addNotification("Failed to remove item", "error");
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
            addNotification("Error removing from cart", "error");
        }
    };

    const clearCartAPI = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            const response = await fetch('http://localhost:4000/api/clearcart', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                setCart([]);
                addNotification("Cart cleared", "info");
            }
        } catch (error) {
            console.error('Error clearing cart:', error);
            addNotification("Error clearing cart", "error");
        }
    };


    const handleLogout = () => {
        // Clear token from localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('accesstoken');
        // navigate('/login');
        window.location.href = "/login";
    };

   


    const placeOrder = async () => {
        console.log("Placing order with cart:", cart);
        setCartError(""); // Clear any previous errors

        if (cart.length === 0) {
            setCartError("Cart is empty");
            return;
        }

        // Fetch latest stock data before placing order
        await fetchCartItemsStock();

        // Wait a moment for stock data to update
        setTimeout(async () => {
            // Check for out-of-stock items with latest data
            const outOfStockItems = cart.filter(item => {
                const currentStock = getCurrentStockSync(item.id);
                return currentStock === 0 || item.quantity > currentStock;
            });

            if (outOfStockItems.length > 0) {
                const outOfStockNames = outOfStockItems.map(item => item.name).join(', ');
                setCartError(`Cannot place order: ${outOfStockNames} ${outOfStockItems.length === 1 ? 'is' : 'are'} out of stock `);
                return;
            }

            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    setCartError("Please login first");
                    return;
                }
                const response = await fetch('http://localhost:4000/api/place-order', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ cart })
                });

                const data = await response.json();

                if (data.success) {
                    // Clear cart state immediately
                    setCart([]);
                    setStockData({}); // Clear stock cache
                    setShowCart(false);
                    setOrderPlaced(true);
                    setCartError(""); // Clear error

                    addNotification(`Order placed successfully! Order ID: ${data.orderId} 🎉`, "success");

                    // Hide success animation after 3 seconds
                    setTimeout(() => setOrderPlaced(false), 3000);

                } else {
                    setCartError(data.message || "Failed to place order");
                }

            } catch (error) {
                console.error('Error placing order:', error);
                setCartError("Error placing order. Please try again.");
            } finally {
                setLoading(false);
            }
        }, 500); // 500ms delay to ensure stock data is updated
    };

    const handleGoToOrders = () => {
        setCurrentPage('orders');
    };

    const handleBackFromOrders = () => {
        setCurrentPage('dashboard');
    };
    const fetchOrderHistory = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            const response = await fetch('http://localhost:4000/api/my-orders', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                // You can add this to your state if you want to show order history
                console.log('Order History:', data.orders);
            }
        } catch (error) {
            console.error('Error fetching order history:', error);
        }
    };

    const fetchOrderDetails = async (orderId) => {
        try {
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
                console.log('Order Details:', data.orderDetails);
                return data.orderDetails;
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
        }
    };


    // const getCurrentStock = (productId) => {
    //     console.log("products",products)
    //     const currentProduct = products.find(p => p.id === productId);
    //     console.log("currnetProduct", currentProduct)
    //     return currentProduct ? currentProduct.stock : 0;
    // };

    const fetchTotalOrdersCount = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            const response = await fetch('http://localhost:4000/api/my-orders', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                setTotalOrdersCount(data.orders.length);
            }
        } catch (error) {
            console.error('Error fetching orders count:', error);
        }
    };


    const getCurrentStock = async (productId) => {
        // First check if we have cached stock data
        if (stockData[productId] !== undefined) {
            return stockData[productId];
        }

        try {
            const token = localStorage.getItem('accessToken');
            if (!token) return 0;

            const response = await fetch(`http://localhost:4000/api/stock/${productId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                // Update the stock cache
                setStockData(prev => ({
                    ...prev,
                    [productId]: data.stock
                }));
                return data.stock;
            }
            return 0;
        } catch (error) {
            console.error('Error fetching stock:', error);
            return 0;
        }
    };

    // Add this function to fetch stock for all cart items at once
    const fetchCartItemsStock = async () => {
        if (cart.length === 0) return;

        try {
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            const productIds = cart.map(item => item.id);

            const response = await fetch('http://localhost:4000/api/stock/multiple', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productIds })
            });

            const data = await response.json();
            if (data.success) {
                setStockData(data.stockData);
            }
        } catch (error) {
            console.error('Error fetching cart items stock:', error);
        }
    };

    // Modified version of getCurrentStock for synchronous use (uses cached data)
    const getCurrentStockSync = (productId) => {
        console.log("Fetching stock for product:", productId);
        return stockData[productId]?.stock || 0;
    };

    // Add this useEffect to fetch stock when cart changes
    useEffect(() => {
        if (cart.length > 0) {
            fetchCartItemsStock();
        }
    }, [cart]);

    useEffect(() => {
        fetchWholesalers();
        fetchCart();
        fetchTotalOrdersCount();
    }, []);

    // Load products when wholesaler is selected
    useEffect(() => {
        if (selectedWholesaler) {
            fetchProducts(selectedWholesaler.id);
        }
    }, [selectedWholesaler]);

    const addNotification = (message, type = "success") => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 3000);
    };


    const filteredProducts = products
        .filter(p => categoryFilter === "All" || p.category === categoryFilter)
        .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            switch (sortBy) {
                case "price-low": return a.price - b.price;
                case "price-high": return b.price - a.price;
                case "stock": return b.stock - a.stock;
                default: return a.name.localeCompare(b.name);
            }
        });

    // Get quantity of a product in cart
    const getProductQuantityInCart = (productId) => {
        const cartItem = cart.find(item => item.id === productId);
        return cartItem ? cartItem.quantity : 0;
    };

    // Update product quantity directly from product card
    const updateProductQuantity = (product, newQuantity) => {
        console.log('Updating quantity for:', product.name, 'to', newQuantity);

        if (newQuantity > product.stock) {
            addNotification(`Only ${product.stock} items available`, "error");
            return;
        }
        console.log("hee", product.id, newQuantity, "heee")
        updateCartItemAPI(product.id, newQuantity);
    };

    const getTotalAmount = () => {
        return cart.reduce((total, item) => {
            const discountedPrice = item.price * (1 - (item.discount || 0) / 100);
            return total + (discountedPrice * item.quantity);
        }, 0);
    };



    const handleWholesalerSelect = (wholesaler) => {
        setSelectedWholesaler(wholesaler);
        setSearchTerm("");
        setCategoryFilter("All");
        setProducts([]);
    };

    const StatCard = ({ icon, label, value, color }) => (
        <div className={`bg-gradient-to-r ${color} rounded-xl p-4 text-white shadow-lg transform hover:scale-105 transition-all duration-300`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm opacity-90">{label}</p>
                    <p className="text-2xl font-bold">{value}</p>
                </div>
                {icon}
            </div>
        </div>
    );

    const LoadingSpinner = () => (
        <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
    );


    if (currentPage === 'orders') {
        return (
            <MyOrders
                onBack={handleBackFromOrders}
                addNotification={addNotification}
            />
        );
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            {/* Notifications */}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {notifications.map(notification => (
                    <div
                        key={notification.id}
                        className={`px-4 py-2 rounded-lg shadow-lg text-white font-medium animate-pulse ${notification.type === "success" ? "bg-green-500" :
                            notification.type === "error" ? "bg-red-500" : "bg-blue-500"
                            }`}
                    >
                        {notification.message}
                    </div>
                ))}
            </div>








            <div className="bg-white shadow-xl border-b-4 border-gradient-to-r from-purple-500 to-pink-500">
                <div className="max-w-7xl mx-auto px-2 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Title - Left side on larger screens, center on mobile */}
                        {/* <div className="flex-1 flex justify-center sm:justify-start"> */}
                        <div className="flex-1 flex justify-center">

                            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                RetailHub
                            </h1>
                        </div>

                        {/* Right side buttons - Always in one line */}
                        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
                            {/* My Orders Button */}
                            <button
                                onClick={handleGoToOrders}
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2 sm:px-3 md:px-4 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                            >
                                <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden xs:inline sm:inline">Orders</span>
                                {/* <span className="xs:hidden">📦</span> */}
                            </button>

                            {/* Cart Button */}
                            <button
                                onClick={() => setShowCart(!showCart)}
                                className="relative bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 sm:p-3 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                            >
                                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                                {cart.length > 0 && (
                                    <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-6 sm:h-6 flex items-center justify-center font-bold text-[10px] sm:text-xs">
                                        {cart.length}
                                    </span>
                                )}
                            </button>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 sm:px-3 md:px-4 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                            >
                                <span className="hidden xs:inline sm:inline">Logout</span>
                                <span className="xs:hidden">🚪</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 py-8">
                {!selectedWholesaler ? (
                    <>
                        {/* Dashboard Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <StatCard
                                icon={<Users className="w-8 h-8" />}
                                label="My Wholesalers"
                                value={wholesalers.length}
                                color="from-blue-500 to-blue-600"
                            />
                            <StatCard
                                icon={<Package className="w-8 h-8" />}
                                label="Total Orders"
                                value={totalOrdersCount}
                                color="from-green-500 to-green-600"
                            />
                        </div>

                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Wholesalers</h2>

                        {loading ? (
                            <LoadingSpinner />
                        ) : wholesalers.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-xl text-gray-600">No wholesalers found</p>
                                <p className="text-gray-500">Contact wholesalers to get added to their network</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {wholesalers.map(w => (
                                    <div
                                        key={w.id}
                                        onClick={() => handleWholesalerSelect(w)}
                                        className="group cursor-pointer bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-purple-300"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
                                                {w.name}
                                            </h3>
                                            {w.verified && (
                                                <CheckCircle className="w-6 h-6 text-green-500" />
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center text-gray-600">
                                                <MapPin className="w-4 h-4 mr-2" />
                                                <span>{w.location}</span>
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <Phone className="w-4 h-4 mr-2" />
                                                <span>{w.contact}</span>
                                            </div>
                                            {w.category && (
                                                <div className="text-sm bg-purple-100 text-purple-600 px-2 py-1 rounded-full inline-block">
                                                    {w.category}
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 text-center">
                                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-full text-sm font-medium group-hover:shadow-lg transition-all">
                                                View Products →
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* Back Navigation */}
                        <button
                            onClick={() => {
                                setSelectedWholesaler(null);
                                setSearchTerm("");
                                setCategoryFilter("All");
                                setProducts([]);
                            }}
                            className="mb-6 flex items-center text-purple-600 hover:text-purple-800 font-medium transition-colors"
                        >
                            ← Back to Wholesalers
                        </button>

                        {/* Wholesaler Header */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 border-l-4 border-purple-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                        {selectedWholesaler.name}
                                    </h1>
                                    <div className="flex items-center space-x-4 text-gray-600">
                                        <div className="flex items-center">
                                            <MapPin className="w-4 h-4 mr-1" />
                                            <span>{selectedWholesaler.location}</span>
                                        </div>
                                    </div>
                                </div>
                                <a
                                    href={`tel:${selectedWholesaler.contact}`}
                                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full flex items-center space-x-2 transform hover:scale-105 transition-all duration-300"
                                >
                                    <Phone className="w-4 h-4" />
                                    {/* <span>Call Now</span> */}
                                </a>
                            </div>
                        </div>

                        {/* Filters and Search */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                                    />
                                </div>

                            </div>
                        </div>

                        {/* Products Grid */}
                        {loading ? (
                            <LoadingSpinner />
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-12">
                                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-xl text-gray-600">No products found</p>
                            </div>
                        ) : (



                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredProducts.map(product => {
                                    const quantityInCart = getProductQuantityInCart(product.id);

                                    return (
                                        <div
                                            key={product.id}
                                            className={`relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 
                  ${product.stock === 0
                                                    ? 'border-red-500 opacity-75'
                                                    : 'border-transparent hover:border-purple-300'
                                                }`}
                                        >
                                            <div className="text-center mb-4">
                                                <div className="text-4xl mb-2">{product.image}</div>
                                                <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
                                                <p className="text-sm text-gray-500">{product.unit}</p>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        {product.discount > 0 ? (
                                                            <div>
                                                                <span className="text-lg font-bold text-green-600">
                                                                    ₹{Math.round(product.price * (1 - product.discount / 100))}
                                                                </span>
                                                                <span className="text-sm text-gray-500 line-through ml-2">
                                                                    ₹{product.price}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-lg font-bold text-gray-800">₹{product.price}</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <span className={`text-sm px-2 py-1 rounded-full ${product.stock === 0 ? 'bg-red-100 text-red-600' :
                                                        product.stock > 30 ? 'bg-green-100 text-green-600' :
                                                            product.stock > 10 ? 'bg-yellow-100 text-yellow-600' :
                                                                'bg-red-100 text-red-600'
                                                        }`}>
                                                        Stock: {product.stock}
                                                    </span>
                                                    <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                                                        {product.category}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-4 space-y-2">
                                                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                                                    <button
                                                        onClick={() => decrementQuantity(product.id)}
                                                        disabled={product.stock === 0 || (localQuantities[product.id] || 0) <= 0}
                                                        className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <div className="text-center">
                                                        <span className="text-lg font-bold text-gray-800">{localQuantities[product.id] || 0}</span>
                                                        <p className="text-xs text-gray-500">quantity</p>
                                                    </div>
                                                    <button
                                                        onClick={() => incrementQuantity(product.id, product.stock)}
                                                        disabled={product.stock === 0 || (localQuantities[product.id] || 0) >= product.stock}
                                                        className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => handleAddToCart(product)}
                                                    disabled={product.stock === 0 || (localQuantities[product.id] || 0) === 0}
                                                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                                >
                                                    <ShoppingCart className="w-4 h-4" />
                                                    <span>
                                                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                {/* Shopping Cart Modal */}
                {showCart && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Shopping Cart</h2>
                                <button
                                    onClick={() => setShowCart(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>

                            {cart.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">Your cart is empty</p>
                            ) : (
                                <>

                                    <div className="space-y-4 mb-6">
                                        {cart.map(item => {
                                            console.log("cart item", item)
                                            const currentStock = getCurrentStockSync(item.id);
                                            console.log("currentStock", currentStock)
                                            const isOutOfStock = currentStock === 0;
                                            const isQuantityExceeded = item.quantity > currentStock;
                                            const hasStockIssue = isOutOfStock || isQuantityExceeded;
                                            console.log("isOutOfStock", isOutOfStock);
                                            console.log("isQuantityExceeded", isQuantityExceeded); return (
                                                <div key={item.id} className={`flex items-center justify-between border-b pb-4 rounded-lg p-2 ${hasStockIssue ? 'border-2 border-red-500 bg-red-50' : ''
                                                    }`}>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold">{item.name}</h4>
                                                        <p className="text-sm text-gray-500">{item.unit}</p>
                                                        {hasStockIssue ? (
                                                            <>
                                                            <p className="text-red-600 font-bold">Out of Stock</p>
                                                            <p className="text-xs text-gray-500">Stock: {currentStock}</p>

                                                             </>
                                                        ) : (
                                                            <>
                                                                <p className="text-green-600 font-bold">
                                                                    ₹{Math.round(item.price * (1 - (item.discount || 0) / 100))}
                                                                </p>
                                                                <p className="text-xs text-gray-500">Stock: {currentStock}</p>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => updateCartItemAPI(item.id, item.quantity - 1)}
                                                            // disabled={hasStockIssue }
                                                            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </button>
                                                        <span className="font-semibold">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateCartItemAPI(item.id, item.quantity + 1)}
                                                            disabled={hasStockIssue || item.quantity >= currentStock}
                                                            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => removeFromCartAPI(item.id)}
                                                            className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 ml-2"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>


                                    <div className="border-t pt-4">
                                        {/* Error message */}
                                        {cartError && (
                                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                                                {cartError}
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center text-xl font-bold mb-4">
                                            <span>Total: ₹{Math.round(getTotalAmount())}</span>
                                        </div>
                                        <button
                                            onClick={placeOrder}
                                            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                                        >
                                            Place Order 🎉
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Order Success Animation */}
                {orderPlaced && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-8 text-center animate-bounce">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Placed!</h2>
                            <p className="text-gray-600">Thank you for your order. We'll contact you soon!</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}