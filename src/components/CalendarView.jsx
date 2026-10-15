import { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  Button,
  ButtonBase,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { THEME } from '../constants';

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
  const isNarrow = useMediaQuery('(max-width:767px)');
  const showDayTitles = viewMode === 'week' || !isNarrow;

  const headerText =
    viewMode === 'week'
      ? `${days[0].format('MMM D')} — ${days[6].format('MMM D, YYYY')}`
      : currentDate.format('MMMM YYYY');

  return (
    <Box sx={{ p: { xs: 1.5, md: 2 }, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      {/* Calendar header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1 } }}>
          <IconButton onClick={navigateBack} size="small" aria-label={`Previous ${viewMode}`} sx={{ color: THEME.textSecondary }}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: THEME.text, minWidth: { xs: 100, md: 180 }, textAlign: 'center', fontSize: { xs: '0.8rem', md: '1rem' } }}
          >
            {headerText}
          </Typography>
          <IconButton onClick={navigateForward} size="small" aria-label={`Next ${viewMode}`} sx={{ color: THEME.textSecondary }}>
            <ChevronRightIcon />
          </IconButton>
          <Chip
            label="Today"
            size="small"
            onClick={goToToday}
            sx={{
              height: 32,
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
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>{d}</Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>{d.charAt(0)}</Box>
          </Typography>
        ))}
      </Box>

      {/* Calendar grid */}
      <Box
        className="card-hover-reveal"
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
            <ButtonBase
              key={day.format('YYYY-MM-DD')}
              className="calendar-day card-reveal"
              onClick={() => setSelectedDay(day)}
              aria-label={`Open ${day.format('MMMM D, YYYY')}, ${dayTasks.length} ${dayTasks.length === 1 ? 'task' : 'tasks'} due`}
              sx={{
                minHeight: viewMode === 'week' ? { xs: 88, md: 120 } : { xs: 56, md: 80 },
                width: '100%',
                minWidth: 0,
                borderRadius: 2,
                p: { xs: 0.5, md: 0.75 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                justifyContent: 'flex-start',
                textAlign: 'left',
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
              {showDayTitles ? (
                <>
                  {dayTasks.slice(0, viewMode === 'week' ? 5 : 3).map((task) => (
                    <Box
                      key={task.id}
                      sx={{
                        px: 0.5,
                        py: 0.25,
                        mb: 0.25,
                        borderRadius: 0.75,
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
                      sx={{ fontSize: '0.65rem', color: THEME.textMuted, px: 0.5 }}
                    >
                      +{dayTasks.length - (viewMode === 'week' ? 5 : 3)} more
                    </Typography>
                  )}
                </>
              ) : (
                dayTasks.length > 0 && (
                  <Typography
                    variant="caption"
                    sx={{ fontSize: '0.65rem', color: THEME.textSecondary, fontWeight: 600 }}
                  >
                    {dayTasks.length}
                  </Typography>
                )
              )}
            </ButtonBase>
          );
        })}
      </Box>

      <Dialog
        open={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        fullWidth
        maxWidth="sm"
        aria-labelledby="calendar-day-title"
        slotProps={{
          paper: {
            sx: { m: { xs: 1, sm: 3 }, width: { xs: 'calc(100% - 16px)', sm: 'auto' } },
          },
        }}
      >
        {selectedDay && (
          <>
            <DialogTitle id="calendar-day-title" sx={{ pr: 7 }}>
              <Typography variant="h5" component="span" sx={{ fontWeight: 600, color: THEME.text }}>
                {selectedDay.format('dddd')}
              </Typography>
              <Typography variant="body2" sx={{ color: THEME.textSecondary }}>
                {selectedDay.format('MMMM D, YYYY')}
              </Typography>
              <IconButton
                onClick={() => setSelectedDay(null)}
                aria-label="Close day details"
                size="small"
                sx={{ color: THEME.textMuted, position: 'absolute', top: 16, right: 16 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Typography variant="caption" sx={{ color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.65rem', mb: 1, display: 'block' }}>
                Tasks due
              </Typography>
              {getTasksForDay(selectedDay).length === 0 ? (
                <Typography variant="body2" sx={{ color: THEME.textMuted, py: 1, fontSize: '0.85rem' }}>
                  No tasks due this day.
                </Typography>
              ) : (
                <Box>
                  {getTasksForDay(selectedDay).map((task) => (
                    <Button
                      key={task.id}
                      onClick={() => { setSelectedDay(null); onTaskClick(task); }}
                      fullWidth
                      sx={{
                        justifyContent: 'flex-start',
                        px: 1.5,
                        py: 1,
                        mb: 0.5,
                        color: task.completed ? THEME.textMuted : THEME.text,
                        textDecoration: task.completed ? 'line-through' : 'none',
                        backgroundColor: THEME.surface,
                        border: `1px solid ${THEME.border}`,
                        '&:hover': { borderColor: THEME.borderStrong, backgroundColor: THEME.surfaceHover },
                      }}
                    >
                      {task.title}
                    </Button>
                  ))}
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
              <Button
                startIcon={<MenuBookIcon />}
                onClick={() => {
                  setSelectedDay(null);
                  onOpenJournal(selectedDay.format('YYYY-MM-DD'));
                }}
              >
                Open journal for {selectedDay.format('MMM D')}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
