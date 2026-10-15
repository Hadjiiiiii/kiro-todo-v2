import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { VIEWS, THEME } from '../constants';

const VIEW_TITLES = {
  [VIEWS.KANBAN]: 'Board',
  [VIEWS.LIST]: 'Logbook',
  [VIEWS.CALENDAR]: 'Calendar',
  [VIEWS.STATS]: 'Statistics',
  [VIEWS.HABITS]: 'Habits',
  [VIEWS.JOURNAL]: 'Journal',
  [VIEWS.FINANCE]: 'Finance',
};

const VIEW_SUBTITLES = {
  [VIEWS.KANBAN]: 'Organize what needs your attention',
  [VIEWS.LIST]: 'Keep a dated record of finished work',
  [VIEWS.CALENDAR]: 'See tasks by due date',
  [VIEWS.STATS]: 'See task and journal progress',
  [VIEWS.HABITS]: 'Build consistent routines',
  [VIEWS.JOURNAL]: 'Write down what mattered today',
  [VIEWS.FINANCE]: 'Track income and expenses',
};

const TASK_VIEWS = new Set([VIEWS.KANBAN, VIEWS.LIST, VIEWS.CALENDAR]);
const TASK_ACTION_VIEWS = new Set([VIEWS.LIST, VIEWS.CALENDAR]);

export default function GlassHeader({ currentView, taskCount, onAddTask }) {
  const showTaskCount = TASK_VIEWS.has(currentView) && taskCount > 0;
  const showAddTask = TASK_ACTION_VIEWS.has(currentView);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, md: 4 },
        py: { xs: 1.5, md: 2.5 },
        borderBottom: `1px solid ${THEME.border}`,
        backgroundColor: THEME.bg,
      }}
    >
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: THEME.text,
              fontSize: { xs: '1.25rem', md: '1.75rem' },
            }}
          >
            {VIEW_TITLES[currentView]}
          </Typography>
          {showTaskCount && (
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
                {taskCount} active
              </Typography>
            </Box>
          )}
        </Box>
        <Typography
          variant="body2"
          sx={{ color: THEME.textMuted, mt: 0.5, fontSize: '0.85rem', display: { xs: 'none', md: 'block' } }}
        >
          {VIEW_SUBTITLES[currentView]}
        </Typography>
      </Box>

      {showAddTask && (
        <Tooltip title="Add task">
          <IconButton
            onClick={onAddTask}
            aria-label="Add task"
            sx={{
              width: 44,
              height: 44,
              backgroundColor: THEME.accent,
              color: THEME.onAccent,
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
