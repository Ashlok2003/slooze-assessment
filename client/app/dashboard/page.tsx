'use client';

import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Home, ShoppingBag, Heart, Settings, LogOut,
  MapPin, Clock, Star, Plus, Minus, Trash2, ChevronRight,
  CreditCard, Receipt, Store, Loader2, Share2, Globe, Copy, Users, Check, X
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

// --- Shared Carts GraphQL ---
const GET_SHARED_CARTS = gql`
  query GetSharedCarts {
    sharedCarts {
      id
      shareCode
      country
      createdAt
      createdBy {
        id
        name
        email
      }
      items {
        id
        quantity
        menuItem {
          id
          name
          price
        }
      }
    }
  }
`;

const CREATE_SHARED_CART = gql`
  mutation CreateSharedCart($input: CreateSharedCartInput!) {
    createSharedCart(input: $input) {
      id
      shareCode
      country
    }
  }
`;

const DELETE_SHARED_CART = gql`
  mutation DeleteSharedCart($id: String!) {
    deleteSharedCart(id: $id) {
      id
    }
  }
`;

const ADD_ITEMS_TO_SHARED_CART = gql`
  mutation AddItemsToSharedCart($input: AddItemsToSharedCartInput!) {
    addItemsToSharedCart(input: $input) {
      id
      items {
        id
        quantity
        menuItem {
          id
          name
          price
        }
      }
    }
  }
`;

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <button className={cn(
    "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all duration-200 group text-sm font-medium",
    active
      ? "bg-zinc-900 text-white shadow-sm"
      : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
  )}>
    <Icon className={cn("w-4 h-4", active ? "text-white" : "text-zinc-400 group-hover:text-zinc-600")} />
    <span>{label}</span>
  </button>
);

const CategoryPill = ({ label, active = false }: { label: string, active?: boolean }) => (
  <button className={cn(
    "px-5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border",
    active
      ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
      : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
  )}>
    {label}
  </button>
);

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email: string; role: string; country: string } | null>(null);
  const [cart, setCart] = useState<{ menuItemId: string; name: string; price: number; quantity: number }[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCountry, setShareCountry] = useState<'INDIA' | 'AMERICA'>('INDIA');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery<any>(DASHBOARD_DATA, {
    pollInterval: 5000,
  });
  const { data: sharedCartsData, refetch: refetchSharedCarts } = useQuery<any>(GET_SHARED_CARTS, {
    pollInterval: 10000,
  });
  const [createOrder, { loading: creatingOrder }] = useMutation(CREATE_ORDER);
  const [createSharedCart, { loading: creatingSharedCart }] = useMutation(CREATE_SHARED_CART);
  const [deleteSharedCart] = useMutation(DELETE_SHARED_CART);
  const [addItemsToSharedCart, { loading: addingItemsToSharedCart }] = useMutation(ADD_ITEMS_TO_SHARED_CART);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setShareCountry(parsedUser.country || 'INDIA');
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

  const handleShareCart = async () => {
    if (cart.length === 0) return;
    try {
      const result = await createSharedCart({
        variables: {
          input: {
            country: shareCountry,
            items: cart.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
          },
        },
      });
      const code = (result.data as any)?.createSharedCart?.shareCode;
      setCopiedCode(code);
      navigator.clipboard.writeText(code);
      setShowShareModal(false);
      refetchSharedCarts();
      setTimeout(() => setCopiedCode(null), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to share cart");
    }
  };

  const handleImportCart = (sharedCart: any) => {
    const newItems = sharedCart.items.map((item: any) => ({
      menuItemId: item.menuItem.id,
      name: item.menuItem.name,
      price: item.menuItem.price,
      quantity: item.quantity,
    }));
    setCart(newItems);
  };

  const handleAddToSharedCart = async (sharedCartId: string) => {
    if (cart.length === 0) return;
    try {
      await addItemsToSharedCart({
        variables: {
          input: {
            sharedCartId,
            items: cart.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
          },
        },
      });
      alert("Items added to shared cart!");
      refetchSharedCarts();
    } catch (err) {
      console.error(err);
      alert("Failed to add items to shared cart");
    }
  };

  const handleDeleteSharedCart = async (id: string) => {
    try {
      await deleteSharedCart({ variables: { id } });
      refetchSharedCarts();
    } catch (err) {
      console.error(err);
      alert("Failed to delete shared cart");
    }
  };

  if (!user) return null;

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="flex h-screen bg-zinc-50 font-sans text-zinc-900 overflow-hidden">

      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-zinc-200 p-4 z-20">
        <div className="flex items-center gap-2 mb-8 px-2 mt-2">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            S
          </div>
          <span className="text-lg font-semibold tracking-tight text-zinc-900">Slooze</span>
        </div>

        <nav className="flex-1 space-y-1">
          <SidebarItem icon={Home} label="Dashboard" active />
          <SidebarItem icon={ShoppingBag} label="Orders" />
          <SidebarItem icon={Heart} label="Favorites" />
          <SidebarItem icon={Receipt} label="Wallet" />
          <SidebarItem icon={Settings} label="Settings" />
        </nav>

        <div className="mt-auto pt-4 border-t border-zinc-100">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold border border-zinc-200 text-xs">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 truncate">{user.name || "User"}</p>
              <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              router.push('/login');
            }}
            className="flex items-center gap-2 text-xs text-red-500 hover:text-red-600 px-2 py-1.5 font-medium transition-colors hover:bg-red-50 rounded w-full"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative bg-zinc-50/50">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-zinc-200/50">
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white font-bold">S</div>
          </div>

          <div className="flex-1 max-w-sm hidden lg:block relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-100/50 border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all text-sm h-9 placeholder:text-zinc-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 rounded-full text-xs font-medium text-zinc-600 shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              {user.country === 'INDIA' ? 'Mumbai, IN' : 'New York, US'}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-6xl mx-auto space-y-8">

            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative w-full rounded-2xl bg-zinc-900 p-8 text-white overflow-hidden shadow-xl"
            >
              <div className="relative z-10 max-w-md">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-zinc-100 border border-white/10 mb-4">
                  Premium Selection
                </span>
                <h1 className="text-3xl font-bold mb-3 tracking-tight">Culinary Excellence</h1>
                <p className="text-zinc-400 mb-6 text-sm leading-relaxed max-w-sm">
                  Experience the finest dining from top-rated restaurants, delivered directly to your doorstep with priority handling.
                </p>
                <button className="bg-white text-zinc-900 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-100 transition-colors shadow-sm">
                  Explore Menu
                </button>
              </div>

              {/* Decorative Mesh */}
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 blur-3xl rounded-full"></div>
              <div className="absolute bottom-0 right-20 w-40 h-40 bg-gradient-to-tr from-blue-500/20 to-teal-500/20 blur-2xl rounded-full"></div>
            </motion.div>

            {/* Categories */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-zinc-900 tracking-tight">Categories</h2>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                <CategoryPill label="All" active />
                <CategoryPill label="Fine Dining" />
                <CategoryPill label="Asian Fusion" />
                <CategoryPill label="Gourmet Burgers" />
                <CategoryPill label="Patisserie" />
                <CategoryPill label="Organic" />
              </div>
            </div>

            {/* Restaurant Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-zinc-900 tracking-tight">Featured Restaurants</h2>
                <button className="text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors">View All</button>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map(n => <div key={n} className="h-64 bg-zinc-100 rounded-xl animate-pulse" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data?.restaurants.map((rest: any, idx: number) => (
                    <motion.div
                      key={rest.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group bg-white rounded-xl border border-zinc-200 overflow-hidden hover:border-zinc-300 hover:shadow-md transition-all duration-300 flex flex-col h-full"
                    >
                      <div className="h-32 bg-zinc-100 relative overflow-hidden group-hover:opacity-90 transition-opacity">
                        <div className={`w-full h-full bg-gradient-to-br ${idx % 2 === 0 ? 'from-zinc-100 to-zinc-200' : 'from-slate-100 to-slate-200'} flex items-center justify-center`}>
                          <Store className="w-8 h-8 text-zinc-300" />
                        </div>
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold shadow-sm border border-zinc-100 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-zinc-400" />
                          <span>25m</span>
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col">
                        <div className="mb-3">
                          <h3 className="font-semibold text-zinc-900">{rest.name}</h3>
                          <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                            <span className="flex items-center gap-0.5 text-zinc-700 font-medium">
                              <Star className="w-3 h-3 fill-zinc-700 text-zinc-700" /> 4.8
                            </span>
                            <span>•</span>
                            <span>{rest.country}</span>
                          </div>
                        </div>

                        <div className="space-y-2 mt-auto">
                          {rest.menuItems.slice(0, 2).map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 transition-colors group/item cursor-pointer" onClick={() => addToCart(item)}>
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-zinc-700">{item.name}</span>
                                <span className="text-[10px] text-zinc-500">${item.price}</span>
                              </div>
                              <button
                                className="w-6 h-6 rounded bg-white border border-zinc-200 hover:border-zinc-300 flex items-center justify-center transition-all text-zinc-600 shadow-sm"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Right Sidebar (Cart) */}
      <aside className="w-80 bg-white border-l border-zinc-200 hidden xl:flex flex-col z-20">
        <div className="p-5 border-b border-zinc-100">
          <h2 className="text-sm font-semibold text-zinc-900 mb-4 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" /> Current Order
          </h2>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[55vh] pr-1 scrollbar-thin scrollbar-thumb-zinc-200">
            <AnimatePresence mode="popLayout">
              {cart.map((item) => (
                <motion.div
                  key={item.menuItemId}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group flex flex-col gap-2 p-3 rounded-lg border border-zinc-100 hover:border-zinc-200 bg-zinc-50/50 mb-2 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-xs text-zinc-800 line-clamp-1">{item.name}</span>
                    <span className="font-semibold text-xs text-zinc-900">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2 bg-white rounded border border-zinc-200 px-1 py-0.5 shadow-sm">
                      <button onClick={() => updateQuantity(item.menuItemId, -1)} className="p-0.5 hover:bg-zinc-100 rounded text-zinc-500 disabled:opacity-50"><Minus className="w-3 h-3" /></button>
                      <span className="text-xs font-medium w-4 text-center tabular-nums">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.menuItemId, 1)} className="p-0.5 hover:bg-zinc-100 rounded text-zinc-500"><Plus className="w-3 h-3" /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.menuItemId)} className="text-zinc-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {cart.length === 0 && (
              <div className="h-48 flex flex-col items-center justify-center text-zinc-400 gap-3 border border-dashed border-zinc-200 rounded-lg bg-zinc-50/50">
                <ShoppingBag className="w-6 h-6 opacity-20" />
                <span className="text-xs">Your cart is empty</span>
              </div>
            )}
          </div>

          {/* Checkout Section */}
          <div className="mt-4 pt-4 border-t border-dashed border-zinc-200 space-y-3">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Fees</span>
              <span>$2.00</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="font-semibold text-sm text-zinc-900">Total</span>
              <span className="font-bold text-lg text-zinc-900">${(cartTotal > 0 ? cartTotal + 2 : 0).toFixed(2)}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={cart.length === 0 || creatingOrder}
              className="w-full py-2.5 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {creatingOrder ? <Loader2 className="w-4 h-4 animate-spin" /> : "Checkout"}
            </button>

            <button
              onClick={() => setShowShareModal(true)}
              disabled={cart.length === 0}
              className="w-full py-2 bg-white text-zinc-700 rounded-lg text-sm font-medium border border-zinc-200 hover:bg-zinc-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share Cart to {user?.country === 'INDIA' ? '🇮🇳 India' : '🇺🇸 America'}
            </button>

            {copiedCode && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Cart shared! Code copied: <span className="font-mono font-bold">{copiedCode}</span></span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Share Modal */}
        <AnimatePresence>
          {showShareModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => setShowShareModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl p-5 shadow-xl border border-zinc-200 w-72"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm text-zinc-900">Share Cart</h3>
                  <button onClick={() => setShowShareModal(false)} className="p-1 hover:bg-zinc-100 rounded">
                    <X className="w-4 h-4 text-zinc-400" />
                  </button>
                </div>

                <p className="text-xs text-zinc-500 mb-4">
                  Share your cart with all users in your country ({user?.country === 'INDIA' ? '🇮🇳 India' : '🇺🇸 America'})
                </p>

                <div className="mb-4 p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                  <p className="text-xs text-zinc-600 mb-1">{cart.length} items</p>
                  <p className="text-sm font-semibold">${cartTotal.toFixed(2)}</p>
                </div>

                <button
                  onClick={handleShareCart}
                  disabled={creatingSharedCart}
                  className="w-full py-2.5 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                >
                  {creatingSharedCart ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Globe className="w-4 h-4" />
                      Share with {user?.country}
                    </>
                  )}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Shared Carts Feed */}
        <div className="flex-1 bg-zinc-50 p-5 flex flex-col min-h-0 border-t border-zinc-100">
          <h3 className="font-semibold text-xs text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Users className="w-3.5 h-3.5" />
            Shared Carts in {user?.country}
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-zinc-200">
            {sharedCartsData?.sharedCarts?.length === 0 && (
              <div className="text-xs text-zinc-400 text-center py-4">No shared carts in your region</div>
            )}
            {sharedCartsData?.sharedCarts?.map((sharedCart: any) => (
              <motion.div
                key={sharedCart.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-3 rounded-lg border border-zinc-200 shadow-sm group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs font-semibold text-zinc-900">
                      {sharedCart.createdBy?.name || sharedCart.createdBy?.email?.split('@')[0]}
                    </p>
                    <p className="text-[10px] text-zinc-400">{sharedCart.items.length} items</p>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100 font-mono">
                    {sharedCart.shareCode}
                  </span>
                </div>
                <div className="flex gap-1.5 mt-2">
                  <button
                    onClick={() => handleImportCart(sharedCart)}
                    className="flex-1 py-1.5 text-[10px] font-medium bg-zinc-100 text-zinc-900 rounded hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1"
                    title="Import to my cart"
                  >
                    <Copy className="w-3 h-3" />
                    Import
                  </button>
                  <button
                    onClick={() => handleAddToSharedCart(sharedCart.id)}
                    disabled={cart.length === 0}
                    className="flex-1 py-1.5 text-[10px] font-medium bg-zinc-900 text-white rounded hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Add my cart items to this shared cart"
                  >
                    <Plus className="w-3 h-3" />
                    Add Items
                  </button>
                  {sharedCart.createdBy?.id === user?.email && (
                    <button
                      onClick={() => handleDeleteSharedCart(sharedCart.id)}
                      className="py-1.5 px-2 text-[10px] font-medium bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
