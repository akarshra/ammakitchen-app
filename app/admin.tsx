import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '../constants/theme';
import { useApp, OrderItem, API_BASE_URL } from '../context/AppContext';
import { 
  ArrowLeft, Check, Flame, Truck, CheckCircle2, ShieldCheck, 
  RefreshCw, ExternalLink, Award, Heart, Users, Plus, Edit2, Ticket, X, Info
} from 'lucide-react-native';
import io from 'socket.io-client';

const getHeaders = (additionalHeaders: Record<string, string> = {}) => ({
  'Content-Type': 'application/json',
  'bypass-tunnel-reminder': 'true',
  ...additionalHeaders,
});

type TabType = 'orders' | 'menu' | 'crm' | 'coupons';
type OrderStatusType = 'Received' | 'Preparing' | 'Out for Delivery' | 'Delivered';

export default function AdminScreen() {
  const router = useRouter();
  const { updateOrderStatus } = useApp();
  
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatusType>('Received');
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  // CRM State
  const [crmStats, setCrmStats] = useState<any>(null);
  const [crmUsers, setCrmUsers] = useState<any[]>([]);
  const [crmElders, setCrmElders] = useState<any[]>([]);
  const [loadingCrm, setLoadingCrm] = useState(false);
  const [crmSubTab, setCrmSubTab] = useState<'users' | 'elders'>('users');

  // Modals state
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<any>(null);
  const [menuForm, setMenuForm] = useState({
    name: '',
    subtitle: '',
    price: '',
    original_price: '',
    category: 'Traditional Specials',
    is_veg: true,
    is_popular: false,
    prep_time: '15 mins',
    serving_size: 'Serves 1',
    calories: '320 kcal',
    description: '',
    long_description: '',
    image: '',
  });

  const [couponModalVisible, setCouponModalVisible] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount_value: '',
    discount_type: 'fixed' as 'fixed' | 'percent',
  });

  const [dietModalVisible, setDietModalVisible] = useState(false);
  const [selectedElder, setSelectedElder] = useState<any>(null);
  const [dietForm, setDietForm] = useState({
    dietary_restriction: 'none',
    delivery_notes: '',
  });

  // Fetch all orders from backend
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: getHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.warn('Error loading orders in admin panel:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch all menu items (including sold-out ones)
  const fetchMenu = async () => {
    setLoadingMenu(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/menu`, {
        headers: getHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data);
      }
    } catch (error) {
      console.warn('Error loading menu in admin panel:', error);
    } finally {
      setLoadingMenu(false);
    }
  };

  // Fetch CRM stats, users, and senior profiles
  const fetchCrmData = async () => {
    setLoadingCrm(true);
    try {
      const statsRes = await fetch(`${API_BASE_URL}/api/crm/stats`, { headers: getHeaders() });
      if (statsRes.ok) setCrmStats(await statsRes.json());

      const usersRes = await fetch(`${API_BASE_URL}/api/crm/users`, { headers: getHeaders() });
      if (usersRes.ok) setCrmUsers(await usersRes.json());

      const eldersRes = await fetch(`${API_BASE_URL}/api/crm/elder-profiles`, { headers: getHeaders() });
      if (eldersRes.ok) setCrmElders(await eldersRes.json());
    } catch (error) {
      console.warn('Error loading CRM data in admin panel:', error);
    } finally {
      setLoadingCrm(false);
    }
  };

  // Fetch coupons list
  const fetchCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/coupons`, {
        headers: getHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setCoupons(data);
      }
    } catch (error) {
      console.warn('Error fetching coupons in admin:', error);
    } finally {
      setLoadingCoupons(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchMenu();
    fetchCrmData();
    fetchCoupons();
  }, []);

  // WebSockets for live status updates in admin console
  useEffect(() => {
    const socket = io(API_BASE_URL);

    socket.on('connect', () => {
      console.log('Admin socket connected');
    });

    socket.on('new_order', (newOrder) => {
      setOrders((prev) => [newOrder, ...prev]);
    });

    socket.on('order_status_update', (data) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === data.id ? { ...o, status: data.status } : o))
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatusType) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status: nextStatus }),
      });

      if (response.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
        );
        updateOrderStatus(orderId, nextStatus);
      } else {
        Alert.alert('Error', 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error modifying status:', error);
      Alert.alert('Error', 'Server connection timed out');
    }
  };

  const handleToggleAvailability = async (itemId: string, isAvailable: boolean) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/menu/${itemId}/availability`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ isAvailable }),
      });

      if (response.ok) {
        setMenuItems((prev) =>
          prev.map((item) => (item.id === itemId ? { ...item, is_available: isAvailable } : item))
        );
      } else {
        Alert.alert('Error', 'Failed to modify availability');
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
      Alert.alert('Error', 'Server connection timed out');
    }
  };

  const handleAdjustPoints = async (userId: string, points: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/loyalty/add-points`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ points }),
      });
      if (response.ok) {
        fetchCrmData();
        Alert.alert('Points Adjusted', `Adjusted loyalty points balance by ${points > 0 ? '+' : ''}${points} points.`);
      } else {
        Alert.alert('Error', 'Failed to adjust points balance');
      }
    } catch (error) {
      console.error('Error adjusting points in admin console:', error);
      Alert.alert('Error', 'Server connection timed out');
    }
  };

  // Create or Update Menu Item
  const handleSaveMenuItem = async () => {
    if (!menuForm.name || !menuForm.price || !menuForm.category) {
      Alert.alert('Required Fields', 'Name, Price and Category are required.');
      return;
    }

    try {
      const isEdit = !!editingMenuItem;
      const url = isEdit 
        ? `${API_BASE_URL}/api/menu/${editingMenuItem.id}`
        : `${API_BASE_URL}/api/menu`;
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify({
          ...menuForm,
          price: parseFloat(menuForm.price),
          original_price: menuForm.original_price ? parseFloat(menuForm.original_price) : null
        })
      });

      if (response.ok) {
        Alert.alert('Success', `Menu item ${isEdit ? 'updated' : 'added'} successfully.`);
        setMenuModalVisible(false);
        setEditingMenuItem(null);
        fetchMenu();
      } else {
        const err = await response.json();
        Alert.alert('Error', err.error || 'Failed to save menu item.');
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
      Alert.alert('Error', 'Failed to connect to backend server.');
    }
  };

  // Open form for adding new item
  const openAddMenuModal = () => {
    setEditingMenuItem(null);
    setMenuForm({
      name: '',
      subtitle: '',
      price: '',
      original_price: '',
      category: 'Traditional Specials',
      is_veg: true,
      is_popular: false,
      prep_time: '15 mins',
      serving_size: 'Serves 1',
      calories: '320 kcal',
      description: '',
      long_description: '',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    });
    setMenuModalVisible(true);
  };

  // Open form for editing existing item
  const openEditMenuModal = (item: any) => {
    setEditingMenuItem(item);
    setMenuForm({
      name: item.name,
      subtitle: item.subtitle || '',
      price: item.price.toString(),
      original_price: item.original_price ? item.original_price.toString() : '',
      category: item.category,
      is_veg: item.is_veg,
      is_popular: item.is_popular,
      prep_time: item.prep_time || '15 mins',
      serving_size: item.serving_size || 'Serves 1',
      calories: item.calories || '320 kcal',
      description: item.description || '',
      long_description: item.long_description || '',
      image: item.image || '',
    });
    setMenuModalVisible(true);
  };

  // Create Promo Coupon
  const handleSaveCoupon = async () => {
    if (!couponForm.code || !couponForm.discount_value) {
      Alert.alert('Required Fields', 'Coupon code and discount value are required.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/coupons`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          code: couponForm.code.toUpperCase(),
          discountValue: parseInt(couponForm.discount_value),
          discountType: couponForm.discount_type,
        })
      });

      if (response.ok) {
        Alert.alert('Success', 'Promo coupon created successfully.');
        setCouponModalVisible(false);
        setCouponForm({ code: '', discount_value: '', discount_type: 'fixed' });
        fetchCoupons();
      } else {
        const err = await response.json();
        Alert.alert('Error', err.error || 'Failed to save coupon.');
      }
    } catch (error) {
      console.error('Error saving coupon:', error);
      Alert.alert('Error', 'Connection timeout.');
    }
  };

  // Toggle Coupon Status
  const handleToggleCoupon = async (code: string, activeState: boolean) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/coupons/${code}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ isActive: activeState })
      });

      if (response.ok) {
        setCoupons(prev => 
          prev.map(c => c.code === code ? { ...c, is_active: activeState } : c)
        );
      } else {
        Alert.alert('Error', 'Failed to toggle coupon status');
      }
    } catch (error) {
      console.error('Error toggling coupon:', error);
    }
  };

  // Edit Elder Profile Dietary guidelines
  const openEditDietModal = (elder: any) => {
    setSelectedElder(elder);
    setDietForm({
      dietary_restriction: elder.dietary_restriction || 'none',
      delivery_notes: elder.delivery_notes || '',
    });
    setDietModalVisible(true);
  };

  const handleSaveDietary = async () => {
    if (!selectedElder) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/crm/elder-profiles/${selectedElder.id}/diet`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          dietaryRestriction: dietForm.dietary_restriction,
          deliveryNotes: dietForm.delivery_notes,
        })
      });

      if (response.ok) {
        Alert.alert('Updated', 'Elder care dietary requirements updated successfully.');
        setDietModalVisible(false);
        fetchCrmData();
      } else {
        Alert.alert('Error', 'Failed to save changes.');
      }
    } catch (error) {
      console.error('Error saving dietary specs:', error);
    }
  };

  const filteredOrders = orders.filter((o) => o.status === selectedStatus);

  const getStatusButtonConfig = (status: OrderStatusType, orderId: string) => {
    switch (status) {
      case 'Received':
        return {
          label: 'Start Cooking',
          icon: <Flame size={15} color="#FFFFFF" />,
          next: 'Preparing' as OrderStatusType,
        };
      case 'Preparing':
        return {
          label: 'Hand to Rider',
          icon: <Truck size={15} color="#FFFFFF" />,
          next: 'Out for Delivery' as OrderStatusType,
        };
      case 'Out for Delivery':
        return {
          label: 'Deliver Order',
          icon: <CheckCircle2 size={15} color="#FFFFFF" />,
          next: 'Delivered' as OrderStatusType,
        };
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kitchen Console</Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <TouchableOpacity
            onPress={() => Linking.openURL(`${API_BASE_URL}/crm`).catch(() => {})}
            style={styles.refreshBtn}
          >
            <ExternalLink size={18} color={Colors.textDark} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              fetchOrders();
              fetchMenu();
              fetchCrmData();
              fetchCoupons();
            }}
            style={styles.refreshBtn}
          >
            <RefreshCw size={18} color={Colors.textDark} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs Selector */}
      <View style={styles.tabsWrapper}>
        <TouchableOpacity
          onPress={() => setActiveTab('orders')}
          style={[styles.tabBtn, activeTab === 'orders' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabBtnText, activeTab === 'orders' && styles.tabBtnTextActive]}>
            Orders ({orders.filter((o) => o.status !== 'Delivered').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('menu')}
          style={[styles.tabBtn, activeTab === 'menu' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabBtnText, activeTab === 'menu' && styles.tabBtnTextActive]}>
            Menu Stock
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('crm')}
          style={[styles.tabBtn, activeTab === 'crm' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabBtnText, activeTab === 'crm' && styles.tabBtnTextActive]}>
            CRM Portal
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('coupons')}
          style={[styles.tabBtn, activeTab === 'coupons' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabBtnText, activeTab === 'coupons' && styles.tabBtnTextActive]}>
            Coupons
          </Text>
        </TouchableOpacity>
      </View>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <View style={{ flex: 1 }}>
          <View style={styles.statusSegmentContainer}>
            {(['Received', 'Preparing', 'Out for Delivery', 'Delivered'] as OrderStatusType[]).map((status) => {
              const label =
                status === 'Received'
                  ? 'Incoming'
                  : status === 'Preparing'
                  ? 'Cooking'
                  : status === 'Out for Delivery'
                  ? 'On Road'
                  : 'Done';
              const count = orders.filter((o) => o.status === status).length;
              return (
                <TouchableOpacity
                  key={status}
                  onPress={() => setSelectedStatus(status)}
                  style={[
                    styles.statusSegmentBtn,
                    selectedStatus === status && styles.statusSegmentBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusSegmentText,
                      selectedStatus === status && styles.statusSegmentTextActive,
                    ]}
                  >
                    {label} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {loadingOrders ? (
            <ActivityIndicator style={styles.loader} color={Colors.terracotta} size="large" />
          ) : (
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {filteredOrders.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <ShieldCheck size={40} color={Colors.textMuted} />
                  <Text style={styles.emptyText}>No orders in this status</Text>
                </View>
              ) : (
                filteredOrders.map((order) => {
                  const btnConfig = getStatusButtonConfig(order.status, order.id);
                  const formattedTotal = parseFloat(order.total as any).toFixed(2);
                  return (
                    <View key={order.id} style={[styles.orderCard, Shadows.card]}>
                      <View style={styles.orderCardHeader}>
                        <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                        <Text style={styles.orderTime}>{order.payment_status === 'Paid' ? 'Paid' : 'COD Pending'}</Text>
                      </View>

                      {/* Items */}
                      <View style={styles.itemsWrapper}>
                        {order.items.map((item, idx) => (
                          <Text key={idx} style={styles.itemText}>
                            <Text style={styles.itemQty}>{item.quantity}x </Text>
                            {item.item.name}
                          </Text>
                        ))}
                      </View>

                      {order.notes ? (
                        <View style={styles.notesBox}>
                          <Text style={styles.notesText}>📝 Notes: {order.notes}</Text>
                        </View>
                      ) : null}

                      {order.rider_name ? (
                        <View style={styles.riderBox}>
                          <Text style={styles.riderText}>🚴 Rider: {order.rider_name} ({order.rider_phone})</Text>
                        </View>
                      ) : null}

                      <Text style={styles.addressText}>📍 {order.deliveryAddress}</Text>

                      <View style={styles.orderCardFooter}>
                        <Text style={styles.orderTotal}>₹{formattedTotal}</Text>
                        {btnConfig ? (
                          <TouchableOpacity
                            onPress={() => handleUpdateStatus(order.id, btnConfig.next)}
                            style={styles.actionBtn}
                          >
                            {btnConfig.icon}
                            <Text style={styles.actionBtnText}>{btnConfig.label}</Text>
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.completedBadge}>
                            <Check size={12} color={Colors.vegGreen} strokeWidth={3} />
                            <Text style={styles.completedBadgeText}>Completed</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          )}
        </View>
      )}

      {/* Menu Stock Tab */}
      {activeTab === 'menu' && (
        <View style={{ flex: 1 }}>
          <View style={styles.menuControlHeader}>
            <Text style={styles.sectionTitle}>Stock Management</Text>
            <TouchableOpacity onPress={openAddMenuModal} style={styles.addDishBtn}>
              <Plus size={14} color="#FFF" />
              <Text style={styles.addDishBtnText}>Add Dish</Text>
            </TouchableOpacity>
          </View>

          {loadingMenu ? (
            <ActivityIndicator style={styles.loader} color={Colors.terracotta} size="large" />
          ) : (
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {menuItems.map((item) => (
                <View key={item.id} style={[styles.menuItemRow, Shadows.card]}>
                  <View style={styles.menuItemTextCol}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.menuItemName}>{item.name}</Text>
                      {item.is_veg ? (
                        <View style={styles.vegDotBorder}><View style={styles.vegDot} /></View>
                      ) : (
                        <View style={styles.nonVegDotBorder}><View style={styles.nonVegDot} /></View>
                      )}
                    </View>
                    <Text style={styles.menuItemCategory}>{item.category} • ₹{parseFloat(item.price).toFixed(2)}</Text>
                  </View>
                  
                  <View style={styles.menuItemToggleCol}>
                    <TouchableOpacity onPress={() => openEditMenuModal(item)} style={styles.editBtn}>
                      <Edit2 size={14} color={Colors.textMuted} />
                    </TouchableOpacity>
                    <Switch
                      value={item.is_available}
                      onValueChange={(val) => handleToggleAvailability(item.id, val)}
                      trackColor={{ false: '#EEEEEE', true: '#C8E6C9' }}
                      thumbColor={item.is_available ? Colors.vegGreen : '#9E9E9E'}
                    />
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {/* CRM Tab */}
      {activeTab === 'crm' && (
        <View style={{ flex: 1 }}>
          {loadingCrm ? (
            <ActivityIndicator style={styles.loader} color={Colors.terracotta} size="large" />
          ) : (
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Analytics Summary Cards */}
              <View style={styles.crmStatsGrid}>
                <View style={[styles.crmStatCard, Shadows.subtle]}>
                  <Text style={styles.crmStatVal}>₹{(crmStats?.totalSales || 0).toLocaleString()}</Text>
                  <Text style={styles.crmStatLabel}>Revenue (Delivered)</Text>
                </View>
                <View style={[styles.crmStatCard, Shadows.subtle]}>
                  <Text style={styles.crmStatVal}>{crmStats?.totalUsers || 0}</Text>
                  <Text style={styles.crmStatLabel}>Registered Customers</Text>
                </View>
                <View style={[styles.crmStatCard, Shadows.subtle]}>
                  <Text style={styles.crmStatVal}>{crmStats?.totalSubscriptions || 0}</Text>
                  <Text style={styles.crmStatLabel}>Meal Subscribers</Text>
                </View>
                <View style={[styles.crmStatCard, Shadows.subtle]}>
                  <Text style={styles.crmStatVal}>{crmStats?.totalDonations || 0}</Text>
                  <Text style={styles.crmStatLabel}>Meals Donated</Text>
                </View>
              </View>

              {/* Sub-segmented control */}
              <View style={styles.crmSubTabsRow}>
                <TouchableOpacity
                  onPress={() => setCrmSubTab('users')}
                  style={[styles.crmSubTabBtn, crmSubTab === 'users' && styles.crmSubTabBtnActive]}
                  activeOpacity={0.8}
                >
                  <Users size={14} color={crmSubTab === 'users' ? '#FFFFFF' : Colors.textMuted} />
                  <Text style={[styles.crmSubTabText, crmSubTab === 'users' && styles.textWhite]}>
                    Customers ({crmUsers.length})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setCrmSubTab('elders')}
                  style={[styles.crmSubTabBtn, crmSubTab === 'elders' && styles.crmSubTabBtnActive]}
                  activeOpacity={0.8}
                >
                  <Heart size={14} color={crmSubTab === 'elders' ? '#FFFFFF' : Colors.textMuted} />
                  <Text style={[styles.crmSubTabText, crmSubTab === 'elders' && styles.textWhite]}>
                    Senior Citizens ({crmElders.length})
                  </Text>
                </TouchableOpacity>
              </View>

              {/* CRM Sub Tab content list */}
              {crmSubTab === 'users' ? (
                crmUsers.length === 0 ? (
                  <View style={styles.crmEmptyBox}>
                    <Text style={styles.crmEmptyText}>No registered customers found</Text>
                  </View>
                ) : (
                  crmUsers.map((cust) => (
                    <View key={cust.id} style={[styles.crmUserCard, Shadows.card]}>
                      <View style={styles.crmUserHeader}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                          <Text style={styles.crmUserName}>{cust.name}</Text>
                          <Text style={styles.crmUserPhone}>✆ {cust.phone} • {cust.email || 'No email'}</Text>
                        </View>
                        <View style={styles.crmPointsBadge}>
                          <Award size={12} color={Colors.goldMetallic} />
                          <Text style={styles.crmPointsText}>{cust.points_balance} Pts</Text>
                        </View>
                      </View>
                      
                      <View style={styles.crmUserActions}>
                        <TouchableOpacity
                          onPress={() => handleAdjustPoints(cust.id, 50)}
                          style={styles.crmAdjustBtn}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.crmAdjustBtnText}>+50 Pts</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleAdjustPoints(cust.id, -50)}
                          style={[styles.crmAdjustBtn, styles.crmAdjustBtnDeduct]}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.crmAdjustBtnText, { color: Colors.terracotta }]}>-50 Pts</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )
              ) : (
                crmElders.length === 0 ? (
                  <View style={styles.crmEmptyBox}>
                    <Text style={styles.crmEmptyText}>No elder care profiles registered</Text>
                  </View>
                ) : (
                  crmElders.map((elder) => (
                    <View key={elder.id} style={[styles.crmElderCard, Shadows.card]}>
                      <View style={styles.crmElderHeader}>
                        <Text style={styles.crmElderName}>{elder.name}</Text>
                        <View style={styles.crmRestrictionBadge}>
                          <Text style={styles.crmRestrictionText}>
                            {elder.dietary_restriction === 'none'
                              ? 'No Restriction'
                              : elder.dietary_restriction === 'low-salt'
                              ? 'Low Salt/Spice'
                              : elder.dietary_restriction === 'diabetic-friendly'
                              ? 'Diabetic Friendly'
                              : 'Soft Easy Chew'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.crmElderSub}>Sponsor: {elder.sponsor_name || 'Akarsh Raj'}</Text>
                      <Text style={styles.crmElderSub}>Phone: {elder.phone}</Text>
                      <Text style={styles.crmElderAddress}>📍 {elder.address}</Text>
                      {elder.delivery_notes ? (
                        <View style={styles.crmElderNotesBox}>
                          <Text style={styles.crmElderNotes}>"Rider instruction: {elder.delivery_notes}"</Text>
                        </View>
                      ) : null}

                      <TouchableOpacity 
                        onPress={() => openEditDietModal(elder)}
                        style={styles.elderEditBtn}
                      >
                        <Edit2 size={12} color={Colors.terracotta} />
                        <Text style={styles.elderEditBtnText}>Edit Care Guidelines</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )
              )}
            </ScrollView>
          )}
        </View>
      )}

      {/* Coupons Tab */}
      {activeTab === 'coupons' && (
        <View style={{ flex: 1 }}>
          <View style={styles.menuControlHeader}>
            <Text style={styles.sectionTitle}>Active Discount Codes</Text>
            <TouchableOpacity onPress={() => setCouponModalVisible(true)} style={styles.addDishBtn}>
              <Plus size={14} color="#FFF" />
              <Text style={styles.addDishBtnText}>New Coupon</Text>
            </TouchableOpacity>
          </View>

          {loadingCoupons ? (
            <ActivityIndicator style={styles.loader} color={Colors.terracotta} size="large" />
          ) : (
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {coupons.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ticket size={40} color={Colors.textMuted} />
                  <Text style={styles.emptyText}>No promo codes available</Text>
                </View>
              ) : (
                coupons.map((coupon) => (
                  <View key={coupon.code} style={[styles.couponCard, Shadows.card]}>
                    <View style={styles.couponMain}>
                      <Ticket size={18} color={Colors.terracotta} />
                      <View style={{ marginLeft: 10, flex: 1 }}>
                        <Text style={styles.couponCodeText}>{coupon.code}</Text>
                        <Text style={styles.couponSubText}>
                          Discount: {coupon.discount_value} {coupon.discount_type === 'percent' ? '%' : '₹'} Off
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={coupon.is_active}
                      onValueChange={(val) => handleToggleCoupon(coupon.code, val)}
                      trackColor={{ false: '#EEEEEE', true: '#C8E6C9' }}
                      thumbColor={coupon.is_active ? Colors.vegGreen : '#9E9E9E'}
                    />
                  </View>
                ))
              )}
            </ScrollView>
          )}
        </View>
      )}

      {/* MODAL 1: ADD/EDIT MENU ITEM */}
      <Modal
        visible={menuModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setMenuModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingMenuItem ? 'Edit Dish Details' : 'Add New Dish'}</Text>
            <TouchableOpacity onPress={() => setMenuModalVisible(false)} style={styles.modalCloseBtn}>
              <X size={20} color={Colors.textDark} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalFormContent}>
            <Text style={styles.inputLabel}>Dish Name *</Text>
            <TextInput
              value={menuForm.name}
              onChangeText={(text) => setMenuForm({...menuForm, name: text})}
              placeholder="e.g. Traditional Sambar Idli"
              style={styles.textInput}
            />

            <Text style={styles.inputLabel}>Subtitle (Short Tagline)</Text>
            <TextInput
              value={menuForm.subtitle}
              onChangeText={(text) => setMenuForm({...menuForm, subtitle: text})}
              placeholder="e.g. Steamed Rice Cakes with Lentil Chowder"
              style={styles.textInput}
            />

            <View style={styles.formRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.inputLabel}>Price (₹) *</Text>
                <TextInput
                  value={menuForm.price}
                  onChangeText={(text) => setMenuForm({...menuForm, price: text})}
                  placeholder="e.g. 70"
                  keyboardType="numeric"
                  style={styles.textInput}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.inputLabel}>Original Price (Strikeout)</Text>
                <TextInput
                  value={menuForm.original_price}
                  onChangeText={(text) => setMenuForm({...menuForm, original_price: text})}
                  placeholder="e.g. 90"
                  keyboardType="numeric"
                  style={styles.textInput}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Category *</Text>
            <TextInput
              value={menuForm.category}
              onChangeText={(text) => setMenuForm({...menuForm, category: text})}
              placeholder="Traditional Specials, Curry & Sambhar, Breads, Ice Cream & Brownie"
              style={styles.textInput}
            />

            <View style={styles.formRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.inputLabel}>Prep Time</Text>
                <TextInput
                  value={menuForm.prep_time}
                  onChangeText={(text) => setMenuForm({...menuForm, prep_time: text})}
                  placeholder="e.g. 10 mins"
                  style={styles.textInput}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.inputLabel}>Serving Size</Text>
                <TextInput
                  value={menuForm.serving_size}
                  onChangeText={(text) => setMenuForm({...menuForm, serving_size: text})}
                  placeholder="e.g. Serves 1-2"
                  style={styles.textInput}
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.inputLabel}>Calories</Text>
                <TextInput
                  value={menuForm.calories}
                  onChangeText={(text) => setMenuForm({...menuForm, calories: text})}
                  placeholder="e.g. 280 kcal"
                  style={styles.textInput}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8, justifyContent: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', flex: 1 }}>Vegetarian?</Text>
                  <Switch
                    value={menuForm.is_veg}
                    onValueChange={(val) => setMenuForm({...menuForm, is_veg: val})}
                    trackColor={{ false: '#EEEEEE', true: '#C8E6C9' }}
                    thumbColor={menuForm.is_veg ? Colors.vegGreen : '#9E9E9E'}
                  />
                </View>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', flex: 1 }}>Show popular badge?</Text>
              <Switch
                value={menuForm.is_popular}
                onValueChange={(val) => setMenuForm({...menuForm, is_popular: val})}
                trackColor={{ false: '#EEEEEE', true: '#C8E6C9' }}
                thumbColor={menuForm.is_popular ? Colors.vegGreen : '#9E9E9E'}
              />
            </View>

            <Text style={styles.inputLabel}>Short Description</Text>
            <TextInput
              value={menuForm.description}
              onChangeText={(text) => setMenuForm({...menuForm, description: text})}
              placeholder="Fresh homestyle cooked..."
              multiline
              numberOfLines={2}
              style={[styles.textInput, { height: 60, paddingTop: 8 }]}
            />

            <Text style={styles.inputLabel}>Detailed Story / Ingredients</Text>
            <TextInput
              value={menuForm.long_description}
              onChangeText={(text) => setMenuForm({...menuForm, long_description: text})}
              placeholder="A detailed recipe history..."
              multiline
              numberOfLines={4}
              style={[styles.textInput, { height: 100, paddingTop: 8 }]}
            />

            <Text style={styles.inputLabel}>Image URL</Text>
            <TextInput
              value={menuForm.image}
              onChangeText={(text) => setMenuForm({...menuForm, image: text})}
              placeholder="https://images.unsplash.com/..."
              style={styles.textInput}
            />

            <TouchableOpacity onPress={handleSaveMenuItem} style={styles.saveFormBtn}>
              <Text style={styles.saveFormBtnText}>Save Dish</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* MODAL 2: CREATE COUPON */}
      <Modal
        visible={couponModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCouponModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Discount Code</Text>
            <TouchableOpacity onPress={() => setCouponModalVisible(false)} style={styles.modalCloseBtn}>
              <X size={20} color={Colors.textDark} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalFormContent}>
            <Text style={styles.inputLabel}>Promo Coupon Code (CAPITALS) *</Text>
            <TextInput
              value={couponForm.code}
              onChangeText={(text) => setCouponForm({...couponForm, code: text.toUpperCase()})}
              placeholder="e.g. DIWALI30"
              style={styles.textInput}
            />

            <Text style={styles.inputLabel}>Discount Type</Text>
            <View style={styles.couponTypeRow}>
              <TouchableOpacity
                onPress={() => setCouponForm({...couponForm, discount_type: 'fixed'})}
                style={[styles.typeBtn, couponForm.discount_type === 'fixed' && styles.typeBtnActive]}
              >
                <Text style={[styles.typeBtnText, couponForm.discount_type === 'fixed' && styles.typeBtnTextActive]}>
                  Flat Cash Off (₹)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setCouponForm({...couponForm, discount_type: 'percent'})}
                style={[styles.typeBtn, couponForm.discount_type === 'percent' && styles.typeBtnActive]}
              >
                <Text style={[styles.typeBtnText, couponForm.discount_type === 'percent' && styles.typeBtnTextActive]}>
                  Percentage (%)
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Discount Value *</Text>
            <TextInput
              value={couponForm.discount_value}
              onChangeText={(text) => setCouponForm({...couponForm, discount_value: text})}
              placeholder={couponForm.discount_type === 'fixed' ? 'e.g. 50 (Flat ₹50 Off)' : 'e.g. 15 (15% Off)'}
              keyboardType="numeric"
              style={styles.textInput}
            />

            <TouchableOpacity onPress={handleSaveCoupon} style={styles.saveFormBtn}>
              <Text style={styles.saveFormBtnText}>Create Coupon</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* MODAL 3: EDIT ELDER DIET */}
      <Modal
        visible={dietModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDietModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Elder Care Settings</Text>
            <TouchableOpacity onPress={() => setDietModalVisible(false)} style={styles.modalCloseBtn}>
              <X size={20} color={Colors.textDark} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalFormContent}>
            <Text style={styles.elderModalName}>Patient: {selectedElder?.name}</Text>
            
            <Text style={styles.inputLabel}>Dietary Restriction Category</Text>
            <View style={{ gap: 8, marginVertical: 10 }}>
              {[
                { key: 'none', label: 'None (Regular Spices)' },
                { key: 'low-salt', label: 'Low Salt & Mild Spicing' },
                { key: 'diabetic-friendly', label: 'Diabetic Friendly (No Sugar/White Rice)' },
                { key: 'soft-chew', label: 'Soft easy-chew texture' }
              ].map((dietOpt) => (
                <TouchableOpacity
                  key={dietOpt.key}
                  onPress={() => setDietForm({...dietForm, dietary_restriction: dietOpt.key})}
                  style={[styles.dietSelectBtn, dietForm.dietary_restriction === dietOpt.key && styles.dietSelectBtnActive]}
                >
                  <Text style={[styles.dietSelectText, dietForm.dietary_restriction === dietOpt.key && styles.dietSelectTextActive]}>
                    {dietOpt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Special Delivery instructions for Rider</Text>
            <TextInput
              value={dietForm.delivery_notes}
              onChangeText={(text) => setDietForm({...dietForm, delivery_notes: text})}
              placeholder="e.g. Ring bell twice, deliver strictly to elderly hand"
              multiline
              numberOfLines={3}
              style={[styles.textInput, { height: 80, paddingTop: 8 }]}
            />

            <TouchableOpacity onPress={handleSaveDietary} style={styles.saveFormBtn}>
              <Text style={styles.saveFormBtnText}>Update Care Guidelines</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF6F0',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backBtn: {
    padding: 8,
  },
  refreshBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E1E1E',
  },
  tabsWrapper: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    backgroundColor: '#FFFFFF',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabBtnActive: {
    borderBottomWidth: 3,
    borderBottomColor: Colors.terracotta,
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  tabBtnTextActive: {
    color: Colors.terracotta,
    fontWeight: '800',
  },
  statusSegmentContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  statusSegmentBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  statusSegmentBtnActive: {
    backgroundColor: 'rgba(232, 90, 42, 0.12)',
  },
  statusSegmentText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  statusSegmentTextActive: {
    color: Colors.terracotta,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.terracotta,
  },
  orderTime: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.vegGreen,
  },
  itemsWrapper: {
    gap: 4,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  itemText: {
    fontSize: 13,
    color: Colors.textDark,
  },
  itemQty: {
    fontWeight: '700',
    color: Colors.terracotta,
  },
  notesBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: Colors.goldDark,
    padding: 6,
    borderRadius: 4,
  },
  notesText: {
    fontSize: 11,
    color: Colors.goldDark,
    fontWeight: '500',
  },
  riderBox: {
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
    padding: 6,
    borderRadius: 4,
  },
  riderText: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '600',
  },
  addressText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  orderCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textDark,
  },
  actionBtn: {
    backgroundColor: Colors.terracotta,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  completedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.vegGreen,
  },
  menuControlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addDishBtn: {
    backgroundColor: Colors.forestGreen,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  addDishBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFF',
  },
  menuItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
  },
  menuItemTextCol: {
    gap: 4,
  },
  menuItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
  },
  vegDotBorder: {
    width: 14,
    height: 14,
    borderWidth: 1.5,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  nonVegDotBorder: {
    width: 14,
    height: 14,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nonVegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  menuItemCategory: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  menuItemToggleCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editBtn: {
    padding: 6,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
  },
  crmStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  crmStatCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  crmStatVal: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textDark,
  },
  crmStatLabel: {
    fontSize: 9.5,
    color: Colors.textMuted,
  },
  crmSubTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 6,
    gap: 8,
    marginVertical: 4,
  },
  crmSubTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  crmSubTabBtnActive: {
    backgroundColor: Colors.terracotta,
  },
  crmSubTabText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: Colors.textMuted,
  },
  textWhite: {
    color: '#FFFFFF',
  },
  crmEmptyBox: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  crmEmptyText: {
    fontSize: 12.5,
    color: Colors.textMuted,
  },
  crmUserCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    gap: 10,
    marginBottom: 8,
  },
  crmUserHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  crmUserName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textDark,
  },
  crmUserPhone: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  crmPointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderWidth: 0.8,
    borderColor: 'rgba(251, 191, 36, 0.25)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  crmPointsText: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.goldMetallic,
  },
  crmUserActions: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 10,
  },
  crmAdjustBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 0.8,
    borderColor: 'rgba(16, 185, 129, 0.15)',
    paddingVertical: 6,
    borderRadius: 8,
  },
  crmAdjustBtnDeduct: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.15)',
  },
  crmAdjustBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.vegGreen,
  },
  crmElderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    gap: 6,
    marginBottom: 8,
  },
  crmElderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  crmElderName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: Colors.textDark,
  },
  crmRestrictionBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderWidth: 0.8,
    borderColor: 'rgba(251, 191, 36, 0.25)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  crmRestrictionText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: Colors.goldMetallic,
  },
  crmElderSub: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  crmElderAddress: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  crmElderNotesBox: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
    borderWidth: 0.8,
    borderColor: '#EEEEEE',
  },
  crmElderNotes: {
    fontSize: 11,
    fontStyle: 'italic',
    color: Colors.textMuted,
  },
  elderEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(232, 90, 42, 0.25)',
    borderRadius: 8,
    paddingVertical: 7,
    marginTop: 6,
  },
  elderEditBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.terracotta,
  },
  couponCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
  },
  couponMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  couponCodeText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textDark,
    letterSpacing: 0.5,
  },
  couponSubText: {
    fontSize: 11.5,
    color: Colors.textMuted,
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FAF6F0',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFF',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textDark,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalFormContent: {
    padding: 20,
    paddingBottom: 50,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    marginTop: 12,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0DCD6',
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 14,
    color: Colors.textDark,
  },
  formRow: {
    flexDirection: 'row',
  },
  saveFormBtn: {
    backgroundColor: Colors.terracotta,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  saveFormBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  couponTypeRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 4,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0DCD6',
  },
  typeBtnActive: {
    borderColor: Colors.terracotta,
    backgroundColor: 'rgba(232, 90, 42, 0.05)',
  },
  typeBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  typeBtnTextActive: {
    color: Colors.terracotta,
  },
  elderModalName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 10,
  },
  dietSelectBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0DCD6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 4,
  },
  dietSelectBtnActive: {
    borderColor: Colors.vegGreen,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  dietSelectText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  dietSelectTextActive: {
    color: Colors.vegGreen,
    fontWeight: '800',
  },
});
