import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  DollarSign,
  FileText,
  Settings,
  Home,
  Users2,
  Shield,
  Star,
} from 'lucide-react';

export type UserRole = 'ADMIN' | 'STAFF' | 'USER';

export interface MenuItem {
  id: string;
  label: string;
  icon: any;
  href: string;
}

// Admin menu items
export const adminMenuItems: MenuItem[] = [
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
    id: 'testimonials',
    label: 'Testimonials',
    icon: Star,
    href: '/admin/testimonials',
  },
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
    id: 'receipts',
    label: 'Receipts',
    icon: FileText,
    href: '/admin/receipts',
  },
  {
    id: 'staffs',
    label: 'Staffs',
    icon: Users2,
    href: '/admin/staffs',
  },
  {
    id: 'role-permission',
    label: 'Roles & Permissions',
    icon: Shield,
    href: '/admin/role-permission',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/admin/settings',
  },
];

// Staff menu items
export const staffMenuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/staff/dashboard',
  },
  { id: 'bookings', label: 'Bookings', icon: Package, href: '/staff/bookings' },
  {
    id: 'customers',
    label: 'Customers',
    icon: Users,
    href: '/staff/customers',
  },
  { id: 'services', label: 'Services', icon: Truck, href: '/staff/services' },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/staff/settings',
  },
];

// Customer menu items
export const customerMenuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/customer/dashboard',
  },
  {
    id: 'bookings',
    label: 'My Bookings',
    icon: Package,
    href: '/customer/bookings',
  },
  {
    id: 'home',
    label: 'Back to Home',
    icon: Home,
    href: '/',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/customer/settings',
  },
];

// Function to get menu items based on role
export const getMenuByRole = (role?: string): MenuItem[] => {
  switch (role) {
    case 'ADMIN':
      return adminMenuItems;
    case 'STAFF':
      return staffMenuItems;
    case 'USER':
    default:
      return customerMenuItems;
  }
};
