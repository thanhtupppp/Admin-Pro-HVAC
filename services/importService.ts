import { parse } from 'papaparse';
import { userService } from './userService';
import { errorService } from './errorService';
import { AdminUser, ErrorCode } from '../types';

interface ImportResult {
    success: number;
    failed: number;
    errors: string[];
}

/**
 * Parse CSV file
 */
const parseCSV = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                resolve(results.data);
            },
            error: (error) => {
                reject(error);
            }
        });
    });
};

/**
 * Validate user data
 */
const validateUser = (data: any): { valid: boolean; error?: string } => {
    if (!data.email || !data.email.includes('@')) {
        return { valid: false, error: 'Invalid email' };
    }
    if (!data.username || data.username.length < 3) {
        return { valid: false, error: 'Username must be at least 3 characters' };
    }
    if (!data.role || !['Super Admin', 'Admin', 'Internal'].includes(data.role)) {
        return { valid: false, error: 'Invalid role' };
    }
    return { valid: true };
};

/**
 * Validate error code data
 */
const validateErrorCode = (data: any): { valid: boolean; error?: string } => {
    if (!data.code) {
        return { valid: false, error: 'Error code is required' };
    }
    if (!data.title) {
        return { valid: false, error: 'Title is required' };
    }
    if (!data.brand) {
        return { valid: false, error: 'Brand is required' };
    }
    return { valid: true };
};

export const importService = {
    /**
     * Import users from CSV
     */
    importUsers: async (file: File): Promise<ImportResult> => {
        const result: ImportResult = { success: 0, failed: 0, errors: [] };

        try {
            const data = await parseCSV(file);

            for (let i = 0; i < data.length; i++) {
                const row = data[i];
                const validation = validateUser(row);

                if (!validation.valid) {
                    result.failed++;
                    result.errors.push(`Row ${i + 1}: ${validation.error}`);
                    continue;
                }

                try {
                    // Check if user already exists
                    const existingUsers = await userService.getUsers();
                    const exists = existingUsers.find(u => u.email === row.email);

                    if (exists) {
                        result.failed++;
                        result.errors.push(`Row ${i + 1}: User with email ${row.email} already exists`);
                        continue;
                    }

                    // Create user
                    const newUser: Partial<AdminUser> = {
                        email: row.email,
                        username: row.username,
                        role: row.role,
                        status: row.status || 'active',
                        avatar: row.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.username)}&background=random`,
                        createdAt: new Date().toISOString(),
                        lastLogin: ''
                    };

                    await userService.createUser(newUser as AdminUser);
                    result.success++;
                } catch (e) {
                    result.failed++;
                    result.errors.push(`Row ${i + 1}: ${e}`);
                }
            }

            return result;
        } catch (e) {
            throw new Error(`CSV parsing failed: ${e}`);
        }
    },

    /**
     * Import error codes from CSV
     */
    importErrorCodes: async (file: File): Promise<ImportResult> => {
        const result: ImportResult = { success: 0, failed: 0, errors: [] };

        try {
            const data = await parseCSV(file);

            for (let i = 0; i < data.length; i++) {
                const row = data[i];
                const validation = validateErrorCode(row);

                if (!validation.valid) {
                    result.failed++;
                    result.errors.push(`Row ${i + 1}: ${validation.error}`);
                    continue;
                }

                try {
                    // Check if error code already exists
                    const existingErrors = await errorService.getErrors();
                    const exists = existingErrors.find(e => e.code === row.code && e.brand === row.brand);

                    if (exists) {
                        result.failed++;
                        result.errors.push(`Row ${i + 1}: Error code ${row.code} for ${row.brand} already exists`);
                        continue;
                    }

                    // Create error code
                    const newError: Partial<ErrorCode> = {
                        code: row.code,
                        title: row.title,
                        description: row.description || '',
                        solution: row.solution || '',
                        brand: row.brand,
                        model: row.model || '',
                        category: row.category || 'General',
                        severity: row.severity || 'Medium',
                        status: row.status || 'active',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };

                    await errorService.createError(newError as ErrorCode);
                    result.success++;
                } catch (e) {
                    result.failed++;
                    result.errors.push(`Row ${i + 1}: ${e}`);
                }
            }

            return result;
        } catch (e) {
            throw new Error(`CSV parsing failed: ${e}`);
        }
    },

    /**
     * Download CSV template for users
     */
    downloadUserTemplate: () => {
        const template = [
            {
                email: 'example@domain.com',
                username: 'johndoe',
                role: 'Admin',
                status: 'active',
                avatar: 'https://ui-avatars.com/api/?name=John+Doe'
            }
        ];

        const csv = 'email,username,role,status,avatar\n' +
            template.map(row => `${row.email},${row.username},${row.role},${row.status},${row.avatar}`).join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'user_template.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    /**
     * Download CSV template for error codes
     */
    downloadErrorTemplate: () => {
        const template = [
            {
                code: 'E01',
                title: 'Sensor Error',
                description: 'Temperature sensor malfunction',
                solution: 'Replace sensor',
                brand: 'Daikin',
                model: 'FTKC25',
                category: 'Sensor',
                severity: 'High',
                status: 'active'
            }
        ];

        const csv = 'code,title,description,solution,brand,model,category,severity,status\n' +
            template.map(row => `${row.code},${row.title},${row.description},${row.solution},${row.brand},${row.model},${row.category},${row.severity},${row.status}`).join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'error_code_template.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};
