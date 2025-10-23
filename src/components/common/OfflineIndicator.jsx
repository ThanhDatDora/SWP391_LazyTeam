import { WifiOff, Database } from 'lucide-react';

/**
 * OfflineIndicator - Shows when using fallback/cached data
 */
const OfflineIndicator = ({ isOffline = false, message = null }) => {
  if (!isOffline) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <WifiOff className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            <span className="font-medium">Offline Mode:</span>{' '}
            {message || 'Backend unavailable. Displaying cached content.'}
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * CachedDataBadge - Small badge to indicate cached data
 */
export const CachedDataBadge = () => {
  return (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
      <Database className="w-3 h-3 mr-1" />
      Cached
    </span>
  );
};

export default OfflineIndicator;
