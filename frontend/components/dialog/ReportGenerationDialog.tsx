'use client';

import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import type { InvoiceStatus } from '@/types/payment';

interface ReportGenerationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (params: {
    startDate: string;
    endDate: string;
    status?: InvoiceStatus;
    format: 'pdf' | 'excel';
  }) => void;
  isGenerating: boolean;
}

export const ReportGenerationDialog = ({
  isOpen,
  onOpenChange,
  onGenerate,
  isGenerating,
}: ReportGenerationDialogProps) => {
  const [reportFilters, setReportFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    status: 'ALL' as InvoiceStatus | 'ALL',
    format: 'excel' as 'pdf' | 'excel',
  });

  const handleGenerate = () => {
    onGenerate({
      startDate: reportFilters.startDate.toISOString().split('T')[0],
      endDate: reportFilters.endDate.toISOString().split('T')[0],
      status: reportFilters.status !== 'ALL' ? reportFilters.status : undefined,
      format: reportFilters.format,
    });
    onOpenChange(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className='max-w-md'>
        <AlertDialogHeader>
          <AlertDialogTitle>Generate Invoice Report</AlertDialogTitle>
          <AlertDialogDescription>
            Select the date range, status, and format for the report.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='text-sm font-medium'>Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !reportFilters.startDate && 'text-muted-foreground',
                    )}
                  >
                    <CalendarDays className='mr-2 h-4 w-4' />
                    {reportFilters.startDate ? (
                      format(reportFilters.startDate, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0'>
                  <Calendar
                    mode='single'
                    selected={reportFilters.startDate}
                    onSelect={date =>
                      date &&
                      setReportFilters(prev => ({ ...prev, startDate: date }))
                    }
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className='text-sm font-medium'>End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !reportFilters.endDate && 'text-muted-foreground',
                    )}
                  >
                    <CalendarDays className='mr-2 h-4 w-4' />
                    {reportFilters.endDate ? (
                      format(reportFilters.endDate, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0'>
                  <Calendar
                    mode='single'
                    selected={reportFilters.endDate}
                    onSelect={date =>
                      date &&
                      setReportFilters(prev => ({ ...prev, endDate: date }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='text-sm font-medium'>Status</label>
              <Select
                value={reportFilters.status}
                onValueChange={(value: InvoiceStatus | 'ALL') =>
                  setReportFilters(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='w-full'>
                  <SelectItem value='ALL'>All</SelectItem>
                  <SelectItem value='UNPAID'>Unpaid</SelectItem>
                  <SelectItem value='PAID'>Paid</SelectItem>
                  <SelectItem value='OVERDUE'>Overdue</SelectItem>
                  <SelectItem value='CANCELLED'>Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className='text-sm font-medium'>Format</label>
              <Select
                value={reportFilters.format}
                onValueChange={(value: 'pdf' | 'excel') =>
                  setReportFilters(prev => ({ ...prev, format: value }))
                }
              >
                <SelectTrigger className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='w-full'>
                  <SelectItem value='excel'>Excel</SelectItem>
                  <SelectItem value='pdf'>PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Generate'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
