// Script để đăng ký tài khoản admin vào Firebase Authentication
// Chạy lệnh: node register-admin-auth.js

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

// Firebase config
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

async function registerAdmin() {
    const adminEmail = 'thanhtupy@gmail.com';
    const adminPassword = 'Admin@123456'; // Mật khẩu mạnh cho admin

    try {
        console.log('🔐 Đang đăng ký tài khoản admin vào Firebase Authentication...');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);
        console.log('');

        const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);

        console.log('✅ Đăng ký tài khoản admin thành công!');
        console.log('📋 Thông tin Firebase Auth:');
        console.log(`   UID: ${userCredential.user.uid}`);
        console.log(`   Email: ${userCredential.user.email}`);
        console.log(`   Created: ${userCredential.user.metadata.creationTime}`);
        console.log('');
        console.log('🔑 QUAN TRỌNG - Lưu lại thông tin đăng nhập:');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);
        console.log('');
        console.log('💡 Bây giờ anh/chị có thể đăng nhập vào hệ thống với thông tin trên!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi khi đăng ký tài khoản:', error.code, error.message);

        if (error.code === 'auth/email-already-in-use') {
            console.log('');
            console.log('ℹ️  Tài khoản đã tồn tại trong Firebase Auth.');
            console.log('   Anh/chị có thể đăng nhập trực tiếp với:');
            console.log(`   Email: ${adminEmail}`);
            console.log(`   Password: ${adminPassword} (hoặc password đã đặt trước đó)`);
        } else if (error.code === 'auth/weak-password') {
            console.log('');
            console.log('⚠️  Mật khẩu quá yếu. Vui lòng đổi password trong code thành mật khẩu mạnh hơn (tối thiểu 6 ký tự).');
        }

        process.exit(1);
    }
}

registerAdmin();
