import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, CheckCircle, XCircle, Eye, Ban, Shield } from 'lucide-react';
import { format } from 'date-fns';

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    verified: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
    suspended: 'bg-gray-100 text-gray-700'
};

export default function DealerApprovalTable({ dealers, onApprove, onReject, onSuspend, onViewDetails }) {
    return (
        <div className="bg-white rounded-xl border overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50">
                        <TableHead>Dealer</TableHead>
                        <TableHead>License #</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applied</TableHead>
                        <TableHead>Listings</TableHead>
                        <TableHead className="w-12"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {dealers.map((dealer) => (
                        <TableRow key={dealer.id} className="hover:bg-gray-50">
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    {dealer.logo_url ? (
                                        <img
                                            src={dealer.logo_url}
                                            alt={dealer.business_name}
                                            className="w-10 h-10 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                            <span className="text-lg font-bold text-gray-400">
                                                {dealer.business_name?.[0]?.toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium">{dealer.business_name}</p>
                                        <p className="text-sm text-gray-500">{dealer.owner_email}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                                {dealer.license_number || '-'}
                            </TableCell>
                            <TableCell>
                                <span className="text-gray-600">
                                    {dealer.city}, {dealer.state}
                                </span>
                            </TableCell>
                            <TableCell>
                                <Badge className={statusColors[dealer.verification_status]} variant="secondary">
                                    {dealer.verification_status === 'verified' && <Shield className="w-3 h-3 mr-1" />}
                                    {dealer.verification_status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-gray-500">
                                {dealer.created_date ? format(new Date(dealer.created_date), 'MMM d, yyyy') : '-'}
                            </TableCell>
                            <TableCell>
                                <span className="font-medium">{dealer.active_listings || 0}</span>
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onViewDetails?.(dealer)} className="flex items-center gap-2">
                                            <Eye className="w-4 h-4" />
                                            View Details
                                        </DropdownMenuItem>
                                        {dealer.verification_status === 'pending' && (
                                            <>
                                                <DropdownMenuItem onClick={() => onApprove?.(dealer)} className="text-emerald-600 flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4" />
                                                    Approve
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onReject?.(dealer)} className="text-red-600 flex items-center gap-2">
                                                    <XCircle className="w-4 h-4" />
                                                    Reject
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        {dealer.verification_status === 'verified' && (
                                            <DropdownMenuItem onClick={() => onSuspend?.(dealer)} className="text-orange-600 flex items-center gap-2">
                                                <Ban className="w-4 h-4" />
                                                Suspend
                                            </DropdownMenuItem>
                                        )}
                                        {dealer.verification_status === 'suspended' && (
                                            <DropdownMenuItem onClick={() => onApprove?.(dealer)} className="text-emerald-600 flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" />
                                                Reinstate
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {dealers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <p>No dealers found</p>
                </div>
            )}
        </div>
    );
}
