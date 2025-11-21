import { useEffect, useState } from "react";
import { DashboardOverview, dashboardApi } from "../api/dashboardApi";

interface UseDashboardState {
  overview: DashboardOverview | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Generate realistic mock data for dashboard when backend is unavailable
 */
const generateMockDashboardData = (): DashboardOverview => {
  const now = new Date();
  
  // Mock GPA trend (last 8 weeks)
  const gpa_trend = [
    { label: "Week 1", gpa: 3.45 },
    { label: "Week 2", gpa: 3.52 },
    { label: "Week 3", gpa: 3.48 },
    { label: "Week 4", gpa: 3.65 },
    { label: "Week 5", gpa: 3.68 },
    { label: "Week 6", gpa: 3.72 },
    { label: "Week 7", gpa: 3.70 },
    { label: "Week 8", gpa: 3.75 },
  ];

  // Mock weekly task stats
  const weekly_task_stats = [
    { day: "Mon", completed: 4, planned: 5 },
    { day: "Tue", completed: 6, planned: 6 },
    { day: "Wed", completed: 3, planned: 5 },
    { day: "Thu", completed: 7, planned: 7 },
    { day: "Fri", completed: 4, planned: 6 },
    { day: "Sat", completed: 2, planned: 3 },
    { day: "Sun", completed: 1, planned: 2 },
  ];

  // Mock study time by course
  const study_time_by_course = [
    { courseName: "Algorithms", hours: 12 },
    { courseName: "Database Systems", hours: 8 },
    { courseName: "Web Development", hours: 10 },
    { courseName: "Data Structures", hours: 6 },
    { courseName: "Software Engineering", hours: 5 },
  ];

  // Mock upcoming deadlines
  const upcoming_deadlines = [
    {
      id: 1,
      course: 101,
      title: "Algorithm Analysis Project",
      description: "Implement and analyze sorting algorithms",
      due_at: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: "in_progress" as const,
      weight: 25,
      type: "project",
    },
    {
      id: 2,
      course: 102,
      title: "Database Design Homework",
      description: "Design ER diagram for e-commerce system",
      due_at: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      status: "pending" as const,
      weight: 15,
      type: "homework",
    },
    {
      id: 3,
      course: 103,
      title: "Midterm Exam",
      description: "Chapters 1-5",
      due_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "pending" as const,
      weight: 30,
      type: "exam",
    },
  ];

  // Mock weekly tasks
  const weekly_tasks = [
    {
      id: 1,
      user: 1,
      assignment: 1,
      title: "Review sorting algorithms",
      description: "Study quicksort and mergesort",
      due_at: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: "in_progress" as const,
      priority: "high" as const,
    },
    {
      id: 2,
      user: 1,
      assignment: 2,
      title: "Complete ER diagram draft",
      description: "First draft for database assignment",
      due_at: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: "pending" as const,
      priority: "medium" as const,
    },
    {
      id: 3,
      user: 1,
      assignment: null,
      title: "Prepare midterm study guide",
      description: "Compile notes from all chapters",
      due_at: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: "pending" as const,
      priority: "high" as const,
    },
  ];

  return {
    current_gpa: 3.75,
    upcoming_deadlines,
    weekly_tasks,
    study_time_this_week_hours: 41,
    next_events: [],
    gpa_trend,
    weekly_task_stats,
    study_time_by_course,
  };
};

export const useDashboard = (): UseDashboardState => {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.getOverview();
      
      // Enhance backend data with mock data for missing fields
      const enhancedData: DashboardOverview = {
        ...data,
        gpa_trend: data.gpa_trend?.length ? data.gpa_trend : generateMockDashboardData().gpa_trend,
        weekly_task_stats: data.weekly_task_stats?.length ? data.weekly_task_stats : generateMockDashboardData().weekly_task_stats,
        study_time_by_course: data.study_time_by_course?.length ? data.study_time_by_course : generateMockDashboardData().study_time_by_course,
      };
      
      setOverview(enhancedData);
    } catch (err: any) {
      // On error, use full mock data but still surface error
      setError(err?.response?.data?.detail || "Failed to load dashboard.");
      setOverview(generateMockDashboardData());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const refresh = async () => {
    await load();
  };

  return { overview, loading, error, refresh };
};


