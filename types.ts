
export enum ViewType {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  ERROR_LIST = 'ERROR_LIST',
  ERROR_EDIT = 'ERROR_EDIT',
  DOCUMENT_MANAGER = 'DOCUMENT_MANAGER',
  OCR_TOOL = 'OCR_TOOL',
  BRAND_MANAGER = 'BRAND_MANAGER',
  USER_MANAGER = 'USER_MANAGER',
  PLAN_MANAGER = 'PLAN_MANAGER',
  SETTINGS = 'SETTINGS',
  ACTIVITY_LOG = 'ACTIVITY_LOG',
  SYSTEM_UPDATE = 'SYSTEM_UPDATE',
  TRANSACTIONS = 'TRANSACTIONS'
}

export interface SystemVersion {
  version: string;
  releaseDate: string;
  changes?: string[];
  notes?: string[];
  type?: 'stable' | 'beta' | 'security';
  size?: string;
  isCritical?: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface ActivityEntry {
  id: string;
  userId: string;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'SYSTEM' | 'LOGIN';
  target: string;
  details: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'danger';
}

export interface ErrorCode {
  id: string;
  code: string;
  title: string;
  brand: string;
  model: string;
  symptom: string;
  cause: string;
  status: 'active' | 'pending' | 'draft';
  severity: 'high' | 'medium' | 'low';
  updatedAt: string;
  steps: string[];
  components: string[]; // New
  tools: string[];      // New
  images: string[];     // New (replacing single imageUrl)
  videos?: string[];    // New (YouTube Links)
  description?: string; // Backwards compatibility
  isCommon?: boolean;   // Flag for common errors shown on mobile home
}
export interface Brand {
  id: string;
  name: string;
  logo: string;
  modelCount: number;
}

export interface Model {
  id: string;
  brandId: string;
  name: string;
  type: string;
  notes: string;
}

export interface AdminUser {
  id: string;
  username: string;
  name?: string; // Full name from mobile signup
  email: string;
  role: string;
  status: 'active' | 'locked';
  avatar?: string;
  lastLogin: string;
  plan?: 'Free' | 'Premium' | 'Internal';
  planId?: string;
  planName?: string;
  planExpiresAt?: string; // ISO Date String
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  userCount: number;
  status: 'active' | 'inactive';
}

export interface Notification {
  id: string;
  type: 'user' | 'error' | 'system' | 'warning';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  icon?: string;
  activityId?: string; // Link to ActivityEntry
}

export interface Coupon {
  id: string;
  code: string; // SUMMER2024, NEWYEAR50
  discountType: 'percent' | 'fixed';
  discountValue: number; // 50 (%) hoặc 50000 (VNĐ)
  validFrom: string;
  validTo: string;
  usageLimit: number; // Số lần tối đa
  usedCount: number; // Số lần đã dùng
  status: 'active' | 'expired' | 'disabled';
  applicablePlans?: string[]; // ['premium', 'enterprise'] hoặc [] = all
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankSettings {
  id: string;
  bankId: string; // 'ICB', 'VCB', 'TCB', etc.
  bankName: string; // 'VietinBank', 'Vietcombank', etc.
  accountNumber: string;
  accountName: string;
  template: 'compact' | 'compact2' | 'qr_only' | 'print';
  isActive: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface ServicePlan {
  id: string;
  name: string;
  price: number;
  duration: number; // in months
  features: string[];
  isPopular?: boolean;
  description?: string;
  status: 'active' | 'archived';
}

export interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  planId: string;
  planName: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'rejected';
  paymentMethod: 'vietqr' | 'momo' | 'banking';
  createdAt: string;
  updatedAt: string;
  couponCode?: string;
}
