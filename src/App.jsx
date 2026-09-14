import { lazy, Suspense, startTransition, useCallback, useEffect, useState, useMemo } from 'react';
import { Alert, Box, useMediaQuery } from '@mui/material';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useTaskContext } from './context/TaskContext';
import { useHabitContext } from './context/HabitContext';
import { useJournalContext } from './context/JournalContext';
import { useFinanceContext } from './context/FinanceContext';
import { useSettingsContext } from './context/SettingsContext';
import { VIEWS } from './constants';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import GlassHeader from './components/GlassHeader';
import Toolbar from './components/Toolbar';
import KanbanBoard from './components/KanbanBoard';
import AccountDialog from './components/AccountDialog';

const ListView = lazy(() => import('./components/ListView'));
const CalendarView = lazy(() => import('./components/CalendarView'));
const StatsDashboard = lazy(() => import('./components/StatsDashboard'));
const HabitView = lazy(() => import('./components/HabitView'));
const JournalView = lazy(() => import('./components/JournalView'));
const FinanceView = lazy(() => import('./components/FinanceView'));
const TaskDialog = lazy(() => import('./components/TaskDialog'));

function ViewFallback() {
  return (
    <Box
      sx={{ flex: 1 }}
      role="status"
      aria-live="polite"
      aria-label="Opening view"
    />
  );
}

dayjs.extend(isSameOrBefore);

export default function App() {
  const { tasks, stats, deleteTask, ready: tasksReady, syncError: taskSyncError } = useTaskContext();
  const { ready: habitsReady, syncError: habitSyncError } = useHabitContext();
  const { ready: journalReady, syncError: journalSyncError } = useJournalContext();
  const { ready: financeReady, syncError: financeSyncError } = useFinanceContext();
  const { onboardingCompleted, completeOnboarding, ready: settingsReady, syncError: settingsSyncError } = useSettingsContext();
  const isDesktop = useMediaQuery('(min-width:768px)');
  const allDataReady = tasksReady && habitsReady && journalReady && financeReady && settingsReady;
  const hasSyncError = taskSyncError || habitSyncError || journalSyncError || financeSyncError || settingsSyncError;

  // View state
  const [currentView, setCurrentView] = useState(VIEWS.KANBAN);

  // Journal date (set from calendar zoom)
  const [journalDate, setJournalDate] = useState(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [taskDialogReady, setTaskDialogReady] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [initialDueDate, setInitialDueDate] = useState(null);
  const showOnboarding = !onboardingCompleted;

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
    setInitialDueDate(null);
    setDialogOpen(true);
  };

  const handleOpenTodayTask = () => {
    setEditTask(null);
    setInitialDueDate(dayjs().startOf('day'));
    setDialogOpen(true);
  };

  const handleTaskClick = (task) => {
    setEditTask(task);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditTask(null);
    setInitialDueDate(null);
  };

  const filtersActive = Boolean(searchQuery) || priorityFilter !== 'All' || dueDateFilter !== 'All' || showCompleted;

  const clearFilters = () => {
    setSearchQuery('');
    setPriorityFilter('All');
    setDueDateFilter('All');
    setShowCompleted(false);
  };

  const handleDelete = (id) => {
    deleteTask(id);
  };

  const activeTaskCount = tasks.filter((t) => !t.completed).length;

  const handleViewChange = useCallback((view) => {
    startTransition(() => {
      setCurrentView(view);
    });
  }, []);

  const handleOpenJournal = (date) => {
    setJournalDate(date);
    startTransition(() => {
      setCurrentView(VIEWS.JOURNAL);
    });
  };

  useEffect(() => {
    if (dialogOpen) setTaskDialogReady(true);
  }, [dialogOpen]);

  useEffect(() => {
    if (showOnboarding && tasks.length > 0) {
      completeOnboarding();
    }
  }, [completeOnboarding, showOnboarding, tasks.length]);

  if (!allDataReady) {
    return <Box role="status" sx={{ p: 3 }}>Synchronizing your TasKeep records…</Box>;
  }

  const renderView = () => {
    switch (currentView) {
      case VIEWS.KANBAN:
        return (
          <KanbanBoard
            filteredTasks={filteredTasks}
            onTaskClick={handleTaskClick}
            onAddTask={handleOpenCreate}
            onAddTodayTask={handleOpenTodayTask}
            showOnboarding={showOnboarding}
            onDismissOnboarding={completeOnboarding}
          />
        );
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
        return (
          <KanbanBoard
            filteredTasks={filteredTasks}
            onTaskClick={handleTaskClick}
            onAddTask={handleOpenCreate}
            onAddTodayTask={handleOpenTodayTask}
            showOnboarding={showOnboarding}
            onDismissOnboarding={completeOnboarding}
          />
        );
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100dvh', overflow: 'hidden', pt: 'env(safe-area-inset-top)' }}>
      {/* Sidebar - desktop only */}
      {isDesktop && (
        <Sidebar
          currentView={currentView}
          onViewChange={handleViewChange}
          onOpenAccount={() => setAccountDialogOpen(true)}
          stats={stats}
        />
      )}

      {/* Main content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', pb: isDesktop ? 0 : 'calc(64px + env(safe-area-inset-bottom))' }} component="main">
        {/* Header */}
        <GlassHeader
          currentView={currentView}
          taskCount={activeTaskCount}
          onAddTask={handleOpenCreate}
        />

        {hasSyncError && (
          <Alert severity="error" role="alert" sx={{ borderRadius: 0 }}>
            TasKeep could not synchronize your latest changes. Check your connection, then try again.
          </Alert>
        )}

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
            onViewChange={handleViewChange}
            filtersActive={filtersActive}
            onClearFilters={clearFilters}
          />
        )}

        {/* View content */}
        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Suspense fallback={<ViewFallback />}>
            {renderView()}
          </Suspense>
        </Box>
      </Box>

      {/* Mobile bottom navigation */}
      {!isDesktop && (
        <MobileNav
          currentView={currentView}
          onViewChange={handleViewChange}
          onOpenAccount={() => setAccountDialogOpen(true)}
        />
      )}

      <AccountDialog open={accountDialogOpen} onClose={() => setAccountDialogOpen(false)} />

      {taskDialogReady && (
        <Suspense fallback={null}>
          <TaskDialog
            open={dialogOpen}
            onClose={handleCloseDialog}
            editTask={editTask}
            initialDueDate={initialDueDate}
            onDelete={handleDelete}
          />
        </Suspense>
      )}
    </Box>
  );
}
