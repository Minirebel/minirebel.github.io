import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import { Trash2, ExternalLink } from 'lucide-react';

interface WebsiteCardProps {
  website: {
    id: number;
    name: string;
    url: string;
    status: 'online' | 'offline' | 'checking';
    response_time: number | null;
    last_checked: string;
  };
  onDelete: (id: number) => void;
}

export function WebsiteCard({ website, onDelete }: WebsiteCardProps) {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const handleDelete = () => {
    onDelete(website.id);
  };

  const handleVisit = () => {
    window.open(website.url, '_blank');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{website.name}</CardTitle>
          <StatusBadge status={website.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Response Time</span>
            <span>{website.response_time ? `${website.response_time}ms` : 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Last Checked</span>
            <span>{formatTime(website.last_checked)}</span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" size="sm" onClick={handleVisit}>
              <ExternalLink className="w-4 h-4 mr-1" />
              Visit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
