import { forwardRef } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Checkbox,
  LinearProgress,
  IconButton,
  ButtonBase,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RepeatIcon from '@mui/icons-material/Repeat';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import dayjs from 'dayjs';
import { PRIORITY_COLORS, CATEGORY_COLORS, THEME, TASK_CARD_HOVER_ZOOM } from '../constants';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const TaskCard = forwardRef(function TaskCard(
  {
    task,
    onToggleComplete,
    onClick,
    isDragging,
    dragAttributes,
    dragListeners,
    style,
  },
  ref
) {
  const isOverdue =
    task.dueDate && !task.completed && dayjs(task.dueDate).isBefore(dayjs(), 'day');

  const subtaskCount = task.subtasks?.length || 0;
  const subtaskDone = task.subtasks?.filter((s) => s.completed).length || 0;
  const subtaskProgress = subtaskCount > 0 ? (subtaskDone / subtaskCount) * 100 : 0;
  const titleId = `task-title-${task.id}`;
  const canDrag = Boolean(dragListeners);

  return (
    <Card
      ref={ref}
      style={style}
      component="article"
      aria-labelledby={titleId}
      data-dragging={isDragging}
      className="card-reveal"
      sx={{
        mb: 1,
        opacity: isDragging ? 0.5 : task.completed ? 0.5 : 1,
        transform: isDragging ? 'rotate(2deg)' : 'none',
        backgroundColor: THEME.surface,
        border: `1px solid ${THEME.border}`,
        borderRadius: '12px',
        boxShadow: 'none',
        ...TASK_CARD_HOVER_ZOOM,
      }}
    >
      <Box
        className="task-card-zoom"
        sx={{
          transformOrigin: 'center center',
          transition: 'transform 0.2s ease',
        }}
      >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
          <Checkbox
            checked={task.completed}
            disabled={isDragging}
            onChange={() => onToggleComplete(task.id)}
            aria-label={`${task.completed ? 'Mark incomplete' : 'Mark complete'}: ${task.title}`}
            size="small"
            slotProps={{
              input: {
                'aria-label': `${task.completed ? 'Mark incomplete' : 'Mark complete'}: ${task.title}`,
              },
            }}
            sx={{
              p: 0.5,
              mt: -0.5,
              ml: -0.5,
              flexShrink: 0,
              '@media (pointer: coarse)': { p: 1.25 },
            }}
          />
          <ButtonBase
            onClick={() => onClick(task)}
            aria-label={`Open task ${task.title}`}
            disabled={isDragging}
            sx={{
              flex: 1,
              minWidth: 0,
              display: 'block',
              textAlign: 'left',
              py: 0.25,
              borderRadius: 1,
              '@media (pointer: coarse)': { minHeight: 44 },
            }}
          >
            <Typography
              id={titleId}
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

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
              <Box
                role="img"
                aria-label={`${task.priority} priority`}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: PRIORITY_COLORS[task.priority],
                }}
              />
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
              {task.recurrence && task.recurrence !== 'none' && (
                <RepeatIcon titleAccess={`Repeats ${task.recurrence}`} sx={{ fontSize: '0.75rem', color: THEME.textMuted }} />
              )}
            </Box>
          </ButtonBase>
          {canDrag && (
            <IconButton
              {...dragAttributes}
              {...dragListeners}
              aria-label={`Move task ${task.title}`}
              sx={{
                color: THEME.textMuted,
                cursor: 'grab',
                touchAction: 'none',
                flexShrink: 0,
                mt: -0.5,
                mr: -0.5,
              }}
            >
              <DragIndicatorIcon sx={{ fontSize: '1.1rem' }} />
            </IconButton>
          )}
        </Box>
      </CardContent>
      </Box>
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
  } = useSortable({ id: task.id, data: { title: task.title } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TaskCard
      ref={setNodeRef}
      style={style}
      task={task}
      onToggleComplete={onToggleComplete}
      onClick={onClick}
      isDragging={isDragging}
      dragAttributes={attributes}
      dragListeners={listeners}
    />
  );
}

export { TaskCard };
