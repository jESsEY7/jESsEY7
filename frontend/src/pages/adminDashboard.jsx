import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import client from '@/api/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  LayoutDashboard, Users, Car, DollarSign, Shield, Settings,
  TrendingUp, BarChart3, AlertTriangle, CheckCircle, Clock,
  Building2, Eye, MessageSquare, Search, Filter, MoreVertical,
  ArrowUpRight, ArrowDownRight, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

// Stats Card
function StatCard({ title, value, change, changeType, icon: Icon, color = "gray" }) {
  const colorClasses = {
    gray: "bg-gray-100 text-gray-600",
    amber: "bg-amber-100 text-amber-600",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            {change && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${changeType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {changeType === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span>{change}% from last week</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Moderation Item
function ModerationItem({ item, type }) {
  const statusIcons = {
    pending: <Clock className="w-4 h-4 text-amber-500" />,
    approved: <CheckCircle className="w-4 h-4 text-green-500" />,
    flagged: <AlertTriangle className="w-4 h-4 text-red-500" />
  };

  return (
    <div className="flex items-center gap-4 py-3 border-b last:border-0">
      <div className="p-2 bg-gray-100 rounded-lg">
        {type === 'vehicle' ? <Car className="w-5 h-5 text-gray-600" /> : <Building2 className="w-5 h-5 text-gray-600" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{item.title || item.name}</p>
        <p className="text-sm text-gray-500">{item.description || item.email}</p>
      </div>
      <div className="flex items-center gap-3">
        {statusIcons[item.status] || statusIcons.pending}
        <Button size="sm" variant="outline">Review</Button>
      </div>
    </div>
  );
}

// User Row
function UserRow({ user }) {
  const roleColors = {
    admin: "bg-purple-100 text-purple-700",
    dealer: "bg-blue-100 text-blue-700",
    buyer: "bg-green-100 text-green-700",
    seller: "bg-amber-100 text-amber-700"
  };

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{user.full_name || user.username}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role] || roleColors.buyer}`}>
          {user.role || 'buyer'}
        </span>
      </td>
      <td className="py-3 px-4 text-sm text-gray-500">
        {new Date(user.created_at || user.date_joined).toLocaleDateString()}
      </td>
      <td className="py-3 px-4">
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </button>
      </td>
    </tr>
  );
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch all vehicles for moderation
  const { data: vehiclesData, isLoading: vehiclesLoading, refetch: refetchVehicles } = useQuery({
    queryKey: ['admin-vehicles'],
    queryFn: async () => {
      const response = await client.get('/vehicles/', { params: { limit: 50 } });
      return response.data;
    }
  });

  // Fetch all users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await client.get('/users/');
      return response.data;
    }
  });

  // Fetch inquiries
  const { data: inquiriesData } = useQuery({
    queryKey: ['admin-inquiries'],
    queryFn: async () => {
      const response = await client.get('/vehicles/inquiries/');
      return response.data;
    }
  });

  const vehicles = vehiclesData?.results || vehiclesData || [];
  const users = usersData?.results || usersData || [];
  const inquiries = inquiriesData?.results || inquiriesData || [];

  // Calculate stats
  const stats = {
    totalUsers: users.length,
    totalVehicles: vehicles.length,
    pendingReview: vehicles.filter(v => v.status === 'pending').length,
    totalInquiries: inquiries.length,
    dealers: users.filter(u => u.role === 'dealer').length,
    activeListings: vehicles.filter(v => v.status === 'active').length
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'moderation', label: 'Moderation', icon: Shield },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'vehicles', label: 'Vehicles', icon: Car },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
                <LayoutDashboard className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-gray-400">Platform management and analytics</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => refetchVehicles()}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6 border-b border-white/10 -mb-px overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                    ? 'border-white text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.id === 'moderation' && stats.pendingReview > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {stats.pendingReview}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                change={15}
                changeType="up"
                icon={Users}
                color="blue"
              />
              <StatCard
                title="Active Dealers"
                value={stats.dealers}
                icon={Building2}
                color="green"
              />
              <StatCard
                title="Total Vehicles"
                value={stats.totalVehicles}
                change={8}
                changeType="up"
                icon={Car}
                color="amber"
              />
              <StatCard
                title="Pending Review"
                value={stats.pendingReview}
                icon={AlertTriangle}
                color={stats.pendingReview > 0 ? "red" : "gray"}
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Recent Vehicles */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Listings</CardTitle>
                    <CardDescription>Newly added vehicles</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('vehicles')}>
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  {vehiclesLoading ? (
                    <div className="space-y-3 animate-pulse">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-gray-100 rounded" />
                      ))}
                    </div>
                  ) : vehicles.length > 0 ? (
                    <div className="divide-y">
                      {vehicles.slice(0, 5).map(vehicle => (
                        <ModerationItem
                          key={vehicle.id}
                          item={{
                            title: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
                            description: `$${Number(vehicle.price).toLocaleString()} • ${vehicle.dealer_name || 'Unknown dealer'}`,
                            status: vehicle.status
                          }}
                          type="vehicle"
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-gray-500">No vehicles found</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Users */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Users</CardTitle>
                    <CardDescription>Newly registered accounts</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('users')}>
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="space-y-3 animate-pulse">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-gray-100 rounded" />
                      ))}
                    </div>
                  ) : users.length > 0 ? (
                    <div className="divide-y">
                      {users.slice(0, 5).map(user => (
                        <div key={user.id} className="flex items-center gap-3 py-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{user.full_name || user.username}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'dealer' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                            {user.role || 'buyer'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-gray-500">No users found</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <Eye className="w-8 h-8 opacity-80 mb-2" />
                  <p className="text-3xl font-bold">{vehicles.reduce((s, v) => s + (v.views_count || 0), 0).toLocaleString()}</p>
                  <p className="text-blue-100">Total Views</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <MessageSquare className="w-8 h-8 opacity-80 mb-2" />
                  <p className="text-3xl font-bold">{stats.totalInquiries}</p>
                  <p className="text-green-100">Inquiries</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                <CardContent className="p-6">
                  <TrendingUp className="w-8 h-8 opacity-80 mb-2" />
                  <p className="text-3xl font-bold">{stats.activeListings}</p>
                  <p className="text-amber-100">Active Listings</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <DollarSign className="w-8 h-8 opacity-80 mb-2" />
                  <p className="text-3xl font-bold">
                    ${(vehicles.reduce((s, v) => s + Number(v.price || 0), 0) / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-purple-100">Total Value</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === 'moderation' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Pending Review
                </CardTitle>
                <CardDescription>Vehicles awaiting approval</CardDescription>
              </CardHeader>
              <CardContent>
                {vehicles.filter(v => v.status === 'pending').length > 0 ? (
                  <div className="divide-y">
                    {vehicles.filter(v => v.status === 'pending').map(vehicle => (
                      <div key={vehicle.id} className="flex items-center gap-4 py-4">
                        <img
                          src={vehicle.primary_image || '/placeholder-car.jpg'}
                          alt={`${vehicle.make} ${vehicle.model}`}
                          className="w-20 h-14 object-cover rounded-lg bg-gray-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                          <p className="text-sm text-gray-500">${Number(vehicle.price).toLocaleString()} • {vehicle.dealer_name}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <CheckCircle className="w-16 h-16 mx-auto text-green-300 mb-4" />
                    <p className="text-lg font-medium">All caught up!</p>
                    <p className="mt-1">No items pending review</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>{users.length} registered users</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64"
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500 border-b">
                        <th className="py-3 px-4 font-medium">User</th>
                        <th className="py-3 px-4 font-medium">Role</th>
                        <th className="py-3 px-4 font-medium">Joined</th>
                        <th className="py-3 px-4 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <UserRow key={user.id} user={user} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'vehicles' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>All Vehicles</CardTitle>
                  <CardDescription>{vehicles.length} total listings</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search vehicles..."
                      className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {vehicles.map(vehicle => (
                    <div key={vehicle.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={vehicle.primary_image || '/placeholder-car.jpg'}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="w-24 h-16 object-cover rounded-lg bg-gray-200"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                        <p className="text-sm text-gray-500">${Number(vehicle.price).toLocaleString()} • {vehicle.mileage?.toLocaleString() || 0} mi</p>
                        <p className="text-xs text-gray-400 mt-1">{vehicle.dealer_name}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${vehicle.status === 'active' ? 'bg-green-100 text-green-700' :
                            vehicle.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              'bg-gray-100 text-gray-700'
                          }`}>
                          {vehicle.status}
                        </span>
                        <Button size="sm" variant="outline">Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure system-wide settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Auto-approve Verified Dealers</p>
                    <p className="text-sm text-gray-500">Automatically approve listings from verified dealers</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-500">Configure system email alerts</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Pricing Rules</p>
                    <p className="text-sm text-gray-500">Set platform fees and pricing guidelines</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}