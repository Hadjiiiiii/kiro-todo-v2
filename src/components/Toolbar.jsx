import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  InputAdornment,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { PRIORITIES, THEME } from '../constants';
import ViewSwitcher from './ViewSwitcher';

const DUE_DATE_FILTERS = ['All', 'Overdue', 'Today', 'This Week'];

export default function Toolbar({
  searchQuery,
  onSearchChange,
  priorityFilter,
  onPriorityFilterChange,
  dueDateFilter,
  onDueDateFilterChange,
  showCompleted,
  onShowCompletedChange,
  currentView,
  onViewChange,
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 4,
        py: 2,
        flexWrap: 'wrap',
        borderBottom: `1px solid ${THEME.border}`,
        backgroundColor: THEME.bg,
      }}
    >
      <TextField
        placeholder="Search tasks..."
        size="small"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{
          minWidth: 200,
          flex: { xs: '1 1 100%', sm: '0 1 auto' },
          '& .MuiOutlinedInput-root': {
            fontSize: '0.875rem',
            backgroundColor: THEME.surface,
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" sx={{ color: THEME.textMuted }} />
            </InputAdornment>
          ),
        }}
      />
      <FormControl size="small" sx={{ minWidth: 110 }}>
        <InputLabel sx={{ fontSize: '0.875rem' }}>Priority</InputLabel>
        <Select
          value={priorityFilter}
          onChange={(e) => onPriorityFilterChange(e.target.value)}
          label="Priority"
          sx={{ fontSize: '0.875rem', backgroundColor: THEME.surface }}
        >
          <MenuItem value="All">All</MenuItem>
          {PRIORITIES.map((p) => (
            <MenuItem key={p} value={p}>
              {p}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel sx={{ fontSize: '0.875rem' }}>Due Date</InputLabel>
        <Select
          value={dueDateFilter}
          onChange={(e) => onDueDateFilterChange(e.target.value)}
          label="Due Date"
          sx={{ fontSize: '0.875rem', backgroundColor: THEME.surface }}
        >
          {DUE_DATE_FILTERS.map((f) => (
            <MenuItem key={f} value={f}>
              {f}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControlLabel
        control={
          <Switch
            checked={showCompleted}
            onChange={(e) => onShowCompletedChange(e.target.checked)}
            size="small"
          />
        }
        label={
          <Typography variant="caption" sx={{ color: THEME.textSecondary, fontSize: '0.78rem' }}>
            Completed
          </Typography>
        }
        sx={{ mx: 0 }}
      />
      <Box sx={{ ml: 'auto' }}>
        <ViewSwitcher currentView={currentView} onViewChange={onViewChange} />
      </Box>
    </Box>
  );
}
