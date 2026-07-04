import { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Paper,
  IconButton,
  TextField,
  InputAdornment,
  Tooltip,
  Button,
  Fab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useMediaQuery,
} from '@mui/material';
import {
  DndContext,
  closestCorners,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { THEME, getCategoryColor } from '../constants';
import { useTaskContext } from '../context/TaskContext';
import SortableTaskCard, { TaskCard } from './TaskCard';
import CategoryZoomDialog from './CategoryZoomDialog';

function KanbanColumn({ category, tasks, onToggleComplete, onTaskClick, onDelete, categories, onColumnClick }) {
  const { setNodeRef, isOver } = useDroppable({ id: category });
  const color = getCategoryColor(category, categories);

  return (
    <Paper
      sx={{
        flex: 1,
        minWidth: 280,
        backgroundColor: isOver ? THEME.accentSoft : THEME.surface,
        border: isOver
          ? `1px solid ${THEME.accentSoftBorder}`
          : `1px solid ${THEME.border}`,
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease',
        overflow: 'hidden',
      }}
      elevation={0}
    >
      <Box
        sx={{
          p: 2,
          pb: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${THEME.border}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: color,
            }}
          />
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, color: THEME.text, fontSize: '0.85rem' }}
          >
            {category}
          </Typography>
          <Chip
            label={tasks.length}
            size="small"
            sx={{
              height: 18,
              fontSize: '0.65rem',
              fontWeight: 600,
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              color: THEME.textSecondary,
              border: 'none',
            }}
          />
        </Box>
        {onDelete && (
          <Tooltip title={`Remove "${category}" column`}>
            <IconButton
              size="small"
              onClick={() => onDelete(category)}
              sx={{
                color: THEME.textMuted,
                width: 24,
                height: 24,
                '&:hover': { color: THEME.error },
              }}
            >
              <CloseIcon sx={{ fontSize: '0.85rem' }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Box
        ref={setNodeRef}
        onClick={(e) => {
          if (e.target === e.currentTarget && onColumnClick) {
            onColumnClick(category);
          }
        }}
        sx={{
          flex: 1,
          p: 1,
          minHeight: 100,
          overflowY: 'auto',
        }}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 80,
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: THEME.textMuted, fontSize: '0.8rem' }}
              >
                No tasks
              </Typography>
            </Box>
          ) : (
            tasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onClick={onTaskClick}
              />
            ))
          )}
        </SortableContext>
      </Box>
    </Paper>
  );
}

function AddColumnButton({ onAdd }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (name.trim()) {
      const success = onAdd(name.trim());
      if (success) {
        setName('');
        setAdding(false);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') { setAdding(false); setName(''); }
  };

  if (adding) {
    return (
      <Paper
        sx={{
          minWidth: 280,
          maxWidth: 380,
          backgroundColor: THEME.surface,
          border: `1px solid ${THEME.border}`,
          borderRadius: 3,
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
        elevation={0}
      >
        <TextField
          placeholder="Column name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': { fontSize: '0.875rem' },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleSubmit} disabled={!name.trim()}>
                  <AddIcon fontSize="small" sx={{ color: name.trim() ? THEME.accent : THEME.textMuted }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Typography
          variant="caption"
          sx={{ color: THEME.textMuted, fontSize: '0.7rem', cursor: 'pointer' }}
          onClick={() => { setAdding(false); setName(''); }}
        >
          Cancel
        </Typography>
      </Paper>
    );
  }

  return (
    <Box
      onClick={() => setAdding(true)}
      sx={{
        minWidth: 240,
        height: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        borderRadius: 3,
        border: `1px dashed ${THEME.border}`,
        cursor: 'pointer',
        color: THEME.textMuted,
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: THEME.accent,
          color: THEME.accent,
          backgroundColor: THEME.accentSoft,
        },
      }}
    >
      <AddIcon sx={{ fontSize: '1rem' }} />
      <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
        Add Column
      </Typography>
    </Box>
  );
}

export default function KanbanBoard({ filteredTasks, onTaskClick, onAddTask }) {
  const { tasks, categories, toggleComplete, reorderTasks, addCategory, deleteCategory } = useTaskContext();
  const [activeId, setActiveId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [zoomedCategory, setZoomedCategory] = useState(null);
  const [expandedPanels, setExpandedPanels] = useState(() => categories.length > 0 ? [categories[0]] : []);
  const isMobile = useMediaQuery('(max-width:767px)');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const getTasksByCategory = (category) => {
    return filteredTasks
      .filter((t) => t.category === category)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  };

  const findContainer = (id) => {
    if (categories.includes(id)) return id;
    const task = tasks.find((t) => t.id === id);
    return task ? task.category : null;
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findContainer(active.id);
    const overContainer = categories.includes(over.id)
      ? over.id
      : findContainer(over.id);

    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    const updatedTasks = tasks.map((task) => {
      if (task.id === active.id) {
        return { ...task, category: overContainer };
      }
      return task;
    });

    reorderTasks(updatedTasks);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeContainer = findContainer(active.id);
    const overContainer = categories.includes(over.id)
      ? over.id
      : findContainer(over.id);

    if (!activeContainer || !overContainer) return;

    if (active.id !== over.id) {
      const containerTasks = tasks
        .filter((t) => t.category === overContainer)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      const oldIndex = containerTasks.findIndex((t) => t.id === active.id);
      const newIndex = containerTasks.findIndex((t) => t.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(containerTasks, oldIndex, newIndex);
        const updatedTasks = tasks.map((task) => {
          const reorderedIndex = reordered.findIndex((t) => t.id === task.id);
          if (reorderedIndex !== -1) {
            return { ...task, order: reorderedIndex, category: overContainer };
          }
          return task;
        });
        reorderTasks(updatedTasks);
      }
    }
  };

  const handleDeleteColumn = (category) => {
    const columnTasks = tasks.filter((t) => t.category === category);
    if (columnTasks.length > 0) {
      const remaining = categories.filter((c) => c !== category);
      if (remaining.length === 0) return;
      const target = remaining[0];
      const updatedTasks = tasks.map((t) =>
        t.category === category ? { ...t, category: target } : t
      );
      reorderTasks(updatedTasks);
    }
    deleteCategory(category);
  };

  const handleAccordionToggle = (category) => {
    setExpandedPanels((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const activeTask = tasks.find((t) => t.id === activeId);

  // Mobile accordion view
  const renderMobileAccordion = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Edit mode toolbar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: 2, pt: 1.5, pb: 0.5 }}>
        <Button
          size="small"
          startIcon={<EditIcon sx={{ fontSize: '0.9rem' }} />}
          onClick={() => setEditMode((v) => !v)}
          sx={{
            fontSize: '0.78rem',
            color: editMode ? THEME.accent : THEME.textMuted,
            backgroundColor: editMode ? THEME.accentSoft : 'transparent',
            border: editMode ? `1px solid ${THEME.accentSoftBorder}` : `1px solid transparent`,
            borderRadius: 2,
            px: 1.5,
            py: 0.5,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: editMode ? THEME.accentSoft : 'rgba(255,255,255,0.04)',
            },
          }}
        >
          {editMode ? 'Done' : 'Edit'}
        </Button>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', px: 1.5, pb: 2 }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {categories.map((category) => {
            const categoryTasks = getTasksByCategory(category);
            const color = getCategoryColor(category, categories);
            const isExpanded = expandedPanels.includes(category);

            return (
              <Accordion
                key={category}
                expanded={isExpanded}
                onChange={() => handleAccordionToggle(category)}
                disableGutters
                elevation={0}
                sx={{
                  backgroundColor: THEME.surface,
                  border: `1px solid ${isExpanded ? THEME.borderStrong : THEME.border}`,
                  borderRadius: '12px !important',
                  mb: 1,
                  '&::before': { display: 'none' },
                  '&.Mui-expanded': { margin: '0 0 8px 0' },
                  overflow: 'hidden',
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: THEME.textMuted, fontSize: '1.2rem' }} />}
                  sx={{
                    minHeight: 48,
                    px: 2,
                    '& .MuiAccordionSummary-content': {
                      alignItems: 'center',
                      gap: 1,
                      my: 1,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: color,
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, color: THEME.text, fontSize: '0.85rem', flex: 1 }}
                  >
                    {category}
                  </Typography>
                  <Chip
                    label={categoryTasks.length}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      color: THEME.textSecondary,
                      border: 'none',
                    }}
                  />
                  {editMode && categories.length > 1 && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteColumn(category);
                      }}
                      sx={{
                        color: THEME.textMuted,
                        width: 28,
                        height: 28,
                        ml: 0.5,
                        '&:hover': { color: THEME.error },
                      }}
                    >
                      <CloseIcon sx={{ fontSize: '0.85rem' }} />
                    </IconButton>
                  )}
                </AccordionSummary>
                <AccordionDetails sx={{ px: 1.5, pt: 0, pb: 1.5 }}>
                  <SortableContext items={categoryTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                    {categoryTasks.length === 0 ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
                        <Typography variant="body2" sx={{ color: THEME.textMuted, fontSize: '0.8rem' }}>
                          No tasks
                        </Typography>
                      </Box>
                    ) : (
                      categoryTasks.map((task) => (
                        <SortableTaskCard
                          key={task.id}
                          task={task}
                          onToggleComplete={toggleComplete}
                          onClick={onTaskClick}
                        />
                      ))
                    )}
                  </SortableContext>
                </AccordionDetails>
              </Accordion>
            );
          })}

          {editMode && (
            <Box sx={{ mt: 1 }}>
              <AddColumnButton onAdd={addCategory} />
            </Box>
          )}

          <DragOverlay>
            {activeTask ? (
              <TaskCard
                task={activeTask}
                onToggleComplete={() => {}}
                onClick={() => {}}
                isDragging
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add task"
        onClick={onAddTask}
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          zIndex: 1000,
          backgroundColor: THEME.accent,
          '&:hover': { backgroundColor: THEME.accentHover },
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );

  // Desktop column view
  const renderDesktopColumns = () => (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        {/* Edit mode toolbar */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: 2, pt: 1.5, pb: 0.5 }}>
          <Button
            size="small"
            startIcon={<EditIcon sx={{ fontSize: '0.9rem' }} />}
            onClick={() => setEditMode((v) => !v)}
            sx={{
              fontSize: '0.78rem',
              color: editMode ? THEME.accent : THEME.textMuted,
              backgroundColor: editMode ? THEME.accentSoft : 'transparent',
              border: editMode ? `1px solid ${THEME.accentSoftBorder}` : `1px solid transparent`,
              borderRadius: 2,
              px: 1.5,
              py: 0.5,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: editMode ? THEME.accentSoft : 'rgba(255,255,255,0.04)',
              },
            }}
          >
            {editMode ? 'Done' : 'Edit'}
          </Button>
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            p: 2,
            pt: 1,
            flex: 1,
            overflow: 'auto',
            alignItems: 'stretch',
            flexDirection: 'row',
          }}
        >
          {categories.map((category) => (
            <KanbanColumn
              key={category}
              category={category}
              categories={categories}
              tasks={getTasksByCategory(category)}
              onToggleComplete={toggleComplete}
              onTaskClick={onTaskClick}
              onDelete={editMode && categories.length > 1 ? handleDeleteColumn : null}
              onColumnClick={setZoomedCategory}
            />
          ))}
          {editMode && <AddColumnButton onAdd={addCategory} />}
        </Box>
      </Box>
      <DragOverlay>
        {activeTask ? (
          <TaskCard
            task={activeTask}
            onToggleComplete={() => {}}
            onClick={() => {}}
            isDragging
          />
        ) : null}
      </DragOverlay>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add task"
        onClick={onAddTask}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          backgroundColor: THEME.accent,
          '&:hover': { backgroundColor: THEME.accentHover },
        }}
      >
        <AddIcon />
      </Fab>

      {/* Category Zoom Dialog */}
      <CategoryZoomDialog
        open={!!zoomedCategory}
        onClose={() => setZoomedCategory(null)}
        category={zoomedCategory}
        tasks={zoomedCategory ? getTasksByCategory(zoomedCategory) : []}
        onToggleComplete={toggleComplete}
        onTaskClick={onTaskClick}
        onAddTask={onAddTask}
        categories={categories}
      />
    </DndContext>
  );

  return isMobile ? renderMobileAccordion() : renderDesktopColumns();
}
