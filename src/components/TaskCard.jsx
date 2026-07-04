import { forwardRef } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Checkbox,
  LinearProgress,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RepeatIcon from '@mui/icons-material/Repeat';
import dayjs from 'dayjs';
import { PRIORITY_COLORS, CATEGORY_COLORS, THEME } from '../constants';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const TaskCard = forwardRef(function TaskCard(
  { task, onToggleComplete, onClick, isDragging },
  ref
) {
  const isOverdue =
    task.dueDate && !task.completed && dayjs(task.dueDate).isBefore(dayjs(), 'day');

  const subtaskCount = task.subtasks?.length || 0;
  const subtaskDone = task.subtasks?.filter((s) => s.completed).length || 0;
  const subtaskProgress = subtaskCount > 0 ? (subtaskDone / subtaskCount) * 100 : 0;

  return (
    <Card
      ref={ref}
      data-dragging={isDragging}
      sx={{
        mb: 1,
        cursor: 'pointer',
        opacity: isDragging ? 0.5 : task.completed ? 0.5 : 1,
        transform: isDragging ? 'rotate(2deg)' : 'none',
        backgroundColor: THEME.surface,
        border: `1px solid ${THEME.border}`,
        borderRadius: '12px',
        boxShadow: 'none',
        '&:hover': {
          backgroundColor: THEME.surfaceHover,
          borderColor: THEME.borderStrong,
          boxShadow: THEME.shadowLight,
        },
      }}
      onClick={() => onClick(task)}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
          <Checkbox
            checked={task.completed}
            onChange={(e) => {
              e.stopPropagation();
              onToggleComplete(task.id);
            }}
            onClick={(e) => e.stopPropagation()}
            size="small"
            sx={{ p: 0, mt: 0.2 }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                textDecoration: task.completed ? 'line-through' : 'none',
                color: task.completed ? THEME.textMuted : THEME.text,
                wordBreak: 'break-word',
                fontSize: '0.85rem',
              }}
            >
              {task.title}
            </Typography>
            {task.notes && (
              <Typography
                variant="caption"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  mt: 0.5,
                  color: THEME.textMuted,
                  fontSize: '0.75rem',
                }}
              >
                {task.notes}
              </Typography>
            )}

            {/* Subtask progress */}
            {subtaskCount > 0 && (
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <LinearProgress
                  variant="determinate"
                  value={subtaskProgress}
                  sx={{
                    flex: 1,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 2,
                      backgroundColor: subtaskDone === subtaskCount ? THEME.green : THEME.accent,
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: THEME.textMuted, fontSize: '0.65rem', whiteSpace: 'nowrap' }}
                >
                  {subtaskDone}/{subtaskCount}
                </Typography>
              </Box>
            )}

            {/* Tags row */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
              {/* Priority dot */}
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: PRIORITY_COLORS[task.priority],
                }}
              />
              {/* Category chip */}
              <Chip
                label={task.category}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  fontWeight: 500,
                  backgroundColor: `${CATEGORY_COLORS[task.category] || THEME.accent}22`,
                  color: CATEGORY_COLORS[task.category] || THEME.accent,
                  border: 'none',
                }}
              />
              {/* Due date */}
              {task.dueDate && (
                <Chip
                  icon={<CalendarTodayIcon sx={{ fontSize: '0.6rem !important' }} />}
                  label={dayjs(task.dueDate).format('MMM D')}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.65rem',
                    backgroundColor: isOverdue ? THEME.accentSoft : 'rgba(255,255,255,0.06)',
                    color: isOverdue ? THEME.error : THEME.textMuted,
                    border: 'none',
                    '& .MuiChip-icon': {
                      color: isOverdue ? THEME.error : THEME.textMuted,
                    },
                  }}
                />
              )}
              {/* Recurring indicator */}
              {task.recurrence && task.recurrence !== 'none' && (
                <RepeatIcon sx={{ fontSize: '0.75rem', color: THEME.textMuted }} />
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
});

export default function SortableTaskCard({ task, onToggleComplete, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard
        task={task}
        onToggleComplete={onToggleComplete}
        onClick={onClick}
        isDragging={isDragging}
      />
    </div>
  );
}

export { TaskCard };
