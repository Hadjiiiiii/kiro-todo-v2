import { Box, Typography, List, ListItemButton, ListItemIcon, ListItemText, Divider, Avatar, IconButton } from '@mui/material';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BarChartIcon from '@mui/icons-material/BarChart';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LogoutIcon from '@mui/icons-material/Logout';
import { VIEWS, THEME } from '../constants';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { id: VIEWS.KANBAN, label: 'Board', icon: <ViewKanbanIcon /> },
  { id: VIEWS.LIST, label: 'List', icon: <FormatListBulletedIcon /> },
  { id: VIEWS.CALENDAR, label: 'Calendar', icon: <CalendarMonthIcon /> },
  { id: VIEWS.HABITS, label: 'Habits', icon: <FitnessCenterIcon /> },
  { id: VIEWS.JOURNAL, label: 'Journal', icon: <MenuBookIcon /> },
  { id: VIEWS.STATS, label: 'Statistics', icon: <BarChartIcon /> },
  { id: VIEWS.FINANCE, label: 'Finance', icon: <AccountBalanceWalletIcon /> },
];

export default function Sidebar({ currentView, onViewChange, stats }) {
  const { currentUser, logout } = useAuth();

  return (
    <Box
      component="nav"
      sx={{
        width: 248,
        minWidth: 248,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: THEME.surface,
        borderRight: `1px solid ${THEME.border}`,
        overflow: 'hidden',
      }}
    >
      {/* Logo / Brand */}
      <Box sx={{ px: 3, py: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar
          sx={{
            width: 38,
            height: 38,
            backgroundColor: THEME.accent,
            color: '#fff',
            fontSize: '1rem',
          }}
        >
          <AssignmentIcon sx={{ fontSize: '1.2rem' }} />
        </Avatar>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: '1.25rem',
              lineHeight: 1.1,
              color: THEME.text,
            }}
          >
            TasKeep
          </Typography>
          <Typography variant="caption" sx={{ color: THEME.textMuted, fontSize: '0.72rem' }}>
            Stay organized
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: THEME.border }} />

      {/* Navigation */}
      <List sx={{ px: 1.5, py: 2, flex: 1 }}>
        {NAV_ITEMS.map((item) => (
          <ListItemButton
            key={item.id}
            selected={currentView === item.id}
            onClick={() => onViewChange(item.id)}
            sx={{
              borderRadius: 2.5,
              mb: 0.5,
              py: 1.1,
              px: 1.75,
              color: THEME.textSecondary,
              '&.Mui-selected': {
                backgroundColor: THEME.accentSoft,
                '&:hover': {
                  backgroundColor: THEME.accentSoft,
                },
                '& .MuiListItemIcon-root': {
                  color: THEME.accent,
                },
                '& .MuiListItemText-primary': {
                  color: THEME.accent,
                  fontWeight: 600,
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: THEME.textMuted }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontWeight: 500,
              }}
            />
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ borderColor: THEME.border }} />

      {/* Quick Stats */}
      <Box sx={{ px: 3, py: 2.5 }}>
        <Typography variant="caption" sx={{ color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.65rem' }}>
          Overview
        </Typography>
        <Box sx={{ mt: 1.25, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: THEME.textSecondary }}>Active</Typography>
            <Typography variant="caption" sx={{ color: THEME.accent, fontWeight: 600 }}>{stats.active}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: THEME.textSecondary }}>Completed</Typography>
            <Typography variant="caption" sx={{ color: THEME.green, fontWeight: 600 }}>{stats.completed}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: THEME.textSecondary }}>Overdue</Typography>
            <Typography variant="caption" sx={{ color: stats.overdue > 0 ? THEME.error : THEME.textMuted, fontWeight: 600 }}>{stats.overdue}</Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ borderColor: THEME.border }} />

      {/* User & Logout */}
      <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            sx={{
              width: 28,
              height: 28,
              backgroundColor: THEME.accentSoft,
              color: THEME.accent,
              fontSize: '0.7rem',
              fontWeight: 700,
            }}
          >
            {currentUser?.username?.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="caption" sx={{ color: THEME.textSecondary, fontSize: '0.75rem' }}>
            {currentUser?.username}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={logout}
          sx={{ color: THEME.textMuted, '&:hover': { color: THEME.error } }}
          title="Sign out"
        >
          <LogoutIcon sx={{ fontSize: '1rem' }} />
        </IconButton>
      </Box>
    </Box>
  );
}
