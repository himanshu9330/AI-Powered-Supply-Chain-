import React, { useState } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Grid,
} from '@mui/material';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';

import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { KPICard } from '../../components/ui/KPICard';

const SAMPLE_INVENTORY = [
  { id: 'inv_1', sku: 'SKU-ELEC-001', product_name: 'iPhone 15 Pro 256GB',             warehouse: 'Central Hub NY',      on_hand: 450, allocated: 50, available: 400, status: 'IN_STOCK'     },
  { id: 'inv_2', sku: 'SKU-ELEC-002', product_name: 'MacBook Pro M3 16"',              warehouse: 'West Coast LA',        on_hand: 12,  allocated: 4,  available: 8,   status: 'LOW_STOCK'    },
  { id: 'inv_3', sku: 'SKU-FURN-001', product_name: 'Ergonomic Executive Chair',       warehouse: 'Midwest Hub',          on_hand: 180, allocated: 20, available: 160, status: 'IN_STOCK'     },
  { id: 'inv_4', sku: 'SKU-APPR-001', product_name: 'Performance Fleece Jacket',       warehouse: 'Southern Fulfillment', on_hand: 850, allocated: 10, available: 840, status: 'OVERSTOCK'    },
  { id: 'inv_5', sku: 'SKU-ELEC-005', product_name: 'Wireless Noise-Cancel Headphones',warehouse: 'Central Hub NY',      on_hand: 0,   allocated: 0,  available: 0,   status: 'OUT_OF_STOCK' },
];

const INIT_ADJ = { sku: SAMPLE_INVENTORY[0].sku, type: 'ADD', quantity: 50, reason: '' };

export const InventoryList = () => {
  const [inventory, setInventory] = useState(SAMPLE_INVENTORY);
  const [openModal, setOpenModal] = useState(false);
  const [adj, setAdj] = useState(INIT_ADJ);

  const handleAdjust = () => {
    setInventory(inventory.map((item) => {
      if (item.sku !== adj.sku) return item;
      const qty = Number(adj.quantity);
      const newOnHand = adj.type === 'ADD' ? item.on_hand + qty : Math.max(0, item.on_hand - qty);
      const newAvailable = Math.max(0, newOnHand - item.allocated);
      const status = newOnHand === 0 ? 'OUT_OF_STOCK' : newOnHand < 20 ? 'LOW_STOCK' : 'IN_STOCK';
      return { ...item, on_hand: newOnHand, available: newAvailable, status };
    }));
    setOpenModal(false);
  };

  const totalUnits = inventory.reduce((acc, i) => acc + i.on_hand, 0);
  const allocated  = inventory.reduce((acc, i) => acc + i.allocated, 0);
  const available  = inventory.reduce((acc, i) => acc + i.available, 0);

  const columns = [
    {
      id: 'sku', label: 'SKU', minWidth: 130,
      format: (v) => <Box component="span" sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'primary.main', fontSize: '0.8rem' }}>{v}</Box>,
    },
    { id: 'product_name', label: 'Product Name', minWidth: 220 },
    { id: 'warehouse',    label: 'Warehouse',    minWidth: 160 },
    { id: 'on_hand',      label: 'On Hand',      minWidth: 100, align: 'right' },
    { id: 'allocated',    label: 'Allocated',    minWidth: 100, align: 'right' },
    {
      id: 'available', label: 'Available', minWidth: 110, align: 'right',
      format: (v) => <Box component="span" sx={{ fontWeight: 700, color: v === 0 ? 'error.main' : v < 20 ? 'warning.main' : 'success.main' }}>{v}</Box>,
    },
    { id: 'status', label: 'Health',  minWidth: 130, sortable: false, format: (v) => <StatusBadge status={v} /> },
  ];

  return (
    <Box className="page-enter">
      <PageHeader
        title="Inventory Stock Management"
        subtitle="Real-time multi-warehouse stock levels, allocation tracking and adjustment controls"
        icon={Inventory2RoundedIcon}
        breadcrumbs={['Inventory']}
        actionButton={
          <Button variant="contained" size="small" startIcon={<TuneRoundedIcon />} onClick={() => setOpenModal(true)}>
            Adjust Stock
          </Button>
        }
      />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <KPICard title="TOTAL ON-HAND UNITS" value={`${totalUnits.toLocaleString()}`} subtitle="across all warehouses" color="primary" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <KPICard title="ALLOCATED TO ORDERS" value={`${allocated}`} subtitle="fulfillment reserved" color="secondary" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <KPICard title="AVAILABLE TO PROMISE" value={`${available.toLocaleString()}`} subtitle="ready to ship" color="success" />
        </Grid>
      </Grid>

      <DataTable
        columns={columns}
        data={inventory}
        searchPlaceholder="Filter by warehouse, SKU or product…"
        onRefresh={() => {}}
      />

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Stock Level Adjustment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <TextField select fullWidth label="Select SKU" value={adj.sku} onChange={(e) => setAdj({ ...adj, sku: e.target.value })}>
                {inventory.map((i) => <MenuItem key={i.sku} value={i.sku}>{i.sku} — {i.product_name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Adjustment Type" value={adj.type} onChange={(e) => setAdj({ ...adj, type: e.target.value })}>
                <MenuItem value="ADD">Add Stock (+)</MenuItem>
                <MenuItem value="REMOVE">Deduct Stock (−)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Quantity" type="number" value={adj.quantity} onChange={(e) => setAdj({ ...adj, quantity: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Reason / Notes" multiline rows={2} value={adj.reason} onChange={(e) => setAdj({ ...adj, reason: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdjust}>Confirm Adjustment</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
