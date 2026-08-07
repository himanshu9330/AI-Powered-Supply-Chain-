import React, { useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';

const SAMPLE_POS = [
  { id: 'po_101', po_number: 'PO-2024-001', supplier_name: 'Global Tech Components Corp', warehouse: 'Central Hub NY', total_amount: 45000.00, status: 'RECEIVED', created_at: '2024-08-01' },
  { id: 'po_102', po_number: 'PO-2024-002', supplier_name: 'Apex Furniture Manufacturing', warehouse: 'West Coast LA', total_amount: 18400.00, status: 'IN_TRANSIT', created_at: '2024-08-03' },
  { id: 'po_103', po_number: 'PO-2024-003', supplier_name: 'Pacific Textiles & Apparel', warehouse: 'Midwest Distribution', total_amount: 8900.00, status: 'PENDING', created_at: '2024-08-05' },
];

export const PurchaseOrderList = () => {
  const [orders, setOrders] = useState(SAMPLE_POS);
  const [openModal, setOpenModal] = useState(false);
  const [newPo, setNewPo] = useState({ supplier_name: 'Global Tech Components Corp', warehouse: 'Central Hub NY', total_amount: 12500 });

  const handleCreate = () => {
    setOrders([{ id: `po_${Date.now()}`, po_number: `PO-2024-00${orders.length + 1}`, ...newPo, status: 'PENDING', created_at: new Date().toISOString().split('T')[0] }, ...orders]);
    setOpenModal(false);
  };

  const columns = [
    { id: 'po_number', label: 'PO Number', minWidth: 130, format: (v) => <strong>{v}</strong> },
    { id: 'supplier_name', label: 'Supplier', minWidth: 220 },
    { id: 'warehouse', label: 'Destination Warehouse', minWidth: 160 },
    { id: 'total_amount', label: 'Total Value', minWidth: 120, format: (v) => `$${Number(v).toLocaleString()}` },
    { id: 'created_at', label: 'Order Date', minWidth: 120 },
    { id: 'status', label: 'PO Status', minWidth: 130, format: (v) => <StatusBadge status={v} /> },
  ];

  return (
    <Box>
      <PageHeader
        title="Purchase Orders"
        subtitle="Manage supplier replenishment orders, tracking delivery timelines and receipts"
        breadcrumbs={['Purchase Orders']}
        actionButton={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenModal(true)}>
            Create Purchase Order
          </Button>
        }
      />

      <DataTable columns={columns} data={orders} searchPlaceholder="Search POs..." />

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>New Purchase Order</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField select label="Supplier" fullWidth value={newPo.supplier_name} onChange={(e) => setNewPo({ ...newPo, supplier_name: e.target.value })}>
              <MenuItem value="Global Tech Components Corp">Global Tech Components Corp</MenuItem>
              <MenuItem value="Apex Furniture Manufacturing">Apex Furniture Manufacturing</MenuItem>
              <MenuItem value="Pacific Textiles & Apparel">Pacific Textiles & Apparel</MenuItem>
            </TextField>
            <TextField select label="Destination Warehouse" fullWidth value={newPo.warehouse} onChange={(e) => setNewPo({ ...newPo, warehouse: e.target.value })}>
              <MenuItem value="Central Hub NY">Central Hub NY</MenuItem>
              <MenuItem value="West Coast LA">West Coast LA</MenuItem>
              <MenuItem value="Midwest Distribution">Midwest Distribution</MenuItem>
            </TextField>
            <TextField label="Estimated Total Value ($)" type="number" fullWidth value={newPo.total_amount} onChange={(e) => setNewPo({ ...newPo, total_amount: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Submit PO</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
