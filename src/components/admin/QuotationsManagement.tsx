import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, FileText, Calendar, Send } from 'lucide-react';
import { format } from 'date-fns';

import { AdminHeader } from './AdminHeader';
import { DataTable } from './DataTable';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Quotation } from '@/types/business';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LoadingState } from './LoadingState';

const statusColors = {
  draft: 'bg-gray-500',
  sent: 'bg-blue-500',
  accepted: 'bg-green-500',
  rejected: 'bg-red-500',
  expired: 'bg-yellow-500'
} as const;

export function QuotationsManagement() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const { toast } = useToast();

  const columns: ColumnDef<Quotation>[] = [
    {
      accessorKey: 'quotation_number',
      header: 'Quotation Number'
    },
    {
      accessorKey: 'customer_id',
      header: 'Customer'
    },
    {
      accessorKey: 'total_amount',
      header: 'Total Amount',
      cell: ({ row }) => {
        const amount = row.getValue('total_amount') as number;
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(amount);
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as keyof typeof statusColors;
        return (
          <Badge className={statusColors[status]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      }
    },
    {
      accessorKey: 'valid_until',
      header: 'Valid Until',
      cell: ({ row }) => {
        return format(new Date(row.getValue('valid_until')), 'PP');
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const quotation = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setSelectedQuotation(quotation)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {quotation.status === 'draft' && (
                <DropdownMenuItem onClick={() => updateQuotationStatus(quotation.id, 'sent')}>
                  <Send className="mr-2 h-4 w-4" />
                  Send to Customer
                </DropdownMenuItem>
              )}
              {quotation.status === 'sent' && (
                <>
                  <DropdownMenuItem onClick={() => updateQuotationStatus(quotation.id, 'accepted')}>
                    Mark as Accepted
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateQuotationStatus(quotation.id, 'rejected')}>
                    Mark as Rejected
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ];

  const loadQuotations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotations(data as Quotation[]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load quotations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuotationStatus = async (quotationId: string, status: Quotation['status']) => {
    try {
      const { error } = await supabase
        .from('quotations')
        .update({ status })
        .eq('id', quotationId);

      if (error) throw error;

      setQuotations(quotations.map(quotation => 
        quotation.id === quotationId ? { ...quotation, status } : quotation
      ));

      toast({
        title: 'Success',
        description: 'Quotation status updated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update quotation status',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return <LoadingState message="Loading quotations..." />;
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Quotations"
        description="View and manage customer quotations"
      >
        <Button variant="outline" onClick={() => loadQuotations()}>
          <Calendar className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </AdminHeader>

      <DataTable
        columns={columns}
        data={quotations}
        searchColumn="quotation_number"
        searchPlaceholder="Search quotations..."
      />

      {selectedQuotation && (
        <Dialog open={!!selectedQuotation} onOpenChange={() => setSelectedQuotation(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Quotation Details - {selectedQuotation.quotation_number}</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Quotation Information</h4>
                  <p>Status: {selectedQuotation.status}</p>
                  <p>Created: {format(new Date(selectedQuotation.created_at), 'PPP')}</p>
                  <p>Valid Until: {format(new Date(selectedQuotation.valid_until), 'PPP')}</p>
                  <p>Total: {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(selectedQuotation.total_amount)}</p>
                </div>
                <div>
                  <h4 className="font-medium">Customer Information</h4>
                  <p>ID: {selectedQuotation.customer_id}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium">Quotation Items</h4>
                <ul className="mt-2 space-y-2">
                  {selectedQuotation.items.map((item) => (
                    <li key={item.id} className="flex justify-between">
                      <span>
                        {item.quantity}x {item.product_id}
                        {item.description && (
                          <span className="ml-2 text-sm text-muted-foreground">
                            ({item.description})
                          </span>
                        )}
                      </span>
                      <span>
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        }).format(item.total_price)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
