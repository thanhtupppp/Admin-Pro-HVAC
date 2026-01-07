import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { AdminUser } from '../types';

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th className="text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="font-medium text-text-primary">{user.username}</td>
                <td className="text-text-secondary">{user.email}</td>
                <td>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${user.role === 'admin' ? 'bg-status-error/10 text-status-error' :
                      user.role === 'editor' ? 'bg-brand-primary/10 text-brand-primary' :
                        'bg-text-muted/10 text-text-muted'
                    }`}>
                    {user.role}
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
    </div>
  );
};

export default UserManager;
