import { useState } from 'react';
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BarChartIcon from '@mui/icons-material/BarChart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { VIEWS, THEME } from '../constants';

const PRIMARY_ITEMS = [
  { id: VIEWS.KANBAN, label: 'Board', icon: <ViewKanbanIcon /> },
  { id: VIEWS.LIST, label: 'List', icon: <FormatListBulletedIcon /> },
  { id: VIEWS.CALENDAR, label: 'Calendar', icon: <CalendarMonthIcon /> },
];

const MORE_ITEMS = [
  { id: VIEWS.HABITS, label: 'Habits', icon: <FitnessCenterIcon /> },
  { id: VIEWS.JOURNAL, label: 'Journal', icon: <MenuBookIcon /> },
  { id: VIEWS.STATS, label: 'Statistics', icon: <BarChartIcon /> },
  { id: VIEWS.FINANCE, label: 'Finance', icon: <AccountBalanceWalletIcon /> },
];

const MORE_IDS = MORE_ITEMS.map((item) => item.id);

export default function MobileNav({ currentView, onViewChange }) {
  const [moreOpen, setMoreOpen] = useState(false);

  // Determine which bottom nav item is active
  const getNavValue = () => {
    if (PRIMARY_ITEMS.some((item) => item.id === currentView)) {
      return currentView;
    }
    // If current view is in "More" section, highlight "More"
    return 'more';
  };

  const handleNavChange = (event, newValue) => {
    if (newValue === 'more') {
      setMoreOpen(true);
    } else {
      onViewChange(newValue);
    }
  };

  const handleMoreItemClick = (viewId) => {
    onViewChange(viewId);
    setMoreOpen(false);
  };

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          borderTop: `1px solid ${THEME.border}`,
        }}
      >
        <BottomNavigation
          value={getNavValue()}
          onChange={handleNavChange}
          showLabels
          sx={{
            backgroundColor: THEME.surface,
            height: 64,
            '& .MuiBottomNavigationAction-root': {
              color: THEME.textMuted,
              minWidth: 0,
              padding: '6px 0',
              '&.Mui-selected': {
                color: THEME.accent,
              },
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.65rem',
                marginTop: '2px',
                '&.Mui-selected': {
                  fontSize: '0.65rem',
                },
              },
              '& .MuiSvgIcon-root': {
                fontSize: '1.4rem',
              },
            },
          }}
        >
          {PRIMARY_ITEMS.map((item) => (
            <BottomNavigationAction
              key={item.id}
              value={item.id}
              label={item.label}
              icon={item.icon}
            />
          ))}
          <BottomNavigationAction
            value="more"
            label="More"
            icon={<MoreHorizIcon />}
          />
        </BottomNavigation>
      </Box>

      {/* More drawer (bottom sheet) */}
      <Drawer
        anchor="bottom"
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: THEME.surface,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '50vh',
          },
        }}
      >
        {/* Handle indicator */}
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 0.5 }}>
          <Box
            sx={{
              width: 36,
              height: 4,
              borderRadius: 2,
              backgroundColor: THEME.textMuted,
              opacity: 0.5,
            }}
          />
        </Box>

        <Typography
          variant="caption"
          sx={{
            px: 3,
            py: 1,
            color: THEME.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontSize: '0.65rem',
          }}
        >
          More views
        </Typography>

        <List sx={{ px: 1, pb: 2 }}>
          {MORE_ITEMS.map((item) => (
            <ListItemButton
              key={item.id}
              selected={currentView === item.id}
              onClick={() => handleMoreItemClick(item.id)}
              sx={{
                borderRadius: 2.5,
                mx: 1,
                mb: 0.5,
                py: 1.5,
                minHeight: 48,
                color: THEME.textSecondary,
                '&.Mui-selected': {
                  backgroundColor: THEME.accentSoft,
                  '& .MuiListItemIcon-root': { color: THEME.accent },
                  '& .MuiListItemText-primary': { color: THEME.accent, fontWeight: 600 },
                },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: THEME.textMuted }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
              />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
    </>
  );
}
