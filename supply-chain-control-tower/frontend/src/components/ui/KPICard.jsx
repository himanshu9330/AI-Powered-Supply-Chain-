import React from 'react';
import { Card, CardContent, Typography, Box, Avatar, LinearProgress, Skeleton } from '@mui/material';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import TrendingFlatRoundedIcon from '@mui/icons-material/TrendingFlatRounded';
import { alpha } from '@mui/material/styles';

export const KPICard = ({
  title,
  value,
  subtitle,
  change,
  isPositive,
  icon: Icon,
  color = 'primary',
  progress,
  loading = false,
}) => {
  const TrendIcon = change === undefined ? null
    : isPositive === true  ? TrendingUpRoundedIcon
    : isPositive === false ? TrendingDownRoundedIcon
    : TrendingFlatRoundedIcon;

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Skeleton variant="text" width={120} height={18} />
            <Skeleton variant="rounded" width={42} height={42} />
          </Box>
          <Skeleton variant="text" width={100} height={40} />
          <Skeleton variant="text" width={80} height={18} sx={{ mt: 0.5 }} />
          {progress !== undefined && <Skeleton variant="rounded" height={6} sx={{ mt: 2 }} />}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: (t) => `linear-gradient(90deg, ${t.palette[color]?.main || t.palette.primary.main}, ${t.palette[color]?.light || t.palette.primary.light})`,
          borderRadius: '14px 14px 0 0',
        },
      }}
    >
      <CardContent>
        {/* Header Row */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Typography
            variant="overline"
            sx={{ color: 'text.secondary', lineHeight: 1.3, maxWidth: 'calc(100% - 56px)' }}
          >
            {title}
          </Typography>
          {Icon && (
            <Avatar
              sx={{
                bgcolor: (t) => alpha(t.palette[color]?.main || t.palette.primary.main, 0.12),
                color: `${color}.main`,
                width: 42,
                height: 42,
                borderRadius: '12px',
                flexShrink: 0,
              }}
            >
              <Icon sx={{ fontSize: 20 }} />
            </Avatar>
          )}
        </Box>

        {/* Value */}
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, lineHeight: 1, mb: 0.75, letterSpacing: '-0.5px' }}
        >
          {value}
        </Typography>

        {/* Trend + Subtitle */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
          {TrendIcon && change && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.25,
                px: 0.75,
                py: 0.25,
                borderRadius: '6px',
                bgcolor: (t) => alpha(
                  isPositive ? t.palette.success.main : t.palette.error.main,
                  0.1
                ),
                color: isPositive ? 'success.main' : 'error.main',
              }}
            >
              <TrendIcon sx={{ fontSize: 14 }} />
              <Typography variant="caption" sx={{ fontWeight: 700, lineHeight: 1 }}>
                {change}
              </Typography>
            </Box>
          )}
          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Progress Bar */}
        {progress !== undefined && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Target Progress
              </Typography>
              <Typography variant="caption" fontWeight={700} color={`${color}.main`}>
                {progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(progress, 100)}
              color={color}
              sx={{ height: 5, borderRadius: 99 }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
