import React, { useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';

const SAMPLE_TRANSFERS = [
  { id: 'tr_1', transfer_number: 'TR-101', from_warehouse: 'Central Hub NY', to_warehouse: 'West Coast LA', product_sku: 'SKU-ELEC-001', quantity: 100, status: 'IN_TRANSIT', transfer_date: '2024-08-04' },
  { id: 'tr_2', transfer_number: 'TR-102', from_warehouse: 'Midwest Distribution', to_warehouse: 'Southern Fulfillment', product_sku: 'SKU-FURN-001', quantity: 30, status: 'COMPLETED', transfer_date: '2024-08-02' },
];

export const TransferList = () => {
  const [transfers, setTransfers] = useState(SAMPLE_TRANSFERS);
  const [openModal, setOpenModal] = useState(false);
  const [newTransfer, setNewTransfer] = useState({ from_warehouse: 'Central Hub NY', to_warehouse: 'West Coast LA', product_sku: 'SKU-ELEC-001', quantity: 50 });

  const handleCreate = () => {
    setTransfers([{ id: `tr_${Date.now()}`, transfer_number: `TR-10${transfers.length + 1}`, ...newTransfer, status: 'IN_TRANSIT', transfer_date: new Date().toISOString().split('T')[0] }, ...transfers]);
    setOpenModal(false);
  };

  const columns = [
    { id: 'transfer_number', label: 'Transfer #', minWidth: 120, format: (v) => <strong>{v}</strong> },
    { id: 'from_warehouse', label: 'Source Warehouse', minWidth: 180 },
    { id: 'to_warehouse', label: 'Destination Warehouse', minWidth: 180 },
    { id: 'product_sku', label: 'SKU Code', minWidth: 140 },
    { id: 'quantity', label: 'Units Transferred', minWidth: 140 },
    { id: 'transfer_date', label: 'Date', minWidth: 110 },
    { id: 'status', label: 'Status', minWidth: 130, format: (v) => <StatusBadge status={v} /> },
  ];

  return (
    <Box>
      <PageHeader
        title="Inter-Warehouse Stock Transfers"
        subtitle="Balance stock across nodes with automated transfer recommendations and tracking"
        breadcrumbs={['Stock Transfers']}
        actionButton={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenModal(true)}>
            Initiate Transfer
          </Button>
        }
      />

      <DataTable columns={columns} data={transfers} searchPlaceholder="Search transfers..." />

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Initiate Stock Transfer</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField select label="Source Warehouse" fullWidth value={newTransfer.from_warehouse} onChange={(e) => setNewTransfer({ ...newTransfer, from_warehouse: e.target.value })}>
              <MenuItem value="Central Hub NY">Central Hub NY</MenuItem>
              <MenuItem value="Midwest Distribution">Midwest Distribution</MenuItem>
            </TextField>
            <TextField select label="Destination Warehouse" fullWidth value={newTransfer.to_warehouse} onChange={(e) => setNewTransfer({ ...newTransfer, to_warehouse: e.target.value })}>
              <MenuItem value="West Coast LA">West Coast LA</MenuItem>
              <MenuItem value="Southern Fulfillment">Southern Fulfillment</MenuItem>
            </TextField>
            <TextField label="SKU Code" fullWidth value={newTransfer.product_sku} onChange={(e) => setNewTransfer({ ...newTransfer, product_sku: e.target.value })} />
            <TextField label="Quantity to Transfer" type="number" fullWidth value={newTransfer.quantity} onChange={(e) => setNewTransfer({ ...newTransfer, quantity: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Start Transfer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
