import React, { useState } from 'react';
import { exportService } from '../services/exportService';

const BackupManager: React.FC = () => {
    const [isExporting, setIsExporting] = useState(false);
    const [lastBackup, setLastBackup] = useState<string | null>(null);

    const handleExport = async (type: 'users' | 'transactions' | 'errors' | 'plans' | 'brands') => {
        setIsExporting(true);
        try {
            let result;
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
            alert(`✅ Exported ${result.count} ${type} successfully!`);
        } catch (e) {
            alert(`❌ Export failed: ${e}`);
        } finally {
            setIsExporting(false);
        }
    };

    const handleFullBackup = async () => {
        setIsExporting(true);
        try {
            const result = await exportService.fullBackup();
            setLastBackup(new Date().toLocaleString('vi-VN'));
            alert(`✅ Full backup created!\n\nUsers: ${result.stats.usersCount}\nTransactions: ${result.stats.transactionsCount}\nErrors: ${result.stats.errorsCount}\nPlans: ${result.stats.plansCount}\nBrands: ${result.stats.brandsCount}`);
        } catch (e) {
            alert(`❌ Backup failed: ${e}`);
        } finally {
            setIsExporting(false);
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
                                        disabled={isExporting}
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
                        disabled={isExporting}
                        className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 shrink-0"
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
        </div>
    );
};

export default BackupManager;
