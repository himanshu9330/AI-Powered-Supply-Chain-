import React from 'react';
import { Box, Card, Typography, Grid, Paper, Chip, Button, Divider } from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import CalculateIcon from '@mui/icons-material/Calculate';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { PageHeader } from '../../components/ui/PageHeader';
import { KPICard } from '../../components/ui/KPICard';

const EOQ_CALCULATIONS = [
  { sku: 'SKU-ELEC-001', name: 'iPhone 15 Pro 256GB', demand: '1,200 / yr', setup_cost: '$150', holding_cost: '$25/unit', eoq: 120, safety_stock: 45, reorder_point: 85, recommendation: 'Order 120 units when stock drops below 85' },
  { sku: 'SKU-ELEC-002', name: 'MacBook Pro M3 16"', demand: '450 / yr', setup_cost: '$250', holding_cost: '$80/unit', eoq: 53, safety_stock: 15, reorder_point: 32, recommendation: 'Order 53 units when stock drops below 32' },
  { sku: 'SKU-FURN-001', name: 'Ergonomic Chair', demand: '800 / yr', setup_cost: '$100', holding_cost: '$18/unit', eoq: 94, safety_stock: 30, reorder_point: 65, recommendation: 'Order 94 units when stock drops below 65' },
];

export const OptimizationDashboard = () => {
  return (
    <Box>
      <PageHeader
        title="Inventory Optimization & EOQ Solver"
        subtitle="Economic Order Quantity calculations, safety stock formula optimization and reorder trigger points"
        breadcrumbs={['EOQ & Optimization']}
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {EOQ_CALCULATIONS.map((item) => (
          <Grid item xs={12} key={item.sku}>
            <Card sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>{item.name}</Typography>
                  <Typography variant="caption" color="text.secondary">SKU: {item.sku}</Typography>
                </Box>
                <Chip label="EOQ Optimal" color="success" />
              </Box>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6} sm={2.4}>
                  <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'background.default' }}>
                    <Typography variant="caption" color="text.secondary">Annual Demand (D)</Typography>
                    <Typography variant="subtitle1" fontWeight={700}>{item.demand}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={2.4}>
                  <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'background.default' }}>
                    <Typography variant="caption" color="text.secondary">Order Setup (S)</Typography>
                    <Typography variant="subtitle1" fontWeight={700}>{item.setup_cost}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={2.4}>
                  <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'background.default' }}>
                    <Typography variant="caption" color="text.secondary">Holding Cost (H)</Typography>
                    <Typography variant="subtitle1" fontWeight={700}>{item.holding_cost}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={2.4}>
                  <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'primary.dark' }}>
                    <Typography variant="caption" color="primary.contrastText">Optimal EOQ</Typography>
                    <Typography variant="h6" fontWeight={800} color="primary.contrastText">{item.eoq} Units</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={2.4}>
                  <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'secondary.dark' }}>
                    <Typography variant="caption" color="secondary.contrastText">Reorder Point (ROP)</Typography>
                    <Typography variant="h6" fontWeight={800} color="secondary.contrastText">{item.reorder_point} Units</Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalculateIcon color="primary" fontSize="small" />
                <Typography variant="body2" fontWeight={600}>
                  Strategy: {item.recommendation}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
