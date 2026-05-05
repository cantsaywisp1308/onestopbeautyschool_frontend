'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  role?: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.replace('/login');
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const userRole = (decoded.role || '').toLowerCase();
      
      if (userRole !== 'admin' && userRole !== 'role_admin') {
        // Not an admin, redirect to student dashboard
        router.replace('/student');
      } else {
        // Access granted
        setIsAuthorized(true);
      }
    } catch (e) {
      console.error("Token validation error:", e);
      localStorage.removeItem('token');
      router.replace('/login');
    }
  }, [router]);

  // Prevent flicker while checking authorization
  if (!isAuthorized) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#0f172a',
        color: '#94a3b8',
        fontFamily: 'sans-serif'
      }}>
        <p>Verifying Admin Access...</p>
      </div>
    );
  }

  return <>{children}</>;
}
