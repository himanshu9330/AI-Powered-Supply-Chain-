import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button, Alert, Link, Container, Avatar, CircularProgress, MenuItem
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LockResetIcon from '@mui/icons-material/LockReset';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { authService } from '../../services/authService';

export const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'MANAGER',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.register(formData);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card sx={{ width: '100%', p: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', borderRadius: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main', width: 56, height: 56 }}>
              <PersonAddIcon fontSize="large" />
            </Avatar>
            <Typography component="h1" variant="h5" sx={{ fontWeight: 700 }}>
              Create Account
            </Typography>
          </Box>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>Account created! Redirecting to login...</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField margin="dense" required fullWidth label="First Name" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
            <TextField margin="dense" required fullWidth label="Last Name" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
            <TextField margin="dense" required fullWidth label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            <TextField margin="dense" required fullWidth label="Password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            <TextField margin="dense" select fullWidth label="Role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
              <MenuItem value="ADMIN">Admin</MenuItem>
              <MenuItem value="MANAGER">Supply Chain Manager</MenuItem>
              <MenuItem value="ANALYST">Data Analyst</MenuItem>
            </TextField>
            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ py: 1.5, mt: 2, fontWeight: 700 }}>
              {loading ? <CircularProgress size={24} /> : 'Register Account'}
            </Button>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">Back to Login</Link>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <Container maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card sx={{ width: '100%', p: 2, borderRadius: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ m: 1, bgcolor: 'warning.main', width: 56, height: 56 }}>
              <LockResetIcon fontSize="large" />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Reset Password</Typography>
          </Box>
          {submitted ? (
            <Alert severity="success">Reset instructions sent to your email!</Alert>
          ) : (
            <Box component="form" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
              <TextField margin="normal" required fullWidth label="Registered Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Button type="submit" fullWidth variant="contained" sx={{ py: 1.5, mt: 2 }}>Send Reset Link</Button>
            </Box>
          )}
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link component={RouterLink} to="/login" variant="body2">Back to Login</Link>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export const ResetPassword = () => <ForgotPassword />;
