import { Member, MembershipPlan, Supplement, Payment, Attendance, DashboardStats } from './types';

export const membershipPlans: MembershipPlan[] = [
  {
    id: '1',
    name: 'Monthly',
    duration: 1,
    price: 1500,
    features: ['Full gym access', 'Locker facility', 'Basic training'],
  },
  {
    id: '2',
    name: 'Quarterly',
    duration: 3,
    price: 4000,
    features: ['Full gym access', 'Locker facility', 'Personal trainer (2 sessions)', 'Diet consultation'],
  },
  {
    id: '3',
    name: 'Yearly',
    duration: 12,
    price: 12000,
    features: ['Full gym access', 'Premium locker', 'Personal trainer (weekly)', 'Diet plan', 'Supplements discount'],
  },
];

export const mockMembers: Member[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    email: 'rahul@email.com',
    phone: '+91 98765 43210',
    address: '123 MG Road, Mumbai',
    joiningDate: '2024-01-15',
    expiryDate: '2025-01-15',
    planId: '3',
    status: 'active',
    dueAmount: 0,
    paidAmount: 12000,
  },
  {
    id: '2',
    name: 'Priya Patel',
    email: 'priya@email.com',
    phone: '+91 87654 32109',
    address: '456 Park Street, Delhi',
    joiningDate: '2024-06-01',
    expiryDate: '2024-09-01',
    planId: '2',
    status: 'expired',
    dueAmount: 4000,
    paidAmount: 4000,
  },
  {
    id: '3',
    name: 'Amit Kumar',
    email: 'amit@email.com',
    phone: '+91 76543 21098',
    address: '789 Lake View, Bangalore',
    joiningDate: '2024-11-01',
    expiryDate: '2024-12-01',
    planId: '1',
    status: 'active',
    dueAmount: 1500,
    paidAmount: 0,
  },
  {
    id: '4',
    name: 'Sneha Reddy',
    email: 'sneha@email.com',
    phone: '+91 65432 10987',
    address: '321 Hill Road, Hyderabad',
    joiningDate: '2024-10-15',
    expiryDate: '2025-10-15',
    planId: '3',
    status: 'active',
    dueAmount: 0,
    paidAmount: 12000,
  },
  {
    id: '5',
    name: 'Vikram Singh',
    email: 'vikram@email.com',
    phone: '+91 54321 09876',
    address: '654 Garden Lane, Pune',
    joiningDate: '2024-08-01',
    expiryDate: '2024-11-01',
    planId: '2',
    status: 'expired',
    dueAmount: 2000,
    paidAmount: 2000,
  },
];

export const mockSupplements: Supplement[] = [
  {
    id: '1',
    name: 'Whey Protein Gold',
    description: 'Premium whey protein with 24g protein per serving',
    price: 2500,
    stock: 25,
    category: 'Protein',
  },
  {
    id: '2',
    name: 'BCAA Energy',
    description: 'Branch chain amino acids for muscle recovery',
    price: 1200,
    stock: 40,
    category: 'Amino Acids',
  },
  {
    id: '3',
    name: 'Pre-Workout Blast',
    description: 'High energy pre-workout formula',
    price: 1800,
    stock: 15,
    category: 'Pre-Workout',
  },
  {
    id: '4',
    name: 'Creatine Monohydrate',
    description: 'Pure creatine for strength and power',
    price: 800,
    stock: 50,
    category: 'Creatine',
  },
  {
    id: '5',
    name: 'Mass Gainer Pro',
    description: 'High calorie mass gainer for bulking',
    price: 3200,
    stock: 8,
    category: 'Mass Gainer',
  },
  {
    id: '6',
    name: 'Multivitamin Complex',
    description: 'Complete daily vitamin and mineral support',
    price: 600,
    stock: 60,
    category: 'Vitamins',
  },
];

export const mockPayments: Payment[] = [
  { id: '1', memberId: '1', amount: 12000, date: '2024-01-15', status: 'paid', planId: '3' },
  { id: '2', memberId: '2', amount: 4000, date: '2024-06-01', status: 'paid', planId: '2' },
  { id: '3', memberId: '3', amount: 1500, date: '2024-11-01', status: 'pending', planId: '1' },
  { id: '4', memberId: '4', amount: 12000, date: '2024-10-15', status: 'paid', planId: '3' },
  { id: '5', memberId: '5', amount: 4000, date: '2024-08-01', status: 'overdue', planId: '2' },
];

export const mockAttendance: Attendance[] = [
  { id: '1', memberId: '1', date: '2024-11-20', checkIn: '06:30', checkOut: '08:00' },
  { id: '2', memberId: '3', date: '2024-11-20', checkIn: '07:00', checkOut: '08:30' },
  { id: '3', memberId: '4', date: '2024-11-20', checkIn: '17:00', checkOut: '18:30' },
  { id: '4', memberId: '1', date: '2024-11-19', checkIn: '06:45', checkOut: '08:15' },
  { id: '5', memberId: '4', date: '2024-11-19', checkIn: '17:30', checkOut: '19:00' },
];

export const dashboardStats: DashboardStats = {
  totalMembers: 5,
  activeMembers: 3,
  expiredMembers: 2,
  totalRevenue: 40000,
  pendingDues: 7500,
  monthlyRevenue: 15500,
};
