import React, { useState, useEffect } from 'react';
import { emailService } from '../services/emailService';

const EmailSettings: React.FC = () => {
    const [config, setConfig] = useState({
        serviceId: '',
        publicKey: '',
        templates: {
            welcome: '',
            paymentPending: '',
            paymentSuccess: '',
            planActivated: '',
        }
    });

    const [isSaving, setIsSaving] = useState(false);
    const [testEmail, setTestEmail] = useState('');
    const [isSendingTest, setIsSendingTest] = useState(false);

    useEffect(() => {
        const savedConfig = emailService.getConfig();
        setConfig(savedConfig);
    }, []);

    const handleChange = (field: string, value: string) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleTemplateChange = (key: string, value: string) => {
        setConfig(prev => ({
            ...prev,
            templates: { ...prev.templates, [key]: value }
        }));
    };

    const handleSave = () => {
        setIsSaving(true);
        try {
            emailService.saveConfig(config);
            alert('✅ Đã lưu cấu hình Email!');
        } catch (e) {
            alert('Lỗi khi lưu cấu hình');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSendTest = async () => {
        if (!testEmail) {
            alert('Vui lòng nhập email nhận test');
            return;
        }
        setIsSendingTest(true);
        try {
            await emailService.sendTestEmail(testEmail);
            alert(`✅ Email test đã được gửi đến ${testEmail}`);
        } catch (e: any) {
            alert(`❌ Gửi thất bại: ${e.text || e.message || 'Lỗi không xác định'}`);
        } finally {
            setIsSendingTest(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-white">Cấu hình Email Notifications</h3>
                    <p className="text-xs text-text-secondary">Tích hợp EmailJS để gửi thông báo tự động</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    <span className="material-symbols-outlined text-[20px]">save</span>
                    {isSaving ? 'Đang lưu...' : 'Lưu cấu hình'}
                </button>
            </div>

            {/* Main Config */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Credentials */}
                <div className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6 space-y-4">
                    <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500">key</span>
                        EmailJS Credentials
                    </h4>

                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Service ID</label>
                        <input
                            type="text"
                            value={config.serviceId}
                            onChange={(e) => handleChange('serviceId', e.target.value)}
                            placeholder="service_xxxxx"
                            className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none font-mono text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Public Key</label>
                        <input
                            type="password"
                            value={config.publicKey}
                            onChange={(e) => handleChange('publicKey', e.target.value)}
                            placeholder="xxxxxxxxxxxxx"
                            className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none font-mono text-sm"
                        />
                    </div>

                    <div className="pt-4 mt-2 border-t border-border-dark/30">
                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Gửi thử Email</label>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                                placeholder="nhập email của bạn..."
                                className="flex-1 bg-background-dark border border-border-dark rounded-xl px-4 py-2 text-white focus:ring-1 focus:ring-primary outline-none text-sm"
                            />
                            <button
                                onClick={handleSendTest}
                                disabled={isSendingTest || !config.serviceId}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-border-dark transition-all disabled:opacity-50 text-xs flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-[16px]">send</span>
                                {isSendingTest ? 'Sending...' : 'Test Send'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Templates */}
                <div className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6 space-y-4">
                    <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-500">description</span>
                        Template IDs
                    </h4>
                    <p className="text-xs text-text-secondary">Nhập ID của template bạn đã tạo trên dashboard EmailJS.</p>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-1.5">Welcome Template</label>
                            <input
                                type="text"
                                value={config.templates.welcome}
                                onChange={(e) => handleTemplateChange('welcome', e.target.value)}
                                placeholder="template_welcome"
                                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2 text-white focus:ring-1 focus:ring-primary outline-none font-mono text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-1.5">Payment Success</label>
                            <input
                                type="text"
                                value={config.templates.paymentSuccess}
                                onChange={(e) => handleTemplateChange('paymentSuccess', e.target.value)}
                                placeholder="template_payment_success"
                                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2 text-white focus:ring-1 focus:ring-primary outline-none font-mono text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-1.5">Plan Activated</label>
                            <input
                                type="text"
                                value={config.templates.planActivated}
                                onChange={(e) => handleTemplateChange('planActivated', e.target.value)}
                                placeholder="template_plan_active"
                                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2 text-white focus:ring-1 focus:ring-primary outline-none font-mono text-xs"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tutorial */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <h5 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">help</span>
                    Hướng dẫn Setup EmailJS
                </h5>
                <ol className="list-decimal list-inside text-xs text-text-secondary space-y-1 ml-1">
                    <li>Đăng ký tài khoản miễn phí tại <a href="https://www.emailjs.com/" target="_blank" className="text-primary hover:underline">emailjs.com</a>.</li>
                    <li>Tạo một <strong>Email Service</strong> (ví dụ: Gmail). Copy <strong>Service ID</strong>.</li>
                    <li>Vào mục <strong>Account</strong> để lấy <strong>Public Key</strong>.</li>
                    <li>Tạo các <strong>Email Templates</strong> tương ứng và copy <strong>Template ID</strong>.</li>
                    <li>Điền các thông tin vào form trên và lưu lại.</li>
                </ol>
            </div>
        </div>
    );
};

export default EmailSettings;
