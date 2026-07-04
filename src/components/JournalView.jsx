import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Autocomplete,
  Chip,
  IconButton,
  Button,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import dayjs from 'dayjs';
import { THEME } from '../constants';
import { useJournalContext } from '../context/JournalContext';

export default function JournalView({ initialDate }) {
  const { getEntry, saveEntry, getAllPeople } = useJournalContext();
  const [currentDate, setCurrentDate] = useState(
    initialDate ? dayjs(initialDate) : dayjs()
  );
  const [dump, setDump] = useState('');
  const [people, setPeople] = useState([]);
  const [peopleInput, setPeopleInput] = useState('');
  const saveTimerRef = useRef(null);

  const dateStr = currentDate.format('YYYY-MM-DD');
  const allPeople = getAllPeople();

  // Load entry when date changes
  useEffect(() => {
    const entry = getEntry(dateStr);
    setDump(entry.dump);
    setPeople(entry.people);
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
    saveTimerRef.current = setTimeout(() => {
      saveEntry(dateStr, { dump: newDump, people: newPeople });
    }, 500);
  }, [dateStr, saveEntry]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

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

  const isToday = currentDate.isSame(dayjs(), 'day');

  return (
    <Box sx={{ p: 3, flex: 1, overflow: 'auto', maxWidth: 720, mx: 'auto', width: '100%' }}>
      {/* Date navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 3 }}>
        <IconButton onClick={navigateBack} size="small" sx={{ color: THEME.textSecondary }}>
          <ChevronLeftIcon />
        </IconButton>
        <Box sx={{ textAlign: 'center', minWidth: 180 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: THEME.text, lineHeight: 1.2 }}>
            {currentDate.format('dddd')}
          </Typography>
          <Typography variant="body2" sx={{ color: THEME.textSecondary, fontSize: '0.85rem' }}>
            {currentDate.format('MMMM D, YYYY')}
          </Typography>
        </Box>
        <IconButton onClick={navigateForward} size="small" sx={{ color: THEME.textSecondary }}>
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
          Dump
        </Typography>
        <TextField
          value={dump}
          onChange={handleDumpChange}
          placeholder="Brain dump, thoughts, reflections..."
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
      </Box>

      {/* People section */}
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
          People
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
              placeholder={people.length === 0 ? 'Add people you interacted with...' : 'Add more...'}
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
  );
}
