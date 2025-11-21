import { FormEvent, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  TrendingUp,
  BookOpen,
  AlertCircle
} from "lucide-react";
import {
  PageShell,
  PageSection,
  Heading,
  Text,
  Card,
  SectionHeader,
  StatCard,
  Avatar,
  Input,
  Button,
  SkeletonCard,
} from "../../components";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";
import { useToast } from "../../context/ToastContext";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.24,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const ProfilePage = () => {
  const { user } = useAuth();
  const { profile, loading, error, saveProfile } = useProfile();
  const { showSuccess, showError } = useToast();

  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");
  const [targetGpa, setTargetGpa] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setMajor(profile.major ?? "");
      setYear(profile.year ?? "");
      setTargetGpa(
        profile.target_gpa != null ? profile.target_gpa.toString() : ""
      );
    }
  }, [profile]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const parsedTarget =
      targetGpa.trim() === "" ? null : Number.parseFloat(targetGpa);

    try {
      await saveProfile({
        major,
        year,
        target_gpa: Number.isNaN(parsedTarget) ? null : parsedTarget
      });
      showSuccess("Profile updated successfully", "Your dashboard will reflect these changes.");
    } catch (err: any) {
      showError(
        "Failed to save changes",
        err?.response?.data?.detail || "We couldn't save your changes. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading && !profile) {
    return (
      <PageShell>
        <PageSection>
          <header>
            <Heading level="h1">Profile</Heading>
            <Text variant="body" color="muted" className="mt-2">
              Basic information that powers your academic insights.
            </Text>
          </header>
          <SkeletonCard />
        </PageSection>
      </PageShell>
    );
  }

  if (error && !profile) {
    return (
      <PageShell>
        <PageSection>
          <Heading level="h1">Profile</Heading>
          <Card variant="elevated" role="alert" aria-live="assertive">
            <div className="flex items-center gap-3 text-danger-400">
              <AlertCircle className="h-5 w-5" aria-hidden="true" />
              <p className="text-sm">{error}</p>
            </div>
          </Card>
        </PageSection>
      </PageShell>
    );
  }

  const userInitials = user?.first_name?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U";

  return (
    <PageShell>
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
      >
        <PageSection>
          <header>
            <Heading level="h1">Profile</Heading>
            <Text variant="body" color="muted" className="mt-2">
              Manage your academic information and preferences.
            </Text>
          </header>

          {/* Profile Header Card - 8pt spacing (gap-4) */}
          <Card variant="elevated">
            <div className="flex items-center gap-4">
              <Avatar text={userInitials} size="xl" />
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-slate-100">
                  {user?.first_name || user?.last_name
                    ? `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim()
                    : "Student"}
                </h2>
                <p className="text-sm text-slate-400">{user?.email}</p>
              </div>
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid gap-4 grid-cols-1 sm:gap-5 sm:grid-cols-3">
            <StatCard
              label="Current GPA"
              value={
                profile?.current_gpa != null
                  ? profile.current_gpa.toFixed(2)
                  : "—"
              }
              icon={<TrendingUp className="h-4 w-4" />}
            />
            <StatCard
              label="Major"
              value={major || "Not set"}
              icon={<GraduationCap className="h-4 w-4" />}
            />
            <StatCard
              label="Year"
              value={year || "Not set"}
              icon={<BookOpen className="h-4 w-4" />}
            />
          </div>

          {/* Edit Form */}
          <Card variant="elevated">
            <SectionHeader
              title="Academic Information"
              subtitle="Update your details to get personalized insights"
              small
            />

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <Input
              label="Major"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              placeholder="e.g. Computer Science"
            />
            <Input
              label="Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g. 2nd year"
            />
            <Input
              label="Target GPA"
              value={targetGpa}
              onChange={(e) => setTargetGpa(e.target.value)}
              placeholder="e.g. 3.8"
              type="number"
              step="0.01"
              min="0"
              max="4"
            />
              </div>

              {profile?.study_style && (
                <div className="rounded-xl border border-slate-800/60 bg-surface-base shadow-elevation-low backdrop-blur-sm p-4">
                  <p className="text-xs font-semibold uppercase leading-tight tracking-wide text-slate-400 mb-2">
                    Study Style
                  </p>
                  <p className="text-sm leading-relaxed text-slate-200">{profile.study_style}</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-800/60">
                <Button type="submit" loading={saving} size="md">
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </PageSection>
      </motion.div>
    </PageShell>
  );
};


