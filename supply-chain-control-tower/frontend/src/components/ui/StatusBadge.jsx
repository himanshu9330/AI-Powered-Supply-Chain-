import React from 'react';
import { Chip } from '@mui/material';

const STATUS_MAP = {
  // Positive / Success
  in_stock:    { label: 'In Stock',    color: 'success' },
  completed:   { label: 'Completed',   color: 'success' },
  approved:    { label: 'Approved',    color: 'success' },
  received:    { label: 'Received',    color: 'success' },
  active:      { label: 'Active',      color: 'success' },
  optimal:     { label: 'Optimal',     color: 'success' },
  delivered:   { label: 'Delivered',   color: 'success' },
  online:      { label: 'Online',      color: 'success' },

  // Warning
  low_stock:       { label: 'Low Stock',   color: 'warning' },
  pending:         { label: 'Pending',     color: 'warning' },
  in_transit:      { label: 'In Transit',  color: 'warning' },
  reorder_needed:  { label: 'Reorder',     color: 'warning' },
  medium:          { label: 'Medium',      color: 'warning' },
  draft:           { label: 'Draft',       color: 'warning' },

  // Error / Critical
  out_of_stock:    { label: 'Out of Stock', color: 'error' },
  cancelled:       { label: 'Cancelled',    color: 'error' },
  rejected:        { label: 'Rejected',     color: 'error' },
  dead_stock:      { label: 'Dead Stock',   color: 'error' },
  high:            { label: 'High',         color: 'error' },
  delayed:         { label: 'Delayed',      color: 'error' },
  critical:        { label: 'Critical',     color: 'error' },
  offline:         { label: 'Offline',      color: 'error' },

  // Info
  overstock:       { label: 'Overstock',    color: 'info' },
  info:            { label: 'Info',         color: 'info' },
  forecast_ready:  { label: 'Forecast Ready', color: 'info' },
};

export const StatusBadge = ({ status }) => {
  if (!status) return null;
  const key = String(status).toLowerCase().replace(/\s+/g, '_');
  const cfg = STATUS_MAP[key] || {
    label: String(status).replace(/_/g, ' '),
    color: 'default',
  };

  return (
    <Chip
      label={cfg.label}
      color={cfg.color}
      size="small"
      variant="soft"
      sx={{ fontWeight: 700, letterSpacing: '0.2px', textTransform: 'capitalize' }}
    />
  );
};
