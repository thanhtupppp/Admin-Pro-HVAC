import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // Call optional error handler
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        this.setState({ error, errorInfo });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <div className="min-h-screen bg-background-dark flex items-center justify-center p-6">
                    <div className="max-w-2xl w-full bg-surface-dark border border-border-dark rounded-2xl p-8">
                        {/* Error Icon */}
                        <div className="flex items-center justify-center mb-6">
                            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-red-500 text-5xl">error</span>
                            </div>
                        </div>

                        {/* Error Message */}
                        <h1 className="text-2xl font-bold text-white text-center mb-3">
                            Đã xảy ra lỗi
                        </h1>
                        <p className="text-text-secondary text-center mb-6">
                            Ứng dụng gặp sự cố không mong muốn. Vui lòng tải lại trang hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp diễn.
                        </p>

                        {/* Error Details (Development only) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mb-6 p-4 bg-background-dark rounded-xl border border-red-500/20">
                                <p className="text-xs font-bold text-red-500 uppercase mb-2">Chi tiết lỗi (Dev Mode):</p>
                                <pre className="text-xs text-red-400 overflow-x-auto">
                                    {this.state.error.toString()}
                                </pre>
                                {this.state.errorInfo && (
                                    <details className="mt-3">
                                        <summary className="text-xs text-text-secondary cursor-pointer hover:text-white">
                                            Stack trace
                                        </summary>
                                        <pre className="text-[10px] text-text-secondary mt-2 overflow-x-auto">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={this.handleReset}
                                className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all"
                            >
                                Tải lại trang
                            </button>
                            <button
                                onClick={() => window.history.back()}
                                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all"
                            >
                                Quay lại
                            </button>
                        </div>

                        {/* Common Issues */}
                        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                            <p className="text-xs font-bold text-blue-400 mb-2">💡 Các nguyên nhân thường gặp:</p>
                            <ul className="text-xs text-text-secondary space-y-1 list-disc list-inside">
                                <li>Mất kết nối internet</li>
                                <li>Phiên đăng nhập đã hết hạn</li>
                                <li>Cấu hình Firebase chưa đúng</li>
                                <li>Quyền truy cập Firestore bị từ chối</li>
                            </ul>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
