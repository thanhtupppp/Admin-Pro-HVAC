// Script kiểm tra và hướng dẫn sửa lỗi đăng nhập
// Chạy: node check-firebase-auth.js

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAjlwe3zThnEbr6rGHB7YP19-IBHGNcz6I",
    authDomain: "admin-pro-hvac.firebaseapp.com",
    projectId: "admin-pro-hvac",
    storageBucket: "admin-pro-hvac.firebasestorage.app",
    messagingSenderId: "385210564068",
    appId: "1:385210564068:web:b5b5f4137727b294991bf1",
    measurementId: "G-ZH9567SWGR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function checkAuth() {
    console.log('🔍 Kiểm tra Firebase Authentication Setup...\n');

    // 1. Kiểm tra Firestore users
    console.log('📋 BƯỚC 1: Kiểm tra users trong Firestore');
    try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        console.log(`   ✅ Firestore connected. Tìm thấy ${usersSnapshot.size} users:`);

        usersSnapshot.forEach(doc => {
            const data = doc.data();
            console.log(`   - ${data.email} (${data.role}, status: ${data.status})`);
        });
        console.log('');
    } catch (error) {
        console.error('   ❌ Lỗi kết nối Firestore:', error.message);
        console.log('');
    }

    // 2. Test đăng nhập
    const testEmail = 'thanhtupy@gmail.com';
    const testPassword = 'Admin@123456';

    console.log('🔐 BƯỚC 2: Test đăng nhập');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    console.log('');

    try {
        const userCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
        console.log('   ✅ Đăng nhập Firebase Auth THÀNH CÔNG!');
        console.log(`   UID: ${userCredential.user.uid}`);
        console.log(`   Email verified: ${userCredential.user.emailVerified}`);
        console.log('');
        console.log('✅ HỆ THỐNG HOẠT ĐỘNG BÌNH THƯỜNG!');
        console.log('   Nếu web app vẫn lỗi, hãy:');
        console.log('   1. Clear cache trình duyệt (Ctrl + Shift + Delete)');
        console.log('   2. Hard reload (Ctrl + Shift + R)');
        console.log('   3. Thử lại với email và password chính xác');

    } catch (error) {
        console.error('   ❌ Đăng nhập THẤT BẠI!');
        console.error(`   Lỗi: ${error.code} - ${error.message}\n`);

        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
            console.log('📝 NGUYÊN NHÂN: Tài khoản chưa được tạo trong Firebase Authentication');
            console.log('');
            console.log('🔧 CÁCH SỬA:');
            console.log('   Vào Firebase Console và tạo user thủ công:');
            console.log('   1. Mở: https://console.firebase.google.com/project/admin-pro-hvac/authentication/users');
            console.log('   2. Click "Add user"');
            console.log(`   3. Email: ${testEmail}`);
            console.log(`   4. Password: ${testPassword}`);
            console.log('   5. Click "Add user"');
            console.log('');
            console.log('   Sau đó chạy lại script này để verify.');

        } else if (error.code === 'auth/wrong-password') {
            console.log('📝 NGUYÊN NHÂN: Password không đúng');
            console.log('');
            console.log('🔧 CÁCH SỬA:');
            console.log('   1. Vào Firebase Console: https://console.firebase.google.com/project/admin-pro-hvac/authentication/users');
            console.log(`   2. Tìm user ${testEmail}`);
            console.log('   3. Click vào user, chọn "Reset password"');
            console.log(`   4. Đặt password mới: ${testPassword}`);

        } else if (error.code === 'auth/too-many-requests') {
            console.log('📝 NGUYÊN NHÂN: Đã thử đăng nhập sai quá nhiều lần');
            console.log('');
            console.log('🔧 CÁCH SỬA:');
            console.log('   Đợi 15-30 phút hoặc:');
            console.log('   1. Vào Firebase Console');
            console.log('   2. Xóa user cũ');
            console.log('   3. Tạo user mới với email và password trên');
        }
    }

    process.exit(0);
}

checkAuth();
