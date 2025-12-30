
import React from 'react';
import { ViewType, ActivityEntry } from './types';

export const NAV_ITEMS = [
  { id: ViewType.DASHBOARD, label: 'Tổng quan', icon: 'dashboard' },
  { id: ViewType.ERROR_LIST, label: 'Quản lý Lỗi', icon: 'bug_report' },
  { id: ViewType.BRAND_MANAGER, label: 'Hãng & Model', icon: 'category' },
  { id: ViewType.OCR_TOOL, label: 'Nhập liệu OCR', icon: 'document_scanner' },
  { id: ViewType.USER_MANAGER, label: 'Quản trị viên', icon: 'manage_accounts' },
  { id: ViewType.PLAN_MANAGER, label: 'Gói dịch vụ', icon: 'payments' },
  { id: ViewType.ACTIVITY_LOG, label: 'Nhật ký', icon: 'history' },
  { id: ViewType.SYSTEM_UPDATE, label: 'Cập nhật hệ thống', icon: 'system_update_alt' },
  { id: ViewType.SETTINGS, label: 'Cài đặt', icon: 'settings' },
];

export const MOCK_LOGS: ActivityEntry[] = [
  { id: 'l1', userId: '1', userName: 'Hoang.Nguyen', action: 'UPDATE', target: 'Mã lỗi E4-01', details: 'Thay đổi mô tả triệu chứng và thêm 2 bước sửa chữa mới.', timestamp: '2 phút trước', severity: 'info' },
  { id: 'l2', userId: '4', userName: 'Phuong.Vu', action: 'CREATE', target: 'Model CU-XU9ZKH', details: 'Đã thêm model máy lạnh Panasonic mới vào database.', timestamp: '15 phút trước', severity: 'info' },
  { id: 'l3', userId: '1', userName: 'Hoang.Nguyen', action: 'DELETE', target: 'Mã lỗi H11', details: 'Xóa mã lỗi trùng lặp từ nguồn OCR cũ.', timestamp: '1 giờ trước', severity: 'danger' },
  { id: 'l4', userId: 'system', userName: 'Hệ thống', action: 'SYSTEM', target: 'Backup Data', details: 'Tự động sao lưu dữ liệu thành công lên Cloud.', timestamp: '4 giờ trước', severity: 'info' },
  { id: 'l5', userId: '3', userName: 'Anh.Le', action: 'LOGIN', target: 'Hệ thống Admin', details: 'Đăng nhập từ IP 1.55.23.10', timestamp: '5 giờ trước', severity: 'info' },
  { id: 'l6', userId: '1', userName: 'Hoang.Nguyen', action: 'UPDATE', target: 'Gói Premium', details: 'Thay đổi giá từ 189k thành 199k.', timestamp: '1 ngày trước', severity: 'warning' },
];

export const MOCK_BRANDS = [
  { id: 'b1', name: 'Panasonic', logo: 'P', modelCount: 145, color: '#004098' },
  { id: 'b2', name: 'Daikin', logo: 'D', modelCount: 89, color: '#00a1e4' },
  { id: 'b3', name: 'Samsung', logo: 'S', modelCount: 210, color: '#1428a0' },
  { id: 'b4', name: 'LG', logo: 'L', modelCount: 167, color: '#a50034' },
  { id: 'b5', name: 'Toshiba', logo: 'T', modelCount: 76, color: '#ff0000' },
  { id: 'b6', name: 'Mitsubishi', logo: 'M', modelCount: 54, color: '#ee1c23' },
];

export const MOCK_MODELS = [
  { id: 'm1', brandId: 'b1', name: 'CU-XU9ZKH-8', type: 'Máy lạnh', notes: 'Inverter Aero Series 2023' },
  { id: 'm2', brandId: 'b1', name: 'NA-V10FG1WVT', type: 'Máy giặt', notes: 'Cửa trước 10kg' },
  { id: 'm3', brandId: 'b2', name: 'FTKF25XVMV', type: 'Máy lạnh', notes: 'Inverter R32' },
  { id: 'm4', brandId: 'b3', name: 'RT38K5982BS', type: 'Tủ lạnh', notes: 'Twin Cooling Plus' },
];

export const MOCK_ERRORS = [
  { id: '1', code: 'E4-01', brand: 'Samsung', model: 'Inverter S5', title: 'Cảm biến rã đông bất thường', status: 'active', severity: 'medium', updatedAt: '2023-10-20' },
  { id: '2', code: 'U4', brand: 'Daikin', model: 'Series VRV', title: 'Lỗi truyền tín hiệu nóng/lạnh', status: 'pending', severity: 'high', updatedAt: '2023-10-24' },
  { id: '3', code: 'H11', brand: 'Panasonic', model: 'Sky Series', title: 'Lỗi giao tiếp khối trong/ngoài', status: 'active', severity: 'medium', updatedAt: '2023-10-23' },
  { id: '4', code: 'E1', brand: 'LG', model: 'Dual Cool', title: 'Cảm biến nhiệt độ phòng hỏng', status: 'active', severity: 'low', updatedAt: '2023-10-20' },
  { id: '5', code: 'CH05', brand: 'LG', model: 'ArtCool', title: 'Lỗi kết nối tín hiệu', status: 'draft', severity: 'high', updatedAt: '2023-10-18' },
];
