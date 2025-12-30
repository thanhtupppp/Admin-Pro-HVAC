// Script để cập nhật email admin trong Firebase
// Chạy lệnh: node update-admin-email.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

// Firebase config - sử dụng cùng config với app
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

async function updateAdminEmail() {
    try {
        console.log('🔍 Đang tìm tài khoản admin...');

        // Lấy tất cả users
        const usersSnapshot = await getDocs(collection(db, 'users'));

        let adminFound = false;

        for (const userDoc of usersSnapshot.docs) {
            const userData = userDoc.data();

            // Tìm user có email admin@system.vn
            if (userData.email === 'admin@system.vn') {
                adminFound = true;
                console.log('✅ Tìm thấy tài khoản admin:', userData);
                console.log('📝 Đang cập nhật email...');

                // Cập nhật email
                const userRef = doc(db, 'users', userDoc.id);
                await updateDoc(userRef, {
                    email: 'thanhtupy@gmail.com'
                });

                console.log('✅ Đã cập nhật email thành công!');
                console.log('   Email cũ: admin@system.vn');
                console.log('   Email mới: thanhtupy@gmail.com');
                break;
            }
        }

        if (!adminFound) {
            console.log('⚠️  Không tìm thấy tài khoản admin với email admin@system.vn');
            console.log('📋 Danh sách users hiện có:');
            usersSnapshot.forEach(doc => {
                const data = doc.data();
                console.log(`   - ${data.username} (${data.email})`);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi khi cập nhật email:', error);
        process.exit(1);
    }
}

updateAdminEmail();
