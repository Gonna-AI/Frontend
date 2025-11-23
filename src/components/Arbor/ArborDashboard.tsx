import { SystemStats } from '../../types/arbor';
import { Database, Calendar, Mail, FileText, Activity, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ArborDashboardProps {
    stats: SystemStats;
    onRefresh: () => void;
}

export default function ArborDashboard({ stats, onRefresh }: ArborDashboardProps) {
    const StatCard = ({
        icon: Icon,
        label,
        value,
        color,
        status
    }: {
        icon: React.ElementType;
        label: string;
        value: string | number;
        color: string;
        status?: 'active' | 'inactive' | 'warning';
    }) => {
        const statusColors = {
            active: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
            inactive: 'bg-red-500/20 border-red-500/30 text-red-400',
            warning: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
        };

        return (
            <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-white/20 transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    {status && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[status]}`}>
                            {status}
                        </span>
                    )}
                </div>
                <div className="space-y-1">
                    <div className="text-3xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {value}
                    </div>
                    <div className="text-sm text-white/60">{label}</div>
                </div>
            </div>
        );
    };

    const getConnectionStatus = (status: string): 'active' | 'inactive' | 'warning' => {
        if (status === 'Active' || status === 'Connected' || status === 'Ready') return 'active';
        if (status === 'Inactive' || status === 'Not connected') return 'inactive';
        return 'warning';
    };

    return (
        <div className="space-y-8">
            {/* Overview Stats */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">System Overview</h2>
                    <button
                        onClick={onRefresh}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 text-white/70 hover:text-white font-medium rounded-xl transition-all duration-300 flex items-center gap-2"
                    >
                        <Activity className="w-4 h-4" />
                        <span>Refresh Data</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={FileText}
                        label="Total Documents"
                        value={stats.total_documents}
                        color="bg-emerald-500/10 text-emerald-400"
                    />
                    <StatCard
                        icon={Database}
                        label="Vector Store"
                        value={stats.vectorstore_status}
                        color="bg-blue-500/10 text-blue-400"
                        status={getConnectionStatus(stats.vectorstore_status)}
                    />
                    <StatCard
                        icon={Calendar}
                        label="Calendar"
                        value={stats.calendar_status}
                        color="bg-purple-500/10 text-purple-400"
                        status={getConnectionStatus(stats.calendar_status)}
                    />
                    <StatCard
                        icon={Mail}
                        label="Email Status"
                        value={stats.email_status}
                        color="bg-teal-500/10 text-teal-400"
                        status={getConnectionStatus(stats.email_status)}
                    />
                </div>
            </div>

            {/* Document Breakdown */}
            {stats.by_type && Object.keys(stats.by_type).length > 0 && (
                <div>
                    <h3 className="text-xl font-bold text-white mb-4">Documents by Type</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(stats.by_type).map(([type, count]) => (
                            <div
                                key={type}
                                className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-center hover:border-emerald-500/30 transition-all duration-300"
                            >
                                <div className="text-2xl font-bold text-emerald-400 mb-1">{count}</div>
                                <div className="text-sm text-white/60 capitalize">{type}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Urgency Levels */}
            {stats.by_urgency && (
                <div>
                    <h3 className="text-xl font-bold text-white mb-4">Documents by Urgency</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-center hover:bg-red-500/20 transition-all duration-300">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <AlertCircle className="w-5 h-5 text-red-400" />
                                <div className="text-2xl font-bold text-red-400">{stats.by_urgency.critical}</div>
                            </div>
                            <div className="text-sm text-white/60">Critical</div>
                            {stats.by_urgency.critical > 0 && (
                                <div className="text-xs text-red-400 mt-1">Highest Priority</div>
                            )}
                        </div>

                        <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl text-center hover:bg-orange-500/20 transition-all duration-300">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <AlertCircle className="w-5 h-5 text-orange-400" />
                                <div className="text-2xl font-bold text-orange-400">{stats.by_urgency.high}</div>
                            </div>
                            <div className="text-sm text-white/60">High</div>
                        </div>

                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-center hover:bg-yellow-500/20 transition-all duration-300">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <AlertCircle className="w-5 h-5 text-yellow-400" />
                                <div className="text-2xl font-bold text-yellow-400">{stats.by_urgency.medium}</div>
                            </div>
                            <div className="text-sm text-white/60">Medium</div>
                        </div>

                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center hover:bg-emerald-500/20 transition-all duration-300">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                <div className="text-2xl font-bold text-emerald-400">{stats.by_urgency.normal}</div>
                            </div>
                            <div className="text-sm text-white/60">Normal</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Additional Metrics */}
            <div>
                <h3 className="text-xl font-bold text-white mb-4">Document Metadata</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{stats.with_claim_numbers || 0}</div>
                                <div className="text-sm text-white/60">With Claim Numbers</div>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                <span className="text-emerald-400 font-bold">$</span>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{stats.with_amounts || 0}</div>
                                <div className="text-sm text-white/60">With Amounts</div>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                <Mail className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{stats.with_contacts || 0}</div>
                                <div className="text-sm text-white/60">With Contacts</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Last Refresh */}
            {stats.last_refresh && (
                <div className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
                    <div className="flex items-center gap-2 text-white/60">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Last refreshed: {new Date(stats.last_refresh).toLocaleString()}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
