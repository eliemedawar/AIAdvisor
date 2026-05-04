import { FormEvent, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  TrendingUp,
  BookOpen,
  AlertCircle,
  Sparkles,
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
  Select,
  Button,
  SkeletonCard,
} from "../../components";
import { GeneratePlanModal } from "../../components/core/GeneratePlanModal";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";
import { useToast } from "../../context/ToastContext";
import { plannerApi, CurriculaInfo } from "../../api/plannerApi";

const FIXED_MAJORS = ["CCE", "CSE", "ECE"] as const;

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.24, ease: [0.4, 0, 0.2, 1] },
  },
};

export const ProfilePage = () => {
  const { user } = useAuth();
  const { profile, loading, error, saveProfile } = useProfile();
  const { showSuccess, showError } = useToast();

  const [major, setMajor] = useState("");
  const [currentTerm, setCurrentTerm] = useState<string>("");
  const [currentGpa, setCurrentGpa] = useState<string>("");
  const [targetGpa, setTargetGpa] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);

  // Curriculum data for the term select
  const [curricula, setCurricula] = useState<Record<string, CurriculaInfo>>({});
  const [availableMajors, setAvailableMajors] = useState<string[]>([]);

  useEffect(() => {
    plannerApi.getCurricula().then((r) => {
      setAvailableMajors(r.available_majors);
      setCurricula(r.curricula);
    });
  }, []);

  useEffect(() => {
    if (profile) {
      setMajor(profile.major ?? "");
      setCurrentTerm(
        profile.current_semester != null ? String(profile.current_semester) : ""
      );
      setCurrentGpa(profile.current_gpa != null ? String(Number(profile.current_gpa)) : "");
      setTargetGpa(profile.target_gpa != null ? String(Number(profile.target_gpa)) : "");
    }
  }, [profile]);

  // Reset term when major changes and the current term is no longer valid
  const handleMajorChange = (newMajor: string) => {
    setMajor(newMajor);
    const terms = curricula[newMajor]?.terms ?? [];
    const valid = terms.some((t) => String(t.term_number) === currentTerm);
    if (!valid) setCurrentTerm("");
  };

  const termOptions = curricula[major]?.terms ?? [];
  const hasCurriculum = availableMajors.includes(major);
  const canGeneratePlan = hasCurriculum && currentTerm !== "";

  // Derive year label from term for the StatCard
  const termObj = termOptions.find((t) => String(t.term_number) === currentTerm);
  const yearDisplay = termObj ? `Year ${termObj.year}` : profile?.year || "Not set";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const parsedTarget = targetGpa.trim() === "" ? null : Number.parseFloat(targetGpa);
    const parsedCurrent = currentGpa.trim() === "" ? null : Number.parseFloat(currentGpa);
    const parsedTerm = currentTerm === "" ? null : Number.parseInt(currentTerm, 10);

    try {
      await saveProfile({
        major,
        current_semester: parsedTerm,
        current_gpa: Number.isNaN(parsedCurrent) ? null : parsedCurrent,
        target_gpa: Number.isNaN(parsedTarget) ? null : parsedTarget,
      });
      showSuccess("Profile updated", "Your dashboard will reflect these changes.");
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

  const userInitials =
    user?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";

  return (
    <PageShell>
      <motion.div initial="initial" animate="animate" variants={fadeInUp}>
        <PageSection>
          <header>
            <Heading level="h1">Profile</Heading>
            <Text variant="body" color="muted" className="mt-2">
              Manage your academic information and preferences.
            </Text>
          </header>

          {/* Profile Header */}
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

          {/* Stats */}
          <div className="grid gap-4 grid-cols-1 sm:gap-5 sm:grid-cols-3">
            <StatCard
              label="Current GPA"
              value={profile?.current_gpa != null ? Number(profile.current_gpa).toFixed(2) : "—"}
              icon={<TrendingUp className="h-4 w-4" />}
            />
            <StatCard
              label="Major"
              value={major || "Not set"}
              icon={<GraduationCap className="h-4 w-4" />}
            />
            <StatCard
              label="Year"
              value={yearDisplay}
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
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {/* Major */}
                <Select
                  label="Major"
                  name="major"
                  value={major}
                  onChange={(e) => handleMajorChange(e.target.value)}
                >
                  <option value="">Select major…</option>
                  {FIXED_MAJORS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                      {!availableMajors.includes(m) ? " (coming soon)" : ""}
                    </option>
                  ))}
                </Select>

                {/* Current Term — options driven by the selected major's curriculum */}
                <Select
                  label="Current Term"
                  name="current_term"
                  value={currentTerm}
                  onChange={(e) => setCurrentTerm(e.target.value)}
                  disabled={termOptions.length === 0}
                >
                  <option value="">
                    {termOptions.length === 0 ? "Select major first…" : "Select term…"}
                  </option>
                  {termOptions.map((t) => (
                    <option key={t.term_number} value={String(t.term_number)}>
                      {t.label} — {t.season}, Year {t.year}
                    </option>
                  ))}
                </Select>

                {/* Current GPA */}
                <Input
                  label="Current GPA"
                  value={currentGpa}
                  onChange={(e) => setCurrentGpa(e.target.value)}
                  placeholder="e.g. 3.2"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                />

                {/* Target GPA */}
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
                <div className="rounded-xl border border-slate-800/60 bg-surface-base p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                    Study Style
                  </p>
                  <p className="text-sm leading-relaxed text-slate-200">{profile.study_style}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setPlanModalOpen(true)}
                  disabled={!canGeneratePlan}
                  title={
                    !hasCurriculum && major
                      ? `Curriculum for ${major} is not available yet`
                      : !canGeneratePlan
                      ? "Set your major and current term first"
                      : undefined
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-primary-500/40 bg-primary-500/10 px-4 py-2 text-sm font-medium text-primary-300 transition-all duration-quick hover:bg-primary-500/20 hover:text-primary-200 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Generate My Academic Plan
                </button>

                <Button type="submit" loading={saving} size="md">
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </PageSection>
      </motion.div>

      <GeneratePlanModal
        isOpen={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        initialMajor={major}
        initialTerm={currentTerm ? Number(currentTerm) : undefined}
        curricula={curricula}
        availableMajors={availableMajors}
      />
    </PageShell>
  );
};
