// Script để tạo tài khoản admin mới
// Chạy lệnh: node create-admin.js

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

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
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdmin() {
    try {
        console.log('🔧 Đang tạo tài khoản admin mới...');

        const email = 'thanhtupy@gmail.com';
        const password = 'Admin@123456';

        // Step 1: Create Firebase Auth user
        console.log('1️⃣ Creating Firebase Auth user...');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log(`✅ Auth user created with UID: ${user.uid}`);

        // Step 2: Create Firestore document with SAME UID
        console.log('2️⃣ Creating Firestore user document...');
        const adminData = {
            email: email,
            name: 'Super Admin',
            role: 'Super Admin', // ⚠️ CRITICAL: Must match firestore.rules
            status: 'active',
            plan: 'Internal',
            planExpiresAt: null,
            avatar: 'SA',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastLogin: null
        };

        // ⚠️ IMPORTANT: Use setDoc with user.uid as document ID
        await setDoc(doc(db, 'users', user.uid), adminData);

        console.log('✅ Tạo tài khoản admin thành công!');
        console.log('📋 Thông tin tài khoản:');
        console.log(`   UID: ${user.uid}`);
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
        console.log(`   Role: ${adminData.role}`);
        console.log(`   Plan: ${adminData.plan}`);
        console.log(`   Status: ${adminData.status}`);
        console.log('');
        console.log('⚠️ LƯU Ý: Đăng nhập với email và password ở trên!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi khi tạo tài khoản admin:', error);
        console.log('');
        if (error.code === 'auth/email-already-in-use') {
            console.log('💡 Email đã tồn tại. Bạn có thể:');
            console.log('   1. Đăng nhập với email này');
            console.log('   2. Hoặc vào Firebase Console → Firestore');
            console.log('   3. Tìm user document và add field: role = "Super Admin"');
        }
        process.exit(1);
    }
}

createAdmin();
