import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContextSimple';
import SuperSimple from './pages/SuperSimple';

function AppMinimal() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<SuperSimple />} />
      </Routes>
    </AuthProvider>
  );
}

export default AppMinimal;