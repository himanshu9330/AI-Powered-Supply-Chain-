import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { useNavigate } from 'react-router-dom';

export const PageHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  actionButton,
  icon: Icon,
}) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ mb: 3 }}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextRoundedIcon sx={{ fontSize: 14 }} />}
          sx={{ mb: 1 }}
        >
          <Link
            underline="hover"
            color="text.secondary"
            sx={{ cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500 }}
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </Link>
          {breadcrumbs.map((b, idx) => (
            <Typography
              key={idx}
              sx={{
                fontSize: '0.8125rem',
                fontWeight: idx === breadcrumbs.length - 1 ? 600 : 500,
                color: idx === breadcrumbs.length - 1 ? 'text.primary' : 'text.secondary',
              }}
            >
              {b}
            </Typography>
          ))}
        </Breadcrumbs>
      )}

      {/* Title Row */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
          {Icon && (
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(20,184,166,0.10))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid rgba(99,102,241,0.2)',
              }}
            >
              <Icon sx={{ color: 'primary.main', fontSize: 22 }} />
            </Box>
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.375, lineHeight: 1.5, maxWidth: 600 }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        {actionButton && (
          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0, flexWrap: 'wrap' }}>
            {actionButton}
          </Box>
        )}
      </Box>
    </Box>
  );
};
