import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Car, Eye, MessageSquare, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DealerStats({ vehicles = [], quotes = [], transactions = [] }) {
    const activeListings = vehicles.filter(v => v.status === 'active').length;
    const pendingListings = vehicles.filter(v => v.status === 'pending').length;
    const soldVehicles = vehicles.filter(v => v.status === 'sold').length;
    const totalViews = vehicles.reduce((sum, v) => sum + (v.views_count || 0), 0);
    const totalQuotes = quotes.length;
    const pendingQuotes = quotes.filter(q => q.status === 'pending').length;
    const totalRevenue = transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + (t.total_amount || 0), 0);

    const stats = [
        {
            label: 'Active Listings',
            value: activeListings,
            icon: Car,
            color: 'bg-blue-500',
            subtext: `${pendingListings} pending`
        },
        {
            label: 'Total Views',
            value: totalViews.toLocaleString(),
            icon: Eye,
            color: 'bg-purple-500',
            subtext: 'Last 30 days'
        },
        {
            label: 'Quote Requests',
            value: totalQuotes,
            icon: MessageSquare,
            color: 'bg-amber-500',
            subtext: `${pendingQuotes} new`
        },
        {
            label: 'Vehicles Sold',
            value: soldVehicles,
            icon: TrendingUp,
            color: 'bg-emerald-500',
            subtext: 'All time'
        },
        {
            label: 'Total Revenue',
            value: `$${(totalRevenue / 1000).toFixed(0)}K`,
            icon: DollarSign,
            color: 'bg-green-500',
            subtext: 'Completed sales'
        },
        {
            label: 'Avg. Days Listed',
            value: vehicles.length > 0 ? Math.round(vehicles.reduce((sum, v) => {
                const days = Math.floor((new Date() - new Date(v.created_date)) / (1000 * 60 * 60 * 24));
                return sum + days;
            }, 0) / vehicles.length) : 0,
            icon: Clock,
            color: 'bg-indigo-500',
            subtext: 'Until sold'
        }
    ];

    return (
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
                            <div className={`w-10 h-10 ${stat.color} bg-opacity-10 rounded-xl flex items-center justify-center mb-3`}>
                                <stat.icon className={`w-5 h-5 ${stat.color.replace('bg-', 'text-')}`} />
                            </div>
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className="text-sm text-gray-500">{stat.label}</p>
                            <p className="text-xs text-gray-400 mt-1">{stat.subtext}</p>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}
