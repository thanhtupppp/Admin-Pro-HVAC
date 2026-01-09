import { AdminUser, Transaction, ErrorCode } from '../types';

export const DEMO_USERS: AdminUser[] = [
    {
        id: 'user_001',
        email: 'nguyenvanan@hvac.com',
        role: 'admin',
        username: 'nguyenvanan',
        name: 'Nguyễn Văn An',
        avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+An&background=0D8ABC&color=fff',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(), // 2 months ago
        lastLogin: new Date().toISOString(),
        status: 'active',
        plan: 'Premium'
    },
    {
        id: 'user_002',
        email: 'lethib@contractor.com',
        role: 'technician',
        username: 'lethibinh',
        name: 'Lê Thị Bình',
        avatar: 'https://ui-avatars.com/api/?name=Le+Thi+Binh&background=FCBA03&color=fff',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 1 month ago
        lastLogin: new Date().toISOString(),
        status: 'active',
        plan: 'Basic'
    },
    {
        id: 'user_003',
        email: 'phamvanc@service.com',
        role: 'technician',
        username: 'phamvancuong',
        name: 'Phạm Văn Cường',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
        lastLogin: new Date().toISOString(),
        status: 'locked',
        plan: 'Free'
    },
    {
        id: 'user_004',
        email: 'trand@hvac.com',
        role: 'admin',
        username: 'trandung',
        name: 'Trần Dũng',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
        lastLogin: new Date().toISOString(),
        status: 'active',
        plan: 'Enterprise'
    },
    {
        id: 'user_005',
        email: 'hoange@tech.com',
        role: 'technician',
        username: 'hoangeo',
        name: 'Hoàng Eo',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        lastLogin: new Date().toISOString(),
        status: 'active',
        plan: 'Premium'
    }
];

export const DEMO_TRANSACTIONS: Transaction[] = [
    {
        id: 'tx_001',
        userId: 'user_001',
        userEmail: 'nguyenvanan@hvac.com',
        planId: 'plan_premium',
        planName: 'Premium Monthly',
        amount: 5000000,
        status: 'completed',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        paymentMethod: 'vietqr'
    },
    {
        id: 'tx_002',
        userId: 'user_002',
        userEmail: 'lethib@contractor.com',
        planId: 'plan_basic',
        planName: 'Basic Monthly',
        amount: 200000,
        status: 'completed',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
        paymentMethod: 'momo'
    },
    {
        id: 'tx_003',
        userId: 'user_004',
        userEmail: 'trand@hvac.com',
        planId: 'plan_enterprise',
        planName: 'Enterprise Annual',
        amount: 15000000,
        status: 'pending',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 0.5).toISOString(), // 12 hours ago
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 0.5).toISOString(),
        paymentMethod: 'banking'
    },
    {
        id: 'tx_004',
        userId: 'user_005',
        userEmail: 'hoange@tech.com',
        planId: 'plan_premium',
        planName: 'Premium Renewal',
        amount: 500000,
        status: 'failed',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
        paymentMethod: 'momo' // Changed from card (invalid) to momo
    },
    {
        id: 'tx_005',
        userId: 'user_001',
        userEmail: 'nguyenvanan@hvac.com',
        planId: 'addon_ai',
        planName: 'AI Tokens Addon',
        amount: 2500000,
        status: 'completed',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
        paymentMethod: 'vietqr'
    }
];

export const DEMO_ERRORS: ErrorCode[] = [
    {
        id: 'err_001',
        code: 'E1',
        title: 'Lỗi cảm biến nhiệt độ phòng',
        brand: 'Daikin',
        brandName: 'Daikin',
        model: 'VRV IV',
        views: 1250,
        updatedAt: new Date().toISOString(),
        symptom: 'Máy không lạnh, đèn nháy',
        cause: 'Hỏng thermistor',
        status: 'active',
        severity: 'medium',
        steps: ['Kiểm tra điện trở', 'Thay thế cảm biến'],
        tools: ['Đồng hồ vạn năng'],
        components: ['Thermistor R1T'],
        images: []
    },
    {
        id: 'err_002',
        code: 'CH05',
        title: 'Lỗi giao tiếp giữa dàn nóng và dàn lạnh',
        brand: 'LG',
        brandName: 'LG',
        model: 'Multi V',
        views: 890,
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        symptom: 'Mất kết nối',
        cause: 'Dây tín hiệu đứt',
        status: 'active',
        severity: 'high',
        steps: [],
        tools: [],
        components: [],
        images: []
    },
    {
        id: 'err_003',
        code: 'U4',
        title: 'Mất tín hiệu kết nối',
        brand: 'Daikin',
        brandName: 'Daikin',
        model: 'Inverter',
        views: 3400,
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        symptom: 'Đèn nháy U4',
        cause: 'Bo mạch hỏng',
        status: 'active',
        severity: 'high',
        steps: [],
        tools: [],
        components: [],
        images: []
    },
    {
        id: 'err_004',
        code: 'P0',
        title: 'Bảo vệ quá dòng inverter',
        brand: 'Panasonic',
        brandName: 'Panasonic',
        model: 'Sky Series',
        views: 560,
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
        symptom: 'Máy ngắt',
        cause: 'Máy nén quá tải',
        status: 'active',
        severity: 'high', // Critical mapped to high
        steps: [],
        tools: [],
        components: [],
        images: []
    },
    {
        id: 'err_005',
        code: 'F3',
        title: 'Nhiệt độ ống đẩy bất thường',
        brand: 'Daikin',
        brandName: 'Daikin',
        model: 'VRV A',
        views: 210,
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        symptom: 'Ống đẩy quá nóng',
        cause: 'Thiếu gas hoặc tắc tiết lưu',
        status: 'active',
        severity: 'medium',
        steps: [],
        tools: [],
        components: [],
        images: []
    }
];

export const DEMO_STATS = {
    totalUsers: 145,
    totalRevenue: 258500000,
    pendingApprovals: 3,
    activeErrors: 12,
    trends: {
        users: 15.2,
        revenue: 28.5,
        approvals: -10,
        errors: 8.4
    }
};
