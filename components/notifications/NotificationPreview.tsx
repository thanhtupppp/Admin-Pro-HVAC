import React from 'react';
import { Bell } from 'lucide-react';

interface NotificationPreviewProps {
  title: string;
  body: string;
}

export function NotificationPreview({ title, body }: NotificationPreviewProps) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-500/10 rounded-lg">
          <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
            {title || 'Tiêu đề thông báo...'}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
            {body || 'Nội dung thông báo sẽ hiển thị ở đây...'}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-slate-500 dark:text-slate-500">
              Admin Pro HVAC
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-500">
              Vừa xong
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
