import React, { useState } from 'react';
import {
  Grid, Box, Card, CardContent, Typography, Button, Chip, Avatar,
  Table, TableBody, TableCell, TableHead, TableRow, LinearProgress,
  IconButton, Tooltip, Divider, Skeleton,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';

import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip, Legend, BarChart, Bar,
} from 'recharts';

import { KPICard } from '../../components/ui/KPICard';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useNavigate } from 'react-router-dom';

// ── Static Demo Data ─────────────────────────────────────────────
const REVENUE_DATA = [
  { month: 'Jan', revenue: 145000, forecast: 140000 },
  { month: 'Feb', revenue: 162000, forecast: 158000 },
  { month: 'Mar', revenue: 189000, forecast: 180000 },
  { month: 'Apr', revenue: 175000, forecast: 178000 },
  { month: 'May', revenue: 210000, forecast: 205000 },
  { month: 'Jun', revenue: 245000, forecast: 240000 },
  { month: 'Jul', revenue: 280000, forecast: 275000 },
];

const MONTHLY_SALES = [
  { month: 'Jan', sales: 42 }, { month: 'Feb', sales: 58 },
  { month: 'Mar', sales: 71 }, { month: 'Apr', sales: 65 },
  { month: 'May', sales: 84 }, { month: 'Jun', sales: 97 },
  { month: 'Jul', sales: 110 },
];

const WAREHOUSES = [
  { name: 'Central Hub NY', pct: 88, color: '#6366f1' },
  { name: 'West Coast LA',  pct: 74, color: '#14b8a6' },
  { name: 'Midwest Hub',    pct: 92, color: '#f59e0b' },
  { name: 'Southern Fulfil.',pct: 65, color: '#10b981' },
];

const RECENT_EVENTS = [
  { id: 1, title: 'PO-2024-089 Received',               type: 'PO',     time: '12 min ago', status: 'received' },
  { id: 2, title: 'AI Ensemble Forecast: iPhone 15 Pro', type: 'AI',     time: '45 min ago', status: 'completed' },
  { id: 3, title: 'Low Stock Alert: Ergonomic Chair',    type: 'ALERT',  time: '2 hrs ago',  status: 'low_stock' },
  { id: 4, title: 'Transfer TR-104 Shipped to LA',       type: 'XFER',   time: '4 hrs ago',  status: 'in_transit' },
  { id: 5, title: 'Supplier MicroChip: Lead-time delay', type: 'SUPPLY', time: '6 hrs ago',  status: 'delayed' },
];

// ── Custom Recharts Tooltip ──────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '10px',
        p: 1.5,
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        minWidth: 160,
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.75 }}>
        {label}
      </Typography>
      {payload.map((entry, i) => (
        <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 0.25 }}>
          <Typography variant="caption" sx={{ color: entry.color, fontWeight: 600 }}>
            {entry.name}
          </Typography>
          <Typography variant="caption" fontWeight={700}>
            ${Number(entry.value).toLocaleString()}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export const ExecutiveDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
  };

  return (
    <Box className="page-enter">
      <PageHeader
        title="Executive Control Tower"
        subtitle="Real-time end-to-end supply chain visibility, AI forecasting & operational KPIs"
        icon={DashboardRoundedIcon}
        breadcrumbs={['Dashboard']}
        actionButton={
          <>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshRoundedIcon />}
              onClick={handleRefresh}
            >
              Sync Data
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<AutoAwesomeRoundedIcon />}
              onClick={() => navigate('/forecast')}
              color="secondary"
            >
              Run AI Forecast
            </Button>
          </>
        }
      />

      {/* ── Row 1: Primary KPIs ─────────────────────────── */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        {[
          { title: 'TOTAL REVENUE (YTD)',   value: '$1,406,000', change: '+14.2%', isPositive: true,  subtitle: 'vs prior period',      icon: AttachMoneyRoundedIcon,   color: 'primary' },
          { title: 'INVENTORY VALUE',       value: '$892,450',   change: '-3.5%',  isPositive: true,  subtitle: 'optimized safety stock',icon: Inventory2RoundedIcon,   color: 'secondary' },
          { title: 'ORDER FILL RATE',       value: '98.5%',      change: '+1.2%',  isPositive: true,  subtitle: 'target: 95.0%',         icon: VerifiedRoundedIcon,     color: 'success',  progress: 98.5 },
          { title: 'OTIF FULFILLMENT',      value: '96.4%',      change: '+0.8%',  isPositive: true,  subtitle: 'supplier performance',  icon: LocalShippingRoundedIcon, color: 'info',    progress: 96.4 },
        ].map((kpi, i) => (
          <Grid item xs={12} sm={6} xl={3} key={i}>
            <KPICard {...kpi} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* ── Row 2: Secondary KPIs ───────────────────────── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          { title: 'FORECAST ACCURACY (MAPE)', value: '92.8%',    change: '+4.1%', isPositive: true,  subtitle: 'Ensemble ML model',    icon: AutoAwesomeRoundedIcon, color: 'secondary', progress: 92.8 },
          { title: 'WAREHOUSE UTILIZATION',    value: '84.2%',    change: '+2.0%', isPositive: true,  subtitle: 'avg. across 4 nodes',  icon: SpeedRoundedIcon,       color: 'warning',   progress: 84.2 },
          { title: 'LOW STOCK ALERTS',         value: '14 Items', change: '+2',    isPositive: false, subtitle: 'immediate action',     icon: WarningAmberRoundedIcon,color: 'error' },
          { title: 'ON-TIME DELIVERY RATE',    value: '97.1%',    change: '+1.5%', isPositive: true,  subtitle: 'customer SLA',         icon: VerifiedRoundedIcon,    color: 'success',   progress: 97.1 },
        ].map((kpi, i) => (
          <Grid item xs={12} sm={6} xl={3} key={i}>
            <KPICard {...kpi} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* ── Row 3: Charts ──────────────────────────────────  */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Revenue vs Forecast Trend */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h6">Revenue & AI Demand Forecast Trend</Typography>
                  <Typography variant="caption" color="text.secondary">Monthly aggregated — actual vs. predicted</Typography>
                </Box>
                <Chip label="Jan – Jul 2024" size="small" variant="outlined" />
              </Box>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={REVENUE_DATA} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
                    </linearGradient>
                    <linearGradient id="gForecast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#14b8a6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={(v) => `$${v / 1000}k`} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <ReTooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ paddingTop: 16 }} />
                  <Area type="monotone" dataKey="revenue"  name="Actual Revenue"    stroke="#6366f1" strokeWidth={2.5} fill="url(#gRevenue)"  dot={false} />
                  <Area type="monotone" dataKey="forecast" name="AI Forecast Demand" stroke="#14b8a6" strokeWidth={2}   fill="url(#gForecast)" dot={false} strokeDasharray="5 3" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Warehouse Capacity */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 0.5 }}>Warehouse Utilization</Typography>
              <Typography variant="caption" color="text.secondary">Capacity usage across 4 facilities</Typography>

              <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {WAREHOUSES.map((wh) => (
                  <Box key={wh.name}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                      <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: '75%' }}>{wh.name}</Typography>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{ color: wh.pct > 90 ? 'error.main' : wh.pct > 80 ? 'warning.main' : 'success.main' }}
                      >
                        {wh.pct}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={wh.pct}
                      sx={{
                        height: 7,
                        borderRadius: 99,
                        bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
                        '& .MuiLinearProgress-bar': { bgcolor: wh.color, borderRadius: 99 },
                      }}
                    />
                  </Box>
                ))}
              </Box>

              <Button
                fullWidth
                variant="outlined"
                size="small"
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{ mt: 3 }}
                onClick={() => navigate('/warehouses')}
              >
                View All Facilities
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Row 4: Monthly Sales Bar + Activity Feed ────── */}
      <Grid container spacing={3}>
        {/* Monthly Sales Volume */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 0.5 }}>Monthly Sales Volume</Typography>
              <Typography variant="caption" color="text.secondary">Units sold by month, 2024</Typography>
              <ResponsiveContainer width="100%" height={200} style={{ marginTop: 20 }}>
                <BarChart data={MONTHLY_SALES} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <ReTooltip cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
                  <Bar dataKey="sales" name="Units Sold" fill="#6366f1" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6">Recent Supply Chain Events</Typography>
                  <Typography variant="caption" color="text.secondary">Live activity feed — last 24 hrs</Typography>
                </Box>
                <Button size="small" endIcon={<ArrowForwardRoundedIcon />} onClick={() => navigate('/notifications')}>
                  View All
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {RECENT_EVENTS.map((event, idx) => (
                  <React.Fragment key={event.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5, gap: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            flexShrink: 0,
                            bgcolor: idx === 0 ? 'success.main' : idx === 1 ? 'primary.main' : idx === 2 ? 'error.main' : 'warning.main',
                          }}
                        />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={600} noWrap>{event.title}</Typography>
                          <Typography variant="caption" color="text.secondary">{event.time}</Typography>
                        </Box>
                      </Box>
                      <StatusBadge status={event.status} />
                    </Box>
                    {idx < RECENT_EVENTS.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
