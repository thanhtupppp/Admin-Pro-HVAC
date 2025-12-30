// Script khởi tạo default plans vào Firestore
// Chạy: node init-plans.js

import { planService } from './services/planService.js';

async function initPlans() {
    console.log('🚀 Bắt đầu khởi tạo default plans...\n');

    try {
        await planService.initializeDefaultPlans();
        console.log('✅ Khởi tạo thành công!\n');

        console.log('📋 Danh sách plans hiện tại:');
        const plans = await planService.getPlans();
        plans.forEach(plan => {
            console.log(`  - ${plan.displayName} (${plan.name}): ${plan.price.toLocaleString()}₫ / ${plan.billingCycle}`);
            console.log(`    Status: ${plan.status}, Features: ${plan.features.length}`);
        });

    } catch (error) {
        console.error('❌ Lỗi khi khởi tạo plans:', error);
    }

    process.exit(0);
}

initPlans();
