import React, { useState, useEffect } from 'react';
import {
  Plus,
  BookOpen,
  FileText,
  CheckSquare,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { AppLayout } from '../../layouts/AppLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { plannerApi } from '../../api/plannerApi';
import { useToast } from '../../context/ToastContext';

interface Course {
  id: number;
  name: string;
  instructor: string;
  credits: number;
  grade: string;
}

interface Assignment {
  id: number;
  title: string;
  course: string;
  due_date: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

interface Task {
  id: number;
  title: string;
  due_date: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const colors = {
    high: 'bg-danger',
    medium: 'bg-warning',
    low: 'bg-success',
  };
  return (
    <span
      className={`${colors[priority as keyof typeof colors]} text-white text-xs px-2 py-1 rounded`}
    >
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

const CourseCard: React.FC<{ course: Course; onDelete: (id: number) => void }> = ({
  course,
  onDelete,
}) => (
  <Card variant="glass" className="hover:border-indigo-neon-600/50 transition-all cursor-pointer">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-indigo-neon-600/20 flex items-center justify-center">
          <BookOpen size={20} className="text-indigo-neon-600" />
        </div>
        <div>
          <h4 className="text-white font-bold">{course.name}</h4>
          <p className="text-gray-500 text-xs">{course.instructor}</p>
        </div>
      </div>
      <Badge variant="default">{course.grade}</Badge>
    </div>
    <p className="text-gray-400 text-sm mb-3">{course.credits} credits</p>
    <button
      onClick={() => onDelete(course.id)}
      className="text-gray-500 hover:text-danger text-xs transition-colors"
    >
      <Trash2 size={16} className="inline mr-1" /> Delete
    </button>
  </Card>
);

const AssignmentItem: React.FC<{
  assignment: Assignment;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}> = ({ assignment, onToggle, onDelete }) => (
  <div
    className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
      assignment.completed
        ? 'bg-success/5 border-success/30'
        : 'bg-void-800 border-void-700 hover:border-indigo-neon-600/50'
    }`}
  >
    <button
      onClick={() => onToggle(assignment.id)}
      className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
        assignment.completed
          ? 'bg-success border-success'
          : 'border-gray-600 hover:border-indigo-neon-600'
      }`}
    >
      {assignment.completed && <CheckSquare size={16} className="text-white" />}
    </button>

    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-2 mb-1">
        <h4 className={`font-medium ${assignment.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
          {assignment.title}
        </h4>
        <PriorityBadge priority={assignment.priority} />
      </div>
      <p className="text-gray-500 text-xs">
        {assignment.course} • Due {new Date(assignment.due_date).toLocaleDateString()}
      </p>
    </div>

    <button
      onClick={() => onDelete(assignment.id)}
      className="text-gray-500 hover:text-danger transition-colors flex-shrink-0"
    >
      <Trash2 size={16} />
    </button>
  </div>
);

export const PlannerPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [c, a, t] = await Promise.all([
          plannerApi.listCourses(),
          plannerApi.listAssignments(),
          plannerApi.listTasks(),
        ]);
        setCourses(c);
        setAssignments(a);
        setTasks(t);
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'Failed to load planner');
        showError('Failed to load planner data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleToggleAssignment = async (id: number) => {
    const assignment = assignments.find(a => a.id === id);
    if (!assignment) return;

    try {
      await plannerApi.updateAssignment(id, {
        ...assignment,
        completed: !assignment.completed,
      });
      setAssignments(prev =>
        prev.map(a =>
          a.id === id ? { ...a, completed: !a.completed } : a
        )
      );
      showSuccess(assignment.completed ? 'Marked incomplete' : 'Assignment completed!');
    } catch (err) {
      showError('Failed to update assignment');
    }
  };

  const handleDeleteCourse = async (id: number) => {
    try {
      await plannerApi.deleteCourse(id);
      setCourses(prev => prev.filter(c => c.id !== id));
      showSuccess('Course deleted');
    } catch (err) {
      showError('Failed to delete course');
    }
  };

  const handleDeleteAssignment = async (id: number) => {
    try {
      await plannerApi.deleteAssignment(id);
      setAssignments(prev => prev.filter(a => a.id !== id));
      showSuccess('Assignment deleted');
    } catch (err) {
      showError('Failed to delete assignment');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6 lg:p-12">
          <div className="animate-pulse space-y-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-glass rounded-2xl" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="p-6 lg:p-12">
          <Card variant="glass" className="border-danger/30 bg-danger/5">
            <div className="flex gap-4">
              <AlertCircle className="text-danger flex-shrink-0" size={24} />
              <div>
                <h3 className="text-white font-bold mb-1">Failed to load planner</h3>
                <p className="text-gray-400 text-sm">{error}</p>
              </div>
            </div>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  const activeAssignments = assignments.filter(a => !a.completed);
  const completedAssignments = assignments.filter(a => a.completed);

  return (
    <AppLayout>
      <div className="p-6 lg:p-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Planner</h1>
          <p className="text-gray-400">Manage your courses, assignments, and tasks</p>
        </div>

        {/* Courses Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Courses</h2>
            <Button variant="primary" size="sm">
              <Plus size={18} className="mr-2" />
              Add Course
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                onDelete={handleDeleteCourse}
              />
            ))}
            {courses.length === 0 && (
              <Card variant="glass" className="col-span-full text-center py-12">
                <BookOpen size={32} className="mx-auto text-gray-500 mb-3" />
                <p className="text-gray-400">No courses yet. Add your first course!</p>
              </Card>
            )}
          </div>
        </div>

        {/* Assignments Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Assignments</h2>
            <Button variant="primary" size="sm">
              <Plus size={18} className="mr-2" />
              Add Assignment
            </Button>
          </div>
          <div className="space-y-3">
            {activeAssignments.map(assignment => (
              <AssignmentItem
                key={assignment.id}
                assignment={assignment}
                onToggle={handleToggleAssignment}
                onDelete={handleDeleteAssignment}
              />
            ))}
            {activeAssignments.length === 0 && (
              <Card variant="glass" className="text-center py-8">
                <FileText size={32} className="mx-auto text-gray-500 mb-3" />
                <p className="text-gray-400">No active assignments</p>
              </Card>
            )}
          </div>

          {completedAssignments.length > 0 && (
            <div className="mt-6">
              <button className="text-gray-500 hover:text-indigo-neon-600 text-sm font-medium transition-colors">
                Show {completedAssignments.length} completed assignments
              </button>
            </div>
          )}
        </div>

        {/* Tasks Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Tasks</h2>
            <Button variant="primary" size="sm">
              <Plus size={18} className="mr-2" />
              Add Task
            </Button>
          </div>
          <div className="space-y-3">
            {activeTasks.map(task => (
              <AssignmentItem
                key={task.id}
                assignment={task as any}
                onToggle={() => {}}
                onDelete={() => {}}
              />
            ))}
            {activeTasks.length === 0 && (
              <Card variant="glass" className="text-center py-8">
                <CheckSquare size={32} className="mx-auto text-gray-500 mb-3" />
                <p className="text-gray-400">No active tasks</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
