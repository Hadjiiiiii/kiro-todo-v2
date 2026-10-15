import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Button,
  ButtonBase,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Tooltip,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import dayjs from 'dayjs';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { PRIORITY_COLORS, CATEGORY_COLORS, THEME } from '../constants';
import { useTaskContext } from '../context/TaskContext';

const DAY_INITIALS = ['SU', 'M', 'T', 'W', 'TH', 'F', 'SA'];

/* ---------- Draggable task item (left panel) ---------- */
function DraggableTask({ task, onTaskClick, onFinish }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { title: task.title },
  });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        px: 0.75,
        py: 0.5,
        minHeight: 44,
        borderRadius: 2,
        backgroundColor: THEME.surface,
        border: `1px solid ${THEME.border}`,
        mb: 0.75,
        opacity: isDragging ? 0.4 : 1,
        '&:hover': {
          backgroundColor: THEME.surfaceHover,
          borderColor: THEME.borderStrong,
        },
      }}
    >
      <IconButton
        {...attributes}
        {...listeners}
        aria-label={`Drag ${task.title} onto a finished date`}
        sx={{
          color: THEME.textMuted,
          cursor: 'grab',
          touchAction: 'none',
          flexShrink: 0,
        }}
      >
        <DragIndicatorIcon sx={{ fontSize: '1.1rem' }} />
      </IconButton>
      <ButtonBase
        onClick={() => onTaskClick(task)}
        aria-label={`Open task ${task.title}`}
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          justifyContent: 'flex-start',
          textAlign: 'left',
          py: 0.75,
          borderRadius: 1,
        }}
      >
        <Box
          role="img"
          aria-label={`${task.priority} priority`}
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: PRIORITY_COLORS[task.priority],
            flexShrink: 0,
          }}
        />
        <Typography
          variant="body2"
          sx={{
            flex: 1,
            minWidth: 0,
            fontSize: '0.82rem',
            fontWeight: 500,
            color: THEME.text,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {task.title}
        </Typography>
        <Chip
          label={task.category}
          size="small"
          sx={{
            height: 18,
            fontSize: '0.6rem',
            display: { xs: 'none', sm: 'inline-flex' },
            backgroundColor: `${CATEGORY_COLORS[task.category] || THEME.accent}22`,
            color: CATEGORY_COLORS[task.category] || THEME.accent,
            border: 'none',
          }}
        />
      </ButtonBase>
      <Tooltip title="Mark finished on a date">
        <IconButton
          aria-label={`Mark ${task.title} finished on a date`}
          onClick={() => onFinish(task)}
          sx={{ color: THEME.textMuted, flexShrink: 0, '&:hover': { color: THEME.green } }}
        >
          <CheckCircleOutlinedIcon sx={{ fontSize: '1.15rem' }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

/* ---------- Floating drag overlay ---------- */
function TaskDragOverlay({ task }) {
  if (!task) return null;
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1.5,
        py: 1,
        borderRadius: 2,
        backgroundColor: THEME.elevated,
        border: `1px solid ${THEME.accent}`,
        boxShadow: THEME.shadow,
        minWidth: 200,
      }}
    >
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: PRIORITY_COLORS[task.priority],
        }}
      />
      <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color: THEME.text }}>
        {task.title}
      </Typography>
    </Box>
  );
}

/* ---------- Droppable day row (right panel) ---------- */
function DayRow({ date, accomplishedTasks, isToday }) {
  const dateStr = date.format('YYYY-MM-DD');
  const { setNodeRef, isOver } = useDroppable({ id: `day-${dateStr}` });
  const dayNum = date.date();
  const dayInitial = DAY_INITIALS[date.day()];

  return (
    <Box
      ref={setNodeRef}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 0.75,
        borderRadius: 1.5,
        minHeight: 44,
        backgroundColor: isOver || isToday ? THEME.accentSoft : 'transparent',
        border: isOver || isToday
          ? `1px solid ${THEME.accentSoftBorder}`
          : '1px solid transparent',
      }}
    >
      {/* Day label */}
      <Typography
        variant="caption"
        sx={{
          width: 42,
          fontSize: '0.75rem',
          fontWeight: isToday ? 700 : 500,
          color: isToday ? THEME.accent : THEME.textSecondary,
          flexShrink: 0,
        }}
      >
        {dayNum}-{dayInitial}
      </Typography>

      {/* Accomplished tasks for this day */}
      <Box sx={{ flex: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap', minHeight: 20 }}>
        {accomplishedTasks.map((task) => (
          <Chip
            key={task.id}
            label={task.title}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              fontWeight: 500,
              backgroundColor: `${PRIORITY_COLORS[task.priority] || THEME.accent}22`,
              color: PRIORITY_COLORS[task.priority] || THEME.accent,
              border: 'none',
              maxWidth: 180,
              '& .MuiChip-label': {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
            }}
          />
        ))}
        {accomplishedTasks.length === 0 && (
          <Box
            sx={{
              flex: 1,
              height: 1,
              borderBottom: `1px dashed ${THEME.border}`,
              alignSelf: 'center',
            }}
          />
        )}
      </Box>
    </Box>
  );
}

/* ---------- Main ListView ---------- */
export default function ListView({ filteredTasks, onTaskClick }) {
  const { tasks, accomplishTask } = useTaskContext();
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'));
  const [activeId, setActiveId] = useState(null);
  const [finishTask, setFinishTask] = useState(null);
  const [finishDate, setFinishDate] = useState(dayjs().format('YYYY-MM-DD'));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const today = dayjs();

  // Active (incomplete) tasks for the left panel
  const activeTasks = useMemo(
    () => filteredTasks.filter((t) => !t.completed),
    [filteredTasks]
  );

  // Days in the current month
  const monthDays = useMemo(() => {
    const daysInMonth = currentMonth.daysInMonth();
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(currentMonth.date(i));
    }
    return days;
  }, [currentMonth]);

  // Accomplished tasks grouped by date
  const accomplishedByDate = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      if (t.accomplishedDate) {
        const key = dayjs(t.accomplishedDate).format('YYYY-MM-DD');
        if (!map[key]) map[key] = [];
        map[key].push(t);
      }
    });
    return map;
  }, [tasks]);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const overId = over.id;
    if (typeof overId === 'string' && overId.startsWith('day-')) {
      const dateStr = overId.replace('day-', '');
      accomplishTask(active.id, dateStr);
    }
  };

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  const openFinishDialog = (task) => {
    setFinishTask(task);
    setFinishDate(dayjs().format('YYYY-MM-DD'));
  };

  const confirmFinish = () => {
    if (!finishTask || !finishDate) return;
    accomplishTask(finishTask.id, finishDate);
    setFinishTask(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Left panel: Active tasks */}
        <Box
          sx={{
            width: { xs: '100%', md: '40%' },
            minWidth: { xs: 'auto', md: 280 },
            borderRight: { xs: 'none', md: `1px solid ${THEME.border}` },
            borderBottom: { xs: `1px solid ${THEME.border}`, md: 'none' },
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            maxHeight: { xs: '40%', md: 'none' },
          }}
        >
          <Box sx={{ px: { xs: 1.5, md: 2.5 }, py: 1.5, borderBottom: `1px solid ${THEME.border}` }}>
            <Typography
              variant="caption"
              sx={{
                color: THEME.textMuted,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontSize: '0.65rem',
                fontWeight: 600,
              }}
            >
              To finish · {activeTasks.length}
            </Typography>
            <Typography variant="body2" sx={{ color: THEME.textSecondary, fontSize: '0.75rem', mt: 0.5 }}>
              Drag onto a day, or tap the check to pick a date.
            </Typography>
          </Box>
          <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 1, md: 1.5 } }}>
            {activeTasks.length === 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: { xs: 60, md: 120 } }}>
                <Typography variant="body2" sx={{ color: THEME.textMuted, fontSize: '0.8rem' }}>
                  No matching tasks to finish.
                </Typography>
              </Box>
            ) : (
              activeTasks.map((task) => (
                <DraggableTask
                  key={task.id}
                  task={task}
                  onTaskClick={onTaskClick}
                  onFinish={openFinishDialog}
                />
              ))
            )}
          </Box>
        </Box>

        {/* Right panel: Day timeline */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Month navigation */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              px: { xs: 1.5, md: 2.5 },
              py: 1.5,
              borderBottom: `1px solid ${THEME.border}`,
            }}
          >
            <IconButton
              size="small"
              onClick={() => setCurrentMonth((m) => m.subtract(1, 'month'))}
              aria-label="Previous month"
              sx={{ color: THEME.textSecondary }}
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, color: THEME.text, minWidth: { xs: 120, md: 220 }, textAlign: 'center', fontSize: '0.85rem' }}
            >
              {currentMonth.format('[Finished] MMMM YYYY')}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setCurrentMonth((m) => m.add(1, 'month'))}
              aria-label="Next month"
              sx={{ color: THEME.textSecondary }}
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Day list */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
            {monthDays.map((date) => (
              <DayRow
                key={date.format('YYYY-MM-DD')}
                date={date}
                isToday={date.isSame(today, 'day')}
                accomplishedTasks={accomplishedByDate[date.format('YYYY-MM-DD')] || []}
              />
            ))}
          </Box>
        </Box>
      </Box>

      <DragOverlay>
        <TaskDragOverlay task={activeTask} />
      </DragOverlay>
      <Dialog open={!!finishTask} onClose={() => setFinishTask(null)} aria-labelledby="finish-task-title">
        <DialogTitle id="finish-task-title">When did you finish this task?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: THEME.textSecondary, mb: 2 }}>
            {finishTask?.title}
          </DialogContentText>
          <TextField
            label="Finished on"
            type="date"
            value={finishDate}
            onChange={(event) => setFinishDate(event.target.value)}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setFinishTask(null)}>Cancel</Button>
          <Button variant="contained" onClick={confirmFinish} disabled={!finishDate}>
            Mark finished
          </Button>
        </DialogActions>
      </Dialog>
    </DndContext>
  );
}
