// Script để tạo tài khoản admin mới
// Chạy lệnh: node create-admin.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyCIyZH-ksFp8qpHAtYkljKk3jqgc1sUxbE",
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "admin-pro-hvac.firebaseapp.com",
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || "admin-pro-hvac",
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "admin-pro-hvac.firebasestorage.app",
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "466143298732",
    appId: process.env.VITE_FIREBASE_APP_ID || "1:466143298732:web:e09935891fce37a50d30e9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createAdmin() {
    try {
        console.log('🔧 Đang tạo tài khoản admin mới...');

        const adminData = {
            username: 'admin',
            email: 'thanhtupy@gmail.com',
            role: 'Super Admin',
            status: 'active',
            plan: 'Internal',
            avatar: 'AD',
            lastLogin: 'Chưa đăng nhập'
        };

        const docRef = await addDoc(collection(db, 'users'), adminData);

        console.log('✅ Tạo tài khoản admin thành công!');
        console.log('📋 Thông tin tài khoản:');
        console.log(`   ID: ${docRef.id}`);
        console.log(`   Username: ${adminData.username}`);
        console.log(`   Email: ${adminData.email}`);
        console.log(`   Role: ${adminData.role}`);
        console.log(`   Plan: ${adminData.plan}`);
        console.log(`   Status: ${adminData.status}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi khi tạo tài khoản admin:', error);
        process.exit(1);
    }
}

createAdmin();
