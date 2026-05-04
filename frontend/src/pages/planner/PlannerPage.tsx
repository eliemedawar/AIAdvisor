import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, BookOpen, FileText, CheckSquare, AlertCircle, Check, Pencil, Trash2, Layers, ChevronDown } from "lucide-react";
import clsx from "clsx";
import {
  PageShell,
  Heading,
  Text,
  Card,
  Button,
  EmptyState,
  SkeletonCard,
  Modal,
  Input,
  Select,
} from "../../components";
import { plannerApi, type Course, type Assignment, type Task, type CreateCoursePayload, type CreateAssignmentPayload, type CreateTaskPayload, type ElectiveOption } from "../../api/plannerApi";
import { useToast } from "../../context/ToastContext";

const PLACEHOLDER_REQUIREMENT: Record<string, string> = {
  "HSS Elective": "hss",
  "Science Elective": "science",
  "ARAB": "arabic",
  "EECE 3xx/4xx": "cce_restricted",
  "MATH Elective": "math_elective",
  "EECE Elective": "eece_elective",
  "EECE Restricted Laboratory": "restricted_lab",
  "Technical Elective": "technical",
  "EECE Elective Laboratory": "elective_lab",
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.24, ease: [0.4, 0, 0.2, 1] } },
};

export const PlannerPage = () => {
  const { showSuccess, showError } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [showDone, setShowDone] = useState(false);
  const [showDoneTasks, setShowDoneTasks] = useState(false);
  const [courseTab, setCourseTab] = useState<"in_progress" | "planned" | "completed">("in_progress");

  const load = async () => {
    setLoading(true);
    setLoadError(null);
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
      setLoadError(err?.response?.data?.detail || "Failed to load planner data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  // ── Add Course modal ──────────────────────────────────────────────────────
  const [courseOpen, setCourseOpen] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseTerm, setCourseTerm] = useState("");
  const [courseCredits, setCourseCredits] = useState<string>("");
  const [courseStatus, setCourseStatus] = useState<"in_progress" | "planned" | "completed">("in_progress");
  const [savingCourse, setSavingCourse] = useState(false);

  const handleCreateCourse = async () => {
    if (!courseName.trim() || !courseCode.trim() || !courseTerm.trim()) return;
    setSavingCourse(true);
    try {
      const payload: CreateCoursePayload = {
        name: courseName.trim(),
        code: courseCode.trim(),
        term: courseTerm.trim(),
        credits: courseCredits.trim() ? Number(courseCredits) : null,
        status: courseStatus,
      };
      await plannerApi.createCourse(payload);
      showSuccess("Course added", `${courseCode} has been added.`);
      setCourseOpen(false);
      setCourseName("");
      setCourseCode("");
      setCourseTerm("");
      setCourseCredits("");
      setCourseStatus("in_progress");
      void load();
    } catch (err: any) {
      showError("Failed to add course", err?.response?.data?.detail || "Please try again.");
    } finally {
      setSavingCourse(false);
    }
  };

  // ── Edit Course modal ─────────────────────────────────────────────────────
  const [editCourseOpen, setEditCourseOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [editCourseName, setEditCourseName] = useState("");
  const [editCourseCode, setEditCourseCode] = useState("");
  const [editCourseTerm, setEditCourseTerm] = useState("");
  const [editCourseCredits, setEditCourseCredits] = useState<string>("");
  const [editCourseStatus, setEditCourseStatus] = useState<"in_progress" | "planned" | "completed">("in_progress");
  const [savingEditCourse, setSavingEditCourse] = useState(false);
  const [deletingCourseId, setDeletingCourseId] = useState<number | null>(null);

  // Elective picker state (used when editing a placeholder course)
  const [electiveLists, setElectiveLists] = useState<Record<string, ElectiveOption[]>>({});
  const [editElectiveSel, setEditElectiveSel] = useState<ElectiveOption | undefined>(undefined);
  const [editElectiveSearch, setEditElectiveSearch] = useState("");

  const openEditCourse = (c: Course) => {
    setEditCourse(c);
    setEditCourseName(c.name);
    setEditCourseCode(c.code);
    setEditCourseTerm(c.term);
    setEditCourseCredits(c.credits != null ? String(c.credits) : "");
    setEditCourseStatus((c.status ?? "in_progress") as "in_progress" | "planned" | "completed");
    setEditElectiveSel(undefined);
    setEditElectiveSearch("");
    setEditCourseOpen(true);
    // Lazy-load elective lists when first needed
    const isElective = c.requirement_type || !!PLACEHOLDER_REQUIREMENT[c.code];
    if (isElective && Object.keys(electiveLists).length === 0) {
      plannerApi.getElectives().then((r) => setElectiveLists(r.electives));
    }
  };

  const handleUpdateCourse = async () => {
    if (!editCourse || !editCourseName.trim() || !editCourseCode.trim() || !editCourseTerm.trim()) return;
    setSavingEditCourse(true);
    try {
      await plannerApi.updateCourse(editCourse.id, {
        name: editCourseName.trim(),
        code: editCourseCode.trim(),
        term: editCourseTerm.trim(),
        credits: editCourseCredits.trim() ? Number(editCourseCredits) : null,
        status: editCourseStatus,
      });
      showSuccess("Course updated", editCourseCode.trim());
      setEditCourseOpen(false);
      void load();
    } catch (err: any) {
      showError("Failed to update course", err?.response?.data?.detail || "Please try again.");
    } finally {
      setSavingEditCourse(false);
    }
  };

  const handleDeleteCourse = async (id: number) => {
    setDeletingCourseId(id);
    try {
      await plannerApi.deleteCourse(id);
      showSuccess("Course deleted", "Course and its assignments were removed.");
      setEditCourseOpen(false);
      void load();
    } catch (err: any) {
      showError("Failed to delete", err?.response?.data?.detail || "Please try again.");
    } finally {
      setDeletingCourseId(null);
    }
  };

  // ── Add Assignment modal ──────────────────────────────────────────────────
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignCourse, setAssignCourse] = useState("");
  const [assignTitle, setAssignTitle] = useState("");
  const [assignDesc, setAssignDesc] = useState("");
  const [assignDue, setAssignDue] = useState("");
  const [assignType, setAssignType] = useState("homework");
  const [assignWeight, setAssignWeight] = useState<string>("");
  const [savingAssign, setSavingAssign] = useState(false);

  const handleCreateAssignment = async () => {
    if (!assignCourse || !assignTitle.trim() || !assignDue) return;
    setSavingAssign(true);
    try {
      const payload: CreateAssignmentPayload = {
        course: Number(assignCourse),
        title: assignTitle.trim(),
        description: assignDesc.trim(),
        due_at: new Date(assignDue).toISOString(),
        status: "pending",
        type: assignType,
        weight: assignWeight.trim() ? Number(assignWeight) : null,
      };
      await plannerApi.createAssignment(payload);
      showSuccess("Assignment added", assignTitle.trim());
      setAssignOpen(false);
      setAssignCourse("");
      setAssignTitle("");
      setAssignDesc("");
      setAssignDue("");
      setAssignWeight("");
      void load();
    } catch (err: any) {
      showError("Failed to add assignment", err?.response?.data?.detail || "Please try again.");
    } finally {
      setSavingAssign(false);
    }
  };

  // ── Mark assignment done ──────────────────────────────────────────────────
  const handleCompleteAssignment = async (id: number) => {
    setCompletingId(id);
    try {
      await plannerApi.updateAssignment(id, { status: "done" });
      setAssignments((prev) => prev.map((a) => a.id === id ? { ...a, status: "done" } : a));
      showSuccess("Assignment completed", "Marked as done.");
    } catch {
      showError("Failed to complete", "Please try again.");
    } finally {
      setCompletingId(null);
    }
  };

  // ── Add Task modal ────────────────────────────────────────────────────────
  const [taskOpen, setTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskDue, setTaskDue] = useState("");
  const [taskPriority, setTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const [taskAssignment, setTaskAssignment] = useState("");
  const [savingTask, setSavingTask] = useState(false);

  const handleCreateTask = async () => {
    if (!taskTitle.trim()) return;
    setSavingTask(true);
    try {
      const payload: CreateTaskPayload = {
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        due_at: taskDue ? new Date(taskDue).toISOString() : null,
        status: "pending",
        priority: taskPriority,
        assignment: taskAssignment ? Number(taskAssignment) : null,
      };
      await plannerApi.createTask(payload);
      showSuccess("Task added", taskTitle.trim());
      setTaskOpen(false);
      setTaskTitle("");
      setTaskDesc("");
      setTaskDue("");
      setTaskAssignment("");
      void load();
    } catch (err: any) {
      showError("Failed to add task", err?.response?.data?.detail || "Please try again.");
    } finally {
      setSavingTask(false);
    }
  };

  // ── Edit Task modal ───────────────────────────────────────────────────────
  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskDesc, setEditTaskDesc] = useState("");
  const [editTaskDue, setEditTaskDue] = useState("");
  const [editTaskPriority, setEditTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const [savingEditTask, setSavingEditTask] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);
  const [completingTaskId, setCompletingTaskId] = useState<number | null>(null);

  const openEditTask = (t: Task) => {
    setEditTask(t);
    setEditTaskTitle(t.title);
    setEditTaskDesc(t.description || "");
    setEditTaskDue(t.due_at ? t.due_at.slice(0, 16) : "");
    setEditTaskPriority(t.priority);
    setEditTaskOpen(true);
  };

  const handleUpdateTask = async () => {
    if (!editTask || !editTaskTitle.trim()) return;
    setSavingEditTask(true);
    try {
      await plannerApi.updateTask(editTask.id, {
        title: editTaskTitle.trim(),
        description: editTaskDesc.trim(),
        due_at: editTaskDue ? new Date(editTaskDue).toISOString() : null,
        priority: editTaskPriority,
      });
      showSuccess("Task updated", editTaskTitle.trim());
      setEditTaskOpen(false);
      void load();
    } catch (err: any) {
      showError("Failed to update task", err?.response?.data?.detail || "Please try again.");
    } finally {
      setSavingEditTask(false);
    }
  };

  const handleDeleteTask = async (id: number) => {
    setDeletingTaskId(id);
    try {
      await plannerApi.deleteTask(id);
      showSuccess("Task deleted", "Task has been removed.");
      setEditTaskOpen(false);
      void load();
    } catch (err: any) {
      showError("Failed to delete", err?.response?.data?.detail || "Please try again.");
    } finally {
      setDeletingTaskId(null);
    }
  };

  const handleCompleteTask = async (id: number) => {
    setCompletingTaskId(id);
    try {
      await plannerApi.updateTask(id, { status: "done" });
      setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status: "done" } : t));
      showSuccess("Task completed", "Marked as done.");
    } catch {
      showError("Failed to complete", "Please try again.");
    } finally {
      setCompletingTaskId(null);
    }
  };

  // Effective requirement type: DB value first, then code-based fallback for old placeholder courses
  const editReqType =
    editCourse?.requirement_type || PLACEHOLDER_REQUIREMENT[editCourse?.code ?? ""] || "";

  const editElectiveOptions = useMemo(() => {
    const opts = electiveLists[editReqType] ?? [];
    const q = editElectiveSearch.toLowerCase();
    if (!q) return opts;
    return opts.filter(
      (o) => o.code.toLowerCase().includes(q) || o.name.toLowerCase().includes(q)
    );
  }, [electiveLists, editReqType, editElectiveSearch]);

  if (loading) {
    return (
      <PageShell>
        <div className="space-y-6">
          <Heading level="h1">Planner</Heading>
          <SkeletonCard />
        </div>
      </PageShell>
    );
  }

  if (loadError) {
    return (
      <PageShell>
        <div className="space-y-6">
          <Heading level="h1">Planner</Heading>
          <Card variant="default" className="border-error-500/30">
            <EmptyState icon={<AlertCircle className="h-8 w-8" />} title="Unable to load" description={loadError} />
            <Button size="sm" variant="primary" onClick={load} className="mt-4">Try again</Button>
          </Card>
        </div>
      </PageShell>
    );
  }

  const courseById = Object.fromEntries(courses.map((c) => [c.id, c]));

  const inProgressCourses = courses.filter((c) => c.status === "in_progress");
  const plannedCourses    = courses.filter((c) => c.status === "planned");
  const completedCourses  = courses.filter((c) => c.status === "completed");
  const visibleCourses =
    courseTab === "in_progress" ? inProgressCourses :
    courseTab === "planned"     ? plannedCourses :
                                  completedCourses;

  const COURSE_TABS: { key: typeof courseTab; label: string; count: number }[] = [
    { key: "in_progress", label: "In Progress", count: inProgressCourses.length },
    { key: "planned",     label: "Planned",     count: plannedCourses.length },
    { key: "completed",   label: "Completed",   count: completedCourses.length },
  ];

  const COURSE_EMPTY: Record<typeof courseTab, string> = {
    in_progress: "No active courses. Start a new semester or update your academic plan.",
    planned:     "No planned courses. Generate your academic plan from the Profile page.",
    completed:   "No completed courses yet.",
  };

  const pendingAssignments = assignments.filter((a) => a.status !== "done");
  const visibleAssignments = showDone ? assignments : pendingAssignments;
  const doneAssignCount = assignments.filter((a) => a.status === "done").length;
  const visibleTasks = tasks.filter((t) => t.status !== "done");
  const doneTaskCount = tasks.filter((t) => t.status === "done").length;
  const displayedTasks = showDoneTasks ? tasks : visibleTasks;

  // Next deadline across pending assignments and tasks
  const nextDeadline = [
    ...pendingAssignments.map((a) => ({ title: a.title, due_at: a.due_at })),
    ...visibleTasks.filter((t) => t.due_at).map((t) => ({ title: t.title, due_at: t.due_at! })),
  ].sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime())[0];

  const summaryStats = [
    {
      label: "In Progress",
      value: inProgressCourses.length,
      sub: inProgressCourses.length === 1 ? "course" : "courses",
      accent: "text-primary-400",
    },
    {
      label: "Assignments",
      value: pendingAssignments.length,
      sub: "pending",
      accent: "text-slate-200",
    },
    {
      label: "Tasks",
      value: visibleTasks.length,
      sub: "pending",
      accent: "text-slate-200",
    },
    {
      label: "Next Due",
      value: nextDeadline
        ? new Date(nextDeadline.due_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })
        : "—",
      sub: nextDeadline ? nextDeadline.title : "Nothing upcoming",
      accent: nextDeadline ? "text-warning-400" : "text-slate-500",
    },
  ];

  return (
    <PageShell>
      <motion.div initial="initial" animate="animate" variants={fadeInUp}>
        <div className="space-y-6">

          {/* ── Header ───────────────────────────────────────────────────── */}
          <header>
            <Heading level="h1">Planner</Heading>
            <Text variant="body" color="muted" className="mt-1">
              Manage courses, assignments, and tasks. This data powers your dashboard and AI advisor.
            </Text>
          </header>

          {/* ── Summary stats row ────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {summaryStats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-slate-800/60 bg-surface-base px-4 py-3 shadow-elevation-low"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{s.label}</p>
                <p className={clsx("mt-1 text-2xl font-bold leading-none tracking-tight", s.accent)}>{s.value}</p>
                <p className="mt-1 truncate text-[11px] text-slate-500">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* ── Courses ──────────────────────────────────────────────────── */}
          <Card variant="elevated">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary-400" />
                <Heading level="h2" className="text-lg">Courses</Heading>
              </div>
              <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setCourseOpen(true)}>
                Add Course
              </Button>
            </div>

            {/* Status tabs */}
            <div className="mt-3 flex gap-1 rounded-xl border border-slate-800/60 bg-slate-900/40 p-1" role="tablist">
              {COURSE_TABS.map((tab) => (
                <button
                  key={tab.key}
                  role="tab"
                  aria-selected={courseTab === tab.key}
                  onClick={() => setCourseTab(tab.key)}
                  className={clsx(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-quick",
                    courseTab === tab.key
                      ? "bg-surface-elevated text-slate-100 shadow-sm"
                      : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  {tab.label}
                  <span
                    className={clsx(
                      "inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[10px] font-semibold",
                      courseTab === tab.key
                        ? tab.key === "in_progress" ? "bg-primary-500/20 text-primary-400"
                          : tab.key === "completed"  ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-slate-700/60 text-slate-300"
                        : "bg-slate-800/60 text-slate-500"
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Course list */}
            <div className="mt-3 space-y-2">
              {visibleCourses.length === 0 ? (
                <EmptyState
                  compact
                  icon={<BookOpen className="h-8 w-8" />}
                  title={courseTab === "in_progress" ? "No active courses" : courseTab === "planned" ? "No planned courses" : "No completed courses"}
                  description={COURSE_EMPTY[courseTab]}
                  action={
                    courseTab === "in_progress"
                      ? <Button size="sm" variant="primary" onClick={() => setCourseOpen(true)}>Add course</Button>
                      : undefined
                  }
                />
              ) : (
                visibleCourses.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-900/30 px-4 py-3 transition-colors hover:bg-slate-900/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-100">{c.code} – {c.name}</p>
                      <p className="text-xs text-slate-400">
                        {c.term}{c.credits != null ? ` · ${c.credits} cr` : ""}
                        {c.category ? ` · ${c.category}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => openEditCourse(c)}
                      title="Edit course"
                      className="ml-3 flex flex-shrink-0 items-center gap-1 rounded-lg border border-slate-700/60 px-2.5 py-1.5 text-xs text-slate-400 transition-colors hover:border-primary-600/60 hover:text-primary-400"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* ── Assignments + Tasks (side by side on xl) ──────────────────── */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

            {/* Assignments */}
            <Card variant="elevated">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary-400" />
                  <Heading level="h2" className="text-base">Assignments</Heading>
                  {doneAssignCount > 0 && (
                    <button
                      onClick={() => setShowDone((v) => !v)}
                      className="rounded-full border border-slate-700/60 px-2 py-0.5 text-xs text-slate-400 transition-colors hover:border-slate-600 hover:text-slate-200"
                    >
                      {showDone ? "Hide done" : `+${doneAssignCount} done`}
                    </button>
                  )}
                </div>
                <Button size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setAssignOpen(true)} disabled={courses.length === 0}>
                  Add
                </Button>
              </div>

              <div className="mt-3 space-y-2">
                {visibleAssignments.length === 0 ? (
                  <EmptyState
                    compact
                    icon={<FileText className="h-8 w-8" />}
                    title="No assignments yet"
                    description={courses.length === 0 ? "Add a course first, then track its assignments." : "Add assignments to track deadlines and stay on top of your workload."}
                    action={courses.length > 0 ? <Button size="sm" variant="primary" onClick={() => setAssignOpen(true)}>Add assignment</Button> : undefined}
                  />
                ) : (
                  <AnimatePresence initial={false}>
                    {visibleAssignments.map((a) => (
                      <motion.div
                        key={a.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden"
                      >
                        <div className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${a.status === "done" ? "border-slate-800/30 bg-slate-900/10 opacity-50" : "border-slate-800/60 bg-slate-900/30"}`}>
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm font-medium ${a.status === "done" ? "line-through text-slate-400" : "text-slate-100"}`}>{a.title}</p>
                            <p className="text-xs text-slate-400">
                              {courseById[a.course]?.code ?? a.course} · Due {new Date(a.due_at).toLocaleDateString()} · {a.type}
                            </p>
                          </div>
                          {a.status !== "done" && (
                            <button
                              onClick={() => handleCompleteAssignment(a.id)}
                              disabled={completingId === a.id}
                              title="Mark as done"
                              className="ml-3 flex flex-shrink-0 items-center gap-1 rounded-lg border border-slate-700/60 px-2.5 py-1.5 text-xs text-slate-400 transition-colors hover:border-emerald-600/60 hover:text-emerald-400 disabled:opacity-50"
                            >
                              <Check className="h-3.5 w-3.5" />
                              {completingId === a.id ? "…" : "Done"}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </Card>

            {/* Tasks */}
            <Card variant="elevated">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-primary-400" />
                  <Heading level="h2" className="text-base">Tasks</Heading>
                  {doneTaskCount > 0 && (
                    <button
                      onClick={() => setShowDoneTasks((v) => !v)}
                      className="rounded-full border border-slate-700/60 px-2 py-0.5 text-xs text-slate-400 transition-colors hover:border-slate-600 hover:text-slate-200"
                    >
                      {showDoneTasks ? "Hide done" : `+${doneTaskCount} done`}
                    </button>
                  )}
                </div>
                <Button size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setTaskOpen(true)}>
                  Add
                </Button>
              </div>

              <div className="mt-3 space-y-2">
                {displayedTasks.length === 0 ? (
                  <EmptyState
                    compact
                    icon={<CheckSquare className="h-8 w-8" />}
                    title="No tasks yet"
                    description="Add tasks to plan your week. Link them to assignments if needed."
                    action={<Button size="sm" variant="primary" onClick={() => setTaskOpen(true)}>Add task</Button>}
                  />
                ) : (
                  <AnimatePresence initial={false}>
                    {displayedTasks.map((t) => (
                      <motion.div
                        key={t.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden"
                      >
                        <div className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${t.status === "done" ? "border-slate-800/30 bg-slate-900/10 opacity-50" : "border-slate-800/60 bg-slate-900/30"}`}>
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm font-medium ${t.status === "done" ? "line-through text-slate-400" : "text-slate-100"}`}>{t.title}</p>
                            <p className="text-xs text-slate-400">
                              {t.due_at ? `Due ${new Date(t.due_at).toLocaleDateString()}` : "No due date"} · {t.priority} priority
                            </p>
                          </div>
                          <div className="ml-3 flex flex-shrink-0 items-center gap-1.5">
                            {t.status !== "done" && (
                              <button
                                onClick={() => handleCompleteTask(t.id)}
                                disabled={completingTaskId === t.id}
                                title="Mark as done"
                                className="flex items-center gap-1 rounded-lg border border-slate-700/60 px-2.5 py-1.5 text-xs text-slate-400 transition-colors hover:border-emerald-600/60 hover:text-emerald-400 disabled:opacity-50"
                              >
                                <Check className="h-3.5 w-3.5" />
                                {completingTaskId === t.id ? "…" : "Done"}
                              </button>
                            )}
                            <button
                              onClick={() => openEditTask(t)}
                              title="Edit task"
                              className="flex items-center gap-1 rounded-lg border border-slate-700/60 px-2.5 py-1.5 text-xs text-slate-400 transition-colors hover:border-primary-600/60 hover:text-primary-400"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </Card>

          </div>
        </div>
      </motion.div>

      {/* ── Add Course Modal ──────────────────────────────────────────────── */}
      <Modal
        isOpen={courseOpen}
        onClose={() => !savingCourse && setCourseOpen(false)}
        title="Add Course"
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setCourseOpen(false)} disabled={savingCourse}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleCreateCourse} loading={savingCourse} disabled={!courseName.trim() || !courseCode.trim() || !courseTerm.trim()}>
              Add
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Course name" value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="e.g. Data Structures" required autoComplete="off" />
          <Input label="Code" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} placeholder="e.g. CS 301" required autoComplete="off" />
          <Input label="Term" value={courseTerm} onChange={(e) => setCourseTerm(e.target.value)} placeholder="e.g. Term I" required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Credits (optional)" type="number" value={courseCredits} onChange={(e) => setCourseCredits(e.target.value)} placeholder="3" />
            <Select label="Status" value={courseStatus} onChange={(e) => setCourseStatus(e.target.value as typeof courseStatus)}>
              <option value="in_progress">In Progress</option>
              <option value="planned">Planned</option>
              <option value="completed">Completed</option>
            </Select>
          </div>
        </div>
      </Modal>

      {/* ── Edit Course Modal ─────────────────────────────────────────────── */}
      <Modal
        isOpen={editCourseOpen}
        onClose={() => !savingEditCourse && setEditCourseOpen(false)}
        title="Edit Course"
        size="sm"
        footer={
          <>
            <button
              onClick={() => editCourse && handleDeleteCourse(editCourse.id)}
              disabled={savingEditCourse || deletingCourseId !== null}
              className="mr-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-red-400 border border-red-800/40 hover:bg-red-950/30 transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {deletingCourseId ? "Deleting…" : "Delete"}
            </button>
            <Button variant="ghost" size="sm" onClick={() => setEditCourseOpen(false)} disabled={savingEditCourse}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleUpdateCourse} loading={savingEditCourse} disabled={!editCourseName.trim() || !editCourseCode.trim() || !editCourseTerm.trim()}>
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Elective picker — shown only for placeholder courses */}
          {editReqType && (
            <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-3 space-y-2">
              <p className="text-xs font-medium text-orange-300">
                Elective slot
                {editCourse?.original_placeholder && (
                  <span className="ml-1 text-slate-500">({editCourse.original_placeholder})</span>
                )}
              </p>
              <p className="text-[11px] text-slate-500">
                Pick a course to replace this placeholder. The fields below will auto-fill.
              </p>
              <input
                type="text"
                placeholder="Search courses…"
                value={editElectiveSearch}
                onChange={(e) => setEditElectiveSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-700/80 bg-surface-base px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-primary-500 focus:outline-none"
              />
              <div className="relative">
                <select
                  value={editElectiveSel?.code ?? ""}
                  onChange={(e) => {
                    const all = electiveLists[editReqType] ?? [];
                    const opt = all.find((o) => o.code === e.target.value);
                    setEditElectiveSel(opt);
                    if (opt) {
                      setEditCourseCode(opt.code);
                      setEditCourseName(opt.name);
                      setEditCourseCredits(String(opt.credits));
                    }
                  }}
                  className="w-full appearance-none rounded-lg border border-slate-700/80 bg-surface-base py-1.5 pl-2.5 pr-7 text-xs text-slate-200 focus:border-primary-500 focus:outline-none"
                >
                  <option value="">— choose an elective —</option>
                  {editElectiveOptions.map((o) => (
                    <option key={o.code} value={o.code}>
                      {o.code} — {o.name} ({o.credits} cr)
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-500" aria-hidden="true" />
              </div>
            </div>
          )}

          <Input label="Course name" value={editCourseName} onChange={(e) => setEditCourseName(e.target.value)} placeholder="e.g. Data Structures" required autoComplete="off" />
          <Input label="Code" value={editCourseCode} onChange={(e) => setEditCourseCode(e.target.value)} placeholder="e.g. CS 301" required autoComplete="off" />
          <Input label="Term" value={editCourseTerm} onChange={(e) => setEditCourseTerm(e.target.value)} placeholder="e.g. Term I" required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Credits (optional)" type="number" value={editCourseCredits} onChange={(e) => setEditCourseCredits(e.target.value)} placeholder="3" />
            <Select label="Status" value={editCourseStatus} onChange={(e) => setEditCourseStatus(e.target.value as typeof editCourseStatus)}>
              <option value="in_progress">In Progress</option>
              <option value="planned">Planned</option>
              <option value="completed">Completed</option>
            </Select>
          </div>
        </div>
      </Modal>

      {/* ── Add Assignment Modal ──────────────────────────────────────────── */}
      <Modal
        isOpen={assignOpen}
        onClose={() => !savingAssign && setAssignOpen(false)}
        title="Add Assignment"
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setAssignOpen(false)} disabled={savingAssign}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleCreateAssignment} loading={savingAssign} disabled={!assignCourse || !assignTitle.trim() || !assignDue}>
              Add
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select label="Course" value={assignCourse} onChange={(e) => setAssignCourse(e.target.value)} required>
            <option value="">Select course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.code} – {c.name}</option>
            ))}
          </Select>
          <Input label="Title" value={assignTitle} onChange={(e) => setAssignTitle(e.target.value)} placeholder="e.g. Homework 1" required />
          <Input label="Description" value={assignDesc} onChange={(e) => setAssignDesc(e.target.value)} placeholder="Optional" />
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Due date</label>
            <input
              type="datetime-local"
              value={assignDue}
              onChange={(e) => setAssignDue(e.target.value)}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/60 px-4 py-2.5 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-primary-500/50"
            />
          </div>
          <Select label="Type" value={assignType} onChange={(e) => setAssignType(e.target.value)}>
            <option value="homework">Homework</option>
            <option value="project">Project</option>
            <option value="exam">Exam</option>
            <option value="quiz">Quiz</option>
            <option value="other">Other</option>
          </Select>
          <Input label="Weight % (optional)" type="number" value={assignWeight} onChange={(e) => setAssignWeight(e.target.value)} placeholder="10" />
        </div>
      </Modal>

      {/* ── Add Task Modal ────────────────────────────────────────────────── */}
      <Modal
        isOpen={taskOpen}
        onClose={() => !savingTask && setTaskOpen(false)}
        title="Add Task"
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setTaskOpen(false)} disabled={savingTask}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleCreateTask} loading={savingTask} disabled={!taskTitle.trim()}>
              Add
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Title" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="e.g. Review chapter 5" required />
          <Input label="Description" value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} placeholder="Optional" />
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Due date (optional)</label>
            <input
              type="datetime-local"
              value={taskDue}
              onChange={(e) => setTaskDue(e.target.value)}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/60 px-4 py-2.5 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-primary-500/50"
            />
          </div>
          <Select label="Priority" value={taskPriority} onChange={(e) => setTaskPriority(e.target.value as "low" | "medium" | "high")}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
          <Select label="Link to assignment (optional)" value={taskAssignment} onChange={(e) => setTaskAssignment(e.target.value)}>
            <option value="">None</option>
            {assignments.map((a) => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
          </Select>
        </div>
      </Modal>

      {/* ── Edit Task Modal ───────────────────────────────────────────────── */}
      <Modal
        isOpen={editTaskOpen}
        onClose={() => !savingEditTask && setEditTaskOpen(false)}
        title="Edit Task"
        size="sm"
        footer={
          <>
            <button
              onClick={() => editTask && handleDeleteTask(editTask.id)}
              disabled={savingEditTask || deletingTaskId !== null}
              className="mr-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-red-400 border border-red-800/40 hover:bg-red-950/30 transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {deletingTaskId ? "Deleting…" : "Delete"}
            </button>
            <Button variant="ghost" size="sm" onClick={() => setEditTaskOpen(false)} disabled={savingEditTask}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleUpdateTask} loading={savingEditTask} disabled={!editTaskTitle.trim()}>
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Title" value={editTaskTitle} onChange={(e) => setEditTaskTitle(e.target.value)} placeholder="e.g. Review chapter 5" required />
          <Input label="Description" value={editTaskDesc} onChange={(e) => setEditTaskDesc(e.target.value)} placeholder="Optional" />
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Due date (optional)</label>
            <input
              type="datetime-local"
              value={editTaskDue}
              onChange={(e) => setEditTaskDue(e.target.value)}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/60 px-4 py-2.5 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-primary-500/50"
            />
          </div>
          <Select label="Priority" value={editTaskPriority} onChange={(e) => setEditTaskPriority(e.target.value as "low" | "medium" | "high")}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
        </div>
      </Modal>
    </PageShell>
  );
};
