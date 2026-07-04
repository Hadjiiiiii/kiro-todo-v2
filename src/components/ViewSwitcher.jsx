import { Box, ToggleButtonGroup, ToggleButton, Tooltip } from '@mui/material';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { VIEWS, THEME } from '../constants';

const VIEW_OPTIONS = [
  { id: VIEWS.KANBAN, label: 'Board', icon: <ViewKanbanIcon fontSize="small" /> },
  { id: VIEWS.LIST, label: 'List', icon: <FormatListBulletedIcon fontSize="small" /> },
  { id: VIEWS.CALENDAR, label: 'Calendar', icon: <CalendarMonthIcon fontSize="small" /> },
];

export default function ViewSwitcher({ currentView, onViewChange }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <ToggleButtonGroup
        value={currentView}
        exclusive
        onChange={(e, val) => val && onViewChange(val)}
        size="small"
        sx={{
          '& .MuiToggleButton-root': {
            border: `1px solid ${THEME.border}`,
            color: THEME.textMuted,
            px: 1.5,
            py: 0.5,
            '&.Mui-selected': {
              backgroundColor: THEME.accentSoft,
              color: THEME.accent,
              borderColor: THEME.accentSoftBorder,
              '&:hover': {
                backgroundColor: THEME.accentSoft,
              },
            },
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            },
          },
        }}
      >
        {VIEW_OPTIONS.map((opt) => (
          <ToggleButton key={opt.id} value={opt.id}>
            <Tooltip title={opt.label}>
              {opt.icon}
            </Tooltip>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}
