import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, Timestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Appeal {
  id: string;
  userId: string;
  userEmail: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
  deviceInfo?: string;
}

const AppealsManager: React.FC = () => {
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAppeals();
  }, []);

  const fetchAppeals = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'appeals'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const fetchedAppeals = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Appeal));
      setAppeals(fetchedAppeals);
    } catch (error) {
      console.error("Error fetching appeals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appeal: Appeal) => {
    if (!window.confirm(`Bạn có chắc muốn mở khóa cho ${appeal.userEmail}?`)) return;
    
    setProcessingId(appeal.id);
    try {
      // 1. Unlock User
      await updateDoc(doc(db, 'users', appeal.userId), {
        status: 'active',
        lockedAt: null,
        lockReason: null,
      });

      // 2. Update Appeal Status
      await updateDoc(doc(db, 'appeals', appeal.id), {
        status: 'approved',
        resolvedAt: Timestamp.now(),
      });

      // 3. Refresh
      fetchAppeals();
      alert('Đã mở khóa tài khoản thành công!');
    } catch (error) {
      console.error("Error approving appeal:", error);
      alert('Có lỗi xảy ra khi mở khóa.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (appeal: Appeal) => {
    if (!window.confirm(`Từ chối kháng cáo của ${appeal.userEmail}? Tài khoản sẽ vẫn bị khóa.`)) return;

    setProcessingId(appeal.id);
    try {
      // Update Appeal Status
      await updateDoc(doc(db, 'appeals', appeal.id), {
        status: 'rejected',
        resolvedAt: Timestamp.now(),
      });

      fetchAppeals();
    } catch (error) {
       console.error("Error rejecting appeal:", error);
       alert('Có lỗi xảy ra.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Xử lý Khiếu nại</h2>
          <p className="text-text-secondary mt-1">Danh sách yêu cầu mở khóa từ người dùng</p>
        </div>
        <button 
          onClick={fetchAppeals}
          className="px-4 py-2 bg-bg-panel border border-border-base rounded-lg text-text-primary hover:bg-bg-hover transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-xl">refresh</span>
          Làm mới
        </button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
             <div key={i} className="h-32 bg-bg-panel rounded-xl animate-pulse"></div>
          ))
        ) : appeals.length === 0 ? (
          <div className="text-center py-12 bg-bg-panel rounded-2xl border border-border-base">
            <span className="material-symbols-outlined text-4xl text-text-muted mb-2">inbox</span>
            <p className="text-text-secondary">Không có khiếu nại nào cần xử lý</p>
          </div>
        ) : (
          appeals.map((appeal) => (
            <div 
              key={appeal.id} 
              className={`bg-bg-panel rounded-xl border border-border-base p-6 transition-all ${appeal.status !== 'pending' ? 'opacity-75 grayscale-[0.5]' : 'shadow-sm hover:shadow-md'}`}
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      appeal.status === 'pending' ? 'text-blue-500 bg-blue-500/10 border-blue-500/20' :
                      appeal.status === 'approved' ? 'text-green-500 bg-green-500/10 border-green-500/20' :
                      'text-red-500 bg-red-500/10 border-red-500/20'
                    }`}>
                      {appeal.status === 'pending' ? 'Chờ xử lý' : appeal.status === 'approved' ? 'Đã chấp nhận' : 'Đã từ chối'}
                    </span>
                    <span className="text-xs text-text-muted">
                      {appeal.createdAt ? format(appeal.createdAt.toDate(), 'dd/MM/yyyy HH:mm', { locale: vi }) : ''}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-text-primary">{appeal.userEmail}</h3>
                    <span className="text-xs font-mono text-text-muted bg-bg-subtle px-2 py-0.5 rounded">{appeal.userId}</span>
                  </div>
                  
                  <div className="bg-bg-subtle/50 p-3 rounded-lg border border-border-base/50">
                    <p className="text-sm text-text-secondary italic">" {appeal.reason} "</p>
                  </div>
                </div>

                {appeal.status === 'pending' && (
                  <div className="flex items-start gap-2">
                    <button
                      onClick={() => handleApprove(appeal)}
                      disabled={!!processingId}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-lg">check_circle</span>
                      Mở khóa
                    </button>
                    <button
                      onClick={() => handleReject(appeal)}
                      disabled={!!processingId}
                      className="px-4 py-2 bg-bg-subtle hover:bg-red-500/10 text-text-primary hover:text-red-500 border border-border-base hover:border-red-500/30 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-lg">cancel</span>
                      Từ chối
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AppealsManager;
