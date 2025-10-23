import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthDebug = () => {
  const { state, isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">🔍 Auth Debug</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold text-lg">Authentication Status:</h2>
            <p className={`text-lg ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
              {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
            </p>
          </div>
          
          <div>
            <h2 className="font-semibold text-lg">User Info:</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(state.user, null, 2)}
            </pre>
          </div>
          
          <div>
            <h2 className="font-semibold text-lg">Full Auth State:</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(state, null, 2)}
            </pre>
          </div>
          
          <div>
            <h2 className="font-semibold text-lg">LocalStorage Token:</h2>
            <p className="bg-gray-100 p-2 rounded text-sm break-all">
              {localStorage.getItem('token') || 'No token found'}
            </p>
          </div>
          
          <div className="mt-6">
            <a href="/auth" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Go to Login
            </a>
            <a href="/" className="ml-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              Go to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDebug;