/**
 * Error Handling Utilities
 * Centralized error handling for consistent UX
 */

export class AppError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number = 500
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export const ErrorCodes = {
    // Firebase errors
    PERMISSION_DENIED: 'permission-denied',
    NOT_FOUND: 'not-found',
    ALREADY_EXISTS: 'already-exists',
    NETWORK_ERROR: 'network-error',

    // Validation errors
    INVALID_INPUT: 'invalid-input',
    MISSING_REQUIRED: 'missing-required',

    // Business logic errors
    INSUFFICIENT_BALANCE: 'insufficient-balance',
    DUPLICATE_ENTRY: 'duplicate-entry',
    RULE_VIOLATION: 'rule-violation'
} as const;

/**
 * Handle Firebase errors with user-friendly messages
 */
export const handleFirebaseError = (error: any): string => {
    console.error('Firebase Error:', error);

    if (error.code) {
        switch (error.code) {
            case 'permission-denied':
                return 'Bạn không có quyền thực hiện thao tác này';
            case 'not-found':
                return 'Không tìm thấy dữ liệu yêu cầu';
            case 'already-exists':
                return 'Dữ liệu đã tồn tại';
            case 'unavailable':
            case 'deadline-exceeded':
                return 'Không thể kết nối đến server. Vui lòng thử lại';
            case 'invalid-argument':
                return 'Dữ liệu đầu vào không hợp lệ';
            case 'resource-exhausted':
                return 'Đã vượt quá giới hạn. Vui lòng thử lại sau';
            default:
                return error.message || 'Đã xảy ra lỗi. Vui lòng thử lại';
        }
    }

    return error.message || 'Đã xảy ra lỗi không xác định';
};

/**
 * Retry logic for transient errors
 */
export const retryOperation = async <T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
): Promise<T> => {
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error: any) {
            lastError = error;

            // Don't retry on permanent errors
            if (error.code === 'permission-denied' ||
                error.code === 'not-found' ||
                error.code === 'invalid-argument') {
                throw error;
            }

            // Wait before retry (exponential backoff)
            if (attempt < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
            }
        }
    }

    throw lastError;
};

/**
 * Validate required fields
 */
export const validateRequired = (
    data: Record<string, any>,
    requiredFields: string[]
): void => {
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
        throw new AppError(
            `Thiếu các trường bắt buộc: ${missingFields.join(', ')}`,
            ErrorCodes.MISSING_REQUIRED,
            400
        );
    }
};

/**
 * Safe JSON parse
 */
export const safeJSONParse = <T>(json: string, fallback: T): T => {
    try {
        return JSON.parse(json);
    } catch {
        return fallback;
    }
};

/**
 * Format error for logging
 */
export const formatErrorForLogging = (error: any): Record<string, any> => {
    return {
        message: error.message,
        code: error.code,
        stack: error.stack,
        timestamp: new Date().toISOString()
    };
};

/**
 * Check if error is retryable
 */
export const isRetryableError = (error: any): boolean => {
    const retryableCodes = [
        'unavailable',
        'deadline-exceeded',
        'resource-exhausted',
        'network-error'
    ];

    return retryableCodes.includes(error.code);
};
