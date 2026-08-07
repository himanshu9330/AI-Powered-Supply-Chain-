import React from 'react';
import { Box, Card, Typography, Grid } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';

const SAMPLE_SALES = [
  { id: 'so_1', order_number: 'SO-9901', customer: 'Acme Retail Group', region: 'North America', total_amount: 14500.00, items_count: 12, status: 'DELIVERED', order_date: '2024-08-06' },
  { id: 'so_2', order_number: 'SO-9902', customer: 'TechCorp Distributors', region: 'Europe', total_amount: 28900.00, items_count: 24, status: 'IN_TRANSIT', order_date: '2024-08-06' },
  { id: 'so_3', order_number: 'SO-9903', customer: 'Pacific Electronics Ltd', region: 'Asia Pacific', total_amount: 8750.00, items_count: 5, status: 'DELIVERED', order_date: '2024-08-05' },
];

const REGIONAL_REVENUE = [
  { region: 'North America', sales: 680000 },
  { region: 'Europe', sales: 420000 },
  { region: 'Asia Pacific', sales: 310000 },
  { region: 'Latin America', sales: 140000 },
];

export const SalesList = () => {
  const columns = [
    { id: 'order_number', label: 'Sales Order #', minWidth: 130, format: (v) => <strong>{v}</strong> },
    { id: 'customer', label: 'Customer', minWidth: 200 },
    { id: 'region', label: 'Region', minWidth: 140 },
    { id: 'total_amount', label: 'Total Value', minWidth: 120, format: (v) => `$${Number(v).toLocaleString()}` },
    { id: 'order_date', label: 'Date', minWidth: 110 },
    { id: 'status', label: 'Delivery Status', minWidth: 130, format: (v) => <StatusBadge status={v} /> },
  ];

  return (
    <Box>
      <PageHeader
        title="Sales Orders & Demand Trends"
        subtitle="Customer order history, regional sales distribution and revenue analytics"
        breadcrumbs={['Sales']}
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Card sx={{ p: 2.5 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Regional Revenue Performance ($)</Typography>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={REGIONAL_REVENUE}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="region" />
                <YAxis tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="sales" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>

      <DataTable columns={columns} data={SAMPLE_SALES} searchPlaceholder="Search sales orders..." />
    </Box>
  );
};
