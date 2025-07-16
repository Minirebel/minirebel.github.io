import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { WebsiteCard } from '@/components/WebsiteCard';
import { AddWebsiteDialog } from '@/components/AddWebsiteDialog';
import { useWebsites } from '@/hooks/useWebsites';
import { RefreshCw } from 'lucide-react';

function App() {
  const { websites, loading, checking, fetchWebsites, checkAllWebsites, deleteWebsite } = useWebsites();

  const handleRefresh = () => {
    checkAllWebsites();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading websites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">Website Status Monitor</h1>
            <p className="text-muted-foreground mt-2">
              Monitor the status of your websites in real-time
            </p>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={handleRefresh} 
              disabled={checking}
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
              {checking ? 'Checking...' : 'Check All'}
            </Button>
            <AddWebsiteDialog onWebsiteAdded={fetchWebsites} />
          </div>
        </div>

        {websites.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No websites added yet</p>
            <AddWebsiteDialog onWebsiteAdded={fetchWebsites} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {websites.map((website) => (
              <WebsiteCard 
                key={website.id} 
                website={website} 
                onDelete={deleteWebsite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
