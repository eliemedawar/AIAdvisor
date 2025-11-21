import { useEffect, useState } from "react";
import { profileApi, StudentProfile, UpdateProfilePayload } from "../api/profileApi";

interface UseProfileState {
  profile: StudentProfile | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  saveProfile: (updates: UpdateProfilePayload) => Promise<void>;
}

export const useProfile = (): UseProfileState => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await profileApi.getProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const refreshProfile = async () => {
    await load();
  };

  const saveProfile = async (updates: UpdateProfilePayload) => {
    setError(null);
    try {
      const updated = await profileApi.updateProfile(updates);
      setProfile(updated);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to save profile.");
      throw err;
    }
  };

  return {
    profile,
    loading,
    error,
    refreshProfile,
    saveProfile
  };
};


