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
} from '@mui/material';
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

export default function TaskDialog({ open, onClose, editTask, onDelete }) {
  const { addTask, updateTask, addSubtask, toggleSubtask, deleteSubtask, categories, addCategory } = useTaskContext();
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
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
      setFormData({ ...defaultFormData, category: categories[0] || '' });
    }
    setErrors({});
    setDeleteConfirm(false);
    setNewSubtask('');
  }, [editTask, open, categories]);

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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: THEME.text, fontSize: '1.4rem' }}>
            {editTask ? 'Edit Task' : 'New Task'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {editTask && (
              <IconButton
                color={deleteConfirm ? 'error' : 'default'}
                onClick={handleDelete}
                title={deleteConfirm ? 'Click again to confirm delete' : 'Delete task'}
                size="small"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
            <IconButton onClick={onClose} size="small" sx={{ color: THEME.textSecondary }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        {deleteConfirm && (
          <Typography variant="caption" color="error">
            Click delete again to confirm
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
          />
          <TextField
            label="Notes"
            value={formData.notes}
            onChange={handleChange('notes')}
            fullWidth
            multiline
            rows={3}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              {addingCategory ? (
                <TextField
                  placeholder="New category name..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newCategoryName.trim()) {
                      const success = addCategory(newCategoryName.trim());
                      if (success) {
                        setFormData((prev) => ({ ...prev, category: newCategoryName.trim() }));
                      }
                      setNewCategoryName('');
                      setAddingCategory(false);
                    }
                    if (e.key === 'Escape') {
                      setNewCategoryName('');
                      setAddingCategory(false);
                    }
                  }}
                  autoFocus
                  size="small"
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
                    + Add new...
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
              label="Due Date"
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
                  Subtasks ({editTask.subtasks?.filter((s) => s.completed).length || 0}/{editTask.subtasks?.length || 0})
                </Typography>

                {editTask.subtasks && editTask.subtasks.length > 0 && (
                  <List dense sx={{ py: 0, mb: 1 }}>
                    {editTask.subtasks.map((subtask) => (
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
                          primaryTypographyProps={{
                            variant: 'body2',
                            sx: {
                              textDecoration: subtask.completed ? 'line-through' : 'none',
                              color: subtask.completed ? THEME.textMuted : THEME.text,
                              fontSize: '0.85rem',
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
          {editTask ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
