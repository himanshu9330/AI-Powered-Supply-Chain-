import React, { useState } from 'react';
import { Box, Card, Typography, Grid, Chip, Paper, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import InsightsIcon from '@mui/icons-material/Insights';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { PageHeader } from '../../components/ui/PageHeader';
import { KPICard } from '../../components/ui/KPICard';

const ABC_XYZ_DATA = [
  { sku: 'SKU-ELEC-001', name: 'iPhone 15 Pro', revenue: '$450,000', abc_class: 'A', xyz_class: 'X', category: 'High Revenue / Constant Demand' },
  { sku: 'SKU-ELEC-002', name: 'MacBook Pro M3', revenue: '$320,000', abc_class: 'A', xyz_class: 'Y', category: 'High Revenue / Variable Demand' },
  { sku: 'SKU-FURN-001', name: 'Ergonomic Chair', revenue: '$140,000', abc_class: 'B', xyz_class: 'X', category: 'Medium Revenue / Constant Demand' },
  { sku: 'SKU-APPR-001', name: 'Fleece Jacket', revenue: '$45,000', abc_class: 'C', xyz_class: 'Z', category: 'Low Revenue / Sporadic Demand' },
];

export const AnalyticsDashboard = () => {
  return (
    <Box>
      <PageHeader
        title="Supply Chain Analytics & ABC-XYZ Matrix"
        subtitle="Pareto inventory segmentation, turnover rates, dead stock identification and overstock metrics"
        breadcrumbs={['Supply Analytics']}
      />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <KPICard title="CLASS A ITEMS (80% REVENUE)" value="12 SKUs" change="High Value Priority" isPositive={true} color="primary" />
        </Grid>
        <Grid item xs={12} sm={3}>
          <KPICard title="INVENTORY TURNOVER RATIO" value="6.4x / year" change="+0.8x" isPositive={true} color="success" />
        </Grid>
        <Grid item xs={12} sm={3}>
          <KPICard title="DEAD STOCK VALUE" value="$24,500" change="3 Items (>90 days)" isPositive={false} color="error" />
        </Grid>
        <Grid item xs={12} sm={3}>
          <KPICard title="OVERSTOCK VALUE" value="$68,200" change="Excess Safety Stock" isPositive={false} color="warning" />
        </Grid>
      </Grid>

      <Card sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          ABC-XYZ Inventory Segmentation Analysis
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>SKU</TableCell>
              <TableCell>Product Name</TableCell>
              <TableCell>Annual Revenue Contribution</TableCell>
              <TableCell align="center">ABC Class (Value)</TableCell>
              <TableCell align="center">XYZ Class (Demand Volatility)</TableCell>
              <TableCell>Segment Strategy</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ABC_XYZ_DATA.map((row) => (
              <TableRow key={row.sku} hover>
                <TableCell><strong>{row.sku}</strong></TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.revenue}</TableCell>
                <TableCell align="center">
                  <Chip label={`Class ${row.abc_class}`} color={row.abc_class === 'A' ? 'primary' : row.abc_class === 'B' ? 'secondary' : 'default'} size="small" />
                </TableCell>
                <TableCell align="center">
                  <Chip label={`Class ${row.xyz_class}`} color={row.xyz_class === 'X' ? 'success' : row.xyz_class === 'Y' ? 'warning' : 'error'} size="small" />
                </TableCell>
                <TableCell>{row.category}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
};
