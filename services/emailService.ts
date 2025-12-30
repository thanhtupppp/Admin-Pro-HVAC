import emailjs from '@emailjs/browser';
import { Transaction, AdminUser } from '../types';

interface EmailConfig {
    serviceId: string;
    publicKey: string;
    templates: {
        welcome: string;
        paymentPending: string;
        paymentSuccess: string;
        planActivated: string;
    }
}

// Default config - key sẽ được lưu trong localStorage hoặc Firestore system settings
const DEFAULT_CONFIG: EmailConfig = {
    serviceId: '',
    publicKey: '',
    templates: {
        welcome: 'template_welcome',
        paymentPending: 'template_payment_pending',
        paymentSuccess: 'template_payment_success',
        planActivated: 'template_plan_activated',
    }
};

const getEmailConfig = (): EmailConfig => {
    const stored = localStorage.getItem('email_config');
    return stored ? JSON.parse(stored) : DEFAULT_CONFIG;
};

export const emailService = {
    /**
     * Save configuration
     */
    saveConfig: (config: EmailConfig) => {
        localStorage.setItem('email_config', JSON.stringify(config));
        if (config.publicKey) {
            emailjs.init(config.publicKey);
        }
    },

    /**
     * Get configuration
     */
    getConfig: (): EmailConfig => {
        return getEmailConfig();
    },

    /**
     * Send test email
     */
    sendTestEmail: async (toEmail: string) => {
        const config = getEmailConfig();
        if (!config.serviceId || !config.publicKey) {
            throw new Error('Email service not configured');
        }

        try {
            await emailjs.send(
                config.serviceId,
                config.templates.welcome, // Use welcome template for test
                {
                    to_email: toEmail,
                    to_name: 'Admin',
                    message: 'This is a test email from Admin Pro HVAC system.',
                },
                config.publicKey
            );
            return true;
        } catch (error) {
            console.error('Email send failed:', error);
            throw error;
        }
    },

    /**
     * Send welcome email to new user
     */
    sendWelcomeEmail: async (user: AdminUser) => {
        const config = getEmailConfig();
        if (!config.serviceId || !config.publicKey) return;

        try {
            await emailjs.send(
                config.serviceId,
                config.templates.welcome,
                {
                    to_email: user.email,
                    to_name: user.username,
                    dashboard_url: window.location.origin
                },
                config.publicKey
            );
        } catch (error) {
            console.warn('Failed to send welcome email:', error);
        }
    },

    /**
     * Send payment confirmation (Transaction Success)
     */
    sendPaymentSuccess: async (transaction: Transaction, userEmail: string, userName: string) => {
        const config = getEmailConfig();
        if (!config.serviceId || !config.publicKey) return;

        try {
            await emailjs.send(
                config.serviceId,
                config.templates.paymentSuccess,
                {
                    to_email: userEmail,
                    to_name: userName,
                    amount: transaction.amount.toLocaleString('vi-VN'),
                    plan_name: transaction.planId,
                    transaction_id: transaction.id,
                    date: new Date().toLocaleString('vi-VN')
                },
                config.publicKey
            );
        } catch (error) {
            console.warn('Failed to send payment success email:', error);
        }
    },

    /**
     * Send plan activation notice
     */
    sendPlanActivated: async (user: AdminUser, planName: string) => {
        const config = getEmailConfig();
        if (!config.serviceId || !config.publicKey) return;

        try {
            await emailjs.send(
                config.serviceId,
                config.templates.planActivated,
                {
                    to_email: user.email,
                    to_name: user.username,
                    plan_name: planName,
                    expiry_date: '30 days from now' // Logic tính ngày hết hạn thực tế sẽ thêm sau
                },
                config.publicKey
            );
        } catch (error) {
            console.warn('Failed to send activation email:', error);
        }
    }
};
