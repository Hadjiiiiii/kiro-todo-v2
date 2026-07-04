import { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  Button,
  Paper,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { PRIORITY_COLORS, THEME } from '../constants';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(weekOfYear);

export default function CalendarView({ filteredTasks, onTaskClick, onOpenJournal }) {
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDay, setSelectedDay] = useState(null);

  const navigateBack = () => {
    setCurrentDate((d) => d.subtract(1, viewMode === 'week' ? 'week' : 'month'));
  };

  const navigateForward = () => {
    setCurrentDate((d) => d.add(1, viewMode === 'week' ? 'week' : 'month'));
  };

  const goToToday = () => {
    setCurrentDate(dayjs());
  };

  const getWeekDays = () => {
    const start = currentDate.startOf('week');
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(start.add(i, 'day'));
    }
    return days;
  };

  const getMonthDays = () => {
    const start = currentDate.startOf('month').startOf('week');
    const end = currentDate.endOf('month').endOf('week');
    const days = [];
    let current = start;
    while (current.isSameOrBefore(end, 'day')) {
      days.push(current);
      current = current.add(1, 'day');
    }
    return days;
  };

  const getTasksForDay = (day) => {
    return filteredTasks.filter(
      (t) => t.dueDate && dayjs(t.dueDate).isSame(day, 'day')
    );
  };

  const days = viewMode === 'week' ? getWeekDays() : getMonthDays();
  const today = dayjs();

  const headerText =
    viewMode === 'week'
      ? `${days[0].format('MMM D')} — ${days[6].format('MMM D, YYYY')}`
      : currentDate.format('MMMM YYYY');

  return (
    <Box sx={{ p: { xs: 1.5, md: 2 }, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      {/* Calendar header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1 } }}>
          <IconButton onClick={navigateBack} size="small" sx={{ color: THEME.textSecondary }}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: THEME.text, minWidth: { xs: 100, md: 180 }, textAlign: 'center', fontSize: { xs: '0.8rem', md: '1rem' } }}
          >
            {headerText}
          </Typography>
          <IconButton onClick={navigateForward} size="small" sx={{ color: THEME.textSecondary }}>
            <ChevronRightIcon />
          </IconButton>
          <Chip
            label="Today"
            size="small"
            onClick={goToToday}
            sx={{
              height: 24,
              fontSize: '0.7rem',
              ml: { xs: 0.5, md: 1 },
              backgroundColor: THEME.accentSoft,
              color: THEME.accent,
              cursor: 'pointer',
              border: 'none',
              '&:hover': {
                backgroundColor: THEME.accentSoft,
              },
            }}
          />
        </Box>

        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, val) => val && setViewMode(val)}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              border: `1px solid ${THEME.border}`,
              color: THEME.textMuted,
              px: { xs: 1, md: 1.5 },
              py: 0.25,
              fontSize: '0.75rem',
              '&.Mui-selected': {
                backgroundColor: THEME.accentSoft,
                color: THEME.accent,
                borderColor: THEME.accentSoftBorder,
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
            },
          }}
        >
          <ToggleButton value="week">Week</ToggleButton>
          <ToggleButton value="month">Month</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Day headers */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 0.5,
          mb: 0.5,
        }}
      >
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <Typography
            key={d}
            variant="caption"
            sx={{
              textAlign: 'center',
              color: THEME.textMuted,
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              py: 0.5,
            }}
          >
            {d}
          </Typography>
        ))}
      </Box>

      {/* Calendar grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 0.5,
          flex: 1,
          overflow: 'auto',
        }}
      >
        {days.map((day) => {
          const dayTasks = getTasksForDay(day);
          const isToday = day.isSame(today, 'day');
          const isCurrentMonth = day.month() === currentDate.month();

          return (
            <Box
              key={day.format('YYYY-MM-DD')}
              onClick={() => setSelectedDay(day)}
              sx={{
                minHeight: viewMode === 'week' ? { xs: 80, md: 120 } : { xs: 56, md: 80 },
                borderRadius: 2,
                p: { xs: 0.5, md: 0.75 },
                cursor: 'pointer',
                backgroundColor: isToday ? THEME.accentSoft : THEME.surface,
                border: isToday
                  ? `1px solid ${THEME.accentSoftBorder}`
                  : `1px solid ${THEME.border}`,
                opacity: isCurrentMonth || viewMode === 'week' ? 1 : 0.4,
                overflow: 'hidden',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: isToday ? 700 : 500,
                  color: isToday ? THEME.accent : THEME.textSecondary,
                  fontSize: '0.7rem',
                  display: 'block',
                  mb: 0.5,
                }}
              >
                {day.format('D')}
              </Typography>
              {dayTasks.slice(0, viewMode === 'week' ? 5 : 3).map((task) => (
                <Box
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  sx={{
                    px: 0.5,
                    py: 0.25,
                    mb: 0.25,
                    borderRadius: 0.75,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderLeft: `2px solid ${PRIORITY_COLORS[task.priority]}`,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.09)',
                    },
                    overflow: 'hidden',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.6rem',
                      color: task.completed ? THEME.textMuted : THEME.textSecondary,
                      textDecoration: task.completed ? 'line-through' : 'none',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'block',
                    }}
                  >
                    {task.title}
                  </Typography>
                </Box>
              ))}
              {dayTasks.length > (viewMode === 'week' ? 5 : 3) && (
                <Typography
                  variant="caption"
                  sx={{ fontSize: '0.55rem', color: THEME.textMuted, px: 0.5 }}
                >
                  +{dayTasks.length - (viewMode === 'week' ? 5 : 3)} more
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Day Zoom Panel */}
      {selectedDay && (
        <Paper
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: 480,
            maxHeight: '70vh',
            overflow: 'auto',
            p: 3,
            borderRadius: 4,
            backgroundColor: THEME.elevated,
            border: `1px solid ${THEME.borderStrong}`,
            boxShadow: THEME.shadow,
            zIndex: 10,
          }}
          elevation={0}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: THEME.text }}>
                {selectedDay.format('dddd')}
              </Typography>
              <Typography variant="body2" sx={{ color: THEME.textSecondary }}>
                {selectedDay.format('MMMM D, YYYY')}
              </Typography>
            </Box>
            <IconButton onClick={() => setSelectedDay(null)} size="small" sx={{ color: THEME.textMuted }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Tasks for this day */}
          <Typography variant="caption" sx={{ color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.65rem', mb: 1, display: 'block' }}>
            Tasks
          </Typography>
          {(() => {
            const dayTasks = getTasksForDay(selectedDay);
            if (dayTasks.length === 0) {
              return (
                <Typography variant="body2" sx={{ color: THEME.textMuted, mb: 2, fontSize: '0.85rem' }}>
                  No tasks for this day
                </Typography>
              );
            }
            return (
              <Box sx={{ mb: 2 }}>
                {dayTasks.map((task) => (
                  <Box
                    key={task.id}
                    onClick={() => { setSelectedDay(null); onTaskClick(task); }}
                    sx={{
                      px: 1.5,
                      py: 1,
                      mb: 0.5,
                      borderRadius: 2,
                      cursor: 'pointer',
                      backgroundColor: THEME.surface,
                      border: `1px solid ${THEME.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      '&:hover': { borderColor: THEME.borderStrong },
                    }}
                  >
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: PRIORITY_COLORS[task.priority] }} />
                    <Typography variant="body2" sx={{ fontSize: '0.85rem', color: task.completed ? THEME.textMuted : THEME.text, textDecoration: task.completed ? 'line-through' : 'none' }}>
                      {task.title}
                    </Typography>
                  </Box>
                ))}
              </Box>
            );
          })()}

          {/* Journal button */}
          <Button
            startIcon={<MenuBookIcon />}
            onClick={() => {
              setSelectedDay(null);
              onOpenJournal(selectedDay.format('YYYY-MM-DD'));
            }}
            fullWidth
            sx={{
              mt: 1,
              color: THEME.accent,
              border: `1px solid ${THEME.accentSoftBorder}`,
              borderRadius: 2.5,
              textTransform: 'none',
              py: 1,
              '&:hover': { backgroundColor: THEME.accentSoft },
            }}
          >
            Open Journal for {selectedDay.format('MMM D')}
          </Button>
        </Paper>
      )}

      {/* Backdrop when zoom is open */}
      {selectedDay && (
        <Box
          onClick={() => setSelectedDay(null)}
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 5,
          }}
        />
      )}
    </Box>
  );
}
