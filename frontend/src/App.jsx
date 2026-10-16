import React from 'react';
import AppRoutes from './routes/AppRoutes';
import Toast from './components/common/Toast';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toast />
    </AuthProvider>
  );
}

export default App;
