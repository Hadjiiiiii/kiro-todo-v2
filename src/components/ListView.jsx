import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  Chip,
  IconButton,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
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
function DraggableTask({ task, onTaskClick }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
  });

  return (
    <Box
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => onTaskClick(task)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1.5,
        py: 1,
        borderRadius: 2,
        cursor: 'grab',
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
      <DragIndicatorIcon sx={{ fontSize: '0.9rem', color: THEME.textMuted, flexShrink: 0 }} />
      <Box
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
          backgroundColor: `${CATEGORY_COLORS[task.category] || THEME.accent}22`,
          color: CATEGORY_COLORS[task.category] || THEME.accent,
          border: 'none',
        }}
      />
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
        minHeight: 36,
        backgroundColor: isOver
          ? THEME.accentSoft
          : isToday
            ? 'rgba(217, 119, 87, 0.06)'
            : 'transparent',
        border: isOver
          ? `1px solid ${THEME.accentSoftBorder}`
          : isToday
            ? `1px solid rgba(217, 119, 87, 0.2)`
            : '1px solid transparent',
        transition: 'all 0.15s ease',
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

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left panel: Active tasks */}
        <Box
          sx={{
            width: '40%',
            minWidth: 280,
            borderRight: `1px solid ${THEME.border}`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${THEME.border}` }}>
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
              Active Tasks — {activeTasks.length}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
            {activeTasks.length === 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120 }}>
                <Typography variant="body2" sx={{ color: THEME.textMuted, fontSize: '0.8rem' }}>
                  No active tasks
                </Typography>
              </Box>
            ) : (
              activeTasks.map((task) => (
                <DraggableTask key={task.id} task={task} onTaskClick={onTaskClick} />
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
              px: 2.5,
              py: 1.5,
              borderBottom: `1px solid ${THEME.border}`,
            }}
          >
            <IconButton
              size="small"
              onClick={() => setCurrentMonth((m) => m.subtract(1, 'month'))}
              sx={{ color: THEME.textSecondary }}
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, color: THEME.text, minWidth: 120, textAlign: 'center', fontSize: '0.85rem' }}
            >
              {currentMonth.format('MMMM YYYY')}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setCurrentMonth((m) => m.add(1, 'month'))}
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
    </DndContext>
  );
}
