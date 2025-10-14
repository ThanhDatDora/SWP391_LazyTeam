import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Landing from './pages/Landing'
import AuthPage from './pages/auth/AuthPage'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={
          <div style={{
            padding: '50px',
            backgroundColor: 'lightpink',
            color: 'black',
            fontSize: '24px',
            textAlign: 'center'
          }}>
            <h1>🚧 Route không tồn tại</h1>
            <p>Đường dẫn này chưa được thiết lập</p>
            <a href="/">← Về trang chủ</a>
          </div>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;
