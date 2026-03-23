import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import {
  MOCK_USER, MOCK_TOKENS,
  courses, nextCourseId,
  assignments, nextAssignmentId,
  tasks, nextTaskId,
  calendarEvents, nextEventId,
  conversations, nextConvId,
  messages, nextMsgId,
  dashboardOverview,
  profile,
} from './mockStore';

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

function ok<T>(data: T): AxiosResponse<T> {
  return { data, status: 200, statusText: 'OK', headers: {}, config: {} as InternalAxiosRequestConfig };
}

function notFound(msg = 'Not found'): never {
  const err: any = new Error(msg);
  err.response = { data: { detail: msg }, status: 404, statusText: 'Not Found', headers: {}, config: {} };
  throw err;
}

export async function handleMockRequest(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  await delay(280);
  const method = (config.method ?? 'get').toLowerCase();
  const url = config.url ?? '';
  const body = config.data
    ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data)
    : {};

  // Auth — accept ANY email/password
  if (url.includes('/auth/login/'))    return ok({ user: MOCK_USER, ...MOCK_TOKENS });
  if (url.includes('/auth/register/')) return ok({ user: MOCK_USER, ...MOCK_TOKENS });
  if (url.includes('/auth/me/'))       return ok(MOCK_USER);
  if (url.includes('/auth/refresh/'))  return ok({ access: MOCK_TOKENS.access });

  // Dashboard
  if (url.includes('/dashboard/overview/')) return ok(dashboardOverview());

  // Profile
  if (url.includes('/profile/')) {
    if (method === 'patch' || method === 'put') Object.assign(profile, body);
    return ok(profile);
  }

  // Courses
  const courseMatch = url.match(/\/planner\/courses\/(\d+)\//);
  if (courseMatch) {
    const id = Number(courseMatch[1]);
    const idx = courses.findIndex(c => c.id === id);
    if (idx === -1) notFound('Course not found');
    if (method === 'delete') { courses.splice(idx, 1); return ok(null); }
    if (method === 'patch' || method === 'put') { Object.assign(courses[idx], body); return ok(courses[idx]); }
    return ok(courses[idx]);
  }
  if (url.includes('/planner/courses/')) {
    if (method === 'post') { const c = { id: nextCourseId(), user: 1, credits: null, ...body }; courses.push(c); return ok(c); }
    return ok(courses);
  }

  // Assignments
  const assignMatch = url.match(/\/planner\/assignments\/(\d+)\//);
  if (assignMatch) {
    const id = Number(assignMatch[1]);
    const idx = assignments.findIndex(a => a.id === id);
    if (idx === -1) notFound('Assignment not found');
    if (method === 'delete') { assignments.splice(idx, 1); return ok(null); }
    if (method === 'patch' || method === 'put') { Object.assign(assignments[idx], body); return ok(assignments[idx]); }
    return ok(assignments[idx]);
  }
  if (url.includes('/planner/assignments/')) {
    if (method === 'post') {
      const course = courses.find(c => c.id === (body.course ?? body.course_id));
      const a = { id: nextAssignmentId(), description: '', status: 'pending', weight: null, type: 'homework', course_name: course?.code ?? '', ...body, course: body.course ?? body.course_id };
      assignments.push(a); return ok(a);
    }
    return ok(assignments);
  }

  // Tasks
  const taskMatch = url.match(/\/planner\/tasks\/(\d+)\//);
  if (taskMatch) {
    const id = Number(taskMatch[1]);
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) notFound('Task not found');
    if (method === 'delete') { tasks.splice(idx, 1); return ok(null); }
    if (method === 'patch' || method === 'put') { Object.assign(tasks[idx], body); return ok(tasks[idx]); }
    return ok(tasks[idx]);
  }
  if (url.includes('/planner/tasks/')) {
    if (method === 'post') { const t = { id: nextTaskId(), user: 1, assignment: null, description: '', status: 'pending', ...body }; tasks.push(t); return ok(t); }
    return ok(tasks);
  }

  // Events
  const eventMatch = url.match(/\/planner\/events\/(\d+)\//);
  if (eventMatch) {
    const id = Number(eventMatch[1]);
    const idx = calendarEvents.findIndex(e => e.id === id);
    if (idx === -1) notFound('Event not found');
    if (method === 'delete') { calendarEvents.splice(idx, 1); return ok(null); }
    if (method === 'patch' || method === 'put') { Object.assign(calendarEvents[idx], body); return ok(calendarEvents[idx]); }
    return ok(calendarEvents[idx]);
  }
  if (url.includes('/planner/events/')) {
    if (method === 'post') { const e = { id: nextEventId(), user: 1, description: '', course: null, assignment: null, ...body }; calendarEvents.push(e); return ok(e); }
    return ok(calendarEvents);
  }

  // Advisor — clear messages
  if (url.match(/\/advisor\/conversations\/\d+\/messages\/$/) && method === 'delete') {
    const cid = Number(url.match(/\/advisor\/conversations\/(\d+)\//)?.[1]);
    let i;
    while ((i = messages.findIndex(m => m.conversation === cid)) !== -1) messages.splice(i, 1);
    return ok(null);
  }

  // Advisor — apply actions
  if (url.match(/\/advisor\/conversations\/\d+\/apply-actions\//) && method === 'post') {
    const actions = body.actions ?? [];
    const created = { assignment_ids: [] as number[], event_ids: [] as number[], task_ids: [] as number[] };
    for (const action of actions) {
      if (action.type === 'create_assignment') {
        const course = courses.find(c => c.code === action.course_code);
        const a = { id: nextAssignmentId(), user: 1, description: '', weight: null, course: course?.id ?? null, course_name: action.course_code, status: 'pending', type: 'homework', title: action.title, due_at: action.due_at };
        assignments.push(a); created.assignment_ids.push(a.id);
      } else if (action.type === 'create_task') {
        const t = { id: nextTaskId(), user: 1, assignment: null, description: '', status: 'pending', ...action };
        tasks.push(t); created.task_ids.push(t.id);
      } else if (action.type === 'create_calendar_event') {
        const course = courses.find(c => c.code === action.course_code);
        const e = { id: nextEventId(), user: 1, description: '', course: course?.id ?? null, assignment: null, title: action.title, start_at: action.start_at, end_at: action.end_at, type: action.event_type ?? 'other' };
        calendarEvents.push(e); created.event_ids.push(e.id);
      }
    }
    const confirmMsg = { id: nextMsgId(), conversation: 1, role: 'assistant' as const, content: `Done! Added ${actions.length} item(s) to your planner.`, created_at: new Date().toISOString() };
    messages.push(confirmMsg);
    return ok({ messages: [confirmMsg], created });
  }

  // Advisor — send message
  if (url.match(/\/advisor\/conversations\/\d+\/messages\/$/) && method === 'post') {
    const convId = Number(url.match(/\/advisor\/conversations\/(\d+)\//)?.[1]);
    const userMsg = { id: nextMsgId(), conversation: convId, role: 'user' as const, content: body.content, created_at: new Date().toISOString() };
    messages.push(userMsg);
    const reply = generateReply(body.content);
    const botMsg = { id: nextMsgId(), conversation: convId, role: 'assistant' as const, content: reply.content, created_at: new Date().toISOString() };
    messages.push(botMsg);
    return ok({ messages: [userMsg, botMsg], proposed_actions: reply.proposed_actions, action_plan_confidence: reply.proposed_actions.length > 0 ? 0.88 : undefined });
  }

  // Advisor — get messages
  if (url.match(/\/advisor\/conversations\/\d+\/messages\//) && method === 'get') {
    const convId = Number(url.match(/\/advisor\/conversations\/(\d+)\//)?.[1]);
    return ok(messages.filter(m => m.conversation === convId));
  }

  // Advisor — create / list conversations
  if (url.includes('/advisor/conversations/') && method === 'post') {
    const conv = { id: nextConvId(), user: 1, title: body.title ?? 'New Conversation', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    conversations.push(conv); return ok(conv);
  }
  if (url.includes('/advisor/conversations/')) return ok(conversations);

  notFound(`No mock handler for ${method.toUpperCase()} ${url}`);
}

function generateReply(input: string): { content: string; proposed_actions: any[] } {
  const l = input.toLowerCase();
  if (l.includes('plan') && l.includes('week'))
    return { content: 'Here\'s your week plan:\n\n**Mon:** Review BFS notes (2h)\n**Tue:** Code DFS for Assignment 3 (3h)\n**Wed:** DB schema design (2h)\n**Thu:** MATH202 Problem Set 5 (1.5h)\n**Fri:** Submit Assignment 3 (1h)', proposed_actions: [] };
  if (l.includes('exam') || l.includes('midterm'))
    return { content: 'Your upcoming exam is **CS301 Midterm** in ~3 weeks.\n\n• **Week 1:** Lecture notes weeks 1-3, sorting algorithms\n• **Week 2:** Graph algorithms, past papers\n• **Week 3:** Light review + rest\n\nWant me to add study sessions to your calendar?', proposed_actions: [] };
  if (l.includes('deadline') || l.includes('due') || l.includes('upcoming'))
    return { content: 'Your upcoming deadlines:\n\n1. **Assignment 3** (CS301) — due in 3 days\n2. **Problem Set 5** (MATH202) — due in 6 days\n3. **Project Milestone 2** (CS410) — due in 10 days\n4. **Sprint 1 Demo** (CS450) — due in 14 days\n5. **CS301 Midterm** — due in 21 days', proposed_actions: [] };
  if (l.includes('gpa'))
    return { content: 'Your current GPA is **3.62**, trending up (+0.22 over 4 semesters). To keep improving: prioritise high-weight assignments and boost MATH202 study time this week.', proposed_actions: [] };
  return { content: 'Got it! I can help you:\n\n• **Plan your week** — prioritise by deadline and weight\n• **Review deadlines** — see what\'s coming up\n• **Prep for exams** — build a study schedule\n• **Add tasks or events** — update your planner\n\nWhat would you like to work on?', proposed_actions: [] };
}
