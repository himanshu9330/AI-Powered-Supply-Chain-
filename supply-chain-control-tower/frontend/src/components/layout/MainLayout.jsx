import React, { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar, DRAWER_WIDTH } from './Sidebar';
import { Navbar } from './Navbar';
import { useAuthStore } from '../../store/useAuthStore';

export const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar handleDrawerToggle={handleDrawerToggle} />
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />

      {/* Main Content Area */}
      <Box
        component="main"
        className="page-enter"
        sx={{
          flexGrow: 1,
          ml: { md: `${DRAWER_WIDTH}px` },
          mt: { xs: '56px', sm: '64px' }, // offset for fixed AppBar
          minHeight: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' },
          p: { xs: 2, sm: 3, md: 4 },
          maxWidth: '100%',
          overflowX: 'hidden',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};
