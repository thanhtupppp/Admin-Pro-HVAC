import React, { useState } from 'react';
import { Send, Loader2, ChevronRight } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { pushNotificationService } from '../services/pushNotificationService';
import { PushNotification } from '../types';
import { TargetSelector } from './notifications/TargetSelector';
import { NotificationPreview } from './notifications/NotificationPreview';

export function PushNotificationManager() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetType, setTargetType] = useState<'all' | 'user' | 'plan'>('all');
  const [targetValue, setTargetValue] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    // Validation
    if (!title.trim() || !body.trim()) {
      toast.error('Vui lòng nhập tiêu đề và nội dung');
      return;
    }

    if (targetType !== 'all' && !targetValue.trim()) {
      toast.error(`Vui lòng nhập ${targetType === 'user' ? 'User ID' : 'Plan'}`);
      return;
    }

    // Confirmation toast
    const confirmed = window.confirm(
      `Gửi thông báo đến: ${
        targetType === 'all' ? 'TẤT CẢ người dùng' :
        targetType === 'user' ? `User: ${targetValue}` :
        `Plan: ${targetValue}`
      }?\n\nTiêu đề: ${title}\nNội dung: ${body}`
    );

    if (!confirmed) return;

    setIsSending(true);

    try {
      const notification: PushNotification = {
        title,
        body,
        targetType,
        targetValue: targetType === 'all' ? undefined : targetValue,
      };

      await pushNotificationService.sendViaCloudFunction(notification);
      await pushNotificationService.saveToHistory(notification);

      toast.success('✅ Đã gửi thông báo thành công!');
      
      // Reset form
      setTitle('');
      setBody('');
      setTargetValue('');
    } catch (error) {
      toast.error(`❌ Lỗi: ${(error as Error).message}`);
    } finally {
      setIsSending(false);
    }
  };

  const titleLength = title.length;
  const bodyLength = body.length;
  const isValid = title.trim() && body.trim() && (targetType === 'all' || targetValue.trim());

  return (
    <>
      <Toaster position="top-right" />
      
      <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors">
        <div className="max-w-4xl mx-auto p-6 md:p-8">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-3">
              <span>Dashboard</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-slate-900 dark:text-slate-100 font-medium">Gửi Thông Báo</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              Gửi Thông Báo Push
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Gửi thông báo đến users qua Firebase Cloud Messaging
            </p>
          </header>

          {/* Main Card */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-6 md:p-8">
            {/* Target Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Đối tượng nhận
              </label>
              <TargetSelector value={targetType} onChange={setTargetType} />
            </div>

            {/* Target Value Input */}
            {targetType !== 'all' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {targetType === 'user' ? 'User ID' : 'Plan'}
                </label>
                <input
                  type="text"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  placeholder={targetType === 'user' ? 'Nhập User ID...' : 'Free, Basic, Premium, Enterprise'}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            )}

            {/* Title Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Tiêu đề
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Cập nhật mới từ Admin Pro HVAC"
                maxLength={50}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <div className={`text-xs mt-1.5 text-right transition-colors ${
                titleLength > 45 ? 'text-red-500' : titleLength > 35 ? 'text-amber-500' : 'text-slate-400'
              }`}>
                {titleLength}/50
              </div>
            </div>

            {/* Body Textarea */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Nội dung
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Nhập nội dung thông báo..."
                rows={4}
                maxLength={200}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              />
              <div className={`text-xs mt-1.5 text-right transition-colors ${
                bodyLength > 180 ? 'text-red-500' : bodyLength > 150 ? 'text-amber-500' : 'text-slate-400'
              }`}>
                {bodyLength}/200
              </div>
            </div>

            {/* Preview */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Preview
              </label>
              <NotificationPreview title={title} body={body} />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setTitle('');
                  setBody('');
                  setTargetValue('');
                  setTargetType('all');
                }}
                className="px-6 py-3 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                Clear
              </button>
              
              <button
                onClick={handleSend}
                disabled={isSending || !isValid}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all transform ${
                  isSending || !isValid
                    ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-[1.02] shadow-lg hover:shadow-xl cursor-pointer'
                }`}
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Gửi Thông Báo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
