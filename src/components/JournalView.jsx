import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Autocomplete,
  Chip,
  IconButton,
  Button,
  ButtonBase,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PeopleIcon from '@mui/icons-material/People';
import dayjs from 'dayjs';
import { THEME } from '../constants';
import { useJournalContext } from '../context/JournalContext';

/* -------------------------------------------------------------------------- */
/*  Monthly Overview (top-right panel)                                         */
/* -------------------------------------------------------------------------- */

function JournalMonthlyOverview({ onDateSelect }) {
  const { entries } = useJournalContext();
  const [viewMonth, setViewMonth] = useState(dayjs().startOf('month'));

  const daysInMonth = viewMonth.daysInMonth();
  const startDay = viewMonth.day(); // 0=Sun

  const prevMonth = () => setViewMonth((m) => m.subtract(1, 'month'));
  const nextMonth = () => setViewMonth((m) => m.add(1, 'month'));

  const hasEntry = (dateStr) => {
    const entry = entries[dateStr];
    if (!entry) return false;
    return (entry.dump && entry.dump.trim().length > 0) || (entry.people && entry.people.length > 0);
  };

  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Build calendar cells
  const cells = [];
  // Empty cells for offset
  for (let i = 0; i < startDay; i++) {
    cells.push(<Box key={`empty-${i}`} />);
  }
  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = viewMonth.date(d).format('YYYY-MM-DD');
    const highlighted = hasEntry(dateStr);
    cells.push(
      <ButtonBase
        key={d}
        className="calendar-day"
        onClick={() => onDateSelect(dateStr)}
        aria-label={`${highlighted ? 'Open journal entry for' : 'Open'} ${viewMonth.date(d).format('MMMM D, YYYY')}`}
        sx={{
          width: '100%',
          minWidth: 0,
          minHeight: 44,
          height: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          cursor: 'pointer',
          fontSize: '0.72rem',
          fontWeight: highlighted ? 600 : 400,
          color: highlighted ? THEME.onAccent : THEME.textSecondary,
          backgroundColor: highlighted ? THEME.accent : 'transparent',
          '&:hover': {
            backgroundColor: highlighted ? THEME.accentHover : THEME.surfaceHover,
          },
        }}
      >
        {d}
      </ButtonBase>
    );
  }

  return (
    <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
      {/* Month navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <IconButton size="small" onClick={prevMonth} aria-label="Previous month" sx={{ color: THEME.textSecondary }}>
          <ChevronLeftIcon fontSize="small" />
        </IconButton>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: THEME.text, fontSize: '0.85rem' }}>
          {viewMonth.format('MMMM YYYY')}
        </Typography>
        <IconButton size="small" onClick={nextMonth} aria-label="Next month" sx={{ color: THEME.textSecondary }}>
          <ChevronRightIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Day headers */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 0.5 }}>
        {dayHeaders.map((h) => (
          <Typography
            key={h}
            variant="caption"
            sx={{
              textAlign: 'center',
              color: THEME.textMuted,
              fontSize: '0.6rem',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            {h.charAt(0)}
          </Typography>
        ))}
      </Box>

      {/* Calendar grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, justifyItems: 'center' }}>
        {cells}
      </Box>
    </Box>
  );
}

/* -------------------------------------------------------------------------- */
/*  People Section (bottom-right panel)                                        */
/* -------------------------------------------------------------------------- */

function JournalPeopleSection({ onDateSelect }) {
  const { getAllPeople, getEntriesForPerson } = useJournalContext();
  const [expandedPerson, setExpandedPerson] = useState(null);

  const allPeople = getAllPeople();

  const handlePersonClick = (name) => {
    setExpandedPerson((prev) => (prev === name ? null : name));
  };

  return (
    <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <PeopleIcon sx={{ color: THEME.textMuted, fontSize: '1.1rem' }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: THEME.text, fontSize: '0.85rem' }}>
          People mentioned
        </Typography>
      </Box>

      {allPeople.length === 0 && (
        <Typography variant="body2" sx={{ color: THEME.textMuted, fontSize: '0.8rem' }}>
          No one mentioned in an entry yet.
        </Typography>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {allPeople.map((person) => {
          const isExpanded = expandedPerson === person;
          const dates = isExpanded ? getEntriesForPerson(person) : [];

          return (
            <Box key={person}>
              <Chip
                label={person}
                onClick={() => handlePersonClick(person)}
                sx={{
                  backgroundColor: isExpanded ? THEME.accentSoft : THEME.surfaceHover,
                  color: isExpanded ? THEME.accent : THEME.textSecondary,
                  border: isExpanded ? `1px solid ${THEME.accentSoftBorder}` : `1px solid ${THEME.border}`,
                  fontWeight: isExpanded ? 600 : 400,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: THEME.accentSoft,
                  },
                }}
                size="small"
              />
              {isExpanded && dates.length > 0 && (
                <Box sx={{ pl: 2, pt: 0.5, pb: 0.5 }}>
                  {dates.map((date) => (
                    <ButtonBase
                      key={date}
                      onClick={() => onDateSelect(date)}
                      sx={{
                        display: 'block',
                        width: '100%',
                        justifyContent: 'flex-start',
                        color: THEME.blue,
                        cursor: 'pointer',
                        py: 0.25,
                        fontSize: '0.72rem',
                        '&:hover': {
                          color: THEME.accent,
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      {dayjs(date).format('MMM D, YYYY (ddd)')}
                    </ButtonBase>
                  ))}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main JournalView                                                           */
/* -------------------------------------------------------------------------- */

export default function JournalView({ initialDate }) {
  const { getEntry, saveEntry, getAllPeople, storageError, lastSavedAt } = useJournalContext();
  const [currentDate, setCurrentDate] = useState(
    initialDate ? dayjs(initialDate) : dayjs()
  );
  const [dump, setDump] = useState('');
  const [people, setPeople] = useState([]);
  const [peopleInput, setPeopleInput] = useState('');
  const [saveStatus, setSaveStatus] = useState('saved');
  const saveTimerRef = useRef(null);
  const pendingSaveRef = useRef(null);

  const dateStr = currentDate.format('YYYY-MM-DD');
  const allPeople = getAllPeople();

  // Load entry when date changes
  useEffect(() => {
    const entry = getEntry(dateStr);
    setDump(entry.dump);
    setPeople(entry.people);
    setSaveStatus('saved');
  }, [dateStr, getEntry]);

  // Update date if initialDate prop changes (from calendar zoom)
  useEffect(() => {
    if (initialDate) {
      setCurrentDate(dayjs(initialDate));
    }
  }, [initialDate]);

  // Auto-save with debounce
  const scheduleSave = useCallback((newDump, newPeople) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    pendingSaveRef.current = { date: dateStr, dump: newDump, people: newPeople };
    setSaveStatus('saving');
    saveTimerRef.current = setTimeout(() => {
      saveEntry(dateStr, { dump: newDump, people: newPeople });
      pendingSaveRef.current = null;
    }, 500);
  }, [dateStr, saveEntry]);

  useEffect(() => {
    if (storageError) {
      setSaveStatus('error');
    } else if (lastSavedAt) {
      setSaveStatus('saved');
    }
  }, [storageError, lastSavedAt]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      const pending = pendingSaveRef.current;
      if (pending) {
        saveEntry(pending.date, { dump: pending.dump, people: pending.people });
        pendingSaveRef.current = null;
      }
    };
  }, [saveEntry]);

  const handleDumpChange = (e) => {
    const val = e.target.value;
    setDump(val);
    scheduleSave(val, people);
  };

  const handlePeopleChange = (event, newValue) => {
    setPeople(newValue);
    scheduleSave(dump, newValue);
  };

  const navigateBack = () => setCurrentDate((d) => d.subtract(1, 'day'));
  const navigateForward = () => setCurrentDate((d) => d.add(1, 'day'));
  const goToToday = () => setCurrentDate(dayjs());

  const handleDateSelect = (dateString) => {
    setCurrentDate(dayjs(dateString));
  };

  const isToday = currentDate.isSame(dayjs(), 'day');

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' }, gap: { xs: 2, md: 3 }, height: '100%', p: { xs: 2, md: 3 }, overflow: 'auto' }}>
      {/* Left Panel — Daily Entry */}
      <Box sx={{ overflow: { xs: 'visible', md: 'auto' }, maxWidth: 720 }}>
        {/* Date navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          <IconButton onClick={navigateBack} size="small" aria-label="Previous day" sx={{ color: THEME.textSecondary }}>
            <ChevronLeftIcon />
          </IconButton>
          <Box sx={{ textAlign: 'center', minWidth: { xs: 140, sm: 180 } }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: THEME.text, lineHeight: 1.2 }}>
              {currentDate.format('dddd')}
            </Typography>
            <Typography variant="body2" sx={{ color: THEME.textSecondary, fontSize: '0.85rem' }}>
              {currentDate.format('MMMM D, YYYY')}
            </Typography>
          </Box>
          <IconButton onClick={navigateForward} size="small" aria-label="Next day" sx={{ color: THEME.textSecondary }}>
            <ChevronRightIcon />
          </IconButton>
          {!isToday && (
            <Button
              size="small"
              onClick={goToToday}
              sx={{
                ml: 1,
                fontSize: '0.72rem',
                color: THEME.accent,
                textTransform: 'none',
                border: `1px solid ${THEME.accentSoftBorder}`,
                borderRadius: 2,
                px: 1.5,
                '&:hover': { backgroundColor: THEME.accentSoft },
              }}
            >
              Today
            </Button>
          )}
        </Box>

        {/* Dump section */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: THEME.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontSize: '0.7rem',
              mb: 1,
            }}
          >
            Daily notes
          </Typography>
          <TextField
            value={dump}
            onChange={handleDumpChange}
            placeholder="Thoughts, reflections, and anything worth remembering..."
            multiline
            minRows={6}
            maxRows={16}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: THEME.surface,
                fontSize: '0.9rem',
                lineHeight: 1.7,
              },
            }}
          />
          <Typography
            role="status"
            aria-live="polite"
            variant="caption"
            sx={{
              display: 'block',
              mt: 0.75,
              color: saveStatus === 'error'
                ? THEME.error
                : saveStatus === 'saving'
                  ? THEME.textMuted
                  : THEME.green,
              fontSize: '0.72rem',
            }}
          >
            {saveStatus === 'error'
              ? 'Could not save this entry on this device.'
              : saveStatus === 'saving'
                ? 'Saving locally…'
                : 'Saved locally on this device'}
          </Typography>
        </Box>

        {/* People autocomplete */}
        <Box>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: THEME.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontSize: '0.7rem',
              mb: 1,
            }}
          >
            People in this entry
          </Typography>
          <Autocomplete
            multiple
            freeSolo
            value={people}
            onChange={handlePeopleChange}
            inputValue={peopleInput}
            onInputChange={(e, val) => setPeopleInput(val)}
            options={allPeople.filter((p) => !people.includes(p))}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const { key, ...tagProps } = getTagProps({ index });
                return (
                  <Chip
                    key={key}
                    label={option}
                    size="small"
                    {...tagProps}
                    sx={{
                      backgroundColor: THEME.accentSoft,
                      color: THEME.accent,
                      borderRadius: 2,
                      '& .MuiChip-deleteIcon': { color: THEME.accent },
                    }}
                  />
                );
              })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={people.length === 0 ? 'Add someone from today…' : 'Add another person…'}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: THEME.surface,
                    fontSize: '0.85rem',
                  },
                }}
              />
            )}
          />
        </Box>
      </Box>

      {/* Right Panel — Monthly Overview + People */}
      <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', gap: 2 }}>
        {/* Top half: Monthly Overview */}
        <Box
          sx={{
            flex: 1,
            overflow: 'hidden',
            borderRadius: 3,
            backgroundColor: THEME.surface,
            border: `1px solid ${THEME.border}`,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <JournalMonthlyOverview onDateSelect={handleDateSelect} />
        </Box>

        {/* Bottom half: People Section */}
        <Box
          sx={{
            flex: 1,
            overflow: 'hidden',
            borderRadius: 3,
            backgroundColor: THEME.surface,
            border: `1px solid ${THEME.border}`,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <JournalPeopleSection onDateSelect={handleDateSelect} />
        </Box>
      </Box>
    </Box>
  );
}
