import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Paper,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import dayjs from 'dayjs';
import { THEME } from '../constants';
import { useHabitContext, SCHEDULE_PRESETS } from '../context/HabitContext';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getScheduleLabel(scheduleDays) {
  const preset = SCHEDULE_PRESETS.find(
    (p) => p.value !== 'custom' && p.days.length === scheduleDays.length && p.days.every((d) => scheduleDays.includes(d))
  );
  if (preset) return preset.label;
  return scheduleDays.map((d) => DAY_LABELS[d]).join('-');
}

/* ---------- Week row: current week with toggleable checkboxes ---------- */
function WeekRow({ habit, weekStart }) {
  const { isHabitDone, toggleHabitDay } = useHabitContext();
  const today = dayjs();

  return (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      {Array.from({ length: 7 }).map((_, i) => {
        const date = weekStart.add(i, 'day');
        const dateStr = date.format('YYYY-MM-DD');
        const isScheduled = habit.scheduleDays.includes(date.day());
        const isDone = isHabitDone(habit.id, dateStr);
        const isPast = date.isBefore(today, 'day') || date.isSame(today, 'day');
        const isFuture = date.isAfter(today, 'day');

        return (
          <Tooltip key={i} title={date.format('ddd MMM D')}>
            <Box
              onClick={() => {
                if (isScheduled && isPast) toggleHabitDay(habit.id, dateStr);
              }}
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isScheduled && isPast ? 'pointer' : 'default',
                backgroundColor: isDone
                  ? THEME.accent
                  : isScheduled
                    ? THEME.surface
                    : 'transparent',
                border: isScheduled
                  ? `1px solid ${isDone ? THEME.accent : THEME.border}`
                  : '1px solid transparent',
                opacity: isFuture ? 0.4 : 1,
                transition: 'all 0.15s ease',
                '&:hover': isScheduled && isPast
                  ? { borderColor: THEME.accent, backgroundColor: isDone ? THEME.accentHover : THEME.accentSoft }
                  : {},
              }}
            >
              {isDone && <CheckIcon sx={{ fontSize: '0.85rem', color: '#fff' }} />}
              {!isDone && isScheduled && (
                <Typography variant="caption" sx={{ fontSize: '0.6rem', color: THEME.textMuted }}>
                  {DAY_LABELS[date.day()]}
                </Typography>
              )}
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}

/* ---------- Mini 4-week streak grid ---------- */
function StreakGrid({ habit }) {
  const { isHabitDone } = useHabitContext();
  const today = dayjs();

  // Last 4 weeks (starting from 4 weeks ago)
  const weeks = [];
  for (let w = 3; w >= 0; w--) {
    const weekStart = today.subtract(w, 'week').startOf('week');
    weeks.push(weekStart);
  }

  return (
    <Box sx={{ display: 'flex', gap: 0.75 }}>
      {weeks.map((weekStart, wi) => (
        <Box key={wi} sx={{ display: 'flex', gap: '2px' }}>
          {Array.from({ length: 7 }).map((_, di) => {
            const date = weekStart.add(di, 'day');
            const dateStr = date.format('YYYY-MM-DD');
            const isScheduled = habit.scheduleDays.includes(date.day());
            const isDone = isHabitDone(habit.id, dateStr);
            const isFuture = date.isAfter(today, 'day');

            return (
              <Box
                key={di}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: 0.5,
                  backgroundColor: isFuture
                    ? 'transparent'
                    : isDone
                      ? THEME.accent
                      : isScheduled
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(255,255,255,0.03)',
                  border: isFuture ? `1px solid ${THEME.border}` : 'none',
                }}
              />
            );
          })}
        </Box>
      ))}
    </Box>
  );
}

/* ---------- Habit Card ---------- */
function HabitCard({ habit }) {
  const { deleteHabit, getCompletionRate } = useHabitContext();
  const currentWeekStart = dayjs().startOf('week');
  const rate = getCompletionRate(habit.id);

  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 3,
        backgroundColor: THEME.surface,
        border: `1px solid ${THEME.border}`,
        mb: 1.5,
      }}
      elevation={0}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: THEME.text, fontSize: '1rem' }}>
            {habit.name}
          </Typography>
          <Chip
            label={getScheduleLabel(habit.scheduleDays)}
            size="small"
            sx={{
              mt: 0.5,
              height: 20,
              fontSize: '0.65rem',
              backgroundColor: THEME.accentSoft,
              color: THEME.accent,
              border: 'none',
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ color: THEME.accent, fontWeight: 600, fontSize: '0.85rem' }}>
            {rate}%
          </Typography>
          <IconButton
            size="small"
            onClick={() => deleteHabit(habit.id)}
            sx={{ color: THEME.textMuted, '&:hover': { color: THEME.error } }}
          >
            <DeleteIcon sx={{ fontSize: '0.9rem' }} />
          </IconButton>
        </Box>
      </Box>

      {/* This week */}
      <Typography variant="caption" sx={{ color: THEME.textMuted, fontSize: '0.65rem', mb: 0.75, display: 'block' }}>
        This Week
      </Typography>
      <WeekRow habit={habit} weekStart={currentWeekStart} />

      {/* 4-week streak */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" sx={{ color: THEME.textMuted, fontSize: '0.6rem', mb: 0.5, display: 'block' }}>
          Last 4 Weeks
        </Typography>
        <StreakGrid habit={habit} />
      </Box>

      {/* Progress bar */}
      <LinearProgress
        variant="determinate"
        value={rate}
        sx={{
          mt: 2,
          height: 4,
          borderRadius: 2,
          backgroundColor: 'rgba(255,255,255,0.08)',
          '& .MuiLinearProgress-bar': {
            borderRadius: 2,
            backgroundColor: THEME.accent,
          },
        }}
      />
    </Paper>
  );
}

/* ---------- Add Habit Form ---------- */
function AddHabitForm({ onClose }) {
  const { addHabit } = useHabitContext();
  const [name, setName] = useState('');
  const [preset, setPreset] = useState('everyday');
  const [customDays, setCustomDays] = useState([]);

  const selectedPreset = SCHEDULE_PRESETS.find((p) => p.value === preset);
  const scheduleDays = preset === 'custom' ? customDays : selectedPreset.days;

  const handleSubmit = () => {
    if (!name.trim() || scheduleDays.length === 0) return;
    addHabit(name.trim(), scheduleDays);
    onClose();
  };

  const toggleCustomDay = (day) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        backgroundColor: THEME.surface,
        border: `1px solid ${THEME.borderStrong}`,
        mb: 2,
      }}
      elevation={0}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: THEME.text, mb: 2 }}>
        New Habit
      </Typography>

      <TextField
        placeholder="Habit name (e.g. Lift weights)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        fullWidth
        size="small"
        autoFocus
        sx={{ mb: 2 }}
      />

      <Typography variant="caption" sx={{ color: THEME.textMuted, fontSize: '0.7rem', mb: 1, display: 'block' }}>
        Schedule
      </Typography>

      <ToggleButtonGroup
        value={preset}
        exclusive
        onChange={(e, val) => val && setPreset(val)}
        size="small"
        sx={{
          mb: 1.5,
          flexWrap: 'wrap',
          '& .MuiToggleButton-root': {
            border: `1px solid ${THEME.border}`,
            color: THEME.textSecondary,
            fontSize: '0.72rem',
            px: 1.5,
            py: 0.5,
            textTransform: 'none',
            '&.Mui-selected': {
              backgroundColor: THEME.accentSoft,
              color: THEME.accent,
              borderColor: THEME.accentSoftBorder,
            },
          },
        }}
      >
        {SCHEDULE_PRESETS.map((p) => (
          <ToggleButton key={p.value} value={p.value}>
            {p.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {/* Custom day selector */}
      {preset === 'custom' && (
        <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5 }}>
          {DAY_FULL.map((label, i) => (
            <Box
              key={i}
              onClick={() => toggleCustomDay(i)}
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '0.7rem',
                fontWeight: 600,
                backgroundColor: customDays.includes(i) ? THEME.accent : THEME.bg,
                color: customDays.includes(i) ? '#fff' : THEME.textSecondary,
                border: `1px solid ${customDays.includes(i) ? THEME.accent : THEME.border}`,
                transition: 'all 0.15s ease',
              }}
            >
              {DAY_LABELS[i]}
            </Box>
          ))}
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button size="small" onClick={onClose} sx={{ color: THEME.textSecondary, textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={handleSubmit}
          disabled={!name.trim() || scheduleDays.length === 0}
          sx={{ textTransform: 'none' }}
        >
          Add Habit
        </Button>
      </Box>
    </Paper>
  );
}

/* ---------- Main HabitView ---------- */
export default function HabitView() {
  const { habits } = useHabitContext();
  const [showForm, setShowForm] = useState(false);

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, flex: 1, overflow: 'auto', maxWidth: 640, mx: 'auto', width: '100%' }}>
      {/* Add button */}
      {!showForm && (
        <Button
          startIcon={<AddIcon />}
          onClick={() => setShowForm(true)}
          sx={{
            mb: 2.5,
            color: THEME.accent,
            border: `1px dashed ${THEME.accentSoftBorder}`,
            borderRadius: 2.5,
            px: 2,
            textTransform: 'none',
            '&:hover': { backgroundColor: THEME.accentSoft },
          }}
        >
          Add Habit
        </Button>
      )}

      {showForm && <AddHabitForm onClose={() => setShowForm(false)} />}

      {/* Habits list */}
      {habits.length === 0 && !showForm && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
          <Typography variant="body2" sx={{ color: THEME.textMuted }}>
            No habits yet. Add one to start tracking!
          </Typography>
        </Box>
      )}

      {habits.map((habit) => (
        <HabitCard key={habit.id} habit={habit} />
      ))}
    </Box>
  );
}
