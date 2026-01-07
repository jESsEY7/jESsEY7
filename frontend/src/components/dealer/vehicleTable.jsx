import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Eye, Edit, Trash2, ExternalLink, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

const statusColors = {
    active: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-yellow-100 text-yellow-700',
    sold: 'bg-blue-100 text-blue-700',
    archived: 'bg-gray-100 text-gray-700'
};

export default function VehicleTable({ vehicles, onEdit, onDelete, onStatusChange }) {
    const formatPrice = (price) => {
        if (!price) return '-';
        return 'KSH ' + new Intl.NumberFormat('en-KE', {
            maximumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="bg-white rounded-xl border overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50">
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Views</TableHead>
                        <TableHead>Quotes</TableHead>
                        <TableHead>Listed</TableHead>
                        <TableHead className="w-12"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {vehicles.map((vehicle) => (
                        <TableRow key={vehicle.id} className="hover:bg-gray-50">
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                        <img
                                            src={vehicle.primary_image || vehicle.images?.[0] || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200'}
                                            alt={vehicle.make}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <p className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                                        <p className="text-sm text-gray-500">{vehicle.mileage?.toLocaleString()} mi • {vehicle.exterior_color}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className="font-semibold">{formatPrice(vehicle.price)}</span>
                            </TableCell>
                            <TableCell>
                                <Badge className={statusColors[vehicle.status]} variant="secondary">
                                    {vehicle.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1 text-gray-600">
                                    <Eye className="w-4 h-4" />
                                    {vehicle.views_count || 0}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1 text-gray-600">
                                    <TrendingUp className="w-4 h-4" />
                                    {vehicle.quotes_count || 0}
                                </div>
                            </TableCell>
                            <TableCell className="text-gray-500">
                                {vehicle.created_date ? format(new Date(vehicle.created_date), 'MMM d, yyyy') : '-'}
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild>
                                            <Link to={createPageUrl(`VehicleDetails?id=${vehicle.id}`)} className="flex items-center gap-2">
                                                <ExternalLink className="w-4 h-4" />
                                                View Listing
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onEdit?.(vehicle)} className="flex items-center gap-2">
                                            <Edit className="w-4 h-4" />
                                            Edit
                                        </DropdownMenuItem>
                                        {vehicle.status === 'pending' && (
                                            <DropdownMenuItem onClick={() => onStatusChange?.(vehicle, 'active')} className="text-emerald-600">
                                                Mark as Active
                                            </DropdownMenuItem>
                                        )}
                                        {vehicle.status === 'active' && (
                                            <DropdownMenuItem onClick={() => onStatusChange?.(vehicle, 'sold')} className="text-blue-600">
                                                Mark as Sold
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem onClick={() => onDelete?.(vehicle)} className="text-red-600 flex items-center gap-2">
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {vehicles.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <p>No vehicles found</p>
                </div>
            )}
        </div>
    );
}
