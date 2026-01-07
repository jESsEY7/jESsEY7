import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Users, Building2, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminStats({ vehicles = [], dealers = [], users = [], quotes = [], transactions = [] }) {
    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter(v => v.status === 'active').length;
    const pendingVehicles = vehicles.filter(v => v.status === 'pending').length;
    const totalDealers = dealers.length;
    const verifiedDealers = dealers.filter(d => d.verification_status === 'verified').length;
    const pendingDealers = dealers.filter(d => d.verification_status === 'pending').length;
    const totalUsers = users.length;
    const totalQuotes = quotes.length;
    const totalRevenue = transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + (t.total_amount || 0), 0);

    const stats = [
        {
            label: 'Total Vehicles',
            value: totalVehicles,
            change: `${activeVehicles} active`,
            icon: Car,
            color: 'blue'
        },
        {
            label: 'Dealers',
            value: totalDealers,
            change: `${pendingDealers} pending`,
            icon: Building2,
            color: 'purple'
        },
        {
            label: 'Users',
            value: totalUsers,
            change: 'Registered',
            icon: Users,
            color: 'emerald'
        },
        {
            label: 'Quote Requests',
            value: totalQuotes,
            change: 'All time',
            icon: TrendingUp,
            color: 'amber'
        },
        {
            label: 'Total Revenue',
            value: `$${(totalRevenue / 1000).toFixed(0)}K`,
            change: 'From sales',
            icon: DollarSign,
            color: 'green'
        },
        {
            label: 'Pending Review',
            value: pendingVehicles + pendingDealers,
            change: 'Items to review',
            icon: AlertCircle,
            color: 'red'
        }
    ];

    // Sample chart data
    const chartData = [
        { name: 'Jan', vehicles: 40, quotes: 24 },
        { name: 'Feb', vehicles: 55, quotes: 35 },
        { name: 'Mar', vehicles: 62, quotes: 45 },
        { name: 'Apr', vehicles: 78, quotes: 55 },
        { name: 'May', vehicles: 95, quotes: 70 },
        { name: 'Jun', vehicles: 110, quotes: 85 }
    ];

    const pieData = [
        { name: 'Active', value: activeVehicles, color: '#10B981' },
        { name: 'Pending', value: pendingVehicles, color: '#F59E0B' },
        { name: 'Sold', value: vehicles.filter(v => v.status === 'sold').length, color: '#3B82F6' }
    ];

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-4">
                                <div className={`w-10 h-10 bg-${stat.color}-100 rounded-xl flex items-center justify-center mb-3`}>
                                    <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                                </div>
                                <p className="text-2xl font-bold">{stat.value}</p>
                                <p className="text-sm text-gray-500">{stat.label}</p>
                                <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Platform Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                                    <YAxis stroke="#9CA3AF" fontSize={12} />
                                    <Tooltip />
                                    <Area
                                        type="monotone"
                                        dataKey="vehicles"
                                        stroke="#F59E0B"
                                        fill="#FEF3C7"
                                        strokeWidth={2}
                                        name="New Listings"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="quotes"
                                        stroke="#3B82F6"
                                        fill="#DBEAFE"
                                        strokeWidth={2}
                                        name="Quote Requests"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Vehicle Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-6 mt-4">
                            {pieData.map(item => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-sm text-gray-600">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
