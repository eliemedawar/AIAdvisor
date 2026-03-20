import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, BookOpen, FileText, CheckSquare, AlertCircle, Check } from "lucide-react";
import {
  PageShell,
  PageSection,
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
import { plannerApi, type Course, type Assignment, type Task, type CreateCoursePayload, type CreateAssignmentPayload, type CreateTaskPayload } from "../../api/plannerApi";
import { useToast } from "../../context/ToastContext";

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

  // Add Course modal
  const [courseOpen, setCourseOpen] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseTerm, setCourseTerm] = useState("");
  const [courseCredits, setCourseCredits] = useState<string>("");
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
      };
      await plannerApi.createCourse(payload);
      showSuccess("Course added", `${courseCode} has been added.`);
      setCourseOpen(false);
      setCourseName("");
      setCourseCode("");
      setCourseTerm("");
      setCourseCredits("");
      load();
    } catch (err: any) {
      showError("Failed to add course", err?.response?.data?.detail || "Please try again.");
    } finally {
      setSavingCourse(false);
    }
  };

  // Add Assignment modal
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
      load();
    } catch (err: any) {
      showError("Failed to add assignment", err?.response?.data?.detail || "Please try again.");
    } finally {
      setSavingAssign(false);
    }
  };

  // Add Task modal
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
      load();
    } catch (err: any) {
      showError("Failed to add task", err?.response?.data?.detail || "Please try again.");
    } finally {
      setSavingTask(false);
    }
  };

  if (loading) {
    return (
      <PageShell>
        <PageSection>
          <Heading level="h1">Planner</Heading>
          <SkeletonCard />
        </PageSection>
      </PageShell>
    );
  }

  if (loadError) {
    return (
      <PageShell>
        <PageSection>
          <Heading level="h1">Planner</Heading>
          <Card variant="default" className="border-error-500/30">
            <EmptyState icon={<AlertCircle className="h-8 w-8" />} title="Unable to load" description={loadError} />
            <Button size="sm" variant="primary" onClick={load} className="mt-4">Try again</Button>
          </Card>
        </PageSection>
      </PageShell>
    );
  }

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

  const courseById = Object.fromEntries(courses.map((c) => [c.id, c]));
  const visibleAssignments = showDone ? assignments : assignments.filter((a) => a.status !== "done");
  const doneCount = assignments.filter((a) => a.status === "done").length;

  return (
    <PageShell>
      <motion.div initial="initial" animate="animate" variants={fadeInUp}>
        <PageSection className="space-y-8">
          <header>
            <Heading level="h1">Planner</Heading>
            <Text variant="body" color="muted" className="mt-2">
              Manage courses, assignments, and tasks. This data powers your dashboard and AI advisor.
            </Text>
          </header>

          {/* Courses */}
          <Card variant="elevated">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary-400" />
                <Heading level="h2" className="text-lg">Courses</Heading>
              </div>
              <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setCourseOpen(true)}>
                Add Course
              </Button>
            </div>
            <div className="mt-4 space-y-2">
              {courses.length === 0 ? (
                <EmptyState
                  icon={<BookOpen className="h-8 w-8" />}
                  title="No courses yet"
                  description="Add your first course to create assignments and track progress."
                  action={<Button size="sm" variant="primary" onClick={() => setCourseOpen(true)}>Add course</Button>}
                />
              ) : (
                courses.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-900/30 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-slate-100">{c.code} – {c.name}</p>
                      <p className="text-xs text-slate-400">{c.term}{c.credits != null ? ` · ${c.credits} cr` : ""}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Assignments */}
          <Card variant="elevated">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary-400" />
                <Heading level="h2" className="text-lg">Assignments</Heading>
                {doneCount > 0 && (
                  <button
                    onClick={() => setShowDone((v) => !v)}
                    className="ml-1 rounded-full px-2 py-0.5 text-xs text-slate-400 border border-slate-700/60 hover:text-slate-200 hover:border-slate-600 transition-colors"
                  >
                    {showDone ? "Hide done" : `+${doneCount} done`}
                  </button>
                )}
              </div>
              <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setAssignOpen(true)} disabled={courses.length === 0}>
                Add Assignment
              </Button>
            </div>
            <div className="mt-4 space-y-2">
              {visibleAssignments.length === 0 ? (
                <EmptyState
                  icon={<FileText className="h-8 w-8" />}
                  title="No assignments yet"
                  description="Add assignments to your courses to track deadlines."
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
                      <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${a.status === "done" ? "border-slate-800/30 bg-slate-900/10 opacity-50" : "border-slate-800/60 bg-slate-900/30"}`}>
                        <div className="min-w-0 flex-1">
                          <p className={`font-medium ${a.status === "done" ? "line-through text-slate-400" : "text-slate-100"}`}>{a.title}</p>
                          <p className="text-xs text-slate-400">
                            {courseById[a.course]?.code ?? a.course} · Due {new Date(a.due_at).toLocaleDateString()} · {a.type}
                          </p>
                        </div>
                        {a.status !== "done" && (
                          <button
                            onClick={() => handleCompleteAssignment(a.id)}
                            disabled={completingId === a.id}
                            title="Mark as done"
                            className="ml-3 flex-shrink-0 flex items-center gap-1 rounded-lg border border-slate-700/60 px-2.5 py-1.5 text-xs text-slate-400 hover:border-emerald-600/60 hover:text-emerald-400 transition-colors disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                            {completingId === a.id ? "Saving…" : "Done"}
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary-400" />
                <Heading level="h2" className="text-lg">Tasks</Heading>
              </div>
              <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setTaskOpen(true)}>
                Add Task
              </Button>
            </div>
            <div className="mt-4 space-y-2">
              {tasks.length === 0 ? (
                <EmptyState
                  icon={<CheckSquare className="h-8 w-8" />}
                  title="No tasks yet"
                  description="Add tasks to plan your week. Link them to assignments if needed."
                  action={<Button size="sm" variant="primary" onClick={() => setTaskOpen(true)}>Add task</Button>}
                />
              ) : (
                tasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-900/30 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-slate-100">{t.title}</p>
                      <p className="text-xs text-slate-400">
                        {t.due_at ? `Due ${new Date(t.due_at).toLocaleDateString()}` : "No due date"} · {t.priority}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </PageSection>
      </motion.div>

      {/* Add Course Modal */}
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
          <Input label="Course name" value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="e.g. Data Structures" required />
          <Input label="Code" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} placeholder="e.g. CS 301" required />
          <Input label="Term" value={courseTerm} onChange={(e) => setCourseTerm(e.target.value)} placeholder="e.g. Fall 2024" required />
          <Input label="Credits (optional)" type="number" value={courseCredits} onChange={(e) => setCourseCredits(e.target.value)} placeholder="3" />
        </div>
      </Modal>

      {/* Add Assignment Modal */}
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

      {/* Add Task Modal */}
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
    </PageShell>
  );
};
