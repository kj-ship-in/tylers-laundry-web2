'use client';

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

interface ConfirmationAlertDialogProps {
  isOpen: boolean;
  action: 'delete' | 'mark-paid' | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationAlertDialog = ({
  isOpen,
  action,
  onConfirm,
  onCancel,
}: ConfirmationAlertDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {action === 'delete' && 'Delete Invoice'}
            {action === 'mark-paid' && 'Mark Invoice as Paid'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {action === 'delete' &&
              'Are you sure you want to delete this invoice? This action cannot be undone.'}
            {action === 'mark-paid' &&
              'Are you sure you want to mark this invoice as paid? This action cannot be undone.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              action === 'delete'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            }
          >
            {action === 'delete' && 'Delete'}
            {action === 'mark-paid' && 'Mark as Paid'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
