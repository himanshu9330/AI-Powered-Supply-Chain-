import React from 'react';
import { Box, Rating, Typography } from '@mui/material';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';

import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable } from '../../components/ui/DataTable';

const SUPPLIERS = [
  { id: 's1', code: 'SUP-001', name: 'Global Tech Components Corp',   contact_email: 'orders@globaltech.com',   lead_time_days: 5,  otif_score: 98.4, rating: 4.8, status: 'ACTIVE' },
  { id: 's2', code: 'SUP-002', name: 'Apex Furniture Manufacturing',  contact_email: 'supply@apexfurniture.com', lead_time_days: 12, otif_score: 92.1, rating: 4.3, status: 'ACTIVE' },
  { id: 's3', code: 'SUP-003', name: 'Pacific Textiles & Apparel',    contact_email: 'contact@pacifictextiles.com', lead_time_days: 8,  otif_score: 95.8, rating: 4.6, status: 'ACTIVE' },
  { id: 's4', code: 'SUP-004', name: 'MicroChip Semiconductor Ltd',   contact_email: 'sales@microchip.io',       lead_time_days: 21, otif_score: 87.5, rating: 3.9, status: 'ACTIVE' },
];

export const SupplierList = () => {
  const columns = [
    {
      id: 'code', label: 'Code', minWidth: 110,
      format: (v) => <Typography variant="caption" sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'primary.main' }}>{v}</Typography>,
    },
    { id: 'name',          label: 'Supplier Name',   minWidth: 240 },
    { id: 'contact_email', label: 'Contact Email',   minWidth: 220 },
    { id: 'lead_time_days',label: 'Avg Lead Time',   minWidth: 120, align: 'right', format: (v) => `${v} days` },
    {
      id: 'otif_score', label: 'OTIF Score', minWidth: 120, align: 'right',
      format: (v) => (
        <Box
          component="span"
          sx={{
            fontWeight: 700,
            color: v >= 95 ? 'success.main' : v >= 90 ? 'warning.main' : 'error.main',
          }}
        >
          {v}%
        </Box>
      ),
    },
    {
      id: 'rating', label: 'Vendor Rating', minWidth: 160, sortable: false,
      format: (v) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Rating value={Number(v)} precision={0.1} readOnly size="small" />
          <Typography variant="caption" fontWeight={700}>{v}</Typography>
        </Box>
      ),
    },
  ];

  return (
    <Box className="page-enter">
      <PageHeader
        title="Supplier Directory & Scorecards"
        subtitle="Vendor reliability metrics, lead time tracking, OTIF performance and rating benchmarks"
        icon={LocalShippingRoundedIcon}
        breadcrumbs={['Suppliers']}
      />
      <DataTable columns={columns} data={SUPPLIERS} searchPlaceholder="Search suppliers by name, code or email…" />
    </Box>
  );
};
