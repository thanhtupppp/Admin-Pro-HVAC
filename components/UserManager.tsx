import React, { useState, useMemo, useEffect } from 'react';
import { userService } from '../services/userService';
import { AdminUser } from '../types';
import BulkImportModal from './BulkImportModal';

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<AdminUser>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (e) {
      console.error("Failed to load users", e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole === 'All' || user.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, selectedRole]);

  const handleAddUser = () => {
    setIsEditing(false);
    setCurrentUser({
      role: 'Technician',
      plan: 'Free',
      status: 'active'
    });
    setShowModal(true);
  };

  const handleEditUser = (user: AdminUser) => {
    setIsEditing(true);
    setCurrentUser(user);
    setShowModal(true);
  };

  const handleSaveUser = async () => {
    if (!currentUser.username || !currentUser.email) return;

    try {
      if (isEditing && currentUser.id) {
        const updatedUser = await userService.updateUser(currentUser.id, currentUser);
        setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
      } else {
        const newUser = await userService.createUser({
          username: currentUser.username,
          email: currentUser.email,
          role: currentUser.role || 'Technician',
          status: currentUser.status || 'active',
          plan: currentUser.plan
        });
        setUsers([newUser, ...users]);
      }
      setShowModal(false);
    } catch (e) {
      alert("Action failed");
    }
  };

  const handleDeleteUser = async (id: string) => {
    const userToDelete = users.find(u => u.id === id);

    // Bảo vệ Super Admin duy nhất
    if (userToDelete?.role === 'Super Admin') {
      const superAdminCount = users.filter(u => u.role === 'Super Admin').length;
      if (superAdminCount <= 1) {
        alert('⛔ Không thể xóa Super Admin duy nhất!\n\nHệ thống cần ít nhất 1 Super Admin để quản lý.');
        return;
      }
    }

    if (confirm('Bạn có chắc muốn xóa người dùng này?')) {
      await userService.deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleToggleStatus = async (id: string) => {
    const userToToggle = users.find(u => u.id === id);

    // Bảo vệ Super Admin duy nhất khỏi bị khóa
    if (userToToggle?.role === 'Super Admin' && userToToggle.status === 'active') {
      const activeSuperAdminCount = users.filter(u => u.role === 'Super Admin' && u.status === 'active').length;
      if (activeSuperAdminCount <= 1) {
        alert('⛔ Không thể khóa Super Admin duy nhất!\n\nHệ thống cần ít nhất 1 Super Admin hoạt động.');
        return;
      }
    }

    try {
      const updatedUser = await userService.toggleStatus(id);
      setUsers(users.map(u => u.id === id ? updatedUser : u));
    } catch (e) {
      console.error(e);
    }
  };

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
        <div className="flex gap-3">
          <button
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-white/5 text-text-secondary font-bold rounded-xl border border-white/10 hover:bg-white/10 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">upload_file</span>
            Import CSV
          </button>
          <button
            onClick={handleAddUser}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            Thêm thành viên
          </button>
        </div>
      </div>

      <BulkImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={() => {
          loadData();
          // setIsImportOpen(false); // Optional: keep open to show results
        }}
        type="users"
      />

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
        <select
          className="bg-surface-dark border-border-dark rounded-xl px-4 py-3 text-white text-sm font-medium focus:ring-1 focus:ring-primary outline-none"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option value="All">Tất cả vai trò</option>
          <option value="Super Admin">Super Admin</option>
          <option value="Editor">Editor</option>
          <option value="Technician">Technician</option>
        </select>
      </div>

      {isLoading ? (
        <div className="bg-surface-dark border border-border-dark/50 rounded-2xl p-8 text-center text-text-secondary">
          Đang tải danh sách thành viên...
        </div>
      ) : (
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
                {filteredUsers.map((user) => (
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
                          <span className={`relative inline-flex rounded-full h-2 w-2 transition-all duration-500 ${user.status === 'active'
                            ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]'
                            : 'bg-red-500/80 shadow-[0_0_5px_rgba(239,68,68,0.3)] animate-pulse'
                            }`}></span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${user.status === 'active' ? 'text-green-500' : 'text-red-500/70'
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
                        <button onClick={() => handleEditUser(user)} title="Chỉnh sửa" className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-all">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        {/* Chỉ hiện nút khóa nếu KHÔNG phải Super Admin */}
                        {user.role !== 'Super Admin' && (
                          <button
                            onClick={() => handleToggleStatus(user.id)}
                            title={user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa'}
                            className={`p-2 rounded-lg transition-all ${user.status === 'active' ? 'text-text-secondary hover:text-orange-400 hover:bg-orange-400/10' : 'text-orange-400 hover:bg-orange-400/20'}`}
                          >
                            <span className="material-symbols-outlined text-[20px]">{user.status === 'active' ? 'lock' : 'lock_open'}</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          title="Xóa"
                          className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        >
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
            <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Hiển thị {filteredUsers.length} tài khoản</p>
            <div className="flex items-center gap-4">
              <button className="text-xs font-bold text-text-secondary hover:text-white transition-colors">Tải thêm</button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
        {[
          { label: 'Premium Users', count: users.filter(u => u.plan === 'Premium').length, color: 'blue', icon: 'workspace_premium' },
          { label: 'Free Users', count: users.filter(u => u.plan === 'Free').length, color: 'emerald', icon: 'eco' },
          { label: 'Internal Staff', count: users.filter(u => u.plan === 'Internal').length, color: 'purple', icon: 'shield_person' },
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-surface-dark border border-border-dark rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border-dark/30 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">{isEditing ? 'Chỉnh sửa thành viên' : 'Thêm thành viên mới'}</h3>
              <button onClick={() => setShowModal(false)} className="text-text-secondary hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase">Username</label>
                <input
                  type="text"
                  className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none"
                  placeholder="Ví dụ: nguyen.van.a"
                  value={currentUser.username || ''}
                  onChange={(e) => setCurrentUser({ ...currentUser, username: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase">Email</label>
                <input
                  type="email"
                  className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none"
                  placeholder="example@service.vn"
                  value={currentUser.email || ''}
                  onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase">Vai trò</label>
                  <select
                    className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none"
                    value={currentUser.role || 'Technician'}
                    onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Editor">Editor</option>
                    <option value="Technician">Technician</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase">Gói dịch vụ</label>
                  <select
                    className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none"
                    value={currentUser.plan || 'Free'}
                    onChange={(e) => setCurrentUser({ ...currentUser, plan: e.target.value as any })}
                  >
                    <option value="Free">Free</option>
                    <option value="Premium">Premium</option>
                    <option value="Internal">Internal</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border-dark/30">
              <button
                onClick={handleSaveUser}
                className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all"
              >
                {isEditing ? 'Lưu thay đổi' : 'Tạo thành viên'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;
