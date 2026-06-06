import {
  DollarSign,
  Package,
  Users,
  FileText,
  LayoutDashboard,
  Truck,
  Settings,
} from 'lucide-react';

export const stats = [
  {
    title: 'Total Revenue',
    value: 'GMD 12,450',
    icon: DollarSign,
    color: 'from-green-500 to-emerald-600',
  },
  {
    title: 'Active Bookings',
    value: '48',
    icon: Package,
    color: 'from-blue-500 to-blue-600',
  },
  {
    title: 'Total Customers',
    value: '1,234',
    icon: Users,
    color: 'from-orange-500 to-yellow-500',
  },
  {
    title: 'Pending Payments',
    value: '12',
    icon: FileText,
    color: 'from-purple-500 to-pink-500',
  },
];

export const recentBookings = [
  {
    id: 'BK-001',
    customer: 'Sarah Johnson',
    service: 'Wash & Fold',
    amount: 'GMD 45',
    status: 'In Progress',
    date: '2025-10-22',
    statusColor: 'blue',
  },
  {
    id: 'BK-002',
    customer: 'Michael Chen',
    service: 'Dry Cleaning',
    amount: 'GMD 75',
    status: 'Completed',
    date: '2025-10-22',
    statusColor: 'green',
  },
  {
    id: 'BK-003',
    customer: 'Emily Rodriguez',
    service: 'Ironing',
    amount: 'GMD 30',
    status: 'Pending',
    date: '2025-10-21',
    statusColor: 'yellow',
  },
  {
    id: 'BK-004',
    customer: 'David Kim',
    service: 'Wash & Fold',
    amount: 'GMD 55',
    status: 'Delivered',
    date: '2025-10-21',
    statusColor: 'green',
  },
  {
    id: 'BK-005',
    customer: 'Lisa Wang',
    service: 'Dry Cleaning',
    amount: 'GMD 90',
    status: 'Cancelled',
    date: '2025-10-20',
    statusColor: 'red',
  },
];

export const services = [
  { name: 'Wash & Fold', price: 'GMD 15', orders: 245, revenue: 'GMD 3,675' },
  { name: 'Dry Cleaning', price: 'GMD 25', orders: 189, revenue: 'GMD 4,725' },
  { name: 'Ironing', price: 'GMD 10', orders: 156, revenue: 'GMD 1,560' },
  {
    name: 'Express Service',
    price: 'GMD 35',
    orders: 98,
    revenue: 'GMD 3,430',
  },
];

export const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin/dashboard',
  },
  { id: 'bookings', label: 'Bookings', icon: Package, href: '/admin/bookings' },
  {
    id: 'customers',
    label: 'Customers',
    icon: Users,
    href: '/admin/customers',
  },
  { id: 'services', label: 'Services', icon: Truck, href: '/admin/services' },
  {
    id: 'payments',
    label: 'Payments',
    icon: DollarSign,
    href: '/admin/payments',
  },
  {
    id: 'invoices',
    label: 'Invoices',
    icon: FileText,
    href: '/admin/invoices',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/admin/settings',
  },
];
