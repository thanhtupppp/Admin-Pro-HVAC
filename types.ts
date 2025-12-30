
export enum ViewType {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  ERROR_LIST = 'ERROR_LIST',
  ERROR_EDIT = 'ERROR_EDIT',
  OCR_TOOL = 'OCR_TOOL',
  BRAND_MANAGER = 'BRAND_MANAGER',
  USER_MANAGER = 'USER_MANAGER',
  PLAN_MANAGER = 'PLAN_MANAGER',
  SETTINGS = 'SETTINGS',
  ACTIVITY_LOG = 'ACTIVITY_LOG',
  SYSTEM_UPDATE = 'SYSTEM_UPDATE'
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
  model: string;
  brand: string;
  title: string;
  symptom: string;
  cause: string;
  components: string[];
  steps: string[];
  status: 'active' | 'pending' | 'draft';
  severity: 'high' | 'medium' | 'low';
  updatedAt: string;
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
  email: string;
  role: string;
  status: 'active' | 'locked';
  avatar?: string;
  lastLogin: string;
  plan?: 'Free' | 'Premium' | 'Internal';
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
