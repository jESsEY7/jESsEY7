import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl, formatCurrency, formatDate } from '@/utils';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import client from '@/api/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText, ArrowLeft, ExternalLink, Calendar,
  MapPin, Clock, Loader2, Download, RefreshCw
} from 'lucide-react';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  viewed: 'bg-blue-100 text-blue-700',
  contacted: 'bg-purple-100 text-purple-700',
  converted: 'bg-emerald-100 text-emerald-700',
  expired: 'bg-gray-100 text-gray-700'
};

// Quote keys for React Query
export const quoteKeys = {
  all: ['quotes'],
  list: () => [...quoteKeys.all, 'list'],
  detail: (id) => [...quoteKeys.all, 'detail', id],
};

export default function MyQuotesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's quotes from backend
  const { data: quotesData, isLoading, error, refetch } = useQuery({
    queryKey: quoteKeys.list(),
    queryFn: async () => {
      const response = await client.get('/sales/quotes/');
      return response.data.results || response.data || [];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });

  const quotes = quotesData || [];

  // Download PDF handler
  const handleDownloadPdf = async (quoteId, referenceNumber) => {
    try {
      const response = await client.get(`/sales/quotes/${quoteId}/pdf/`, {
        responseType: 'blob',
      });

      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `quote_${referenceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Refresh quotes to update viewed status
      refetch();
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load quotes</p>
          <Button onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to={createPageUrl('Vehicles')} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to listings
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Quotes</h1>
                <p className="text-gray-500">{quotes.length} quote{quotes.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {quotes.length > 0 ? (
          <div className="space-y-4">
            {quotes.map((quote) => {
              const isExpired = quote.is_expired;
              const daysRemaining = quote.days_remaining;

              return (
                <Card key={quote.id} className={`overflow-hidden ${isExpired ? 'opacity-60' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      {/* Vehicle Image */}
                      {quote.vehicle_image_url && (
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={quote.vehicle_image_url}
                            alt={quote.vehicle_title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Vehicle Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={statusColors[isExpired ? 'expired' : quote.status]}>
                            {isExpired ? 'Expired' : quote.status}
                          </Badge>
                          {!isExpired && daysRemaining !== null && daysRemaining <= 3 && (
                            <Badge variant="outline" className="text-orange-600 border-orange-300">
                              <Clock className="w-3 h-3 mr-1" />
                              {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{quote.vehicle_title}</h3>
                        <p className="text-sm text-gray-500">Ref: {quote.reference_number}</p>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(quote.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            Delivery to {quote.buyer_zip}
                          </span>
                        </div>
                      </div>

                      {/* Price Info */}
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Drive-Away Price</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(quote.total_price)}
                        </p>
                        <div className="text-xs text-gray-400 mt-1">
                          Base: {formatCurrency(quote.base_price)}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex md:flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleDownloadPdf(quote.id, quote.reference_number)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          PDF
                        </Button>
                        <Link to={`/vehicles/${quote.vehicle}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </Link>
                        {!isExpired && (
                          <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-gray-900 w-full">
                            Contact
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">No quotes yet</h2>
            <p className="text-gray-500 mt-2">Request a quote on any vehicle to see your personalized drive-away price</p>
            <Link to={createPageUrl('Vehicles')}>
              <Button className="mt-6 bg-amber-500 hover:bg-amber-600 text-gray-900">
                Browse Vehicles
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}