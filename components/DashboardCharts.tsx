import React, { useMemo } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction, AdminUser } from '../types';

interface DashboardChartsProps {
    transactions: Transaction[];
    users: AdminUser[];
}

export const RevenueChart: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
    const data = useMemo(() => {
        // Init last 6 months
        const months: Record<string, number> = {};
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `T${d.getMonth() + 1}`; // T1, T2...
            months[key] = 0;
        }

        // Fill data - Add null check
        if (transactions && Array.isArray(transactions)) {
            transactions.forEach(t => {
                if (t.status === 'completed') {
                    const d = new Date(t.createdAt);
                    // Check if within last 6 months approximately
                    const monthDiff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
                    if (monthDiff >= 0 && monthDiff <= 5) {
                        const key = `T${d.getMonth() + 1}`;
                        if (months[key] !== undefined) {
                            months[key] += t.amount;
                        }
                    }
                }
            });
        }

        return Object.entries(months).map(([month, revenue]) => ({ month, revenue }));
    }, [transactions]);

    return (
        <div className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">
                Doanh thu 6 tháng gần đây
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3442" />
                    <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: 12 }} />
                    <YAxis stroke="#64748b" style={{ fontSize: 12 }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1a1f2e',
                            border: '1px solid #2a3442',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                        formatter={(value: number) => `${value.toLocaleString()}₫`}
                    />
                    <Legend wrapperStyle={{ color: '#fff', fontSize: 12 }} />
                    <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#00ff88"
                        strokeWidth={3}
                        dot={{ fill: '#00ff88', r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Doanh thu"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export const UserGrowthChart: React.FC<{ users: AdminUser[] }> = ({ users }) => {
    const data = useMemo(() => {
        // Similar to revenue, simpler bucket
        const months: Record<string, number> = {};
        const now = new Date();
        // Init buckets
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `T${d.getMonth() + 1}`;
            months[key] = 0;
        }

        // Count accumulated users? Or new users per month? 
        // Showing "New Users" per month is better for growth chart bars. 
        // If "Total Growth", use Line/Area. Let's do "New Users" (Bar).
        if (users && Array.isArray(users)) {
            users.forEach(u => {
                // Fallback for users without createdAt (assume old)
                // Or better, skip them for growth chart or put in "Older" bucket
                if (u.createdAt) {
                    const d = new Date(u.createdAt);
                    const monthDiff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
                    if (monthDiff >= 0 && monthDiff <= 5) {
                        const key = `T${d.getMonth() + 1}`;
                        if (months[key] !== undefined) {
                            months[key]++;
                        }
                    }
                }
            });
        }

        return Object.entries(months).map(([month, count]) => ({ month, users: count }));
    }, [users]);

    return (
        <div className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">
                Tăng trưởng người dùng (Mới)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3442" />
                    <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: 12 }} />
                    <YAxis stroke="#64748b" style={{ fontSize: 12 }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1a1f2e',
                            border: '1px solid #2a3442',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                        formatter={(value: number) => `${value} users`}
                    />
                    <Legend wrapperStyle={{ color: '#fff', fontSize: 12 }} />
                    <Bar dataKey="users" fill="#00ff88" name="Người dùng mới" radius={[8, 8, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export const PlanDistributionChart: React.FC<{ users: AdminUser[] }> = ({ users }) => {
    const data = useMemo(() => {
        const distribution: Record<string, number> = {};
        
        if (users && Array.isArray(users)) {
            users.forEach(u => {
                // Normalize: Use the plan string as is, or default to 'Free'
                // Capitalize first letter for display aesthetics if it's lowercase
                let rawPlan = u.plan || 'Free';
                // Simple capitalization
                const planName = rawPlan.charAt(0).toUpperCase() + rawPlan.slice(1).toLowerCase();
                
                if (distribution[planName]) {
                    distribution[planName]++;
                } else {
                    distribution[planName] = 1;
                }
            });
        }

        const colors: Record<string, string> = {
            'Free': '#64748b',
            'Basic': '#3b82f6',
            'Premium': '#00ff88',
            'Enterprise': '#f59e0b',
            'Internal': '#6366f1'
        };
        
        // Fallback colors for unknown plans
        const defaultColors = ['#ec4899', '#8b5cf6', '#14b8a6', '#f43f5e'];

        return Object.entries(distribution).map(([name, value], index) => ({ 
            name, 
            value, 
            color: colors[name] || defaultColors[index % defaultColors.length] 
        }));
    }, [users]);

    return (
        <div className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">
                Phân bố gói dịch vụ
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1a1f2e',
                            border: '1px solid #2a3442',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                    />
                    <Legend wrapperStyle={{ color: '#fff', fontSize: 12 }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

const DashboardCharts: React.FC<DashboardChartsProps> = ({ transactions, users }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RevenueChart transactions={transactions} />
                <UserGrowthChart users={users} />
            </div>
            <PlanDistributionChart users={users} />
        </div>
    );
};

export default DashboardCharts;
