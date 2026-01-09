export enum ViewType {
  LOGIN = 'LOGIN',
  DASHBOARD = 'dashboard',
  ERROR_LIST = 'error_list',
  ERROR_EDIT = 'error_edit',
  DOCUMENT_MANAGER = 'document_manager',
  OCR_TOOL = 'ocr_tool',
  BRAND_MANAGER = 'brand_manager',
  USER_MANAGER = 'user_manager',
  PLAN_MANAGER = 'plan_manager',
  SETTINGS = 'settings',
  ACTIVITY_LOG = 'activity_log',
  SYSTEM_UPDATE = 'system_update',
  TRANSACTIONS = 'transactions',
  AI_ASSISTANT = 'ai_assistant',
  AI_OPS = 'ai_ops',
  DOCUMENTS = 'DOCUMENTS',
  VIDEO_CMS = 'video_cms',
  FEEDBACK_MANAGER = 'feedback_manager',
  PUSH_NOTIFICATIONS = 'push_notifications'
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
  ipAddress?: string;
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
  views?: number;       // View count for analytics
  brandName?: string;   // Display name of the brand
  deviceType?: 'AC' | 'Fridge' | 'Washer' | 'Other'; // Device Category
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
  code?: string;
  year?: number;
  capacity?: string;
  image?: string;
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
  plan?: 'Free' | 'Basic' | 'Premium' | 'Enterprise' | 'Internal';
  planId?: string;
  planName?: string;
  planExpiresAt?: string; // ISO Date String
  createdAt?: string; // ISO Date String
  activeSessions?: UserSession[]; // Track active devices
}

export interface UserSession {
  deviceId: string;
  userAgent: string;
  ip?: string;
  lastActive: string; // ISO Date String
  deviceType?: string; // e.g., 'Mobile', 'Desktop'
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

export interface PushNotification {
  id?: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  targetType: 'all' | 'user' | 'plan';
  targetValue?: string; // userId or planId depending on targetType
  sentAt?: string;
  sentBy?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  userName?: string;
  userPhone?: string;
  planId: string;
  planName: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'rejected';
  paymentMethod: 'vietqr' | 'momo' | 'banking' | 'card';
  transferContent?: string;
  createdAt: string;
  updatedAt: string;
  couponCode?: string;
}

export interface Feedback {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  type: 'general' | 'bug' | 'feature_request' | 'account';
  title: string;
  content: string;
  images?: string[];
  status: 'pending' | 'processing' | 'resolved' | 'closed';
  adminReply?: string;
  repliedAt?: string;
  replyBy?: string; // Admin ID/Name
  createdAt: string;
  updatedAt: string;
}
