import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Divider,
  useMediaQuery,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import { PRIORITIES, RECURRENCE_PATTERNS, THEME } from '../constants';
import { useTaskContext } from '../context/TaskContext';

const defaultFormData = {
  title: '',
  notes: '',
  category: '',
  priority: 'Medium',
  dueDate: null,
  recurrence: 'none',
};

export default function TaskDialog({ open, onClose, editTask, initialDueDate, onDelete }) {
  const { addTask, updateTask, addSubtask, toggleSubtask, deleteSubtask, categories, addCategory, tasks } = useTaskContext();
  const isMobile = useMediaQuery('(max-width:767px)');
  const liveTask = editTask ? tasks.find((task) => task.id === editTask.id) ?? editTask : null;
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    if (!open) return;
    if (editTask) {
      setFormData({
        title: editTask.title || '',
        notes: editTask.notes || '',
        category: editTask.category || categories[0] || '',
        priority: editTask.priority || 'Medium',
        dueDate: editTask.dueDate ? dayjs(editTask.dueDate) : null,
        recurrence: editTask.recurrence || 'none',
      });
    } else {
      setFormData({
        ...defaultFormData,
        category: categories[0] || '',
        dueDate: initialDueDate || null,
      });
    }
    setErrors({});
    setDeleteConfirm(false);
    setNewSubtask('');
    setAddingCategory(false);
    setNewCategoryName('');
  }, [editTask?.id, initialDueDate, open]);

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleDateChange = (value) => {
    setFormData((prev) => ({ ...prev, dueDate: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Title must be 200 characters or fewer';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const taskData = {
      title: formData.title.trim(),
      notes: formData.notes.trim(),
      category: formData.category,
      priority: formData.priority,
      dueDate: formData.dueDate ? formData.dueDate.toISOString() : null,
      recurrence: formData.recurrence,
    };

    if (editTask) {
      updateTask({ ...taskData, id: editTask.id });
    } else {
      addTask(taskData);
    }

    onClose();
  };

  const handleDelete = () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    onDelete(editTask.id);
    onClose();
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim() || !editTask) return;
    addSubtask(editTask.id, newSubtask.trim());
    setNewSubtask('');
  };

  const handleSubtaskKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubtask();
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        aria-labelledby="task-dialog-title"
      >
      <DialogTitle id="task-dialog-title" sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography component="span" variant="h5" sx={{ fontWeight: 600, color: THEME.text, fontSize: '1.4rem' }}>
            {editTask ? 'Edit task' : 'Add task'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {editTask && (
              <IconButton
                color={deleteConfirm ? 'error' : 'default'}
                onClick={handleDelete}
                title={deleteConfirm ? 'Delete task permanently' : 'Delete task'}
                aria-label={deleteConfirm ? 'Confirm permanent task deletion' : 'Delete task'}
                size="small"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
            <IconButton onClick={onClose} size="small" aria-label="Close" sx={{ color: THEME.textSecondary }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        {deleteConfirm && (
          <Typography variant="caption" color="error">
            Delete “{editTask?.title}” permanently? Select delete again.
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Title"
            value={formData.title}
            onChange={handleChange('title')}
            error={!!errors.title}
            helperText={errors.title}
            fullWidth
            autoFocus
            required
            slotProps={{ htmlInput: { maxLength: 200 } }}
          />
          <TextField
            label="Notes"
            value={formData.notes}
            onChange={handleChange('notes')}
            fullWidth
            multiline
            rows={3}
            slotProps={{ htmlInput: { maxLength: 2000 } }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              {addingCategory ? (
                <TextField
                  placeholder="New category name..."
                  value={newCategoryName}
                  onChange={(e) => {
                    setNewCategoryName(e.target.value);
                    if (errors.category) setErrors((prev) => ({ ...prev, category: null }));
                  }}
                  error={!!errors.category}
                  helperText={errors.category}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newCategoryName.trim()) {
                      const success = addCategory(newCategoryName.trim());
                      if (success) {
                        setFormData((prev) => ({ ...prev, category: newCategoryName.trim() }));
                        setNewCategoryName('');
                        setAddingCategory(false);
                      } else {
                        setErrors((prev) => ({ ...prev, category: 'Use a unique category name.' }));
                      }
                    }
                    if (e.key === 'Escape') {
                      setNewCategoryName('');
                      setAddingCategory(false);
                    }
                  }}
                  autoFocus
                  size="small"
                  slotProps={{ htmlInput: { maxLength: 60 } }}
                  sx={{ mt: '6px' }}
                />
              ) : (
                <Select
                  value={formData.category}
                  onChange={(e) => {
                    if (e.target.value === '__ADD_NEW__') {
                      setAddingCategory(true);
                      return;
                    }
                    handleChange('category')(e);
                  }}
                  label="Category"
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                  <MenuItem value="__ADD_NEW__" sx={{ color: THEME.accent, fontStyle: 'italic', fontSize: '0.85rem' }}>
                    Add category…
                  </MenuItem>
                </Select>
              )}
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                onChange={handleChange('priority')}
                label="Priority"
              >
                {PRIORITIES.map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <DatePicker
              label="Due date"
              value={formData.dueDate}
              onChange={handleDateChange}
              slotProps={{
                textField: { fullWidth: true },
                field: { clearable: true },
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Repeat</InputLabel>
              <Select
                value={formData.recurrence}
                onChange={handleChange('recurrence')}
                label="Repeat"
              >
                {RECURRENCE_PATTERNS.map((p) => (
                  <MenuItem key={p.value} value={p.value}>
                    {p.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Subtasks section (only in edit mode) */}
          {editTask && (
            <>
              <Divider sx={{ borderColor: THEME.border, mt: 1 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ color: THEME.textSecondary, mb: 1 }}>
                  Subtasks ({liveTask.subtasks?.filter((s) => s.completed).length || 0}/{liveTask.subtasks?.length || 0})
                </Typography>

                {liveTask.subtasks && liveTask.subtasks.length > 0 && (
                  <List dense sx={{ py: 0, mb: 1 }}>
                    {liveTask.subtasks.map((subtask) => (
                      <ListItem
                        key={subtask.id}
                        sx={{
                          px: 0,
                          py: 0.25,
                          borderRadius: 1,
                        }}
                        secondaryAction={
                          <IconButton
                            size="small"
                            onClick={() => deleteSubtask(editTask.id, subtask.id)}
                            aria-label={`Delete subtask ${subtask.title}`}
                            sx={{ color: THEME.textMuted }}
                          >
                            <CloseIcon sx={{ fontSize: '0.85rem' }} />
                          </IconButton>
                        }
                      >
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Checkbox
                            checked={subtask.completed}
                            onChange={() => toggleSubtask(editTask.id, subtask.id)}
                            size="small"
                            sx={{ p: 0 }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={subtask.title}
                          slotProps={{
                            primary: {
                              variant: 'body2',
                              sx: {
                                textDecoration: subtask.completed ? 'line-through' : 'none',
                                color: subtask.completed ? THEME.textMuted : THEME.text,
                                fontSize: '0.85rem',
                              },
                            },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    placeholder="Add subtask..."
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={handleSubtaskKeyDown}
                    slotProps={{ htmlInput: { maxLength: 200 } }}
                    size="small"
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: '0.85rem',
                      },
                    }}
                  />
                  <IconButton
                    onClick={handleAddSubtask}
                    disabled={!newSubtask.trim()}
                    aria-label="Add subtask"
                    size="small"
                    sx={{
                      backgroundColor: THEME.accentSoft,
                      color: THEME.accent,
                      '&:hover': {
                        backgroundColor: THEME.accentSoft,
                      },
                      '&.Mui-disabled': {
                        color: THEME.textMuted,
                      },
                    }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
        <Button onClick={onClose} sx={{ color: THEME.textSecondary }}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained">
          {editTask ? 'Save changes' : 'Add task'}
        </Button>
      </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
