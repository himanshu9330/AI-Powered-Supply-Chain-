import React, { useState, useMemo } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Paper, TextField, InputAdornment, Box, Typography,
  Skeleton, TableSortLabel, Tooltip, IconButton,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';

export const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  searchPlaceholder = 'Search records…',
  onRowClick,
  actions,
  onRefresh,
  emptyMessage = 'No records found',
  emptySubtitle = 'Try adjusting your search or filters',
  rowsPerPageDefault = 10,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageDefault);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');

  const handleSort = (colId) => {
    const isAsc = orderBy === colId && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(colId);
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lower = searchTerm.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some((val) => val && String(val).toLowerCase().includes(lower))
    );
  }, [data, searchTerm]);

  const sortedData = useMemo(() => {
    if (!orderBy) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[orderBy] ?? '';
      const bVal = b[orderBy] ?? '';
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, orderBy, order]);

  const displayedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper elevation={0} sx={{ borderRadius: '14px', overflow: 'hidden', border: (t) => `1px solid ${t.palette.divider}` }}>
      {/* ── Toolbar ──────────────────────────────────────── */}
      <Box
        sx={{
          px: 2.5,
          py: 1.75,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
          bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
        }}
      >
        <TextField
          size="small"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
          sx={{ minWidth: 260, maxWidth: 380 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {onRefresh && (
            <Tooltip title="Refresh data" arrow>
              <IconButton size="small" onClick={onRefresh}>
                <RefreshRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {actions}
        </Box>
      </Box>

      {/* ── Table ────────────────────────────────────────── */}
      <TableContainer sx={{ maxHeight: 560 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align || 'left'}
                  style={{ minWidth: col.minWidth }}
                  sortDirection={orderBy === col.id ? order : false}
                >
                  {col.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === col.id}
                      direction={orderBy === col.id ? order : 'asc'}
                      onClick={() => handleSort(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((col, j) => (
                    <TableCell key={j}>
                      <Skeleton variant="text" height={22} sx={{ borderRadius: '6px' }} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : displayedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ py: 8 }}>
                  <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                    <InboxRoundedIcon sx={{ fontSize: 48, mb: 1.5, opacity: 0.3 }} />
                    <Typography variant="subtitle2" gutterBottom>{emptyMessage}</Typography>
                    <Typography variant="caption">{emptySubtitle}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              displayedData.map((row, idx) => (
                <TableRow
                  key={row.id || idx}
                  hover
                  onClick={() => onRowClick?.(row)}
                  sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((col) => (
                    <TableCell key={col.id} align={col.align || 'left'}>
                      {col.format ? col.format(row[col.id], row) : (row[col.id] ?? '—')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Pagination ───────────────────────────────────── */}
      <Box sx={{ borderTop: (t) => `1px solid ${t.palette.divider}` }}>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          sx={{ '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.8125rem' } }}
        />
      </Box>
    </Paper>
  );
};
