import { useState, useEffect } from 'react';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import { AdminProvider, useAdmin } from '../../contexts/AdminContext';

function AdminContent() {
  const { admin, loading } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra xác thực...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return <AdminLogin onLoginSuccess={() => window.location.reload()} />;
  }

  return <AdminDashboard />;
}

export function AdminWrapper() {
  return (
    <AdminProvider>
      <AdminContent />
    </AdminProvider>
  );
}
