import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Switch, FormControlLabel, Divider, Grid, Avatar, Chip } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';

import { PageHeader } from '../../components/ui/PageHeader';
import { useAuthStore, useThemeStore } from '../../store/useAuthStore';

export const SettingsPage = () => {
  const { user, updateUser } = useAuthStore();
  const { mode, toggleTheme } = useThemeStore();

  const [profile, setProfile] = useState({
    first_name: user?.first_name || 'Supply Chain',
    last_name: user?.last_name || 'Executive',
    email: user?.email || 'admin@supplychain.com',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    updateUser(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Box>
      <PageHeader
        title="Settings & System Preferences"
        subtitle="Manage user credentials, enterprise theme preferences, roles & security policies"
        breadcrumbs={['Settings']}
      />

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontWeight: 700 }}>
                  {profile.first_name[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>{profile.first_name} {profile.last_name}</Typography>
                  <Chip label={user?.role || 'ADMIN'} color="primary" size="small" />
                </Box>
              </Box>

              <Box component="form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField label="First Name" fullWidth value={profile.first_name} onChange={(e) => setProfile({ ...profile, first_name: e.target.value })} />
                <TextField label="Last Name" fullWidth value={profile.last_name} onChange={(e) => setProfile({ ...profile, last_name: e.target.value })} />
                <TextField label="Email Address" fullWidth value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                <Button type="submit" variant="contained" sx={{ mt: 1 }}>
                  {saved ? 'Settings Saved!' : 'Save Profile Changes'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Theme & System Preferences */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>System Appearance & Preferences</Typography>
              <Divider sx={{ mb: 2 }} />

              <FormControlLabel
                control={<Switch checked={mode === 'dark'} onChange={toggleTheme} color="primary" />}
                label={
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>Dark Mode Theme</Typography>
                    <Typography variant="caption" color="text.secondary">Toggle between sleek dark slate and light workspace appearance</Typography>
                  </Box>
                }
              />

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Non-Docker Local Configuration</Typography>
              <Typography variant="body2" color="text.secondary">Backend Endpoint: <code>http://localhost:5000/api</code></Typography>
              <Typography variant="body2" color="text.secondary">FastAPI ML Endpoint: <code>http://localhost:8000</code></Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
