import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { api } from '../../services/api';
import { useRefresh } from '../../hooks/useCacheClear';
import { testApiConnection, testLogin } from '../../utils/apiTest';

const ApiDebugPanel = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [apiStats, setApiStats] = useState({
    totalRequests: 0,
    cacheHits: 0,
    cacheSize: 0
  });
  const { handleSoftRefresh, forceRefresh } = useRefresh();

  const updateStats = () => {
    // This would need to be implemented in the API service
    setApiStats({
      totalRequests: window.apiRequestCount || 0,
      cacheHits: window.apiCacheHits || 0,
      cacheSize: window.apiCacheSize || 0
    });
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => setIsVisible(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-12 h-12 p-0"
          title="Show API Debug Panel"
        >
          🔧
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="shadow-lg border-blue-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">API Debug Panel</CardTitle>
            <Button 
              onClick={() => setIsVisible(false)}
              variant="ghost"
              className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span>Total Requests:</span>
              <span className="font-mono">{apiStats.totalRequests}</span>
            </div>
            <div className="flex justify-between">
              <span>Cache Hits:</span>
              <span className="font-mono text-green-600">{apiStats.cacheHits}</span>
            </div>
            <div className="flex justify-between">
              <span>Cache Size:</span>
              <span className="font-mono">{apiStats.cacheSize}</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button 
              onClick={updateStats}
              variant="outline" 
              className="h-7 text-xs"
            >
              Refresh Stats
            </Button>
            <Button 
              onClick={handleSoftRefresh}
              variant="outline" 
              className="h-7 text-xs"
            >
              Clear Cache
            </Button>
            <Button 
              onClick={forceRefresh}
              variant="destructive" 
              className="h-7 text-xs"
            >
              Force Reload
            </Button>
            <Button 
              onClick={async () => {
                try {
                  await testApiConnection();
                  alert('API Connection test successful');
                } catch (error) {
                  alert(`API Connection test failed: ${error.message}`);
                }
              }}
              variant="outline" 
              className="h-7 text-xs bg-green-50 hover:bg-green-100"
            >
              Test API
            </Button>
            <Button 
              onClick={async () => {
                try {
                  await testLogin();
                  alert('Login test successful');
                } catch (error) {
                  alert(`Login test failed: ${error.message}`);
                }
              }}
              variant="outline" 
              className="h-7 text-xs bg-yellow-50 hover:bg-yellow-100"
            >
              Test Login
            </Button>
          </div>
          
          <div className="text-xs text-gray-500">
            <div>Backend: localhost:3001</div>
            <div>Environment: Development</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiDebugPanel;