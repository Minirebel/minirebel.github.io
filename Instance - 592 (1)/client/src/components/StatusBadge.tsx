import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'checking';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    online: {
      label: 'Online',
      className: 'bg-green-100 text-green-800 border-green-200'
    },
    offline: {
      label: 'Offline',
      className: 'bg-red-100 text-red-800 border-red-200'
    },
    checking: {
      label: 'Checking...',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  };

  const config = statusConfig[status];

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      config.className,
      className
    )}>
      <span className={cn(
        'w-2 h-2 rounded-full mr-1.5',
        status === 'online' && 'bg-green-500',
        status === 'offline' && 'bg-red-500',
        status === 'checking' && 'bg-yellow-500'
      )} />
      {config.label}
    </span>
  );
}
