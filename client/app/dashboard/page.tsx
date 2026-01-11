'use client';

import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Home, ShoppingBag, Heart, Settings, LogOut,
  MapPin, Clock, Star, Plus, Minus, Trash2, ChevronRight,
  CreditCard, LayoutGrid, Receipt
} from "lucide-react";
import { cn } from "../../lib/utils";

// --- GraphQL Queries/Mutations ---
const DASHBOARD_DATA = gql`
  query DashboardData {
    restaurants {
      id
      name
      country
      menuItems {
        id
        name
        price
      }
    }
    orders {
      id
      status
      total
      user {
        email
        country
      }
      items {
        menuItem {
          name
        }
        quantity
      }
    }
  }
`;

const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(createOrderInput: $input) {
      id
      status
      total
    }
  }
`;

const CHECKOUT_ORDER = gql`
  mutation Checkout($id: String!) {
    checkoutOrder(id: $id) {
      id
      status
    }
  }
`;

const CANCEL_ORDER = gql`
  mutation CancelOrder($id: String!) {
    cancelOrder(id: $id) {
      id
      status
    }
  }
`;

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <button className={cn(
    "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 group",
    active ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
  )}>
    <Icon className={cn("w-5 h-5", active ? "text-white" : "text-gray-400 group-hover:text-gray-600")} />
    <span className="font-medium">{label}</span>
  </button>
);

const CategoryPill = ({ label, active = false }: { label: string, active?: boolean }) => (
  <button className={cn(
    "px-6 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap",
    active
      ? "bg-gray-900 text-white shadow-md"
      : "bg-white text-gray-600 border border-gray-100 hover:border-gray-300"
  )}>
    {label}
  </button>
);

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email: string; role: string; country: string } | null>(null);
  const [cart, setCart] = useState<{ menuItemId: string; name: string; price: number; quantity: number }[]>([]);
  const { data, loading, error, refetch } = useQuery<any>(DASHBOARD_DATA, {
    pollInterval: 5000,
  });
  const [createOrder] = useMutation(CREATE_ORDER);
  const [checkoutOrder] = useMutation(CHECKOUT_ORDER);
  const [cancelOrder] = useMutation(CANCEL_ORDER);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  const addToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.id);
      if (existing) {
        return prev.map((i) => (i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.menuItemId !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => prev.map(item => {
      if (item.menuItemId === itemId) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(i => i.quantity > 0));
  }

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    try {
      await createOrder({
        variables: {
          input: { items: cart.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })) },
        },
      });
      setCart([]);
      refetch();
    } catch (err) {
      console.error(err);
      alert("Failed to place order");
    }
  };

  const handleAction = async (mutation: any, id: string) => {
    try {
      await mutation({ variables: { id } });
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  const isAdminOrManager = user.role === 'ADMIN' || user.role === 'MANAGER';
  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 p-6 z-20">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">
            F
          </div>
          <span className="text-xl font-bold tracking-tight">FoodApp</span>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem icon={Home} label="Dashboard" active />
          <SidebarItem icon={ShoppingBag} label="Orders" />
          <SidebarItem icon={Heart} label="Favorites" />
          <SidebarItem icon={Receipt} label="Wallet" />
          <SidebarItem icon={Settings} label="Settings" />
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-100">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-200 to-gray-100 flex items-center justify-center text-gray-500 font-bold border border-white shadow-sm">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{user.name || "User"}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              router.push('/login');
            }}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 px-2 font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Header (Mobile Logo + Search) */}
        <header className="h-20 flex items-center justify-between px-8 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="md:hidden flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">F</div>
          </div>

          <div className="flex-1 max-w-xl hidden md:block relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for restaurants, food..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-shadow shadow-sm text-sm"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="md:hidden w-8 h-8 rounded-full bg-gray-200"></div>
            <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors">
              <MapPin className="w-4 h-4" />
              {user.country === 'INDIA' ? 'Mumbai, India' : 'New York, USA'}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 w-full rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-blue-200"
          >
            <div className="relative z-10 max-w-lg">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-4 border border-white/10">Free Delivery</span>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">Craving something specific?</h1>
              <p className="text-blue-100 mb-8 text-lg">Order from your favorite restaurants and get 20% off your first order.</p>
              <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg">
                Order Now
              </button>
            </div>
            <div className="absolute right-0 top-0 h-full w-1/2 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
          </motion.div>

          {/* Categories */}
          <div className="mb-10 flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            <CategoryPill label="All" active />
            <CategoryPill label="Pizza" />
            <CategoryPill label="Asian" />
            <CategoryPill label="Burgers" />
            <CategoryPill label="Dessert" />
            <CategoryPill label="Vegan" />
          </div>

          {/* Restaurant Grid */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Popular Restaurants</h2>
              <button className="text-blue-600 font-semibold text-sm hover:underline">View All</button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map(n => <div key={n} className="h-64 bg-gray-200 rounded-3xl animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {data?.restaurants.map((rest: any, idx: number) => (
                  <motion.div
                    key={rest.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group bg-white rounded-3xl p-4 shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300"
                  >
                    <div className="h-40 rounded-2xl bg-gray-100 mb-4 overflow-hidden relative">
                      {/* Mock Image using gradients based on index */}
                      <div className={`w-full h-full bg-gradient-to-br ${idx % 2 === 0 ? 'from-orange-100 to-orange-50' : 'from-green-100 to-green-50'} flex items-center justify-center`}>
                        <span className="text-4xl">
                          {idx % 2 === 0 ? '🍕' : '🥗'}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>25 min</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-start mb-2 px-1">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{rest.name}</h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="font-bold text-gray-700">4.5</span>
                          <span>•</span>
                          <span>{rest.country}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mt-4">
                      {rest.menuItems.slice(0, 3).map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors group/item">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-700">{item.name}</span>
                            <span className="text-xs text-gray-400">${item.price}</span>
                          </div>
                          <button
                            onClick={() => addToCart(item)}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors text-blue-600"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Right Sidebar (Cart & Activity) */}
      <aside className="w-96 bg-white border-l border-gray-100 hidden xl:flex flex-col z-20">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">My Order</h2>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[50vh] pr-2 custom-scrollbar">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={item.menuItemId}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gray-50 p-4 rounded-2xl mb-3 border border-gray-100"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-semibold text-sm text-gray-800 line-clamp-1">{item.name}</span>
                    <span className="font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-white rounded-lg p-1 border border-gray-200">
                      <button onClick={() => updateQuantity(item.menuItemId, -1)} className="p-1 hover:bg-gray-100 rounded"><Minus className="w-3 h-3" /></button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.menuItemId, 1)} className="p-1 hover:bg-gray-100 rounded"><Plus className="w-3 h-3" /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.menuItemId)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {cart.length === 0 && (
              <div className="h-40 flex flex-col items-center justify-center text-gray-400 gap-2 border-2 border-dashed border-gray-200 rounded-2xl">
                <ShoppingBag className="w-8 h-8 opacity-20" />
                <span className="text-sm">Cart is empty</span>
              </div>
            )}
          </div>

          {/* Cart Summary */}
          {cart.length > 0 && (
            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Delivery</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-4 border-t border-gray-100">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <button
                onClick={handlePlaceOrder}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-xl hover:shadow-2xl active:scale-95 flex items-center justify-center gap-2 mt-4"
              >
                Checkout <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Recent Activity Mini-List */}
        <div className="flex-1 bg-gray-50 p-6 overflow-hidden flex flex-col">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" /> Recent Activity
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
            {data?.orders.map((order: any) => (
              <div key={order.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-900">Order #{order.id.slice(0, 4)}</span>
                  <span className="text-[10px] text-gray-400">{order.items.length} items • ${order.total}</span>
                </div>
                <div className={cn(
                  "text-[10px] font-bold px-2 py-1 rounded-full uppercase",
                  order.status === 'PAID' ? "bg-green-100 text-green-700" :
                    order.status === 'PENDING' ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                )}>
                  {order.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
