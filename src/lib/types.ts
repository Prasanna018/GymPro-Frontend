export interface User {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'member';
  phone?: string;
  avatar?: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  joiningDate: string;
  expiryDate: string;
  planId: string;
  status: 'active' | 'expired' | 'pending';
  avatar?: string;
  dueAmount: number;
  paidAmount: number;
}

export interface MembershipPlan {
  id: string;
  name: string;
  duration: number; // in months
  price: number;
  features: string[];
}

export interface Payment {
  id: string;
  memberId: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
  planId: string;
}

export interface Attendance {
  id: string;
  memberId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
}

export interface Supplement {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
}

export interface Order {
  id: string;
  memberId: string;
  items: OrderItem[];
  total: number;
  date: string;
  status: 'completed' | 'pending';
}

export interface OrderItem {
  supplementId: string;
  quantity: number;
  price: number;
}

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  expiredMembers: number;
  totalRevenue: number;
  pendingDues: number;
  monthlyRevenue: number;
}
