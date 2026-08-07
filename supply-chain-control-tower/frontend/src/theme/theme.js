import { createTheme, alpha } from '@mui/material/styles';

// ── Design Tokens ────────────────────────────────────────────────
export const tokens = {
  // Spacing unit: 8px base
  spacing: 8,

  // Border radius
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 28,
    full: 9999,
  },

  // Shadows
  shadows: {
    card: {
      dark:  '0 1px 3px rgba(0,0,0,0.4), 0 8px 24px -4px rgba(0,0,0,0.3)',
      light: '0 1px 3px rgba(0,0,0,0.06), 0 8px 24px -4px rgba(0,0,0,0.06)',
    },
    elevated: {
      dark:  '0 4px 16px rgba(0,0,0,0.5), 0 24px 48px -8px rgba(0,0,0,0.4)',
      light: '0 4px 16px rgba(0,0,0,0.08), 0 24px 48px -8px rgba(0,0,0,0.08)',
    },
    glow: {
      primary: '0 0 20px rgba(99,102,241,0.35)',
      teal:    '0 0 20px rgba(20,184,166,0.35)',
    },
    sidebar: {
      dark:  '4px 0 24px rgba(0,0,0,0.4)',
      light: '4px 0 24px rgba(0,0,0,0.06)',
    },
  },

  // Transition timing
  transition: {
    fast:   '120ms cubic-bezier(0.4,0,0.2,1)',
    normal: '220ms cubic-bezier(0.4,0,0.2,1)',
    slow:   '380ms cubic-bezier(0.4,0,0.2,1)',
  },
};

// ── Theme Factory ────────────────────────────────────────────────
export const getAppTheme = (mode = 'dark') => {
  const isDark = mode === 'dark';

  // Palette primitives
  const P = {
    indigo:   { 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 900: '#312e81' },
    teal:     { 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e' },
    emerald:  { 400: '#34d399', 500: '#10b981', 600: '#059669' },
    amber:    { 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' },
    rose:     { 400: '#f87171', 500: '#ef4444', 600: '#dc2626' },
    cyan:     { 400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2' },
    slate: {
      50:  '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
      400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
      800: '#1e293b', 850: '#172032', 900: '#0f172a', 950: '#09111f',
    },
  };

  const bg = {
    default: isDark ? P.slate[950] : P.slate[50],
    paper:   isDark ? P.slate[900] : '#ffffff',
    surface: isDark ? P.slate[850] : P.slate[100],
    overlay: isDark ? P.slate[800] : '#ffffff',
  };

  return createTheme({
    palette: {
      mode,
      primary:    { main: isDark ? P.indigo[500] : P.indigo[600], light: P.indigo[400], dark: P.indigo[700], contrastText: '#fff' },
      secondary:  { main: isDark ? P.teal[500]   : P.teal[600],   light: P.teal[400],   dark: P.teal[700],   contrastText: '#fff' },
      success:    { main: P.emerald[500], light: P.emerald[400], dark: P.emerald[600],   contrastText: '#fff' },
      warning:    { main: P.amber[500],   light: P.amber[400],   dark: P.amber[600],     contrastText: '#fff' },
      error:      { main: P.rose[500],    light: P.rose[400],    dark: P.rose[600],      contrastText: '#fff' },
      info:       { main: P.cyan[500],    light: P.cyan[400],    dark: P.cyan[600],      contrastText: '#fff' },
      background: bg,
      text: {
        primary:   isDark ? P.slate[50]  : P.slate[900],
        secondary: isDark ? P.slate[400] : P.slate[500],
        disabled:  isDark ? P.slate[600] : P.slate[300],
      },
      divider:   isDark ? 'rgba(148,163,184,0.1)' : 'rgba(100,116,139,0.1)',
      action: {
        hover:    isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
        selected: isDark ? 'rgba(99,102,241,0.12)'  : 'rgba(99,102,241,0.08)',
      },
    },

    shape: { borderRadius: tokens.radius.md },

    typography: {
      fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeightLight:   300,
      fontWeightRegular: 400,
      fontWeightMedium:  500,
      fontWeightBold:    700,
      h1: { fontWeight: 800, fontSize: '2.25rem',  lineHeight: 1.15, letterSpacing: '-0.5px' },
      h2: { fontWeight: 700, fontSize: '1.875rem', lineHeight: 1.2,  letterSpacing: '-0.3px' },
      h3: { fontWeight: 700, fontSize: '1.5rem',   lineHeight: 1.3,  letterSpacing: '-0.2px' },
      h4: { fontWeight: 600, fontSize: '1.25rem',  lineHeight: 1.35, letterSpacing: '-0.1px' },
      h5: { fontWeight: 600, fontSize: '1.0625rem',lineHeight: 1.4  },
      h6: { fontWeight: 600, fontSize: '0.9375rem',lineHeight: 1.4  },
      subtitle1: { fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.5 },
      subtitle2: { fontWeight: 600, fontSize: '0.8125rem', lineHeight: 1.5, letterSpacing: '0.1px' },
      body1:     { fontWeight: 400, fontSize: '0.9375rem', lineHeight: 1.6 },
      body2:     { fontWeight: 400, fontSize: '0.8125rem', lineHeight: 1.6 },
      caption:   { fontWeight: 500, fontSize: '0.75rem',   lineHeight: 1.5, letterSpacing: '0.2px' },
      overline:  { fontWeight: 700, fontSize: '0.6875rem', lineHeight: 1.5, letterSpacing: '0.8px', textTransform: 'uppercase' },
      button:    { fontWeight: 600, fontSize: '0.875rem',  letterSpacing: '0.1px', textTransform: 'none' },
    },

    components: {
      // ── CssBaseline ──────────────────────────────────────────────
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: 'thin',
            scrollbarColor: `${alpha(P.indigo[500], 0.3)} transparent`,
          },
        },
      },

      // ── Paper ─────────────────────────────────────────────────────
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
          rounded: { borderRadius: tokens.radius.lg },
        },
      },

      // ── Card ──────────────────────────────────────────────────────
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: isDark ? P.slate[900] : '#ffffff',
            border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)',
            borderRadius: tokens.radius.lg,
            boxShadow: isDark ? tokens.shadows.card.dark : tokens.shadows.card.light,
            transition: `transform ${tokens.transition.normal}, box-shadow ${tokens.transition.normal}`,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: isDark ? tokens.shadows.elevated.dark : tokens.shadows.elevated.light,
            },
          },
        },
      },

      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: '20px 24px',
            '&:last-child': { paddingBottom: '20px' },
          },
        },
      },

      // ── Button ────────────────────────────────────────────────────
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: tokens.radius.sm + 2,
            fontWeight: 600,
            fontSize: '0.875rem',
            padding: '9px 20px',
            transition: `all ${tokens.transition.normal}`,
            '&:active': { transform: 'scale(0.98)' },
          },
          contained: {
            boxShadow: 'none',
            '&:hover': { boxShadow: isDark ? '0 4px 16px rgba(99,102,241,0.35)' : '0 4px 12px rgba(99,102,241,0.2)' },
          },
          outlined: {
            borderWidth: '1.5px',
            '&:hover': { borderWidth: '1.5px' },
          },
          sizeSmall:  { padding: '5px 14px', fontSize: '0.8125rem' },
          sizeLarge:  { padding: '12px 28px', fontSize: '0.9375rem' },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: tokens.radius.sm,
            transition: `all ${tokens.transition.fast}`,
            '&:hover': { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)' },
          },
        },
      },

      // ── TextField ─────────────────────────────────────────────────
      MuiTextField: {
        defaultProps: { size: 'small' },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: tokens.radius.sm + 2,
            transition: `box-shadow ${tokens.transition.fast}`,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.14)',
              transition: `border-color ${tokens.transition.fast}`,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',
            },
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${alpha(P.indigo[500], 0.15)}`,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: P.indigo[500],
                borderWidth: '1.5px',
              },
            },
          },
        },
      },

      MuiInputLabel: {
        styleOverrides: {
          root: { fontSize: '0.875rem', fontWeight: 500 },
        },
      },

      // ── Select ────────────────────────────────────────────────────
      MuiSelect: {
        styleOverrides: {
          icon: { transition: `transform ${tokens.transition.fast}` },
        },
      },

      // ── Chip ──────────────────────────────────────────────────────
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            fontSize: '0.75rem',
            letterSpacing: '0.1px',
            borderRadius: tokens.radius.sm,
            height: 26,
          },
          sizeSmall: { height: 22, fontSize: '0.6875rem' },
        },
      },

      // ── Table ─────────────────────────────────────────────────────
      MuiTableContainer: {
        styleOverrides: {
          root: { borderRadius: 0, boxShadow: 'none' },
        },
      },

      MuiTable: {
        styleOverrides: {
          root: { borderCollapse: 'separate', borderSpacing: 0 },
        },
      },

      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              backgroundColor: isDark ? P.slate[950] : P.slate[50],
              color: isDark ? P.slate[300] : P.slate[600],
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              padding: '12px 16px',
              borderBottom: `2px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              whiteSpace: 'nowrap',
            },
          },
        },
      },

      MuiTableBody: {
        styleOverrides: {
          root: {
            '& .MuiTableRow-root': {
              transition: `background-color ${tokens.transition.fast}`,
              '&:hover': {
                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              },
            },
          },
        },
      },

      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
            padding: '12px 16px',
            fontSize: '0.875rem',
          },
        },
      },

      // ── Dialog / Modal ────────────────────────────────────────────
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: tokens.radius.xl,
            backgroundImage: 'none',
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
            boxShadow: isDark ? tokens.shadows.elevated.dark : tokens.shadows.elevated.light,
          },
        },
      },

      MuiDialogTitle: {
        styleOverrides: {
          root: { fontWeight: 700, fontSize: '1.0625rem', padding: '20px 24px 12px' },
        },
      },

      MuiDialogContent: {
        styleOverrides: {
          root: { padding: '8px 24px 20px' },
        },
      },

      MuiDialogActions: {
        styleOverrides: {
          root: { padding: '12px 24px 20px', gap: 8 },
        },
      },

      // ── Drawer ────────────────────────────────────────────────────
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
            backgroundColor: isDark ? P.slate[900] : '#ffffff',
            borderRight: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
            boxShadow: isDark ? tokens.shadows.sidebar.dark : tokens.shadows.sidebar.light,
          },
        },
      },

      // ── AppBar ────────────────────────────────────────────────────
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: isDark ? alpha(P.slate[900], 0.92) : alpha('#ffffff', 0.92),
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
            boxShadow: 'none',
          },
        },
      },

      // ── Tooltip ───────────────────────────────────────────────────
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? P.slate[700] : P.slate[800],
            fontSize: '0.75rem',
            fontWeight: 500,
            borderRadius: tokens.radius.sm,
            padding: '6px 12px',
          },
          arrow: {
            color: isDark ? P.slate[700] : P.slate[800],
          },
        },
      },

      // ── Menu ──────────────────────────────────────────────────────
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: tokens.radius.md,
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
            boxShadow: isDark ? tokens.shadows.elevated.dark : tokens.shadows.elevated.light,
            backgroundImage: 'none',
            minWidth: 180,
          },
        },
      },

      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: tokens.radius.xs + 2,
            margin: '2px 6px',
            fontSize: '0.875rem',
            fontWeight: 500,
            padding: '8px 12px',
            transition: `background-color ${tokens.transition.fast}`,
          },
        },
      },

      // ── Alert ─────────────────────────────────────────────────────
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: tokens.radius.md,
            fontSize: '0.875rem',
            fontWeight: 500,
          },
        },
      },

      // ── Breadcrumbs ───────────────────────────────────────────────
      MuiBreadcrumbs: {
        styleOverrides: {
          root: { fontSize: '0.8125rem' },
          separator: { color: isDark ? P.slate[600] : P.slate[400] },
        },
      },

      // ── List / Navigation ──────────────────────────────────────────
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: tokens.radius.sm + 2,
            transition: `all ${tokens.transition.fast}`,
            '&.Mui-selected': {
              '&:hover': { backgroundColor: 'inherit' },
            },
          },
        },
      },

      // ── LinearProgress ────────────────────────────────────────────
      MuiLinearProgress: {
        styleOverrides: {
          root: { borderRadius: tokens.radius.full, height: 6 },
        },
      },

      // ── Skeleton ──────────────────────────────────────────────────
      MuiSkeleton: {
        styleOverrides: {
          root: {
            borderRadius: tokens.radius.sm,
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            '&::after': {
              background: `linear-gradient(90deg, transparent, ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}, transparent)`,
            },
          },
        },
      },

      // ── Tab ───────────────────────────────────────────────────────
      MuiTab: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            fontSize: '0.875rem',
            textTransform: 'none',
            minHeight: 44,
            padding: '8px 16px',
          },
        },
      },

      // ── Avatar ────────────────────────────────────────────────────
      MuiAvatar: {
        styleOverrides: {
          root: { fontWeight: 700 },
        },
      },

      // ── Switch ────────────────────────────────────────────────────
      MuiSwitch: {
        styleOverrides: {
          root: { padding: 7 },
          thumb: { width: 16, height: 16 },
          track: { borderRadius: tokens.radius.full },
        },
      },

      // ── Rating ────────────────────────────────────────────────────
      MuiRating: {
        styleOverrides: {
          iconFilled: { color: P.amber[500] },
        },
      },

      // ── Divider ───────────────────────────────────────────────────
      MuiDivider: {
        styleOverrides: {
          root: { borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' },
        },
      },
    },
  });
};
