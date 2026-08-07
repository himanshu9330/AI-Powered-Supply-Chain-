import React, { useState } from 'react';
import { Box, Card, Typography, List, ListItem, ListItemIcon, ListItemText, Button, Chip, Divider } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';

const NOTIFICATIONS = [
  { id: '1', title: 'Low Stock Alert: Ergonomic Executive Chair', message: 'Current stock (5 units) is below reorder point (30 units). Recommended PO quantity: 94 units.', type: 'LOW_STOCK', priority: 'HIGH', time: '10 mins ago', read: false },
  { id: '2', title: 'AI Ensemble Forecast Completed', message: 'Demand predictions generated for 30-day horizon across 5 core SKUs with 92.8% confidence accuracy.', type: 'AI_FORECAST', priority: 'MEDIUM', time: '45 mins ago', read: false },
  { id: '3', title: 'Purchase Order PO-2024-001 Received', message: 'Supplier Global Tech Components delivered 450 units to Central Hub NY.', type: 'PO_RECEIVED', priority: 'LOW', time: '2 hours ago', read: true },
  { id: '4', title: 'Supplier Lead Time Delay Warning', message: 'MicroChip Semiconductor reported +4 days lead time delay on active shipments.', type: 'SUPPLIER_DELAY', priority: 'HIGH', time: '5 hours ago', read: true },
];

export const NotificationsCenter = () => {
  const [list, setList] = useState(NOTIFICATIONS);

  const markAllRead = () => {
    setList(list.map(n => ({ ...n, read: true })));
  };

  return (
    <Box>
      <PageHeader
        title="Notifications Center"
        subtitle="Real-time automated alerts for inventory thresholds, AI model completion and supply delays"
        breadcrumbs={['Notifications']}
        actionButton={
          <Button variant="outlined" startIcon={<CheckCircleIcon />} onClick={markAllRead}>
            Mark All as Read
          </Button>
        }
      />

      <Card sx={{ p: 1 }}>
        <List disablePadding>
          {list.map((item, idx) => (
            <React.Fragment key={item.id}>
              <ListItem
                sx={{
                  py: 2,
                  px: 2.5,
                  bgcolor: item.read ? 'transparent' : 'action.hover',
                  borderRadius: 2,
                }}
              >
                <ListItemIcon>
                  {item.type === 'LOW_STOCK' && <WarningAmberIcon color="error" />}
                  {item.type === 'AI_FORECAST' && <AutoAwesomeIcon color="secondary" />}
                  {item.type === 'PO_RECEIVED' && <CheckCircleIcon color="success" />}
                  {item.type === 'SUPPLIER_DELAY' && <LocalShippingIcon color="warning" />}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                      <Typography variant="subtitle1" fontWeight={700}>{item.title}</Typography>
                      <Chip
                        label={item.priority}
                        size="small"
                        color={item.priority === 'HIGH' ? 'error' : item.priority === 'MEDIUM' ? 'warning' : 'info'}
                        sx={{ height: 18, fontSize: '0.65rem' }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">{item.message}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>{item.time}</Typography>
                    </Box>
                  }
                />
              </ListItem>
              {idx < list.length - 1 && <Divider sx={{ my: 0.5 }} />}
            </React.Fragment>
          ))}
        </List>
      </Card>
    </Box>
  );
};
