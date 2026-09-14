import { useState } from 'react';
import { Box, Typography, Divider, Avatar, ButtonBase, IconButton } from '@mui/material';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BarChartIcon from '@mui/icons-material/BarChart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LogoutIcon from '@mui/icons-material/Logout';
import { VIEWS, THEME } from '../constants';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { id: VIEWS.KANBAN, label: 'Board', icon: <ViewKanbanIcon fontSize="small" /> },
  { id: VIEWS.LIST, label: 'Logbook', icon: <FormatListBulletedIcon fontSize="small" /> },
  { id: VIEWS.CALENDAR, label: 'Calendar', icon: <CalendarMonthIcon fontSize="small" /> },
  { id: VIEWS.HABITS, label: 'Habits', icon: <FitnessCenterIcon fontSize="small" /> },
  { id: VIEWS.JOURNAL, label: 'Journal', icon: <MenuBookIcon fontSize="small" /> },
  { id: VIEWS.STATS, label: 'Statistics', icon: <BarChartIcon fontSize="small" /> },
  { id: VIEWS.FINANCE, label: 'Finance', icon: <AccountBalanceWalletIcon fontSize="small" /> },
];

function SidebarLink({ item, isActive, onClick, expanded }) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      aria-label={item.label}
      title={expanded ? undefined : item.label}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        width: '100%',
        minHeight: 44,
        px: expanded ? 1.75 : 0,
        py: 1.1,
        justifyContent: expanded ? 'flex-start' : 'center',
        borderRadius: 2.5,
        color: isActive ? THEME.accent : THEME.textSecondary,
        backgroundColor: isActive ? THEME.accentSoft : 'transparent',
        '&:hover': {
          backgroundColor: isActive ? THEME.accentSoft : 'rgba(255, 255, 255, 0.04)',
        },
      }}
    >
      <Box component="span" sx={{ display: 'flex', color: isActive ? THEME.accent : THEME.textMuted, flexShrink: 0 }}>
        {item.icon}
      </Box>
      <Box
        component="span"
        sx={{
          maxWidth: expanded ? 160 : 0,
          opacity: expanded ? 1 : 0,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          fontSize: '0.9rem',
          fontWeight: isActive ? 600 : 500,
          color: isActive ? THEME.accent : THEME.textSecondary,
          transition: 'max-width 180ms ease, opacity 180ms ease',
          '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        }}
      >
        {item.label}
      </Box>
    </ButtonBase>
  );
}

function SidebarContents({ currentView, onViewChange, onOpenAccount, stats, expanded }) {
  const { currentUser, signOut } = useAuth();
  const accountLabel = currentUser?.displayName?.trim() || currentUser?.email || 'Account';
  const avatarInitial = accountLabel.charAt(0).toUpperCase() || 'A';

  return (
    <>
      <Box
        sx={{
          px: expanded ? 3 : 1,
          py: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          justifyContent: expanded ? 'flex-start' : 'center',
          minHeight: 88,
        }}
      >
        <Avatar
          sx={{
            width: 38,
            height: 38,
            flexShrink: 0,
            backgroundColor: THEME.accent,
            color: THEME.onAccent,
          }}
        >
          <AssignmentIcon fontSize="small" />
        </Avatar>
        <Box
          sx={{
            maxWidth: expanded ? 160 : 0,
            opacity: expanded ? 1 : 0,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            transition: 'max-width 180ms ease, opacity 180ms ease',
            '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
          }}
        >
          <Typography
            variant="h6"
            component="p"
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
            Your day, kept together
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: THEME.border }} />

      <Box
        component="ul"
        sx={{
          listStyle: 'none',
          m: 0,
          px: expanded ? 1.5 : 1,
          py: 2,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {NAV_ITEMS.map((item) => (
          <Box component="li" key={item.id} sx={{ m: 0, p: 0 }}>
            <SidebarLink
              isActive={currentView === item.id}
              onClick={() => onViewChange(item.id)}
              item={item}
              expanded={expanded}
            />
          </Box>
        ))}
      </Box>

      <Divider sx={{ borderColor: THEME.border }} />

      <Box
        sx={{
          maxHeight: expanded ? 220 : 0,
          opacity: expanded ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height 180ms ease, opacity 180ms ease',
          '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        }}
        aria-hidden={!expanded}
      >
        <Box sx={{ px: 3, py: 2.5 }}>
          <Typography
            variant="caption"
            sx={{
              color: THEME.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontSize: '0.65rem',
            }}
          >
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
      </Box>

      <Box
        sx={{
          px: expanded ? 2 : 1,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: expanded ? 'space-between' : 'center',
          flexDirection: expanded ? 'row' : 'column',
          gap: 1,
        }}
      >
        <ButtonBase
          onClick={onOpenAccount}
          aria-label="Account"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            minWidth: 0,
            minHeight: 44,
            borderRadius: 2,
            textAlign: 'left',
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.04)' },
          }}
        >
          <Avatar
            sx={{
              width: 28,
              height: 28,
              flexShrink: 0,
              backgroundColor: THEME.accentSoft,
              color: THEME.accent,
              fontSize: '0.7rem',
              fontWeight: 700,
            }}
          >
            {avatarInitial}
          </Avatar>
          <Box
            component="span"
            sx={{
              maxWidth: expanded ? 160 : 0,
              opacity: expanded ? 1 : 0,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              transition: 'max-width 180ms ease, opacity 180ms ease',
              '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
            }}
          >
            <Typography variant="caption" sx={{ color: THEME.textSecondary, fontSize: '0.75rem' }}>
              {accountLabel}
            </Typography>
          </Box>
        </ButtonBase>
        <IconButton
          size="small"
          onClick={signOut}
          sx={{
            color: THEME.textMuted,
            '&:hover': { color: THEME.error },
            minWidth: 44,
            minHeight: 44,
          }}
          title="Sign out"
          aria-label="Sign out"
        >
          <LogoutIcon fontSize="small" />
        </IconButton>
      </Box>
    </>
  );
}

export default function Sidebar({ currentView, onViewChange, onOpenAccount, stats }) {
  const [open, setOpen] = useState(true);
  const closeIfLeaving = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  };

  return (
    <Box
      component="nav"
      aria-label="Views"
      aria-expanded={open}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={closeIfLeaving}
      sx={{
        width: open ? 248 : 64,
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
        backgroundColor: THEME.surface,
        borderRight: `1px solid ${THEME.border}`,
        transition: 'width 220ms cubic-bezier(0.22, 1, 0.36, 1)',
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      }}
    >
      <SidebarContents
        currentView={currentView}
        onViewChange={onViewChange}
        onOpenAccount={onOpenAccount}
        stats={stats}
        expanded={open}
      />
    </Box>
  );
}
