import { useEffect, useState } from "react";
import { DashboardOverview, dashboardApi } from "../api/dashboardApi";

interface UseDashboardState {
  overview: DashboardOverview | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useDashboard = (): UseDashboardState => {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.getOverview();
      setOverview({
        ...data,
        gpa_trend: data.gpa_trend ?? [],
        weekly_task_stats: data.weekly_task_stats ?? [],
        study_time_by_course: data.study_time_by_course ?? [],
      });
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to load dashboard.");
      setOverview(null);
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


