
import React, { useState } from 'react';
import { AdminUser } from '../types';

const MOCK_USERS: AdminUser[] = [
  { id: '1', username: 'hoang.nguyen', email: 'hoang.nguyen@service.vn', role: 'Super Admin', status: 'active', lastLogin: '10 phút trước', avatar: 'HN', plan: 'Internal' },
  { id: '2', username: 'minh.tran', email: 'minh.tran@service.vn', role: 'Editor', status: 'active', lastLogin: '2 giờ trước', avatar: 'MT', plan: 'Internal' },
  { id: '3', username: 'anh.le', email: 'anh.le@service.vn', role: 'Technician', status: 'locked', lastLogin: '3 ngày trước', avatar: 'AL', plan: 'Free' },
  { id: '4', username: 'phuong.vu', email: 'phuong.vu@service.vn', role: 'Editor', status: 'active', lastLogin: 'Vừa xong', avatar: 'PV', plan: 'Internal' },
  { id: '5', username: 'quoc.pham', email: 'quoc.pham@service.vn', role: 'Technician', status: 'active', lastLogin: '5 giờ trước', avatar: 'QP', plan: 'Premium' },
];

const UserManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const getPlanBadge = (plan?: string) => {
    switch (plan) {
      case 'Premium':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
            <span className="material-symbols-outlined text-[14px]">workspace_premium</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Premium</span>
          </div>
        );
      case 'Free':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 text-text-secondary border border-border-dark">
            <span className="material-symbols-outlined text-[14px]">eco</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Free</span>
          </div>
        );
      case 'Internal':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <span className="material-symbols-outlined text-[14px]">shield_person</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Internal</span>
          </div>
        );
      default:
        return <span className="text-xs text-text-secondary">-</span>;
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản trị viên & Người dùng</h1>
          <p className="text-text-secondary text-sm">Quản lý phân quyền, truy cập và gói dịch vụ thành viên</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95">
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Thêm thành viên
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-secondary">search</span>
          <input 
            type="text" 
            placeholder="Tìm theo tên, email hoặc username..." 
            className="w-full bg-surface-dark border border-border-dark rounded-xl pl-12 pr-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="bg-surface-dark border-border-dark rounded-xl px-4 py-3 text-white text-sm font-medium focus:ring-1 focus:ring-primary outline-none">
          <option>Tất cả vai trò</option>
          <option>Super Admin</option>
          <option>Editor</option>
          <option>Technician</option>
        </select>
      </div>

      <div className="bg-surface-dark border border-border-dark/50 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-background-dark/50 border-b border-border-dark/30 text-text-secondary uppercase text-[10px] font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">Người dùng</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4 text-center">Gói dịch vụ</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Truy cập cuối</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark/20">
              {MOCK_USERS.map((user) => (
                <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-indigo-500/20 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                        {user.avatar}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-sm">@{user.username}</span>
                        <span className="text-xs text-text-secondary">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-sm ${user.role === 'Super Admin' ? 'text-amber-400' : 'text-blue-400'}`}>
                        {user.role === 'Super Admin' ? 'verified_user' : user.role === 'Editor' ? 'edit_note' : 'engineering'}
                      </span>
                      <span className="text-sm font-medium text-gray-300">{user.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      {getPlanBadge(user.plan)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-2 w-2">
                        {user.status === 'active' && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        )}
                        <span className={`relative inline-flex rounded-full h-2 w-2 transition-all duration-500 ${
                          user.status === 'active' 
                          ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' 
                          : 'bg-red-500/80 shadow-[0_0_5px_rgba(239,68,68,0.3)] animate-pulse'
                        }`}></span>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                        user.status === 'active' ? 'text-green-500' : 'text-red-500/70'
                      }`}>
                        {user.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-text-secondary">{user.lastLogin}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1">
                      <button title="Chỉnh sửa" className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-all">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button title={user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa'} className={`p-2 rounded-lg transition-all ${user.status === 'active' ? 'text-text-secondary hover:text-orange-400 hover:bg-orange-400/10' : 'text-orange-400 hover:bg-orange-400/20'}`}>
                        <span className="material-symbols-outlined text-[20px]">{user.status === 'active' ? 'lock' : 'lock_open'}</span>
                      </button>
                      <button title="Đặt lại mật khẩu" className="p-2 text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition-all">
                        <span className="material-symbols-outlined text-[20px]">key</span>
                      </button>
                      <button title="Xóa" className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-background-dark/30 border-t border-border-dark/30 flex items-center justify-between">
          <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Hiển thị {MOCK_USERS.length} tài khoản</p>
          <div className="flex items-center gap-4">
             <button className="text-xs font-bold text-text-secondary hover:text-white transition-colors">Tải thêm</button>
          </div>
        </div>
      </div>
      
      {/* Plan Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
        {[
          { label: 'Premium Users', count: 1, color: 'blue', icon: 'workspace_premium' },
          { label: 'Free Users', count: 1, color: 'emerald', icon: 'eco' },
          { label: 'Internal Staff', count: 3, color: 'purple', icon: 'shield_person' },
        ].map((item, i) => (
          <div key={i} className="bg-surface-dark/40 border border-border-dark/30 rounded-2xl p-4 flex items-center justify-between hover:bg-surface-dark/60 transition-colors group cursor-default">
            <div>
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1 group-hover:text-white transition-colors">{item.label}</p>
              <p className="text-xl font-bold text-white">{item.count} <span className="text-xs font-normal text-text-secondary">tài khoản</span></p>
            </div>
            <div className={`w-10 h-10 rounded-xl bg-${item.color}-500/10 flex items-center justify-center text-${item.color}-500 border border-${item.color}-500/20 group-hover:scale-110 transition-transform`}>
              <span className="material-symbols-outlined">{item.icon}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManager;
