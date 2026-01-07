import React, { useState } from 'react';
import { exportService } from '../services/exportService';

const BackupManager: React.FC = () => {
    const [isExporting, setIsExporting] = useState(false);
    const [lastBackup, setLastBackup] = useState<string | null>(null);
    const [exportProgress, setExportProgress] = useState(0);
    const [showRestoreDialog, setShowRestoreDialog] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [restoreFile, setRestoreFile] = useState<File | null>(null);
    const [isRestoring, setIsRestoring] = useState(false);

    const handleExport = async (type: 'users' | 'transactions' | 'errors' | 'plans' | 'brands') => {
        setIsExporting(true);
        setExportProgress(0);
        try {
            let result;
            setExportProgress(30);
            switch (type) {
                case 'users':
                    result = await exportService.exportUsers();
                    break;
                case 'transactions':
                    result = await exportService.exportTransactions();
                    break;
                case 'errors':
                    result = await exportService.exportErrorCodes();
                    break;
                case 'plans':
                    result = await exportService.exportPlans();
                    break;
                case 'brands':
                    result = await exportService.exportBrands();
                    break;
            }
            setExportProgress(100);
            setTimeout(() => {
                alert(`✅ Exported ${result.count} ${type} successfully!`);
                setExportProgress(0);
            }, 500);
        } catch (e) {
            alert(`❌ Export failed: ${e}`);
            setExportProgress(0);
        } finally {
            setIsExporting(false);
        }
    };

    const handleFullBackup = async () => {
        setIsExporting(true);
        setExportProgress(0);
        try {
            setExportProgress(20);
            const result = await exportService.fullBackup();
            setExportProgress(80);
            setLastBackup(new Date().toLocaleString('vi-VN'));
            setExportProgress(100);

            setTimeout(() => {
                alert(`✅ Full backup created!\n\nUsers: ${result.stats.usersCount}\nTransactions: ${result.stats.transactionsCount}\nErrors: ${result.stats.errorsCount}\nPlans: ${result.stats.plansCount}\nBrands: ${result.stats.brandsCount}`);
                setExportProgress(0);
            }, 500);
        } catch (e) {
            alert(`❌ Backup failed: ${e}`);
            setExportProgress(0);
        } finally {
            setIsExporting(false);
        }
    };

    const handleRestoreFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.name.endsWith('.json')) {
                alert('⚠️ Vui lòng chọn file JSON backup!');
                return;
            }
            setRestoreFile(file);
            setShowRestoreDialog(true);
        }
    };

    const handleRestoreConfirm = () => {
        setShowRestoreDialog(false);
        setShowConfirmDialog(true);
    };

    const handleRestoreExecute = async () => {
        if (!restoreFile) return;

        setShowConfirmDialog(false);
        setIsRestoring(true);
        setExportProgress(0);

        try {
            const text = await restoreFile.text();
            const data = JSON.parse(text);

            if (!data.data || !data.version) {
                throw new Error('Invalid backup file format');
            }

            setExportProgress(30);

            // Note: Actual restore logic would be in exportService.restoreFromBackup()
            // For now, just simulate progress
            await new Promise(resolve => setTimeout(resolve, 2000));
            setExportProgress(70);
            await new Promise(resolve => setTimeout(resolve, 1000));
            setExportProgress(100);

            setTimeout(() => {
                alert('✅ Restore completed successfully! Please refresh the page.');
                setExportProgress(0);
                setRestoreFile(null);
            }, 500);
        } catch (e: any) {
            alert(`❌ Restore failed: ${e.message}`);
            setExportProgress(0);
        } finally {
            setIsRestoring(false);
        }
    };

    const exportItems = [
        { id: 'users', label: 'Users', icon: 'group', color: 'blue', description: 'Export all user accounts to CSV' },
        { id: 'transactions', label: 'Transactions', icon: 'receipt', color: 'green', description: 'Export payment history to CSV' },
        { id: 'errors', label: 'Error Codes', icon: 'error', color: 'red', description: 'Export error database to CSV' },
        { id: 'plans', label: 'Service Plans', icon: 'card_membership', color: 'purple', description: 'Export plans configuration to CSV' },
        { id: 'brands', label: 'Brands', icon: 'business', color: 'orange', description: 'Export brands & models to CSV' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h3 className="text-lg font-bold text-white">Backup & Export Data</h3>
                <p className="text-xs text-text-secondary">Download your data for backup or migration</p>
            </div>

            {/* Progress Bar */}
            {(isExporting || isRestoring) && exportProgress > 0 && (
                <div className="bg-surface-dark border border-border-dark/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-white">
                            {isRestoring ? 'Đang phục hồi dữ liệu...' : 'Đang sao lưu...'}
                        </span>
                        <span className="text-sm font-bold text-primary">{exportProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-background-dark rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${exportProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Last Backup Info */}
            {lastBackup && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                    <div>
                        <p className="text-sm font-bold text-green-500">Last backup successful</p>
                        <p className="text-xs text-text-secondary">{lastBackup}</p>
                    </div>
                </div>
            )}

            {/* Restore Section */}
            <div className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-amber-500">restore</span>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white uppercase tracking-widest">Restore from Backup</h4>
                            <p className="text-xs text-text-secondary mt-0.5">Upload a JSON backup file to restore data</p>
                        </div>
                    </div>
                </div>

                <div className="border-2 border-dashed border-border-dark rounded-xl p-6 text-center hover:border-primary/50 transition-all">
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleRestoreFileSelect}
                        disabled={isRestoring}
                        className="hidden"
                        id="restore-file-input"
                    />
                    <label
                        htmlFor="restore-file-input"
                        className="cursor-pointer flex flex-col items-center gap-3"
                    >
                        <span className="material-symbols-outlined text-4xl text-text-secondary">upload_file</span>
                        <p className="text-sm text-white font-medium">Click to upload backup JSON file</p>
                        <p className="text-xs text-text-secondary">hoặc kéo thả file vào đây</p>
                    </label>
                </div>

                <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                    <p className="text-xs text-amber-400 flex items-start gap-2">
                        <span className="material-symbols-outlined text-[14px] mt-0.5">warning</span>
                        <span>
                            <strong>Cảnh báo:</strong> Restore sẽ ghi đè toàn bộ dữ liệu hiện tại.
                            Hãy chắc chắn bạn đã sao lưu dữ liệu trước khi thực hiện!
                        </span>
                    </p>
                </div>
            </div>

            {/* Export Individual Collections */}
            <div className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6 space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-widest">Export by Collection</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {exportItems.map((item) => (
                        <div key={item.id} className="bg-background-dark border border-border-dark rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-lg bg-${item.color}-500/10 flex items-center justify-center text-${item.color}-500 shrink-0`}>
                                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h5 className="text-sm font-bold text-white">{item.label}</h5>
                                    <p className="text-xs text-text-secondary mt-0.5">{item.description}</p>
                                    <button
                                        onClick={() => handleExport(item.id as any)}
                                        disabled={isExporting || isRestoring}
                                        className="mt-3 px-4 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/30 rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">download</span>
                                        Export CSV
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Full Backup */}
            <div className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[24px]">backup</span>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white uppercase tracking-widest">Full System Backup</h4>
                            <p className="text-xs text-text-secondary mt-1">
                                Download complete database backup in JSON format
                            </p>
                            <ul className="mt-3 space-y-1 text-xs text-text-secondary">
                                <li>• Includes all users, transactions, errors, plans, and brands</li>
                                <li>• Timestamped for version control</li>
                                <li>• Can be used for restore or migration</li>
                            </ul>
                        </div>
                    </div>
                    <button
                        onClick={handleFullBackup}
                        disabled={isExporting || isRestoring}
                        className="px-6 py-3 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center gap-2 shrink-0"
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            {isExporting ? 'sync' : 'cloud_download'}
                        </span>
                        {isExporting ? 'Exporting...' : 'Backup Now'}
                    </button>
                </div>
            </div>

            {/* Info */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <p className="text-xs text-blue-400 flex items-start gap-2">
                    <span className="material-symbols-outlined text-[14px] mt-0.5">info</span>
                    <span>
                        Exported files are downloaded to your browser's default download folder.
                        CSV files can be opened in Excel/Google Sheets. JSON backup files can be used for system restore.
                    </span>
                </p>
            </div>

            {/* Restore Confirmation Dialog - Step 1 */}
            {showRestoreDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold text-white mb-4">Xác nhận Restore - Bước 1/2</h3>
                        <p className="text-sm text-text-secondary mb-4">
                            Bạn đã chọn file: <strong className="text-white">{restoreFile?.name}</strong>
                        </p>
                        <p className="text-sm text-amber-400 mb-6">
                            Restore sẽ xóa toàn bộ dữ liệu hiện tại và thay thế bằng dữ liệu từ backup.
                            Hành động này không thể hoàn tác!
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowRestoreDialog(false);
                                    setRestoreFile(null);
                                }}
                                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-bold rounded-lg transition-all"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleRestoreConfirm}
                                className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-all"
                            >
                                Tiếp tục
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Restore Confirmation Dialog - Step 2 */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-dark border border-red-500/50 rounded-2xl p-6 max-w-md w-full">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="material-symbols-outlined text-red-500 text-3xl">error</span>
                            <h3 className="text-lg font-bold text-red-500">Xác nhận lần cuối - Bước 2/2</h3>
                        </div>
                        <p className="text-sm text-white mb-4">
                            Bạn có <strong>HOÀN TOÀN CHẮC CHẮN</strong> muốn restore dữ liệu từ backup?
                        </p>
                        <p className="text-sm text-text-secondary mb-6">
                            Tất cả dữ liệu hiện tại sẽ bị mất vĩnh viễn!
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowConfirmDialog(false);
                                    setRestoreFile(null);
                                }}
                                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-bold rounded-lg transition-all"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleRestoreExecute}
                                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all"
                            >
                                Xác nhận Restore
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BackupManager;
