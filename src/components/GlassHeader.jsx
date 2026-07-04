import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { VIEWS, THEME } from '../constants';

const VIEW_TITLES = {
  [VIEWS.KANBAN]: 'Board',
  [VIEWS.LIST]: 'List',
  [VIEWS.CALENDAR]: 'Calendar',
  [VIEWS.STATS]: 'Statistics',
  [VIEWS.HABITS]: 'Habits',
  [VIEWS.JOURNAL]: 'Journal',
  [VIEWS.FINANCE]: 'Finance',
};

const VIEW_SUBTITLES = {
  [VIEWS.KANBAN]: 'Drag and drop to organize tasks',
  [VIEWS.LIST]: 'All tasks in one place',
  [VIEWS.CALENDAR]: 'Plan your schedule',
  [VIEWS.STATS]: 'Track your productivity',
  [VIEWS.HABITS]: 'Build consistent routines',
  [VIEWS.JOURNAL]: 'Reflect on your day',
  [VIEWS.FINANCE]: 'Track your money',
};

export default function GlassHeader({ currentView, taskCount, onAddTask }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 4,
        py: 2.5,
        borderBottom: `1px solid ${THEME.border}`,
        backgroundColor: THEME.bg,
      }}
    >
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: THEME.text,
              fontSize: '1.75rem',
            }}
          >
            {VIEW_TITLES[currentView]}
          </Typography>
          {taskCount > 0 && (
            <Box
              sx={{
                px: 1.25,
                py: 0.25,
                borderRadius: 2,
                backgroundColor: THEME.accentSoft,
                border: `1px solid ${THEME.accentSoftBorder}`,
              }}
            >
              <Typography variant="caption" sx={{ color: THEME.accent, fontWeight: 600, fontSize: '0.72rem' }}>
                {taskCount}
              </Typography>
            </Box>
          )}
        </Box>
        <Typography
          variant="body2"
          sx={{ color: THEME.textMuted, mt: 0.5, fontSize: '0.85rem' }}
        >
          {VIEW_SUBTITLES[currentView]}
        </Typography>
      </Box>

      {currentView !== VIEWS.STATS && currentView !== VIEWS.KANBAN && currentView !== VIEWS.FINANCE && (
        <Tooltip title="Add new task">
          <IconButton
            onClick={onAddTask}
            sx={{
              width: 42,
              height: 42,
              backgroundColor: THEME.accent,
              color: '#fff',
              borderRadius: 2.5,
              '&:hover': {
                backgroundColor: THEME.accentHover,
              },
            }}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
