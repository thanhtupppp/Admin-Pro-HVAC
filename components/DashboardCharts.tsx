import React from 'react';
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data - sẽ replace bằng real data từ metricsService
const revenueData = [
    { month: 'T7', revenue: 4200000 },
    { month: 'T8', revenue: 5800000 },
    { month: 'T9', revenue: 7200000 },
    { month: 'T10', revenue: 9100000 },
    { month: 'T11', revenue: 11500000 },
    { month: 'T12', revenue: 14200000 },
];

const userGrowthData = [
    { month: 'T7', users: 120 },
    { month: 'T8', users: 185 },
    { month: 'T9', users: 250 },
    { month: 'T10', users: 340 },
    { month: 'T11', users: 425 },
    { month: 'T12', users: 520 },
];

const planDistributionData = [
    { name: 'Free', value: 380, color: '#64748b' },
    { name: 'Premium', value: 140, color: '#00ff88' },
];

export const RevenueChart: React.FC = () => {
    return (
        <div className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">
                Doanh thu 6 tháng gần đây
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
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

export const UserGrowthChart: React.FC = () => {
    return (
        <div className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">
                Tăng trưởng người dùng
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userGrowthData}>
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
                    <Bar dataKey="users" fill="#00ff88" name="Người dùng" radius={[8, 8, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export const PlanDistributionChart: React.FC = () => {
    return (
        <div className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">
                Phân bố gói dịch vụ
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={planDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {planDistributionData.map((entry, index) => (
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

const DashboardCharts: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RevenueChart />
                <UserGrowthChart />
            </div>
            <PlanDistributionChart />
        </div>
    );
};

export default DashboardCharts;
