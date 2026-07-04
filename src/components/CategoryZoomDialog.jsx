import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Checkbox,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { THEME, getCategoryColor } from '../constants';

export default function CategoryZoomDialog({
  open,
  onClose,
  category,
  tasks,
  onToggleComplete,
  onTaskClick,
  onAddTask,
  categories,
}) {
  if (!category) return null;

  const color = getCategoryColor(category, categories);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: color,
            }}
          />
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: THEME.text }}
          >
            {category}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: THEME.textMuted, ml: 1 }}
          >
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        {tasks.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              py: 6,
            }}
          >
            <Typography variant="body2" sx={{ color: THEME.textMuted }}>
              No tasks in this category
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {tasks.map((task) => (
              <ListItem key={task.id} disablePadding divider>
                <ListItemIcon sx={{ minWidth: 42, pl: 1 }}>
                  <Checkbox
                    edge="start"
                    checked={task.completed}
                    onChange={() => onToggleComplete(task.id)}
                    sx={{
                      color: THEME.textMuted,
                      '&.Mui-checked': { color: THEME.accent },
                    }}
                  />
                </ListItemIcon>
                <ListItemButton onClick={() => onTaskClick(task)} sx={{ py: 1.5 }}>
                  <ListItemText
                    primary={task.title}
                    primaryTypographyProps={{
                      sx: {
                        color: task.completed ? THEME.textMuted : THEME.text,
                        textDecoration: task.completed ? 'line-through' : 'none',
                        fontSize: '0.9rem',
                      },
                    }}
                    secondary={task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : null}
                    secondaryTypographyProps={{
                      sx: { color: THEME.textMuted, fontSize: '0.75rem' },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          startIcon={<AddIcon />}
          onClick={() => {
            onAddTask();
            onClose();
          }}
          sx={{
            color: THEME.accent,
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          Add Task
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose} sx={{ color: THEME.textSecondary, textTransform: 'none' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
