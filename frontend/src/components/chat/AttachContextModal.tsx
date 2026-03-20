import { useState, useEffect } from "react";
import { X, Search, BookOpen, FileText, CheckSquare, Loader2 } from "lucide-react";
import { Modal } from "../core/Modal";
import { Button } from "../core/Button";
import { Badge } from "../core/Badge";
import { Input } from "../core/Input";
import { plannerApi, type Course, type Assignment, type Task } from "../../api/plannerApi";

type TabType = "courses" | "assignments" | "tasks";

interface SelectedContext {
  courses: number[];
  assignments: number[];
  tasks: number[];
}

interface AttachContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttach: (formattedContext: string, ids: SelectedContext) => void;
}

/**
 * AttachContextModal - Modal for attaching academic context to messages
 * 
 * Features:
 * - Tabs for Courses, Assignments, and Tasks
 * - Searchable/filterable lists
 * - Multi-select with checkboxes
 * - Selected items shown as badges
 * - Attach button to confirm selection
 * 
 * Usage:
 * ```tsx
 * <AttachContextModal
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   onAttach={(context) => console.log('Attached:', context)}
 * />
 * ```
 */
export const AttachContextModal = ({ isOpen, onClose, onAttach }: AttachContextModalProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("courses");
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SelectedContext>({
    courses: [],
    assignments: [],
    tasks: [],
  });

  useEffect(() => {
    if (!isOpen) return;
    setLoadError(null);
    setLoading(true);
    Promise.all([
      plannerApi.listCourses(),
      plannerApi.listAssignments(),
      plannerApi.listTasks(),
    ])
      .then(([c, a, t]) => {
        setCourses(c);
        setAssignments(a);
        setTasks(t);
      })
      .catch((err: any) => {
        setLoadError(err?.response?.data?.detail || "Failed to load items.");
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  const handleToggleItem = (type: TabType, id: number) => {
    setSelected((prev) => ({
      ...prev,
      [type]: prev[type].includes(id)
        ? prev[type].filter((itemId) => itemId !== id)
        : [...prev[type], id],
    }));
  };

  const handleAttach = () => {
    // Build a human-readable context string from the selected items
    const lines: string[] = ["User-highlighted context:"];
    if (selected.courses.length > 0) {
      const names = courses
        .filter((c) => selected.courses.includes(c.id))
        .map((c) => `${c.code} – ${c.name}`)
        .join(", ");
      lines.push(`Courses: ${names}`);
    }
    if (selected.assignments.length > 0) {
      const names = assignments
        .filter((a) => selected.assignments.includes(a.id))
        .map((a) => `${a.title} (due ${new Date(a.due_at).toLocaleDateString()}, ${a.status})`)
        .join(", ");
      lines.push(`Assignments: ${names}`);
    }
    if (selected.tasks.length > 0) {
      const names = tasks
        .filter((t) => selected.tasks.includes(t.id))
        .map((t) => `${t.title} (${t.priority} priority${t.due_at ? ", due " + new Date(t.due_at).toLocaleDateString() : ""})`)
        .join(", ");
      lines.push(`Tasks: ${names}`);
    }
    const formattedContext = lines.join("\n");
    onAttach(formattedContext, selected);
    setSelected({ courses: [], assignments: [], tasks: [] });
    setSearchQuery("");
    onClose();
  };

  const handleClose = () => {
    // Reset selection so stale selections don't persist across opens
    setSelected({ courses: [], assignments: [], tasks: [] });
    setSearchQuery("");
    onClose();
  };

  const getTotalSelected = () => {
    return selected.courses.length + selected.assignments.length + selected.tasks.length;
  };

  const getFilteredItems = () => {
    const query = searchQuery.toLowerCase();
    switch (activeTab) {
      case "courses":
        return courses.filter(
          (course) =>
            course.name.toLowerCase().includes(query) ||
            course.code.toLowerCase().includes(query)
        );
      case "assignments":
        return assignments.filter((a) => a.title.toLowerCase().includes(query));
      case "tasks":
        return tasks.filter((t) => t.title.toLowerCase().includes(query));
      default:
        return [];
    }
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex h-64 items-center justify-center text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }
    if (loadError) {
      return (
        <div className="flex h-64 items-center justify-center text-error-400">
          <p className="text-sm">{loadError}</p>
        </div>
      );
    }
    const items = getFilteredItems();
    if (items.length === 0) {
      return (
        <div className="flex h-64 items-center justify-center text-slate-500">
          <p className="text-sm">
            {courses.length === 0 && activeTab === "courses"
              ? "Add courses in Planner to attach them here."
              : assignments.length === 0 && activeTab === "assignments"
              ? "Add assignments to your courses to see them here."
              : tasks.length === 0 && activeTab === "tasks"
              ? "Add tasks to see them here."
              : "No items match your search."}
          </p>
        </div>
      );
    }

    return (
      <div className="max-h-64 space-y-2 overflow-y-auto scrollable">
        {activeTab === "courses" &&
          (items as Course[]).map((course) => (
            <label
              key={course.id}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-700/60 bg-slate-900/40 p-3 transition-smooth hover:bg-slate-800/60"
            >
              <input
                type="checkbox"
                checked={selected.courses.includes(course.id)}
                onChange={() => handleToggleItem("courses", course.id)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-primary-500 focus:ring-2 focus:ring-primary-400/60"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-200">{course.code}</span>
                  <Badge variant="default" size="sm">
                    {course.term}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400">{course.name}</p>
              </div>
            </label>
          ))}

        {activeTab === "assignments" &&
          (items as Assignment[]).map((assignment) => (
            <label
              key={assignment.id}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-700/60 bg-slate-900/40 p-3 transition-smooth hover:bg-slate-800/60"
            >
              <input
                type="checkbox"
                checked={selected.assignments.includes(assignment.id)}
                onChange={() => handleToggleItem("assignments", assignment.id)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-primary-500 focus:ring-2 focus:ring-primary-400/60"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-200">{assignment.title}</span>
                  <Badge
                    variant={
                      assignment.status === "done"
                        ? "success"
                        : assignment.status === "in_progress"
                        ? "warning"
                        : "default"
                    }
                    size="sm"
                  >
                    {assignment.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400">
                  Due: {new Date(assignment.due_at).toLocaleDateString()}
                </p>
              </div>
            </label>
          ))}

        {activeTab === "tasks" &&
          (items as Task[]).map((task) => (
            <label
              key={task.id}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-700/60 bg-slate-900/40 p-3 transition-smooth hover:bg-slate-800/60"
            >
              <input
                type="checkbox"
                checked={selected.tasks.includes(task.id)}
                onChange={() => handleToggleItem("tasks", task.id)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-primary-500 focus:ring-2 focus:ring-primary-400/60"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-200">{task.title}</span>
                  <Badge
                    variant={
                      task.priority === "high"
                        ? "danger"
                        : task.priority === "medium"
                        ? "warning"
                        : "default"
                    }
                    size="sm"
                  >
                    {task.priority}
                  </Badge>
                </div>
                {task.due_at && (
                  <p className="text-xs text-slate-400">
                    Due: {new Date(task.due_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </label>
          ))}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-100">Attach Context</h2>
            <p className="mt-1 text-sm text-slate-400">
              Select items to provide context to the AI advisor
            </p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1 text-slate-400 transition-smooth hover:bg-slate-800/60 hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-800/60">
          <button
            onClick={() => setActiveTab("courses")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-smooth ${
              activeTab === "courses"
                ? "border-primary-500 text-primary-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Courses
            {selected.courses.length > 0 && (
              <Badge variant="primary" size="sm">
                {selected.courses.length}
              </Badge>
            )}
          </button>
          <button
            onClick={() => setActiveTab("assignments")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-smooth ${
              activeTab === "assignments"
                ? "border-primary-500 text-primary-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="h-4 w-4" />
            Assignments
            {selected.assignments.length > 0 && (
              <Badge variant="primary" size="sm">
                {selected.assignments.length}
              </Badge>
            )}
          </button>
          <button
            onClick={() => setActiveTab("tasks")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-smooth ${
              activeTab === "tasks"
                ? "border-primary-500 text-primary-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <CheckSquare className="h-4 w-4" />
            Tasks
            {selected.tasks.length > 0 && (
              <Badge variant="primary" size="sm">
                {selected.tasks.length}
              </Badge>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="py-2">{renderTabContent()}</div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800/60 pt-4">
          <p className="text-sm text-slate-400">
            {getTotalSelected()} item{getTotalSelected() !== 1 ? "s" : ""} selected
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="md" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleAttach}
              disabled={getTotalSelected() === 0}
            >
              Attach Context
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

