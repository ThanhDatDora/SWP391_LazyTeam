import { useAuth } from '../contexts/AuthContext';

export default function DebugAuth() {
  const authContext = useAuth();
  
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('token');
  
  let parsedUser = null;
  try {
    parsedUser = storedUser ? JSON.parse(storedUser) : null;
  } catch (e) {
    console.error('Failed to parse user:', e);
  }
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: 'red' }}>🔍 AUTH DEBUG PAGE</h1>
      
      <div style={{ backgroundColor: 'white', padding: '15px', marginBottom: '20px', borderRadius: '5px' }}>
        <h2>AuthContext State:</h2>
        <pre>{JSON.stringify({
          isAuthenticated: authContext.isAuthenticated,
          isLoading: authContext.isLoading,
          user: authContext.user,
          user_role_id: authContext.user?.role_id,
          user_role_id_type: typeof authContext.user?.role_id
        }, null, 2)}</pre>
      </div>
      
      <div style={{ backgroundColor: 'white', padding: '15px', marginBottom: '20px', borderRadius: '5px' }}>
        <h2>localStorage:</h2>
        <div>
          <strong>Token exists:</strong> {storedToken ? '✅ Yes' : '❌ No'}
        </div>
        <div>
          <strong>Token value:</strong> {storedToken ? storedToken.substring(0, 50) + '...' : 'null'}
        </div>
        <div style={{ marginTop: '10px' }}>
          <strong>User raw:</strong>
          <pre style={{ backgroundColor: '#f9f9f9', padding: '10px' }}>{storedUser || 'null'}</pre>
        </div>
        <div>
          <strong>User parsed:</strong>
          <pre style={{ backgroundColor: '#f9f9f9', padding: '10px' }}>{JSON.stringify(parsedUser, null, 2)}</pre>
        </div>
        {parsedUser && (
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: parsedUser.role_id === 1 ? '#90EE90' : '#FFB6C1' }}>
            <strong>role_id:</strong> {parsedUser.role_id} (type: {typeof parsedUser.role_id})
            <br />
            <strong>Is Admin?</strong> {parsedUser.role_id === 1 ? '✅ YES' : '❌ NO'}
            <br />
            <strong>Comparison checks:</strong>
            <ul>
              <li>role_id === 1: {parsedUser.role_id === 1 ? '✅' : '❌'}</li>
              <li>role_id == 1: {parsedUser.role_id == 1 ? '✅' : '❌'}</li>
              <li>role_id === "1": {parsedUser.role_id === "1" ? '✅' : '❌'}</li>
            </ul>
          </div>
        )}
      </div>
      
      <div style={{ backgroundColor: 'white', padding: '15px', marginBottom: '20px', borderRadius: '5px' }}>
        <h2>Current Location:</h2>
        <div><strong>URL:</strong> {window.location.href}</div>
        <div><strong>Pathname:</strong> {window.location.pathname}</div>
      </div>
      
      <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '5px' }}>
        <h2>Actions:</h2>
        <button 
          onClick={() => window.location.href = '/admin'}
          style={{ padding: '10px 20px', marginRight: '10px', fontSize: '16px' }}
        >
          Force Navigate to /admin
        </button>
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.href = '/auth';
          }}
          style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#ff4444', color: 'white' }}
        >
          Logout & Clear All
        </button>
      </div>
    </div>
  );
}
