import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Grid, LinearProgress,
  Avatar, Chip,
} from '@mui/material';
import WarehouseRoundedIcon from '@mui/icons-material/WarehouseRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';

const WAREHOUSES = [
  { id: 'wh_1', code: 'WH-NY-01', name: 'Central Hub — New York',        location: 'New York, NY',    capacity: 10000, occupied: 8800, manager: 'David Miller',  status: 'ACTIVE' },
  { id: 'wh_2', code: 'WH-LA-02', name: 'West Coast Distribution',       location: 'Los Angeles, CA', capacity: 8000,  occupied: 5920, manager: 'Sarah Jenkins', status: 'ACTIVE' },
  { id: 'wh_3', code: 'WH-CHI-03',name: 'Midwest Logistics Hub',         location: 'Chicago, IL',     capacity: 12000, occupied: 11040,manager: 'Robert Vance',  status: 'ACTIVE' },
  { id: 'wh_4', code: 'WH-MIA-04',name: 'Southern Fulfillment Facility', location: 'Miami, FL',       capacity: 6000,  occupied: 3900, manager: 'Elena Rostova', status: 'ACTIVE' },
];

const CAPACITY_COLOR = (pct) =>
  pct >= 90 ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#10b981';

export const WarehouseList = () => (
  <Box className="page-enter">
    <PageHeader
      title="Warehouse Facilities"
      subtitle="Network facility monitoring, capacity metrics and fulfillment throughput"
      icon={WarehouseRoundedIcon}
      breadcrumbs={['Warehouses']}
    />

    <Grid container spacing={3}>
      {WAREHOUSES.map((wh) => {
        const pct = Math.round((wh.occupied / wh.capacity) * 100);
        return (
          <Grid item xs={12} md={6} key={wh.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 46,
                        height: 46,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #6366f1, #14b8a6)',
                      }}
                    >
                      <WarehouseRoundedIcon sx={{ fontSize: 22 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>{wh.name}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <LocationOnRoundedIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">{wh.location} · {wh.code}</Typography>
                      </Box>
                    </Box>
                  </Box>
                  <StatusBadge status={wh.status} />
                </Box>

                {/* Capacity Meter */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '10px',
                    bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                    border: '1px solid',
                    borderColor: 'divider',
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>Capacity Utilization</Typography>
                    <Typography variant="body2" fontWeight={700} sx={{ color: CAPACITY_COLOR(pct) }}>
                      {wh.occupied.toLocaleString()} / {wh.capacity.toLocaleString()} Units ({pct}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={pct}
                    sx={{
                      height: 8,
                      borderRadius: 99,
                      bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
                      '& .MuiLinearProgress-bar': { bgcolor: CAPACITY_COLOR(pct), borderRadius: 99 },
                    }}
                  />
                </Box>

                {/* Footer */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <PersonRoundedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      Manager: <strong>{wh.manager}</strong>
                    </Typography>
                  </Box>
                  <Button size="small" variant="outlined" endIcon={<ArrowForwardRoundedIcon />}>
                    Manage
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  </Box>
);
