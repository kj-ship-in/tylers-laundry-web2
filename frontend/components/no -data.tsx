import { RefreshCw, Database } from 'lucide-react';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from '@/components/ui/empty';
import { Button } from '@/components/ui/button';

export default function NoData({
  onRefresh,
  title = 'No Data Found',
  description = "There's no data available at the moment. Try refreshing or check back later.",
  icon: IconComponent = Database,
  showRefresh = true,
  compact = false,
}) {
  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh();
    }
  };

  const containerClasses = compact
    ? 'w-full flex items-center justify-center p-8'
    : 'min-h-screen w-full flex items-center justify-center p-8 bg-white';

  return (
    <div className={containerClasses}>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <IconComponent className='w-6 h-6' />
          </EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
        {showRefresh && (
          <EmptyContent>
            <Button onClick={handleRefresh} variant='outline'>
              <RefreshCw className='w-4 h-4 mr-2' />
              Refresh Data
            </Button>
          </EmptyContent>
        )}
      </Empty>
    </div>
  );
}
