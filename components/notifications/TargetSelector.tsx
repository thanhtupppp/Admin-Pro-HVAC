import React from 'react';
import { Users, User, Crown } from 'lucide-react';

interface TargetSelectorProps {
  value: 'all' | 'user' | 'plan';
  onChange: (value: 'all' | 'user' | 'plan') => void;
}

export function TargetSelector({ value, onChange }: TargetSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {/* All Users */}
      <button
        type="button"
        onClick={() => onChange('all')}
        className={`
          relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
          ${value === 'all'
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
          }
        `}
      >
        <div className="flex flex-col items-center gap-2">
          <Users className={`w-6 h-6 ${value === 'all' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
          <span className={`text-sm font-medium ${value === 'all' ? 'text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400'}`}>
            Tất cả
          </span>
        </div>
        {value === 'all' && (
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500" />
        )}
      </button>

      {/* Specific User */}
      <button
        type="button"
        onClick={() => onChange('user')}
        className={`
          relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
          ${value === 'user'
            ? 'border-green-500 bg-green-50 dark:bg-green-500/10'
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
          }
        `}
      >
        <div className="flex flex-col items-center gap-2">
          <User className={`w-6 h-6 ${value === 'user' ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`} />
          <span className={`text-sm font-medium ${value === 'user' ? 'text-green-700 dark:text-green-300' : 'text-slate-600 dark:text-slate-400'}`}>
            User cụ thể
          </span>
        </div>
        {value === 'user' && (
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500" />
        )}
      </button>

      {/* By Plan */}
      <button
        type="button"
        onClick={() => onChange('plan')}
        className={`
          relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
          ${value === 'plan'
            ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10'
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
          }
        `}
      >
        <div className="flex flex-col items-center gap-2">
          <Crown className={`w-6 h-6 ${value === 'plan' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`} />
          <span className={`text-sm font-medium ${value === 'plan' ? 'text-purple-700 dark:text-purple-300' : 'text-slate-600 dark:text-slate-400'}`}>
            Theo Plan
          </span>
        </div>
        {value === 'plan' && (
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-500" />
        )}
      </button>
    </div>
  );
}
