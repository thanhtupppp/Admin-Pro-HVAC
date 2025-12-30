import { auth } from './firebaseConfig';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    User
} from 'firebase/auth';
import { userService } from './userService';

export interface AuthResult {
    success: boolean;
    user?: User;
    error?: string;
}

export const authService = {
    /**
     * Đăng nhập với email và password
     */
    signIn: async (email: string, password: string): Promise<AuthResult> => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            // Kiểm tra xem user có tồn tại trong Firestore không
            const users = await userService.getUsers();
            const userInDb = users.find(u => u.email === email);

            if (!userInDb) {
                // Nếu không có trong database, đăng xuất luôn
                await signOut(auth);
                return {
                    success: false,
                    error: 'Tài khoản không có quyền truy cập hệ thống.'
                };
            }

            if (userInDb.status === 'locked') {
                await signOut(auth);
                return {
                    success: false,
                    error: 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.'
                };
            }

            // Cập nhật lastLogin
            const now = new Date();
            const formattedTime = now.toLocaleString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            await userService.updateUser(userInDb.id, {
                lastLogin: formattedTime
            });

            return {
                success: true,
                user: userCredential.user
            };
        } catch (error: any) {
            console.error('Login error:', error);

            let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';

            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = 'Email hoặc mật khẩu không đúng.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Email không hợp lệ.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Quá nhiều lần thử. Vui lòng thử lại sau.';
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = 'Lỗi kết nối. Vui lòng kiểm tra internet.';
            }

            return {
                success: false,
                error: errorMessage
            };
        }
    },

    /**
     * Đăng ký tài khoản mới (dùng để tạo admin lần đầu)
     */
    signUp: async (email: string, password: string): Promise<AuthResult> => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            return {
                success: true,
                user: userCredential.user
            };
        } catch (error: any) {
            console.error('Sign up error:', error);

            let errorMessage = 'Đăng ký thất bại.';

            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Email đã được sử dụng.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Mật khẩu quá yếu. Tối thiểu 6 ký tự.';
            }

            return {
                success: false,
                error: errorMessage
            };
        }
    },

    /**
     * Đăng xuất
     */
    signOut: async (): Promise<void> => {
        await signOut(auth);
    },

    /**
     * Lấy user hiện tại
     */
    getCurrentUser: (): User | null => {
        return auth.currentUser;
    }
};
