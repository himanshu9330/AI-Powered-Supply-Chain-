import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, IconButton, Box, Avatar, Menu, MenuItem,
  Badge, Tooltip, Divider, InputBase, Typography, Chip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import Brightness4RoundedIcon from '@mui/icons-material/Brightness4Rounded';
import Brightness7RoundedIcon from '@mui/icons-material/Brightness7Rounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import KeyboardShortcutIcon from '@mui/icons-material/Keyboard';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import HexagonRoundedIcon from '@mui/icons-material/HexagonRounded';

import { useAuthStore, useThemeStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { DRAWER_WIDTH } from './Sidebar';

export const Navbar = ({ handleDrawerToggle }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { mode, toggleTheme } = useThemeStore();
  const [anchorEl, setAnchorEl] = useState(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const formattedDate = time.toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
  });

  const formattedTime = time.toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <AppBar
      position="fixed"
      color="default"
      sx={{
        zIndex: (t) => t.zIndex.drawer + 1,
        width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { md: `${DRAWER_WIDTH}px` },
      }}
    >
      <Toolbar
        sx={{
          px: { xs: 2, sm: 3 },
          gap: 1.5,
          minHeight: { xs: 56, sm: 64 },
        }}
      >
        {/* Mobile Menu Toggle */}
        <IconButton
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ display: { md: 'none' } }}
          aria-label="open navigation"
        >
          <MenuRoundedIcon />
        </IconButton>

        {/* Mobile Brand */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1, mr: 1 }}>
          <Box
            sx={{
              width: 28, height: 28, borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1, #14b8a6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <HexagonRoundedIcon sx={{ color: '#fff', fontSize: 16 }} />
          </Box>
          <Typography variant="subtitle2" fontWeight={800}>Control Tower</Typography>
        </Box>

        {/* ── Search Bar ──────────────────────────────── */}
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 0.75,
            borderRadius: '10px',
            border: (t) => `1.5px solid ${t.palette.divider}`,
            bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
            width: { sm: 240, lg: 320 },
            transition: 'all 0.2s ease',
            '&:focus-within': {
              borderColor: 'primary.main',
              bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.04)',
              boxShadow: '0 0 0 3px rgba(99,102,241,0.12)',
            },
          }}
        >
          <SearchRoundedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
          <InputBase
            placeholder="Search products, orders, suppliers…"
            sx={{ fontSize: '0.875rem', color: 'text.primary', flex: 1 }}
            inputProps={{ 'aria-label': 'search' }}
          />
          <Box
            sx={{
              display: { xs: 'none', lg: 'flex' },
              alignItems: 'center',
              gap: 0.25,
              px: 0.75,
              py: 0.25,
              borderRadius: '6px',
              bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.65rem' }}>
              ⌘ K
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* ── Date/Time ────────────────────────────────── */}
        <Box sx={{ display: { xs: 'none', lg: 'flex' }, flexDirection: 'column', alignItems: 'flex-end' }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
            {formattedDate}
          </Typography>
          <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {formattedTime}
          </Typography>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1.5, display: { xs: 'none', lg: 'block' } }} />

        {/* ── Theme Toggle ──────────────────────────────── */}
        <Tooltip title={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} mode`} arrow>
          <IconButton onClick={toggleTheme} size="small" aria-label="toggle theme">
            {mode === 'dark'
              ? <Brightness7RoundedIcon sx={{ fontSize: 20 }} />
              : <Brightness4RoundedIcon sx={{ fontSize: 20 }} />
            }
          </IconButton>
        </Tooltip>

        {/* ── Notifications ─────────────────────────────── */}
        <Tooltip title="Notifications" arrow>
          <IconButton
            size="small"
            onClick={() => navigate('/notifications')}
            aria-label="notifications"
          >
            <Badge badgeContent={4} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', minWidth: 17, height: 17 } }}>
              <NotificationsRoundedIcon sx={{ fontSize: 20 }} />
            </Badge>
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1.5 }} />

        {/* ── User Profile ──────────────────────────────── */}
        <Box
          onClick={handleMenuOpen}
          role="button"
          aria-label="user menu"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            px: 1,
            py: 0.5,
            borderRadius: '10px',
            border: (t) => `1px solid transparent`,
            transition: 'all 0.15s ease',
            '&:hover': {
              bgcolor: (t) => t.palette.action.hover,
              borderColor: (t) => t.palette.divider,
            },
          }}
        >
          <Avatar
            sx={{
              width: 32, height: 32,
              bgcolor: 'primary.main',
              fontSize: '0.8125rem',
              fontWeight: 700,
              boxShadow: '0 0 0 2px rgba(99,102,241,0.25)',
            }}
          >
            {user?.first_name?.[0] || 'A'}
          </Avatar>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', lineHeight: 1.1 }}>
              {user ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Admin User'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6875rem', lineHeight: 1 }}>
              {user?.role || 'ADMIN'}
            </Typography>
          </Box>
        </Box>

        {/* ── User Menu Dropdown ────────────────────────── */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          sx={{ mt: 1 }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              {user ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Admin User'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email || 'admin@supplychain.com'}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}>
            <AccountCircleRoundedIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
            Profile Settings
          </MenuItem>
          <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}>
            <SettingsRoundedIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
            Preferences
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <LogoutRoundedIcon fontSize="small" sx={{ mr: 1.5 }} />
            Sign Out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};
