import type { AuthUser } from '../api/authApi';
import type { Conversation, Message } from '../api/advisorApi';
import type { Course, Assignment, Task, CalendarEvent } from '../api/plannerApi';

export const MOCK_USER: AuthUser = {
  id: 1,
  email: 'demo@university.edu',
  first_name: 'Alex',
  last_name: 'Morgan',
  date_joined: '2024-09-01T00:00:00Z',
};

export const MOCK_TOKENS = {
  access: 'mock-access-token',
  refresh: 'mock-refresh-token',
};

const now = new Date();
const d = (offsetDays: number) =>
  new Date(now.getTime() + offsetDays * 86_400_000).toISOString();

export let courses: Course[] = [
  { id: 1, user: 1, name: 'Data Structures & Algorithms', code: 'CS301', term: 'Spring 2025', credits: 3 },
  { id: 2, user: 1, name: 'Linear Algebra',               code: 'MATH202', term: 'Spring 2025', credits: 3 },
  { id: 3, user: 1, name: 'Database Systems',             code: 'CS410', term: 'Spring 2025', credits: 3 },
  { id: 4, user: 1, name: 'Software Engineering',         code: 'CS450', term: 'Spring 2025', credits: 3 },
];
let courseIdSeq = 5;
export const nextCourseId = () => courseIdSeq++;

export let assignments: Assignment[] = [
  { id: 1, course: 1, course_name: 'CS301',   title: 'Assignment 3: Graph Traversal', description: 'Implement BFS and DFS',            due_at: d(3),  status: 'pending',     weight: 0.1,  type: 'homework' },
  { id: 2, course: 2, course_name: 'MATH202', title: 'Problem Set 5',                 description: 'Eigenvalues and eigenvectors',       due_at: d(6),  status: 'pending',     weight: 0.08, type: 'homework' },
  { id: 3, course: 3, course_name: 'CS410',   title: 'Project Milestone 2',           description: 'Schema design and initial queries', due_at: d(10), status: 'in_progress', weight: 0.2,  type: 'project' },
  { id: 4, course: 4, course_name: 'CS450',   title: 'Sprint 1 Demo',                 description: 'Present working prototype',         due_at: d(14), status: 'pending',     weight: 0.15, type: 'project' },
  { id: 5, course: 1, course_name: 'CS301',   title: 'Midterm Exam',                  description: 'Covers weeks 1-7',                  due_at: d(21), status: 'pending',     weight: 0.3,  type: 'exam' },
  { id: 6, course: 2, course_name: 'MATH202', title: 'Quiz 3',                        description: 'Vector spaces',                     due_at: d(-2), status: 'done',        weight: 0.05, type: 'quiz' },
];
let assignmentIdSeq = 7;
export const nextAssignmentId = () => assignmentIdSeq++;

export let tasks: Task[] = [
  { id: 1, user: 1, assignment: 1, title: 'Review BFS lecture notes',       description: '', due_at: d(1),  status: 'pending',     priority: 'high' },
  { id: 2, user: 1, assignment: 1, title: 'Code DFS implementation',         description: '', due_at: d(2),  status: 'pending',     priority: 'high' },
  { id: 3, user: 1, assignment: 3, title: 'Draft ER diagram for DB project', description: '', due_at: d(5),  status: 'in_progress', priority: 'medium' },
  { id: 4, user: 1, assignment: null, title: 'Read MATH202 textbook ch. 6',  description: '', due_at: d(4),  status: 'pending',     priority: 'medium' },
  { id: 5, user: 1, assignment: null, title: 'Set up dev environment CS450', description: '', due_at: d(7),  status: 'pending',     priority: 'low' },
  { id: 6, user: 1, assignment: null, title: 'Review last week\'s lecture',  description: '', due_at: d(-1), status: 'done',        priority: 'low' },
];
let taskIdSeq = 7;
export const nextTaskId = () => taskIdSeq++;

const evt = (offsetDays: number, h: number, durH = 1): [string, string] => {
  const s = new Date(now); s.setDate(s.getDate() + offsetDays); s.setHours(h, 0, 0, 0);
  const e = new Date(s); e.setHours(h + durH);
  return [s.toISOString(), e.toISOString()];
};

export let calendarEvents: CalendarEvent[] = [
  { id: 1, user: 1, title: 'CS301 Lecture',         description: 'Graph theory intro',      start_at: evt(1,9)[0],   end_at: evt(1,9,1)[1],   type: 'class', course: 1, assignment: null },
  { id: 2, user: 1, title: 'Study: Graph Traversal', description: 'BFS/DFS practice',       start_at: evt(2,14)[0],  end_at: evt(2,14,2)[1],  type: 'study', course: 1, assignment: 1 },
  { id: 3, user: 1, title: 'MATH202 Lecture',        description: 'Eigenvalues',             start_at: evt(2,10)[0],  end_at: evt(2,10,1)[1],  type: 'class', course: 2, assignment: null },
  { id: 4, user: 1, title: 'DB Project Work',        description: 'Schema design session',   start_at: evt(3,15)[0],  end_at: evt(3,15,2)[1],  type: 'study', course: 3, assignment: 3 },
  { id: 5, user: 1, title: 'CS301 Midterm',          description: 'Covers weeks 1-7',        start_at: evt(21,9)[0],  end_at: evt(21,9,2)[1],  type: 'exam',  course: 1, assignment: 5 },
  { id: 6, user: 1, title: 'Sprint 1 Demo',          description: 'CS450 prototype demo',    start_at: evt(14,13)[0], end_at: evt(14,13,1)[1], type: 'other', course: 4, assignment: 4 },
];
let eventIdSeq = 7;
export const nextEventId = () => eventIdSeq++;

export let conversations: Conversation[] = [
  { id: 1, user: 1, title: 'General Advising', created_at: new Date(now.getTime() - 86400000).toISOString(), updated_at: now.toISOString() },
];
export let messages: Message[] = [
  { id: 1, conversation: 1, role: 'assistant', content: 'Hi Alex! I\'m your AI Academic Advisor. What would you like to work on today?', created_at: new Date(now.getTime() - 86400000).toISOString() },
];
let convIdSeq = 2;
let msgIdSeq = 2;
export const nextConvId = () => convIdSeq++;
export const nextMsgId = () => msgIdSeq++;

export const dashboardOverview = () => ({
  current_gpa: 3.62,
  gpa_trend: [
    { term: 'Fall 2023',   gpa: 3.40 },
    { term: 'Spring 2024', gpa: 3.55 },
    { term: 'Fall 2024',   gpa: 3.58 },
    { term: 'Spring 2025', gpa: 3.62 },
  ],
  upcoming_deadlines: assignments
    .filter(a => a.status !== 'done')
    .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime())
    .slice(0, 5)
    .map(a => ({ id: a.id, title: a.title, due_at: a.due_at, priority: 'medium', course_name: a.course_name })),
  weekly_tasks: tasks.filter(t => t.status !== 'done').slice(0, 5)
    .map(t => ({ id: t.id, title: t.title, due_at: t.due_at, priority: t.priority })),
  weekly_task_stats: [
    { week: 'Mon', completed: 2, planned: 3 },
    { week: 'Tue', completed: 1, planned: 2 },
    { week: 'Wed', completed: 3, planned: 3 },
    { week: 'Thu', completed: 0, planned: 2 },
    { week: 'Fri', completed: 1, planned: 2 },
    { week: 'Sat', completed: 2, planned: 2 },
    { week: 'Sun', completed: 0, planned: 1 },
  ],
  study_time_by_course: [
    { courseName: 'CS301',   hours: 8 },
    { courseName: 'MATH202', hours: 4 },
    { courseName: 'CS410',   hours: 6 },
    { courseName: 'CS450',   hours: 3 },
  ],
});

export let profile = { user: 1, major: 'Computer Science', university: 'Demo University', year: 3, gpa: 3.62 };
