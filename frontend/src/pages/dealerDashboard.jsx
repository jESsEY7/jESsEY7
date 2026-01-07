import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import client from '@/api/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Building2, Car, DollarSign, Eye, MessageSquare, Plus,
  TrendingUp, BarChart3, Settings, Bell, Package,
  ChevronRight, ArrowUpRight, ArrowDownRight, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

// Stats Card Component
function StatCard({ title, value, change, changeType, icon: Icon, color = "amber" }) {
  const colorClasses = {
    amber: "bg-amber-100 text-amber-600",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600"
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
                <span>{change}% from last month</span>
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

// Recent Activity Item
function ActivityItem({ title, description, time, type }) {
  const icons = {
    inquiry: <MessageSquare className="w-4 h-4 text-blue-500" />,
    view: <Eye className="w-4 h-4 text-green-500" />,
    sale: <DollarSign className="w-4 h-4 text-amber-500" />,
    listing: <Car className="w-4 h-4 text-purple-500" />
  };

  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-0">
      <div className="p-2 bg-gray-100 rounded-lg">
        {icons[type] || <Bell className="w-4 h-4 text-gray-500" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{title}</p>
        <p className="text-sm text-gray-500 truncate">{description}</p>
      </div>
      <span className="text-xs text-gray-400 whitespace-nowrap">{time}</span>
    </div>
  );
}

// Inventory Item
function InventoryItem({ vehicle }) {
  const statusColors = {
    active: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    sold: "bg-gray-100 text-gray-700"
  };

  return (
    <div className="flex items-center gap-4 py-3 border-b last:border-0">
      <img
        src={vehicle.primary_image || '/placeholder-car.jpg'}
        alt={`${vehicle.make} ${vehicle.model}`}
        className="w-16 h-12 object-cover rounded-lg bg-gray-100"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900">{vehicle.year} {vehicle.make} {vehicle.model}</p>
        <p className="text-sm text-gray-500">${Number(vehicle.price).toLocaleString()}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[vehicle.status] || statusColors.pending}`}>
          {vehicle.status}
        </span>
        <span className="text-sm text-gray-500 flex items-center gap-1">
          <Eye className="w-4 h-4" /> {vehicle.views_count || 0}
        </span>
      </div>
    </div>
  );
}

export default function DealerDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch dealer's vehicles
  const { data: vehiclesData, isLoading: vehiclesLoading } = useQuery({
    queryKey: ['dealer-vehicles'],
    queryFn: async () => {
      const response = await client.get('/vehicles/', { params: { dealer: user?.id, limit: 10 } });
      return response.data;
    },
    enabled: !!user?.id
  });

  // Fetch dealer's inquiries
  const { data: inquiriesData } = useQuery({
    queryKey: ['dealer-inquiries'],
    queryFn: async () => {
      const response = await client.get('/vehicles/inquiries/');
      return response.data;
    }
  });

  const vehicles = vehiclesData?.results || vehiclesData || [];
  const inquiries = inquiriesData?.results || inquiriesData || [];

  // Mock stats - in production these would come from analytics API
  const stats = {
    totalListings: vehicles.length,
    activeListings: vehicles.filter(v => v.status === 'active').length,
    totalViews: vehicles.reduce((sum, v) => sum + (v.views_count || 0), 0),
    totalInquiries: inquiries.length,
    revenue: vehicles.filter(v => v.status === 'sold').reduce((sum, v) => sum + Number(v.price), 0)
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'inquiries', label: 'Inquiries', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-7 h-7 text-amber-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user?.dealer_name || 'Dealer Dashboard'}</h1>
                <p className="text-gray-500">Manage your inventory and track performance</p>
              </div>
            </div>
            <Link to="/dealer/vehicles/new">
              <Button className="bg-amber-500 hover:bg-amber-600 text-gray-900">
                <Plus className="w-4 h-4 mr-2" />
                Add Vehicle
              </Button>
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6 border-b -mb-px">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === tab.id
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
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
                title="Total Listings"
                value={stats.totalListings}
                icon={Car}
                color="amber"
              />
              <StatCard
                title="Active Listings"
                value={stats.activeListings}
                change={12}
                changeType="up"
                icon={TrendingUp}
                color="green"
              />
              <StatCard
                title="Total Views"
                value={stats.totalViews.toLocaleString()}
                change={8}
                changeType="up"
                icon={Eye}
                color="blue"
              />
              <StatCard
                title="Inquiries"
                value={stats.totalInquiries}
                icon={MessageSquare}
                color="purple"
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Recent Activity */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates on your listings</CardDescription>
                </CardHeader>
                <CardContent>
                  {inquiries.length > 0 ? (
                    <div className="divide-y">
                      {inquiries.slice(0, 5).map((inquiry, i) => (
                        <ActivityItem
                          key={inquiry.id || i}
                          title={`New inquiry for ${inquiry.car_make || 'vehicle'}`}
                          description={inquiry.message?.substring(0, 50) + '...' || 'Customer inquiry'}
                          time="2h ago"
                          type="inquiry"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p>No recent activity</p>
                      <p className="text-sm mt-1">Inquiries and updates will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to="/dealer/vehicles/new" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Plus className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Add New Vehicle</p>
                      <p className="text-sm text-gray-500">List a new vehicle for sale</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </Link>
                  <Link to="/dealer/inventory" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Manage Inventory</p>
                      <p className="text-sm text-gray-500">View and edit listings</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </Link>
                  <Link to="/dealer/analytics" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">View Analytics</p>
                      <p className="text-sm text-gray-500">Performance metrics</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Recent Listings */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Your Inventory</CardTitle>
                  <CardDescription>Most recent vehicle listings</CardDescription>
                </div>
                <Link to="/dealer/inventory">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {vehiclesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-4 py-3 animate-pulse">
                        <div className="w-16 h-12 bg-gray-200 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/2" />
                          <div className="h-3 bg-gray-200 rounded w-1/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : vehicles.length > 0 ? (
                  <div className="divide-y">
                    {vehicles.slice(0, 5).map(vehicle => (
                      <InventoryItem key={vehicle.id} vehicle={vehicle} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Car className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p>No vehicles listed yet</p>
                    <Link to="/dealer/vehicles/new" className="text-amber-600 hover:text-amber-700 text-sm mt-2 inline-block">
                      Add your first vehicle →
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'inventory' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Inventory Management</CardTitle>
                <Link to="/dealer/vehicles/new">
                  <Button className="bg-amber-500 hover:bg-amber-600 text-gray-900">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Vehicle
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {vehicles.length > 0 ? (
                  <div className="divide-y">
                    {vehicles.map(vehicle => (
                      <InventoryItem key={vehicle.id} vehicle={vehicle} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-lg font-medium">No inventory yet</p>
                    <p className="mt-1">Start by adding your first vehicle listing</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'inquiries' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Customer Inquiries</CardTitle>
                <CardDescription>Messages from potential buyers</CardDescription>
              </CardHeader>
              <CardContent>
                {inquiries.length > 0 ? (
                  <div className="divide-y">
                    {inquiries.map((inquiry, i) => (
                      <div key={inquiry.id || i} className="py-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{inquiry.name || 'Customer'}</p>
                            <p className="text-sm text-gray-500">{inquiry.email || inquiry.phone}</p>
                          </div>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(inquiry.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mt-2 text-gray-700">{inquiry.message}</p>
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" variant="outline">Reply</Button>
                          <Button size="sm" variant="ghost">Mark as Read</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-lg font-medium">No inquiries yet</p>
                    <p className="mt-1">Customer messages will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Dealer Settings</CardTitle>
                <CardDescription>Manage your dealership profile and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Dealership Name</p>
                      <p className="text-sm text-gray-500">{user?.dealer_name || 'Not set'}</p>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Contact Email</p>
                      <p className="text-sm text-gray-500">{user?.email || 'Not set'}</p>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Phone Number</p>
                      <p className="text-sm text-gray-500">{user?.phone || 'Not set'}</p>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Business Address</p>
                      <p className="text-sm text-gray-500">{user?.business_address || 'Not set'}</p>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}