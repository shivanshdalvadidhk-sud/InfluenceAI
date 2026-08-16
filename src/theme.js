import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#7C3AED', // Purple
      light: '#F5F3FF',
      dark: '#6D28D9',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#3B82F6', // Blue
      light: '#EFF6FF',
      dark: '#2563EB',
      contrastText: '#FFFFFF',
    },
    text: {
      primary: '#0F172A', // Slate 900
      secondary: '#64748B', // Slate 500
      disabled: '#94A3B8',
    },
    background: {
      default: '#F6F7FC',
      paper: '#FFFFFF',
    },
    divider: '#E2E8F0',
    error: {
      main: '#EF4444',
    },
    success: {
      main: '#10B981',
    },
    warning: {
      main: '#F59E0B',
    },
    info: {
      main: '#06B6D4',
    },
  },
  typography: {
    fontFamily: '"Inter", "Outfit", -apple-system, sans-serif',
    h1: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 700,
      color: '#0F172A',
    },
    h2: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 700,
      color: '#0F172A',
    },
    h3: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600,
      color: '#0F172A',
    },
    h4: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600,
      color: '#0F172A',
    },
    h5: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600,
      color: '#0F172A',
    },
    h6: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600,
      color: '#0F172A',
    },
    subtitle1: {
      fontFamily: '"Inter", sans-serif',
    },
    subtitle2: {
      fontFamily: '"Inter", sans-serif',
    },
    body1: {
      fontFamily: '"Inter", sans-serif',
      lineHeight: 1.5,
    },
    body2: {
      fontFamily: '"Inter", sans-serif',
      lineHeight: 1.5,
    },
    button: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 20px',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)',
          color: '#FFFFFF',
          transition: 'all 0.2s ease',
          '&:hover': {
            background: 'linear-gradient(135deg, #6D28D9 0%, #2563EB 100%)',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.2)',
          },
        },
        outlinedPrimary: {
          borderColor: '#7C3AED',
          color: '#7C3AED',
          '&:hover': {
            borderColor: '#6D28D9',
            backgroundColor: '#F5F3FF',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
          border: '1px solid #E2E8F0',
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '& fieldset': {
              borderColor: '#E2E8F0',
            },
            '&:hover fieldset': {
              borderColor: '#CBD5E1',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#7C3AED',
            },
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: '#7C3AED',
          height: 6,
        },
        thumb: {
          height: 18,
          width: 18,
          backgroundColor: '#FFFFFF',
          border: '3px solid currentColor',
          '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
            boxShadow: 'inherit',
          },
          '&::before': {
            display: 'none',
          },
        },
        track: {
          height: 6,
          borderRadius: 3,
        },
        rail: {
          height: 6,
          borderRadius: 3,
          backgroundColor: '#E2E8F0',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: '"Outfit", sans-serif',
          fontWeight: 600,
          textTransform: 'none',
          fontSize: '0.95rem',
          minHeight: 48,
        },
      },
    },
  },
});

export default theme;
