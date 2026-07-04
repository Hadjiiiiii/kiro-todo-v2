import { Box, Typography, Paper } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningIcon from '@mui/icons-material/Warning';
import { CATEGORY_COLORS, THEME } from '../constants';
import { useTaskContext } from '../context/TaskContext';

function StatCard({ icon, label, value, color, subtitle }) {
  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 3,
        backgroundColor: THEME.surface,
        border: `1px solid ${THEME.border}`,
        flex: 1,
        minWidth: 160,
      }}
      elevation={0}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography
            variant="caption"
            sx={{ color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}
          >
            {label}
          </Typography>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: color || THEME.text, mt: 0.5, letterSpacing: '-0.02em' }}
          >
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: THEME.textMuted, fontSize: '0.7rem' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            backgroundColor: `${color || THEME.accent}1f`,
          }}
        >
          {icon}
        </Box>
      </Box>
    </Paper>
  );
}

function WeeklyChart({ weekDays }) {
  const maxCount = Math.max(...weekDays.map((d) => d.count), 1);

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        backgroundColor: THEME.surface,
        border: `1px solid ${THEME.border}`,
      }}
      elevation={0}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: THEME.text, mb: 2 }}>
        This Week
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height: 120 }}>
        {weekDays.map((day, i) => (
          <Box key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: '100%',
                maxWidth: 32,
                height: day.count > 0 ? `${(day.count / maxCount) * 80}px` : '4px',
                minHeight: 4,
                borderRadius: 1.5,
                backgroundColor: day.count > 0 ? THEME.accent : 'rgba(255, 255, 255, 0.08)',
                transition: 'height 0.3s ease',
              }}
            />
            <Typography variant="caption" sx={{ color: THEME.textMuted, fontSize: '0.6rem' }}>
              {day.day}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

function CategoryChart({ byCategory }) {
  const entries = Object.entries(byCategory);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        backgroundColor: THEME.surface,
        border: `1px solid ${THEME.border}`,
      }}
      elevation={0}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: THEME.text, mb: 2 }}>
        By Category
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {entries.map(([category, count]) => {
          const percentage = total > 0 ? (count / total) * 100 : 0;
          const color = CATEGORY_COLORS[category] || THEME.accent;

          return (
            <Box key={category}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: THEME.textSecondary, fontSize: '0.75rem' }}>
                  {category}
                </Typography>
                <Typography variant="caption" sx={{ color: THEME.textMuted, fontSize: '0.75rem' }}>
                  {count}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: '100%',
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    width: `${percentage}%`,
                    height: '100%',
                    borderRadius: 3,
                    backgroundColor: color,
                    transition: 'width 0.4s ease',
                  }}
                />
              </Box>
            </Box>
          );
        })}
        {entries.length === 0 && (
          <Typography variant="body2" sx={{ color: THEME.textMuted, textAlign: 'center', py: 2 }}>
            No data yet
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

function CompletionRing({ rate }) {
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (rate / 100) * circumference;

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        backgroundColor: THEME.surface,
        border: `1px solid ${THEME.border}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      elevation={0}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: THEME.text, mb: 2, alignSelf: 'flex-start' }}>
        Completion Rate
      </Typography>
      <Box sx={{ position: 'relative', width: 100, height: 100 }}>
        <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="url(#completionGradient)"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
          <defs>
            <linearGradient id="completionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={THEME.accentHover} />
              <stop offset="100%" stopColor={THEME.accent} />
            </linearGradient>
          </defs>
        </svg>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: THEME.text, lineHeight: 1 }}>
            {rate}%
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default function StatsDashboard() {
  const { stats } = useTaskContext();

  return (
    <Box sx={{ p: 3, flex: 1, overflow: 'auto' }}>
      {/* Top stat cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <StatCard
          icon={<AssignmentIcon sx={{ color: THEME.accent, fontSize: '1.25rem' }} />}
          label="Total Tasks"
          value={stats.total}
          color={THEME.accent}
        />
        <StatCard
          icon={<CheckCircleIcon sx={{ color: THEME.green, fontSize: '1.25rem' }} />}
          label="Completed"
          value={stats.completed}
          color={THEME.green}
          subtitle={`${stats.completedThisWeek} this week`}
        />
        <StatCard
          icon={<TrendingUpIcon sx={{ color: THEME.warning, fontSize: '1.25rem' }} />}
          label="Active"
          value={stats.active}
          color={THEME.warning}
        />
        <StatCard
          icon={<WarningIcon sx={{ color: THEME.error, fontSize: '1.25rem' }} />}
          label="Overdue"
          value={stats.overdue}
          color={THEME.error}
        />
      </Box>

      {/* Charts row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
        <WeeklyChart weekDays={stats.weekDays} />
        <CategoryChart byCategory={stats.byCategory} />
        <CompletionRing rate={stats.completionRate} />
      </Box>
    </Box>
  );
}
