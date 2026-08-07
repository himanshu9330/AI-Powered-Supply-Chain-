import React, { useState } from 'react';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, Box, Divider, Avatar, Chip, Tooltip, Collapse, IconButton,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { alpha } from '@mui/material/styles';

import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import WarehouseRoundedIcon from '@mui/icons-material/WarehouseRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import HexagonRoundedIcon from '@mui/icons-material/HexagonRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';

import { useAuthStore } from '../../store/useAuthStore';

const DRAWER_WIDTH = 264;

const NAV_GROUPS = [
  {
    title: 'OVERVIEW',
    items: [
      { label: 'Executive Dashboard', path: '/dashboard', icon: DashboardRoundedIcon },
    ],
  },
  {
    title: 'CATALOG & STOCK',
    items: [
      { label: 'Products', path: '/products', icon: Inventory2RoundedIcon },
      { label: 'Categories', path: '/categories', icon: CategoryRoundedIcon },
      { label: 'Inventory Stock', path: '/inventory', icon: Inventory2RoundedIcon },
      { label: 'Warehouses', path: '/warehouses', icon: WarehouseRoundedIcon },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      { label: 'Suppliers', path: '/suppliers', icon: LocalShippingRoundedIcon },
      { label: 'Purchase Orders', path: '/purchase-orders', icon: ShoppingCartRoundedIcon },
      { label: 'Sales History', path: '/sales', icon: PointOfSaleRoundedIcon },
      { label: 'Stock Transfers', path: '/transfers', icon: CompareArrowsRoundedIcon },
    ],
  },
  {
    title: 'AI INTELLIGENCE',
    items: [
      { label: 'Demand Forecasting', path: '/forecast', icon: AutoAwesomeRoundedIcon, badge: 'AI' },
      { label: 'Supply Analytics', path: '/analytics', icon: InsightsRoundedIcon },
      { label: 'EOQ Optimization', path: '/optimization', icon: SpeedRoundedIcon },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { label: 'Reports', path: '/reports', icon: AssessmentRoundedIcon },
      { label: 'Notifications', path: '/notifications', icon: NotificationsRoundedIcon },
      { label: 'Settings', path: '/settings', icon: SettingsRoundedIcon },
    ],
  },
];

const NavItem = ({ item, isActive, onClick, collapsed }) => {
  const Icon = item.icon;
  return (
    <Tooltip title={collapsed ? item.label : ''} placement="right" arrow>
      <ListItem disablePadding sx={{ mb: 0.25 }}>
        <ListItemButton
          onClick={onClick}
          sx={{
            borderRadius: '10px',
            py: 1,
            px: 1.5,
            minHeight: 40,
            position: 'relative',
            overflow: 'hidden',
            ...(isActive && {
              background: (t) => `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.18)}, ${alpha(t.palette.primary.main, 0.08)})`,
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 3,
                height: '60%',
                borderRadius: '0 3px 3px 0',
                bgcolor: 'primary.main',
                backgroundColor: 'primary.main',
              },
            }),
            '&:hover': {
              background: (t) => isActive
                ? `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.22)}, ${alpha(t.palette.primary.main, 0.10)})`
                : (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: collapsed ? 'auto' : 34,
              color: isActive ? 'primary.main' : 'text.secondary',
              transition: 'color 0.15s ease',
              '& svg': { fontSize: 19 },
            }}
          >
            <Icon />
          </ListItemIcon>
          {!collapsed && (
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'primary.main' : 'text.primary',
                noWrap: true,
              }}
            />
          )}
          {!collapsed && item.badge && (
            <Chip
              label={item.badge}
              size="small"
              color="secondary"
              sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.5px' }}
            />
          )}
        </ListItemButton>
      </ListItem>
    </Tooltip>
  );
};

const DrawerContent = ({ collapsed, handleDrawerToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* ── Brand Header ─────────────────────────────────────── */}
      <Box
        sx={{
          px: collapsed ? 1.5 : 2.5,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          minHeight: 64,
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #14b8a6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
          }}
        >
          <HexagonRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />
        </Box>
        {!collapsed && (
          <Box sx={{ overflow: 'hidden' }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}
            >
              Control Tower
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
              AI Supply Chain Platform
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Navigation ───────────────────────────────────────── */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden', py: 1.5, px: collapsed ? 1 : 1.5 }}>
        {NAV_GROUPS.map((group, gIdx) => (
          <Box key={gIdx} sx={{ mb: 1.5 }}>
            {!collapsed && (
              <Typography
                variant="overline"
                sx={{ px: 1.5, pb: 0.5, display: 'block', color: 'text.disabled', fontSize: '0.6rem' }}
              >
                {group.title}
              </Typography>
            )}
            <List disablePadding>
              {group.items.map((item) => (
                <NavItem
                  key={item.path}
                  item={item}
                  isActive={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                  collapsed={collapsed}
                />
              ))}
            </List>
          </Box>
        ))}
      </Box>

      {/* ── User Profile Footer ───────────────────────────────── */}
      <Box
        sx={{
          flexShrink: 0,
          borderTop: (t) => `1px solid ${t.palette.divider}`,
          p: collapsed ? 1 : 1.5,
        }}
      >
        {!collapsed ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1.5,
              borderRadius: '10px',
              border: (t) => `1px solid ${t.palette.divider}`,
              bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            }}
          >
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: 'primary.main',
                fontSize: '0.875rem',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {user?.first_name?.[0] || 'A'}
            </Avatar>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {user ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Admin User'}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {user?.role || 'ADMIN'}
              </Typography>
            </Box>
            <Tooltip title="Logout" arrow>
              <IconButton size="small" onClick={handleLogout} sx={{ color: 'text.secondary', flexShrink: 0 }}>
                <LogoutRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <Tooltip title="Logout" placement="right" arrow>
            <IconButton onClick={handleLogout} sx={{ width: '100%', borderRadius: '10px' }}>
              <LogoutRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

export const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const [collapsed] = useState(false);

  return (
    <Box
      component="nav"
      sx={{
        width: { md: DRAWER_WIDTH },
        flexShrink: { md: 0 },
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: (t) => t.zIndex.drawer,
        display: { xs: 'none', md: 'block' },
      }}
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
        }}
      >
        <DrawerContent collapsed={false} handleDrawerToggle={handleDrawerToggle} />
      </Drawer>

      {/* Desktop Permanent Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            position: 'fixed',
            height: '100vh',
            top: 0,
          },
        }}
        open
      >
        <DrawerContent collapsed={collapsed} handleDrawerToggle={handleDrawerToggle} />
      </Drawer>
    </Box>
  );
};

export { DRAWER_WIDTH };
