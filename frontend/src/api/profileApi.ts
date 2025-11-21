import { httpClient } from "./httpClient";

export interface StudentProfile {
  id: number;
  user: number;
  major: string;
  year: string;
  current_gpa: number | null;
  target_gpa: number | null;
  goals: string;
  time_zone: string;
  study_style: string;
}

export type UpdateProfilePayload = Partial<
  Pick<
    StudentProfile,
    "major" | "year" | "current_gpa" | "target_gpa" | "goals" | "time_zone" | "study_style"
  >
>;

export const profileApi = {
  async getProfile(): Promise<StudentProfile> {
    const { data } = await httpClient.get<StudentProfile>("/profile/");
    return data;
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<StudentProfile> {
    const { data } = await httpClient.patch<StudentProfile>("/profile/", payload);
    return data;
  }
};


