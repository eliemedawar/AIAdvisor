import { useState } from "react";
import { motion } from "framer-motion";
import { X, Search, BookOpen, FileText, CheckSquare } from "lucide-react";
import { Modal } from "../core/Modal";
import { Button } from "../core/Button";
import { Badge } from "../core/Badge";
import { Input } from "../core/Input";
import type { Course, Assignment, Task } from "../../api/plannerApi";

/**
 * Mock data for context attachment
 * In production, this would come from the planner API
 */

const mockCourses: Course[] = [
  { id: 1, user: 1, name: "Data Structures", code: "CS 301", term: "Fall 2024", credits: 3 },
  { id: 2, user: 1, name: "Algorithms", code: "CS 302", term: "Fall 2024", credits: 3 },
  { id: 3, user: 1, name: "Database Systems", code: "CS 401", term: "Fall 2024", credits: 3 },
  { id: 4, user: 1, name: "Web Development", code: "CS 350", term: "Fall 2024", credits: 3 },
];

const mockAssignments: Assignment[] = [
  { id: 1, course: 1, title: "Homework 3: Binary Trees", description: "", due_at: "2024-11-25", status: "pending", weight: 10, type: "homework" },
  { id: 2, course: 2, title: "Project: Sorting Visualizer", description: "", due_at: "2024-11-30", status: "in_progress", weight: 25, type: "project" },
  { id: 3, course: 3, title: "Midterm Exam", description: "", due_at: "2024-11-28", status: "pending", weight: 30, type: "exam" },
  { id: 4, course: 4, title: "Final Project Proposal", description: "", due_at: "2024-12-05", status: "pending", weight: 15, type: "project" },
];

const mockTasks: Task[] = [
  { id: 1, user: 1, assignment: 1, title: "Implement BST insert method", description: "", due_at: "2024-11-24", status: "in_progress", priority: "high" },
  { id: 2, user: 1, assignment: 2, title: "Design sorting algorithm UI", description: "", due_at: "2024-11-26", status: "pending", priority: "medium" },
  { id: 3, user: 1, assignment: 3, title: "Review SQL joins and indexing", description: "", due_at: "2024-11-27", status: "pending", priority: "high" },
  { id: 4, user: 1, assignment: null, title: "Read Chapter 5", description: "", due_at: "2024-11-23", status: "pending", priority: "low" },
];

type TabType = "courses" | "assignments" | "tasks";

interface SelectedContext {
  courses: number[];
  assignments: number[];
  tasks: number[];
}

interface AttachContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttach: (context: SelectedContext) => void;
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
  const [selected, setSelected] = useState<SelectedContext>({
    courses: [],
    assignments: [],
    tasks: [],
  });

  const handleToggleItem = (type: TabType, id: number) => {
    setSelected((prev) => ({
      ...prev,
      [type]: prev[type].includes(id)
        ? prev[type].filter((itemId) => itemId !== id)
        : [...prev[type], id],
    }));
  };

  const handleAttach = () => {
    onAttach(selected);
    setSelected({ courses: [], assignments: [], tasks: [] });
    setSearchQuery("");
    onClose();
  };

  const handleClose = () => {
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
        return mockCourses.filter(
          (course) =>
            course.name.toLowerCase().includes(query) ||
            course.code.toLowerCase().includes(query)
        );
      case "assignments":
        return mockAssignments.filter((assignment) =>
          assignment.title.toLowerCase().includes(query)
        );
      case "tasks":
        return mockTasks.filter((task) =>
          task.title.toLowerCase().includes(query)
        );
      default:
        return [];
    }
  };

  const renderTabContent = () => {
    const items = getFilteredItems();

    if (items.length === 0) {
      return (
        <div className="flex h-64 items-center justify-center text-slate-500">
          <p className="text-sm">No items found</p>
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

