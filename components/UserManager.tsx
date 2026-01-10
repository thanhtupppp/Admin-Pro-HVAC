import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { AdminUser } from '../types';
import BulkImportModal from './BulkImportModal';

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  
  // New User Form State
  const [newUser, setNewUser] = useState({
      username: '',
      email: '',
      role: 'viewer', // default
      plan: 'Free' as any,
      status: 'active' as any
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleStatus = async (user: AdminUser) => {
    const action = user.status === 'active' ? 'khóa' : 'mở khóa';
    if (confirm(`Bạn có chắc muốn ${action} người dùng ${user.username}?`)) {
      try {
        const updatedUser = await userService.toggleStatus(user.id);
        setUsers(users.map(u => u.id === user.id ? updatedUser : u));
      } catch (error) {
        console.error("Failed to toggle status", error);
        alert('Lỗi khi cập nhật trạng thái');
      }
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa người dùng này?')) {
      try {
        await userService.deleteUser(id);
        setUsers(users.filter(u => u.id !== id));
      } catch (error) {
        console.error("Failed to delete user", error);
      }
    }
  };

  const handleCreateUser = async () => {
      if (!newUser.username || !newUser.email) {
          alert('Vui lòng điền đầy đủ thông tin bắt buộc');
          return;
      }

      try {
          // Default password for new users? or they set it via email?
          // For now, assuming auth logic handles it or it's a "create profile" call.
          // Note: The original code didn't handle auth creation, just firestore doc. 
          // We keep it as is.
          const createdUser = await userService.createUser({
              username: newUser.username,
              email: newUser.email,
              role: newUser.role,
              status: newUser.status as any,
              plan: newUser.plan as any
          });
          setUsers([createdUser, ...users]);
          setIsAddUserModalOpen(false);
          setNewUser({ username: '', email: '', role: 'viewer', plan: 'Free', status: 'active' });
          alert(`Đã tạo người dùng ${createdUser.username} thành công!`);
      } catch (error) {
          console.error("Create user failed", error);
          alert("Lỗi khi tạo người dùng");
      }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-pulse-slow text-brand-primary text-4xl mb-4">●</div>
          <p className="text-text-secondary text-sm">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary mb-1">Quản trị viên</h1>
          <p className="text-sm text-text-muted">{users.length} người dùng trong hệ thống</p>
        </div>
        <div className="flex gap-3">
             <button
                onClick={() => setIsImportModalOpen(true)}
                className="px-4 py-2 bg-surface-dark border border-border-base hover:bg-surface-hover text-text-primary rounded-lg transition-all flex items-center gap-2"
            >
                <span className="material-symbols-outlined text-xl">upload_file</span>
                Import Excel
            </button>
            <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/80 text-white font-bold rounded-lg transition-all flex items-center gap-2"
            >
                <span className="material-symbols-outlined text-xl">person_add</span>
                Thêm User
            </button>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Tìm kiếm theo tên hoặc email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full max-w-md bg-bg-soft border border-border-base rounded-lg px-4 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
      />

      {/* Users Table */}
      <div className="industrial-card">
        <table className="industrial-table">
          <thead>
            <tr>
              <th>Tên người dùng</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Gói (Plan)</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th className="text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="font-medium text-text-primary">{user.username}</td>
                <td className="text-text-secondary w-40 truncate" title={user.email}>{user.email}</td>
                <td>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${user.role === 'admin' ? 'bg-status-error/10 text-status-error' :
                      user.role === 'editor' ? 'bg-brand-primary/10 text-brand-primary' :
                        'bg-text-muted/10 text-text-muted'
                    }`}>
                    {user.role}
                  </span>
                </td>
                 <td>
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${user.plan === 'Enterprise' ? 'border-purple-500/30 text-purple-400' :
                      user.plan === 'Premium' ? 'border-amber-500/30 text-amber-400' :
                        'border-gray-700 text-gray-400'
                    }`}>
                    {user.plan || 'Free'}
                  </span>
                </td>
                <td>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${user.status === 'active' ? 'status-ok' : 'status-off'
                    }`}>
                    {user.status === 'active' ? '● Active' : '○ Inactive'}
                  </span>
                </td>
                <td className="font-mono text-text-muted text-sm">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}
                </td>
                <td className="text-right">
                  <button
                    onClick={() => handleToggleStatus(user)}
                    className="text-text-secondary hover:text-brand-primary transition-colors mr-2"
                    title={user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa'}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {user.status === 'active' ? 'lock_open' : 'lock'}
                    </span>
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-text-secondary hover:text-status-error transition-colors"
                    title="Xóa"
                  >
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-text-muted">
            {searchTerm ? 'Không tìm thấy người dùng phù hợp' : 'Chưa có người dùng nào'}
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {isAddUserModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#1a1f2e] rounded-2xl w-full max-w-md border border-gray-800 shadow-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Thêm User Mới</h3>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Tên hiển thị <span className="text-red-500">*</span></label>
                          <input 
                              value={newUser.username}
                              onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                              className="w-full bg-background-dark border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-primary"
                              placeholder="VD: Nguyen Van A"
                          />
                      </div>
                      
                      <div>
                          <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Email <span className="text-red-500">*</span></label>
                          <input 
                              type="email"
                              value={newUser.email}
                              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                              className="w-full bg-background-dark border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-primary"
                              placeholder="email@example.com"
                          />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Phân quyền</label>
                              <select 
                                  value={newUser.role}
                                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                                  className="w-full bg-background-dark border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-primary"
                              >
                                  <option value="viewer">Viewer</option>
                                  <option value="editor">Editor</option>
                                  <option value="admin">Admin</option>
                              </select>
                          </div>
                          
                          <div>
                              <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Gói dịch vụ</label>
                              <select 
                                  value={newUser.plan}
                                  onChange={(e) => setNewUser({...newUser, plan: e.target.value as any})}
                                  className="w-full bg-background-dark border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-primary"
                              >
                                  <option value="Free">Free</option>
                                  <option value="Basic">Basic</option>
                                  <option value="Premium">Premium</option>
                                  <option value="Enterprise">Enterprise</option>
                              </select>
                          </div>
                      </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-8">
                      <button 
                          onClick={() => setIsAddUserModalOpen(false)}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-bold"
                      >
                          Hủy
                      </button>
                      <button 
                          onClick={handleCreateUser}
                          className="px-6 py-2 bg-brand-primary hover:bg-brand-primary/80 text-white rounded-lg font-bold shadow-lg shadow-brand-primary/20"
                      >
                          Tạo User
                      </button>
                  </div>
              </div>
          </div>
      )}

      <BulkImportModal 
          isOpen={isImportModalOpen} 
          onClose={() => setIsImportModalOpen(false)} 
          onSuccess={() => { setIsImportModalOpen(false); loadUsers(); }}
          type="users"
      />
    </div>
  );
};

export default UserManager;
