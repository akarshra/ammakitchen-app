import React, { createContext, useContext, useState, useMemo, ReactNode, useEffect } from 'react';
import { MenuItem, MENU_ITEMS, CategoryType } from '../data/menuData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getApiBaseUrl = () => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location) {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3000';
      }
      return `http://${hostname}:3000`;
    }
    return 'http://localhost:3000';
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:3000`;
  }

  return 'https://adwait-api-3000.loca.lt';
};

export const API_BASE_URL = getApiBaseUrl();

const getHeaders = (additionalHeaders: Record<string, string> = {}) => {
  return {
    'Content-Type': 'application/json',
    'bypass-tunnel-reminder': 'true',
    ...additionalHeaders,
  };
};


export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

export interface SubscriptionCustomization {
  planId: string;
  planName: string;
  price: number;
  deliveryDays: string[];
  preference: 'Veg' | 'Non-Veg' | 'Mix';
  timeSlot: string;
  startDate: string;
  endDate: string;
  remainingDeliveries: number;
  history: {
    date: string;
    status: 'Delivered' | 'Skipped' | 'Pending';
  }[];
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  specialNotes?: string;
  customization?: SubscriptionCustomization;
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  packagingFee: number;
  total: number;
  status: 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Received';
  createdAt: string;
  deliveryAddress: string;
  paymentMethod: string;
  notes?: string;
  riderName?: string;
  rider_name?: string;
  riderPhone?: string;
  rider_phone?: string;
  payment_status?: string;
}

export interface FilterState {
  vegOnly: boolean;
  nonVegOnly: boolean;
  popularOnly: boolean;
  under150Only: boolean;
  seniorOnly: boolean;
}

interface AppContextType {
  // Cart
  cart: CartItem[];
  addToCart: (
    item: MenuItem, 
    quantity?: number, 
    specialNotes?: string, 
    customization?: SubscriptionCustomization
  ) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  getItemQuantity: (itemId: string) => number;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  deliveryFee: number;
  packagingFee: number;
  totalAmount: number;

  // Favorites
  favorites: string[];
  toggleFavorite: (itemId: string) => void;
  isFavorite: (itemId: string) => boolean;

  // Search & Filter State
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: CategoryType;
  setSelectedCategory: (cat: CategoryType) => void;
  selectedSubCategory: string;
  setSelectedSubCategory: (subCat: string) => void;
  filters: FilterState;
  toggleFilter: (filterKey: keyof FilterState) => void;
  resetFilters: () => void;
  filteredMenuItems: MenuItem[];

  // Orders
  orders: OrderItem[];
  currentOrder: OrderItem | null;
  setCurrentOrder: (order: OrderItem | null) => void;
  updateOrderStatus: (id: string, status: OrderItem['status']) => void;
  placeOrder: (deliveryAddress: string, paymentMethod: string, notes?: string, paymentStatus?: string) => OrderItem;

  // Address
  selectedAddress: string;
  setSelectedAddress: (addr: string) => void;

  // Splash / First Time Loading
  hasSeenSplash: boolean;
  setHasSeenSplash: (val: boolean) => void;

  // User Authentication
  user: User | null;
  authLoading: boolean;
  registerUser: (name: string, phone: string, email?: string) => Promise<boolean>;
  loginUser: (phone: string) => Promise<boolean>;
  logout: () => void;

  // Subscriptions
  subscriptions: SubscriptionCustomization[];
  skipSubscriptionDay: (planId: string, dateString: string) => void;

  // Elder Care Profiles
  elderProfiles: ElderProfile[];
  fetchElderProfiles: () => Promise<void>;
  addElderProfile: (profile: Omit<ElderProfile, 'id'>) => Promise<boolean>;
  deleteElderProfile: (id: string) => Promise<boolean>;

  // Meal Planner
  mealPlans: MealPlanDay[];
  fetchMealPlans: () => Promise<void>;
  swapMealPlan: (dateString: string, slot: 'Breakfast' | 'Lunch' | 'Dinner', itemId: string | null) => Promise<boolean>;
  skipMealPlan: (dateString: string, slot: 'Breakfast' | 'Lunch' | 'Dinner') => Promise<boolean>;

  // Loyalty Rewards
  loyalty: LoyaltyRewards | null;
  fetchLoyalty: () => Promise<void>;
  donateMeals: (pointsToUse: number, donationCount: number) => Promise<boolean>;
  addLoyaltyPoints: (points: number) => Promise<void>;

  // Nutrition Summary
  nutrition: NutritionSummary | null;
  fetchNutritionSummary: () => Promise<void>;
}

export interface ElderProfile {
  id: string;
  name: string;
  phone: string;
  address: string;
  dietary_restriction: 'none' | 'low-salt' | 'diabetic-friendly' | 'soft-food';
  delivery_notes?: string;
}

export interface MealPlanDay {
  id: string;
  plan_date: string;
  meal_slot: 'Breakfast' | 'Lunch' | 'Dinner';
  menu_item_id: string | null;
  dish_name?: string;
  dish_image?: string;
  status: 'Scheduled' | 'Skipped' | 'Delivered';
}

export interface LoyaltyRewards {
  points_balance: number;
  meals_donated: number;
}

export interface NutritionSummary {
  totalCalories: number;
  totalMealsOrdered: number;
  vegMealsCount: number;
  nonVegMealsCount: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  averageDailyCalories: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_ORDERS: OrderItem[] = [
  {
    id: 'ord-1020',
    orderNumber: '#AK1020',
    items: [
      {
        item: MENU_ITEMS[0], // South Indian Meals
        quantity: 2,
      },
      {
        item: MENU_ITEMS[4], // Curd Rice
        quantity: 1,
      },
    ],
    subtotal: 377,
    deliveryFee: 0,
    packagingFee: 15,
    total: 392,
    status: 'Delivered',
    createdAt: 'Yesterday, 1:15 PM',
    deliveryAddress: '42, Brindavan Road, Fairlands, Salem - 636016',
    paymentMethod: 'UPI (GPay)',
  },
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [hasSeenSplash, setHasSeenSplash] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>(['ak-south-indian-meals', 'ak-curd-rice']);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');

  const handleSetSelectedCategory = (cat: CategoryType) => {
    setSelectedCategory(cat);
    setSelectedSubCategory('All');
  };

  const [filters, setFilters] = useState<FilterState>({
    vegOnly: false,
    nonVegOnly: false,
    popularOnly: false,
    under150Only: false,
    seniorOnly: false,
  });
  const [menu, setMenu] = useState<MenuItem[]>(MENU_ITEMS);
  const [orders, setOrders] = useState<OrderItem[]>(INITIAL_ORDERS);
  const [currentOrder, setCurrentOrder] = useState<OrderItem | null>(null);
  const [selectedAddress, setSelectedAddress] = useState('12, Sarada College Road, Fairlands, Salem, Tamil Nadu');
  const [elderProfiles, setElderProfiles] = useState<ElderProfile[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlanDay[]>([]);
  const [loyalty, setLoyalty] = useState<LoyaltyRewards | null>({ points_balance: 250, meals_donated: 2 });
  const [nutrition, setNutrition] = useState<NutritionSummary | null>(null);
  const [user, setUser] = useState<User | null>({
    id: 'user-123',
    name: 'Akarsh Raj',
    phone: '9876543210',
    email: 'akarsh@test.com'
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState<SubscriptionCustomization[]>([]);

  // Check for saved session on boot
  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedSession = await AsyncStorage.getItem('amma_user_session');
        if (savedSession) {
          setUser(JSON.parse(savedSession));
        } else {
          const mockUser = {
            id: 'user-123',
            name: 'Akarsh Raj',
            phone: '9876543210',
            email: 'akarsh@test.com'
          };
          setUser(mockUser);
          await AsyncStorage.setItem('amma_user_session', JSON.stringify(mockUser));
        }

        // Load active subscriptions
        const savedSubs = await AsyncStorage.getItem('amma_active_subscriptions');
        if (savedSubs) {
          setSubscriptions(JSON.parse(savedSubs));
        }
      } catch (error) {
        console.warn('Failed to load user session/subscriptions:', error);
      } finally {
        setAuthLoading(false);
      }
    };
    loadSession();
  }, []);
  const registerUser = async (name: string, phone: string, email?: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name, phone, email }),
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        await AsyncStorage.setItem('amma_user_session', JSON.stringify(userData));
        return true;
      } else {
        const err = await response.json();
        throw new Error(err.error || 'Failed to register');
      }
    } catch (error: any) {
      alert(error.message || 'Registration failed');
      return false;
    }
  };

  const loginUser = async (phone: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ phone }),
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        await AsyncStorage.setItem('amma_user_session', JSON.stringify(userData));
        return true;
      } else {
        const err = await response.json();
        throw new Error(err.error || 'User not found');
      }
    } catch (error: any) {
      alert(error.message || 'Login failed');
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('amma_user_session');
      setUser(null);
    } catch (error) {
      console.warn('Logout session clear failed:', error);
    }
  };

  // Fetch Menu from Express backend API
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/menu?active=true`, {
          headers: getHeaders(),
        });
        if (response.ok) {
          const data = await response.json();
          const formattedData = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            subtitle: item.subtitle,
            price: parseFloat(item.price),
            originalPrice: item.original_price ? parseFloat(item.original_price) : undefined,
            rating: parseFloat(item.rating),
            reviewCount: item.review_count,
            description: item.description,
            longDescription: item.long_description,
            category: item.category,
            subCategory: item.sub_category || undefined,
            isVeg: item.is_veg,
            isPopular: item.is_popular,
            prepTime: item.prep_time,
            servingSize: item.serving_size,
            calories: item.calories,
            image: item.image,
            highlights: item.highlights || [],
            ingredients: item.ingredients || []
          }));
          setMenu(formattedData);
        }
      } catch (error) {
        console.warn('Could not connect to backend menu API, using local fallback:', error);
      }
    };
    fetchMenu();
  }, []);

  // 1. Fetch Elder Profiles
  const fetchElderProfiles = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${user.id}/elder-profiles`, {
        headers: getHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setElderProfiles(data);
      }
    } catch (error) {
      console.warn('Failed to fetch elder profiles:', error);
    }
  };

  // Add Elder Profile
  const addElderProfile = async (profile: Omit<ElderProfile, 'id'>) => {
    if (!user) return false;
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${user.id}/elder-profiles`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(profile),
      });
      if (response.ok) {
        await fetchElderProfiles();
        return true;
      }
    } catch (error) {
      console.warn('Failed to add elder profile:', error);
    }
    return false;
  };

  // Delete Elder Profile
  const deleteElderProfile = async (profileId: string) => {
    if (!user) return false;
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${user.id}/elder-profiles/${profileId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (response.ok) {
        await fetchElderProfiles();
        return true;
      }
    } catch (error) {
      console.warn('Failed to delete elder profile:', error);
    }
    return false;
  };


  // 2. Fetch Meal Plans
  const fetchMealPlans = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${user.id}/meal-planner`, {
        headers: getHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        const formatted = data.map((plan: any) => ({
          id: plan.id,
          plan_date: plan.plan_date.substring(0, 10),
          meal_slot: plan.meal_slot,
          menu_item_id: plan.menu_item_id,
          dish_name: plan.dish_name,
          dish_image: plan.dish_image,
          status: plan.status,
        }));
        setMealPlans(formatted);
      }
    } catch (error) {
      console.warn('Failed to fetch meal plans:', error);
    }
  };

  // Swap Meal Plan
  const swapMealPlan = async (date: string, slot: 'Breakfast' | 'Lunch' | 'Dinner', menuItemId: string | null) => {
    if (!user) return false;
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${user.id}/meal-planner/swap`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ date, slot, menuItemId }),
      });
      if (response.ok) {
        await fetchMealPlans();
        return true;
      }
    } catch (error) {
      console.warn('Failed to swap meal plan:', error);
    }
    return false;
  };

  // Skip Meal Plan
  const skipMealPlan = async (date: string, slot: 'Breakfast' | 'Lunch' | 'Dinner') => {
    if (!user) return false;
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${user.id}/meal-planner/skip`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ date, slot }),
      });
      if (response.ok) {
        await fetchMealPlans();
        return true;
      }
    } catch (error) {
      console.warn('Failed to skip meal plan:', error);
    }
    return false;
  };


  // 3. Fetch Loyalty Program
  const fetchLoyalty = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${user.id}/loyalty`, {
        headers: getHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setLoyalty({
          points_balance: parseInt(data.points_balance) || 0,
          meals_donated: parseInt(data.meals_donated) || 0,
        });
      }
    } catch (error) {
      console.warn('Failed to fetch loyalty data:', error);
    }
  };

  // Donate Meals
  const donateMeals = async (pointsToUse: number, donationCount: number) => {
    if (!user) return false;
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${user.id}/loyalty/donate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ pointsToUse, donationCount }),
      });
      if (response.ok) {
        await fetchLoyalty();
        return true;
      }
    } catch (error) {
      console.warn('Failed to donate meals:', error);
    }
    return false;
  };

  // Award Points
  const addLoyaltyPoints = async (points: number) => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${user.id}/loyalty/add-points`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ points }),
      });
      if (response.ok) {
        await fetchLoyalty();
      }
    } catch (error) {
      console.warn('Failed to add points:', error);
    }
  };


  // 4. Fetch Nutrition Summary
  const fetchNutritionSummary = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/nutrition/summary/${user.id}`, {
        headers: getHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setNutrition(data);
      }
    } catch (error) {
      console.warn('Failed to fetch nutrition data:', error);
    }
  };

  // Auto fetch user settings on login
  useEffect(() => {
    if (user?.id) {
      fetchElderProfiles();
      fetchMealPlans();
      fetchLoyalty();
      fetchNutritionSummary();
    }
  }, [user]);

  // Cart operations
  const addToCart = (
    item: MenuItem, 
    quantity = 1, 
    specialNotes = '', 
    customization?: SubscriptionCustomization
  ) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((ci) => {
        if (customization) {
          return ci.item.id === item.id && ci.customization?.planId === customization.planId;
        }
        return ci.item.id === item.id;
      });
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
          specialNotes: specialNotes || updated[existingIndex].specialNotes,
          customization: customization || updated[existingIndex].customization,
        };
        return updated;
      }
      return [...prev, { item, quantity, specialNotes, customization }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((ci) => (ci.item.id === itemId ? { ...ci, quantity } : ci))
    );
  };

  const getItemQuantity = (itemId: string) => {
    const found = cart.find((ci) => ci.item.id === itemId);
    return found ? found.quantity : 0;
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculations
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.item.price * item.quantity, 0),
    [cart]
  );

  const deliveryFee = useMemo(() => (subtotal === 0 ? 0 : subtotal >= 250 ? 0 : 25), [subtotal]);
  const packagingFee = useMemo(() => (subtotal === 0 ? 0 : 15), [subtotal]);
  const totalAmount = useMemo(() => subtotal + deliveryFee + packagingFee, [subtotal, deliveryFee, packagingFee]);

  // Favorites
  const toggleFavorite = (itemId: string) => {
    setFavorites((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const isFavorite = (itemId: string) => favorites.includes(itemId);

  // Filters
  const toggleFilter = (key: keyof FilterState) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const resetFilters = () => {
    setFilters({
      vegOnly: false,
      nonVegOnly: false,
      popularOnly: false,
      under150Only: false,
      seniorOnly: false,
    });
  };

  // Filtered menu
  const filteredMenuItems = useMemo(() => {
    return menu.filter((item) => {
      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      // Subcategory filter
      if (selectedSubCategory && selectedSubCategory !== 'All' && item.subCategory !== selectedSubCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesSubtitle = item.subtitle ? item.subtitle.toLowerCase().includes(query) : false;
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesIngredients = item.ingredients ? item.ingredients.some((ing) => ing.toLowerCase().includes(query)) : false;
        if (!matchesName && !matchesSubtitle && !matchesDesc && !matchesIngredients) {
          return false;
        }
      }
      // Pill filters
      if (filters.vegOnly && !item.isVeg) return false;
      if (filters.popularOnly && !item.isPopular) return false;
      if (filters.under150Only && item.price >= 150) return false;
      if (filters.seniorOnly && !item.isSeniorPick) return false;

      return true;
    });
  }, [menu, selectedCategory, selectedSubCategory, searchQuery, filters]);

  const updateOrderStatus = (id: string, status: OrderItem['status']) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === id ? { ...ord, status } : ord))
    );
    setCurrentOrder((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
  };

  // Place Order API Integration
  const placeOrder = (deliveryAddress: string, paymentMethod: string, notes?: string, paymentStatus?: string): OrderItem => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `#AK${randomSuffix}`;
    const newOrder: OrderItem = {
      id: `ord-${Date.now()}`,
      orderNumber,
      items: [...cart],
      subtotal,
      deliveryFee,
      packagingFee,
      total: totalAmount,
      status: 'Preparing',
      createdAt: 'Just now',
      deliveryAddress,
      paymentMethod,
      notes,
    };

    // Check if any cart item is a subscription and activate it!
    cart.forEach((cartItem) => {
      if (cartItem.item.category === 'Monthly Subscription' && cartItem.customization) {
        addSubscription(cartItem.customization);
      }
    });

    // Optimistically update UI
    setOrders((prev) => [newOrder, ...prev]);
    setCurrentOrder(newOrder);
    setCart([]);

    // Send HTTP Post to Node/Express backend API
    fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        userId: user?.id || 'guest-123',
        items: cart,
        subtotal,
        deliveryFee,
        packagingFee,
        total: totalAmount,
        deliveryAddress,
        paymentMethod,
        notes,
        paymentStatus,
      }),
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Server returned error placing order');
      })
      .then((serverOrder) => {
        const formattedOrder: OrderItem = {
          id: serverOrder.id,
          orderNumber: serverOrder.order_number,
          items: cart,
          subtotal: parseFloat(serverOrder.subtotal),
          deliveryFee: parseFloat(serverOrder.delivery_fee),
          packagingFee: parseFloat(serverOrder.packaging_fee),
          total: parseFloat(serverOrder.total),
          status: serverOrder.status,
          createdAt: 'Just now',
          deliveryAddress: serverOrder.delivery_address,
          paymentMethod: serverOrder.payment_method,
          notes: serverOrder.notes,
        };
        
        setOrders((prev) =>
          prev.map((ord) => (ord.id === newOrder.id ? formattedOrder : ord))
        );
        setCurrentOrder(formattedOrder);
        
        // Award loyalty points based on order total (10 points per ₹100)
        const earnedPoints = Math.round(formattedOrder.total / 10);
        addLoyaltyPoints(earnedPoints);
        
        // Update nutrition analytics dashboard
        fetchNutritionSummary();
      })
      .catch((err) => {
        console.warn('Failed to sync order with backend server:', err);
      });

    return newOrder;
  };

  const addSubscription = (customization: SubscriptionCustomization) => {
    setSubscriptions((prev) => {
      const filtered = prev.filter((sub) => sub.planId !== customization.planId);
      const updated = [customization, ...filtered];
      AsyncStorage.setItem('amma_active_subscriptions', JSON.stringify(updated)).catch((err) => {
        console.warn('Failed to save active subscription:', err);
      });
      return updated;
    });
  };

  const skipSubscriptionDay = (planId: string, dateString: string) => {
    setSubscriptions((prev) => {
      const updated = prev.map((sub) => {
        if (sub.planId !== planId) return sub;

        // Mark this date as skipped
        const updatedHistory = sub.history.map((day) => {
          if (day.date === dateString) {
            return { ...day, status: 'Skipped' as const };
          }
          return day;
        });

        // Find next valid delivery date after current end date
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentEnd = new Date(sub.endDate);
        let nextDate = new Date(currentEnd);
        
        // Find next day matching deliveryDays
        let found = false;
        while (!found) {
          nextDate.setDate(nextDate.getDate() + 1);
          const dayOfWeek = dayNames[nextDate.getDay()];
          if (sub.deliveryDays.includes(dayOfWeek)) {
            found = true;
          }
        }

        const newEndDateString = nextDate.toISOString().split('T')[0];
        const newHistoryDay = {
          date: newEndDateString,
          status: 'Pending' as const,
        };

        return {
          ...sub,
          endDate: newEndDateString,
          history: [...updatedHistory, newHistoryDay],
        };
      });

      AsyncStorage.setItem('amma_active_subscriptions', JSON.stringify(updated)).catch((err) => {
        console.warn('Failed to save updated subscriptions:', err);
      });
      return updated;
    });
  };

  return (
    <AppContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        getItemQuantity,
        clearCart,
        cartCount,
        subtotal,
        deliveryFee,
        packagingFee,
        totalAmount,
        favorites,
        toggleFavorite,
        isFavorite,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory: handleSetSelectedCategory,
        selectedSubCategory,
        setSelectedSubCategory,
        filters,
        toggleFilter,
        resetFilters,
        filteredMenuItems,
        orders,
        currentOrder,
        setCurrentOrder,
        updateOrderStatus,
        placeOrder,
        selectedAddress,
        setSelectedAddress,
        hasSeenSplash,
        setHasSeenSplash,
        user,
        authLoading,
        registerUser,
        loginUser,
        logout,
        subscriptions,
        skipSubscriptionDay,
        elderProfiles,
        fetchElderProfiles,
        addElderProfile,
        deleteElderProfile,
        mealPlans,
        fetchMealPlans,
        swapMealPlan,
        skipMealPlan,
        loyalty,
        fetchLoyalty,
        donateMeals,
        addLoyaltyPoints,
        nutrition,
        fetchNutritionSummary,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
