import React, { useState } from 'react';
import {
  Box, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, IconButton, Tooltip, Grid, Card, CardContent,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';

import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { KPICard } from '../../components/ui/KPICard';
import { useNavigate } from 'react-router-dom';

const SAMPLE_PRODUCTS = [
  { id: 'prd_01', sku: 'SKU-ELEC-001', name: 'iPhone 15 Pro 256GB',             category_name: 'Electronics', unit_price: 999.99,  cost_price: 750.00,  reorder_point: 40,  status: 'IN_STOCK'     },
  { id: 'prd_02', sku: 'SKU-ELEC-002', name: 'MacBook Pro M3 16"',              category_name: 'Electronics', unit_price: 2499.00, cost_price: 1950.00, reorder_point: 20,  status: 'LOW_STOCK'    },
  { id: 'prd_03', sku: 'SKU-FURN-001', name: 'Ergonomic Executive Chair',       category_name: 'Furniture',   unit_price: 349.50,  cost_price: 180.00,  reorder_point: 30,  status: 'IN_STOCK'     },
  { id: 'prd_04', sku: 'SKU-APPR-001', name: 'Performance Fleece Jacket',       category_name: 'Apparel',     unit_price: 89.99,   cost_price: 35.00,   reorder_point: 100, status: 'OVERSTOCK'    },
  { id: 'prd_05', sku: 'SKU-ELEC-005', name: 'Wireless Noise-Cancel Headphones',category_name: 'Electronics', unit_price: 299.99,  cost_price: 140.00,  reorder_point: 50,  status: 'OUT_OF_STOCK' },
];

const INIT_FORM = { sku: '', name: '', category_name: 'Electronics', unit_price: '', cost_price: '', reorder_point: 25 };

export const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState(SAMPLE_PRODUCTS);
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState(INIT_FORM);

  const handleCreate = () => {
    if (!form.name || !form.sku) return;
    setProducts([{ ...form, id: `prd_${Date.now()}`, status: 'IN_STOCK' }, ...products]);
    setForm(INIT_FORM);
    setOpenModal(false);
  };

  const inStock    = products.filter((p) => p.status === 'IN_STOCK').length;
  const lowStock   = products.filter((p) => p.status === 'LOW_STOCK').length;
  const outOfStock = products.filter((p) => p.status === 'OUT_OF_STOCK').length;

  const columns = [
    {
      id: 'sku', label: 'SKU Code', minWidth: 130,
      format: (v) => (
        <Typography variant="caption" sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'primary.main' }}>{v}</Typography>
      ),
    },
    { id: 'name',          label: 'Product Name',    minWidth: 220 },
    { id: 'category_name', label: 'Category',        minWidth: 120 },
    {
      id: 'unit_price', label: 'Unit Price', minWidth: 110, align: 'right',
      format: (v) => `$${Number(v).toFixed(2)}`,
    },
    {
      id: 'cost_price', label: 'Cost Price', minWidth: 110, align: 'right',
      format: (v) => `$${Number(v).toFixed(2)}`,
    },
    { id: 'reorder_point', label: 'Reorder Point', minWidth: 120, align: 'right' },
    {
      id: 'status', label: 'Status', minWidth: 130,
      format: (v) => <StatusBadge status={v} />,
      sortable: false,
    },
    {
      id: 'actions', label: '', minWidth: 100,
      sortable: false,
      format: (_, row) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Run AI Forecast" arrow>
            <IconButton size="small" color="secondary" onClick={(e) => { e.stopPropagation(); navigate(`/forecast?productId=${row.id}`); }}>
              <AutoAwesomeRoundedIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="View Details" arrow>
            <IconButton size="small" color="primary" onClick={(e) => e.stopPropagation()}>
              <VisibilityRoundedIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box className="page-enter">
      <PageHeader
        title="Products Catalog"
        subtitle="Manage product specifications, pricing, reorder thresholds and SKU stock health"
        icon={Inventory2RoundedIcon}
        breadcrumbs={['Products']}
        actionButton={
          <Button variant="contained" size="small" startIcon={<AddRoundedIcon />} onClick={() => setOpenModal(true)}>
            Add Product
          </Button>
        }
      />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <KPICard title="TOTAL SKUs"       value={`${products.length} Products`} subtitle="in catalog"  color="primary"   />
        </Grid>
        <Grid item xs={12} sm={4}>
          <KPICard title="IN STOCK SKUs"    value={`${inStock} Items`}            subtitle="available"   color="success"   />
        </Grid>
        <Grid item xs={12} sm={4}>
          <KPICard title="ATTENTION NEEDED" value={`${lowStock + outOfStock} Items`} subtitle="low / out-of-stock" color="error" />
        </Grid>
      </Grid>

      <DataTable
        columns={columns}
        data={products}
        searchPlaceholder="Search by product name, SKU or category…"
        onRefresh={() => {}}
      />

      {/* ── Create Product Modal ──────────────────────────── */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Product to Catalog</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="SKU Code *" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Category" value={form.category_name} onChange={(e) => setForm({ ...form, category_name: e.target.value })}>
                {['Electronics', 'Furniture', 'Apparel', 'Industrial', 'Food & Beverage'].map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Product Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Unit Price ($)" type="number" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Cost Price ($)" type="number" value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Reorder Point" type="number" value={form.reorder_point} onChange={(e) => setForm({ ...form, reorder_point: Number(e.target.value) })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Save Product</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
