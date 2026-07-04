import { useState, useMemo } from 'react';
import { Box } from '@mui/material';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useTaskContext } from './context/TaskContext';
import { VIEWS } from './constants';
import Sidebar from './components/Sidebar';
import GlassHeader from './components/GlassHeader';
import Toolbar from './components/Toolbar';
import KanbanBoard from './components/KanbanBoard';
import ListView from './components/ListView';
import CalendarView from './components/CalendarView';
import StatsDashboard from './components/StatsDashboard';
import HabitView from './components/HabitView';
import JournalView from './components/JournalView';
import FinanceView from './components/FinanceView';
import TaskDialog from './components/TaskDialog';

dayjs.extend(isSameOrBefore);

export default function App() {
  const { tasks, stats, deleteTask } = useTaskContext();

  // View state
  const [currentView, setCurrentView] = useState(VIEWS.KANBAN);

  // Journal date (set from calendar zoom)
  const [journalDate, setJournalDate] = useState(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [dueDateFilter, setDueDateFilter] = useState('All');
  const [showCompleted, setShowCompleted] = useState(false);

  // Derived filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Hide completed unless toggled
      if (!showCompleted && task.completed) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesNotes = (task.notes || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesNotes) return false;
      }

      // Priority filter
      if (priorityFilter !== 'All' && task.priority !== priorityFilter) return false;

      // Due date filter
      if (dueDateFilter !== 'All') {
        if (!task.dueDate) return false;
        const due = dayjs(task.dueDate);
        const today = dayjs().startOf('day');

        switch (dueDateFilter) {
          case 'Overdue':
            if (!due.isBefore(today)) return false;
            break;
          case 'Today':
            if (!due.isSame(today, 'day')) return false;
            break;
          case 'This Week':
            if (due.isBefore(today) || due.isAfter(today.add(7, 'day'))) return false;
            break;
        }
      }

      return true;
    });
  }, [tasks, searchQuery, priorityFilter, dueDateFilter, showCompleted]);

  const handleOpenCreate = () => {
    setEditTask(null);
    setDialogOpen(true);
  };

  const handleTaskClick = (task) => {
    setEditTask(task);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditTask(null);
  };

  const handleDelete = (id) => {
    deleteTask(id);
  };

  const activeTaskCount = tasks.filter((t) => !t.completed).length;

  const handleOpenJournal = (date) => {
    setJournalDate(date);
    setCurrentView(VIEWS.JOURNAL);
  };

  const renderView = () => {
    switch (currentView) {
      case VIEWS.KANBAN:
        return <KanbanBoard filteredTasks={filteredTasks} onTaskClick={handleTaskClick} onAddTask={handleOpenCreate} />;
      case VIEWS.LIST:
        return <ListView filteredTasks={filteredTasks} onTaskClick={handleTaskClick} />;
      case VIEWS.CALENDAR:
        return <CalendarView filteredTasks={filteredTasks} onTaskClick={handleTaskClick} onOpenJournal={handleOpenJournal} />;
      case VIEWS.STATS:
        return <StatsDashboard />;
      case VIEWS.HABITS:
        return <HabitView />;
      case VIEWS.JOURNAL:
        return <JournalView initialDate={journalDate} />;
      case VIEWS.FINANCE:
        return <FinanceView />;
      default:
        return <KanbanBoard filteredTasks={filteredTasks} onTaskClick={handleTaskClick} onAddTask={handleOpenCreate} />;
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        stats={stats}
      />

      {/* Main content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <GlassHeader
          currentView={currentView}
          taskCount={activeTaskCount}
          onAddTask={handleOpenCreate}
        />

        {/* Toolbar (hidden on stats view) */}
        {currentView !== VIEWS.STATS && currentView !== VIEWS.HABITS && currentView !== VIEWS.JOURNAL && currentView !== VIEWS.FINANCE && (
          <Toolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
            dueDateFilter={dueDateFilter}
            onDueDateFilterChange={setDueDateFilter}
            showCompleted={showCompleted}
            onShowCompletedChange={setShowCompleted}
            currentView={currentView}
            onViewChange={setCurrentView}
          />
        )}

        {/* View content */}
        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {renderView()}
        </Box>
      </Box>

      {/* Task dialog */}
      <TaskDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        editTask={editTask}
        onDelete={handleDelete}
      />
    </Box>
  );
}
