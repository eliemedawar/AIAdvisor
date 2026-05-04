import { useEffect, useState, useMemo, useCallback } from "react";
import { CheckCircle, Circle, BookOpen, Sparkles, AlertCircle, ChevronDown } from "lucide-react";
import clsx from "clsx";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Select } from "./Select";
import {
  plannerApi,
  PlannedCourse,
  CourseStatus,
  CurriculaInfo,
  ElectiveOption,
} from "../../api/plannerApi";
import { useToast } from "../../context/ToastContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialMajor?: string;
  initialTerm?: number;
  curricula?: Record<string, CurriculaInfo>;
  availableMajors?: string[];
  onPlanSaved?: () => void;
}

type Step = "select" | "preview";

const FIXED_MAJORS = ["CCE", "CSE", "ECE"] as const;

const STATUS_CONFIG: Record<CourseStatus, { label: string; className: string }> = {
  completed: {
    label: "Completed",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-primary-500/15 text-primary-400 border-primary-500/30",
  },
  planned: {
    label: "Planned",
    className: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  },
};

const CATEGORY_COLOR: Record<string, string> = {
  "ECE Core": "text-primary-400",
  Core: "text-primary-400",
  Mathematics: "text-violet-400",
  "Mathematics/Statistics": "text-violet-400",
  "Mathematics Elective": "text-violet-300",
  Science: "text-cyan-400",
  "Science Lab": "text-cyan-300",
  "Science Elective": "text-cyan-300",
  English: "text-amber-400",
  Arabic: "text-amber-300",
  "General Education": "text-slate-400",
  "ECE Lab": "text-teal-400",
  "ECE Restricted Lab": "text-teal-300",
  "ECE Elective Lab": "text-teal-300",
  "CCE Restricted Elective": "text-orange-400",
  "EECE Elective": "text-orange-300",
  "Technical Elective": "text-rose-300",
  "Final Year Project": "text-emerald-400",
  "Engineering Management": "text-slate-300",
  Humanities: "text-slate-300",
  "Internship/Approved Experience": "text-emerald-300",
};

/** Stable key for a PlannedCourse slot. */
const slotKey = (c: PlannedCourse) => `${c.code}-${c.term_num}-${c.slot}`;

// ── Elective Picker ────────────────────────────────────────────────────────

interface ElectivePickerProps {
  reqType: string;
  electiveLists: Record<string, ElectiveOption[]>;
  selected: ElectiveOption | undefined;
  onSelect: (opt: ElectiveOption | undefined) => void;
}

const ElectivePicker = ({ reqType, electiveLists, selected, onSelect }: ElectivePickerProps) => {
  const [search, setSearch] = useState("");

  const options = electiveLists[reqType] ?? [];
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.code.toLowerCase().includes(q) || o.name.toLowerCase().includes(q)
    );
  }, [options, search]);

  return (
    <div
      className="mt-2 space-y-1.5"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <input
        type="text"
        placeholder="Search courses…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-slate-700/80 bg-surface-base px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-primary-500 focus:outline-none"
      />
      <div className="relative">
        <select
          value={selected?.code ?? ""}
          onChange={(e) => {
            const opt = options.find((o) => o.code === e.target.value);
            onSelect(opt);
          }}
          className="w-full appearance-none rounded-lg border border-slate-700/80 bg-surface-base py-1.5 pl-2.5 pr-7 text-xs text-slate-200 focus:border-primary-500 focus:outline-none"
        >
          <option value="">— choose an elective —</option>
          {filtered.map((o) => (
            <option key={o.code} value={o.code}>
              {o.code} — {o.name} ({o.credits} cr)
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-500"
          aria-hidden="true"
        />
      </div>
    </div>
  );
};

// ── Main Modal ─────────────────────────────────────────────────────────────

export const GeneratePlanModal = ({
  isOpen,
  onClose,
  initialMajor = "",
  initialTerm,
  curricula: curriculaProp,
  availableMajors: availableMajorsProp,
  onPlanSaved,
}: Props) => {
  const { showSuccess, showError } = useToast();

  const [step, setStep] = useState<Step>("select");
  const [major, setMajor] = useState(initialMajor);
  const [termNumber, setTermNumber] = useState<string>(
    initialTerm != null ? String(initialTerm) : ""
  );

  const [curricula, setCurricula] = useState<Record<string, CurriculaInfo>>(
    curriculaProp ?? {}
  );
  const [availableMajors, setAvailableMajors] = useState<string[]>(
    availableMajorsProp ?? []
  );
  const [loadingCurricula, setLoadingCurricula] = useState(false);

  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [courses, setCourses] = useState<(PlannedCourse & { selected: boolean })[]>([]);
  const [saving, setSaving] = useState(false);

  // Elective data
  const [electiveLists, setElectiveLists] = useState<Record<string, ElectiveOption[]>>({});
  // Map slotKey → chosen ElectiveOption
  const [electiveSelections, setElectiveSelections] = useState<
    Record<string, ElectiveOption>
  >({});

  // Fetch curricula if not provided
  useEffect(() => {
    if (!isOpen) return;
    if (curriculaProp && availableMajorsProp) {
      setCurricula(curriculaProp);
      setAvailableMajors(availableMajorsProp);
      return;
    }
    setLoadingCurricula(true);
    plannerApi
      .getCurricula()
      .then((r) => {
        setCurricula(r.curricula);
        setAvailableMajors(r.available_majors);
      })
      .finally(() => setLoadingCurricula(false));
  }, [isOpen, curriculaProp, availableMajorsProp]);

  // Fetch elective lists once (lazy – only when modal opens for the first time)
  useEffect(() => {
    if (!isOpen || Object.keys(electiveLists).length > 0) return;
    plannerApi.getElectives().then((r) => setElectiveLists(r.electives));
  }, [isOpen, electiveLists]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("select");
      setMajor(initialMajor);
      setTermNumber(initialTerm != null ? String(initialTerm) : "");
      setCourses([]);
      setPreviewError(null);
      setElectiveSelections({});
    }
  }, [isOpen, initialMajor, initialTerm]);

  const termOptions = curricula[major]?.terms ?? [];
  const hasCurriculum = availableMajors.includes(major);

  const handleMajorChange = (newMajor: string) => {
    setMajor(newMajor);
    const valid = curricula[newMajor]?.terms.some((t) => String(t.term_number) === termNumber);
    if (!valid) setTermNumber("");
  };

  const handleGeneratePreview = async () => {
    if (!major || !termNumber) return;
    setLoadingPreview(true);
    setPreviewError(null);
    try {
      const result = await plannerApi.generatePlan(major, Number(termNumber));
      setCourses(
        result.courses.map((c) => ({ ...c, selected: !c.is_duplicate }))
      );
      setStep("preview");
    } catch (err: any) {
      setPreviewError(
        err?.response?.data?.error || "Failed to generate plan. Please try again."
      );
    } finally {
      setLoadingPreview(false);
    }
  };

  const toggleCourse = useCallback((code: string, slot: number) => {
    setCourses((prev) =>
      prev.map((c) =>
        c.code === code && c.slot === slot && !c.is_duplicate
          ? { ...c, selected: !c.selected }
          : c
      )
    );
  }, []);

  const toggleTerm = useCallback((termNum: number) => {
    const eligible = courses.filter((c) => c.term_num === termNum && !c.is_duplicate);
    const allSelected = eligible.every((c) => c.selected);
    setCourses((prev) =>
      prev.map((c) =>
        c.term_num === termNum && !c.is_duplicate ? { ...c, selected: !allSelected } : c
      )
    );
  }, [courses]);

  const setElectiveForSlot = useCallback(
    (key: string, opt: ElectiveOption | undefined) => {
      setElectiveSelections((prev) => {
        const next = { ...prev };
        if (opt) {
          next[key] = opt;
        } else {
          delete next[key];
        }
        return next;
      });
    },
    []
  );

  const handleSavePlan = async () => {
    const toCreate = courses
      .filter((c) => c.selected && !c.is_duplicate)
      .map((c) => {
        if (!c.is_placeholder) return c;
        const key = slotKey(c);
        const sel = electiveSelections[key];
        if (!sel) return c; // save as placeholder
        return {
          ...c,
          code: sel.code,
          name: sel.name,
          credits: sel.credits,
          original_placeholder: c.code,
          requirement_type: c.requirement_type,
        };
      });

    if (toCreate.length === 0) {
      showError("Nothing to save", "Select at least one course to add.");
      return;
    }
    setSaving(true);
    try {
      const result = await plannerApi.applyPlan(toCreate);
      const n = result.created.length;
      const s = result.skipped.length;
      showSuccess(
        "Plan saved!",
        `Added ${n} course${n !== 1 ? "s" : ""}${s > 0 ? `, skipped ${s} duplicate${s !== 1 ? "s" : ""}` : ""}.`
      );
      onPlanSaved?.();
      onClose();
    } catch (err: any) {
      showError("Failed to save plan", err?.response?.data?.error || "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Group preview courses by term
  const grouped = useMemo(() => {
    const map = new Map<number, { label: string; courses: typeof courses }>();
    for (const c of courses) {
      if (!map.has(c.term_num)) {
        map.set(c.term_num, { label: c.term_label, courses: [] });
      }
      map.get(c.term_num)!.courses.push(c);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, [courses]);

  const selectedCount = courses.filter((c) => c.selected && !c.is_duplicate).length;
  const duplicateCount = courses.filter((c) => c.is_duplicate).length;

  // ── Footers ───────────────────────────────────────────────────────────────

  const selectFooter = (
    <>
      <Button variant="ghost" size="sm" onClick={onClose}>
        Cancel
      </Button>
      <Button
        size="sm"
        onClick={handleGeneratePreview}
        loading={loadingPreview}
        disabled={!major || !termNumber || !hasCurriculum || loadingPreview}
      >
        {loadingPreview ? "Generating…" : "Preview Plan"}
      </Button>
    </>
  );

  const previewFooter = (
    <>
      <Button variant="ghost" size="sm" onClick={() => setStep("select")}>
        Back
      </Button>
      <Button
        size="sm"
        onClick={handleSavePlan}
        loading={saving}
        disabled={selectedCount === 0}
      >
        Confirm & Save {selectedCount > 0 ? `(${selectedCount})` : ""}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        step === "select"
          ? "Generate My Academic Plan"
          : `${major} — ${curricula[major]?.program ?? "Academic Plan"}`
      }
      footer={step === "select" ? selectFooter : previewFooter}
      size={step === "preview" ? "xl" : "md"}
      disableBackdropClose={saving}
    >
      {/* ── Step 1: Select major + term ──────────────────────────────────── */}
      {step === "select" && (
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-xl border border-primary-500/20 bg-primary-500/8 p-4">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary-400" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-slate-300">
              Select your major and current term. Past terms will be marked{" "}
              <span className="text-emerald-400 font-medium">completed</span>, your current term{" "}
              <span className="text-primary-400 font-medium">in-progress</span>, and future terms{" "}
              <span className="text-slate-400 font-medium">planned</span>.
            </p>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <Select
              label="Major"
              name="gen-major"
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

            <Select
              label="Current Term"
              name="gen-term"
              value={termNumber}
              onChange={(e) => setTermNumber(e.target.value)}
              disabled={loadingCurricula || termOptions.length === 0}
            >
              <option value="">
                {loadingCurricula
                  ? "Loading…"
                  : termOptions.length === 0
                  ? "Select major first…"
                  : "Select term…"}
              </option>
              {termOptions.map((t) => (
                <option key={t.term_number} value={String(t.term_number)}>
                  {t.label} — {t.season}, Year {t.year}
                </option>
              ))}
            </Select>
          </div>

          {major && !hasCurriculum && !loadingCurricula && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-400">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              Curriculum for {major} is not available yet.
            </div>
          )}

          {previewError && (
            <div className="flex items-center gap-2 rounded-xl border border-danger-500/30 bg-danger-500/10 p-3 text-sm text-danger-400">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              {previewError}
            </div>
          )}
        </div>
      )}

      {/* ── Step 2: Review & confirm ──────────────────────────────────────── */}
      {step === "preview" && (
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-800/60 bg-surface-base p-3 text-xs">
            <span className="text-slate-400">
              <span className="font-semibold text-slate-200">{courses.length}</span> courses total
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400">
              <span className="font-semibold">
                {courses.filter((c) => c.status === "completed").length}
              </span>{" "}
              completed
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-primary-400">
              <span className="font-semibold">
                {courses.filter((c) => c.status === "in_progress").length}
              </span>{" "}
              in-progress
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">
              <span className="font-semibold">
                {courses.filter((c) => c.status === "planned").length}
              </span>{" "}
              planned
            </span>
            {duplicateCount > 0 && (
              <>
                <span className="text-slate-600">·</span>
                <span className="text-amber-400">
                  <span className="font-semibold">{duplicateCount}</span> already in planner
                </span>
              </>
            )}
          </div>

          <p className="text-xs text-slate-500">
            Uncheck courses you don't want. For elective slots, use the dropdown to pick a
            specific course — or leave it as a placeholder to decide later.
          </p>

          {/* Scrollable grouped list */}
          <div className="max-h-[58vh] overflow-y-auto space-y-5 pr-1">
            {grouped.map(([termNum, group]) => {
              const eligible = group.courses.filter((c) => !c.is_duplicate);
              const allSelected = eligible.length > 0 && eligible.every((c) => c.selected);

              return (
                <div key={termNum}>
                  {/* Term header */}
                  <button
                    type="button"
                    onClick={() => toggleTerm(termNum)}
                    className="mb-2 flex w-full items-center justify-between rounded-lg px-1 py-0.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-300 focus-visible:outline-none"
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                      {group.label}
                    </span>
                    {eligible.length > 0 && (
                      <span className="normal-case tracking-normal text-slate-500">
                        {allSelected ? "Deselect all" : "Select all"}
                      </span>
                    )}
                  </button>

                  {/* Course rows */}
                  <div className="space-y-1.5">
                    {group.courses.map((course) => {
                      const isDupe = course.is_duplicate;
                      const isPlaceholder = course.is_placeholder;
                      const key = slotKey(course);
                      const statusCfg = STATUS_CONFIG[course.status];
                      const catColor = CATEGORY_COLOR[course.category] ?? "text-slate-400";
                      const electiveSel = electiveSelections[key];

                      // ── Placeholder row (div, not button, so picker inputs work) ──
                      if (isPlaceholder && !isDupe) {
                        return (
                          <div
                            key={key}
                            className={clsx(
                              "rounded-xl border px-3 py-2.5 transition-all duration-quick",
                              course.selected
                                ? "border-primary-500/30 bg-primary-500/8"
                                : "border-slate-800/60 bg-surface-base"
                            )}
                          >
                            <div className="flex w-full items-center gap-3">
                              {/* Checkbox toggle */}
                              <button
                                type="button"
                                onClick={() => toggleCourse(course.code, course.slot)}
                                className="shrink-0 text-slate-500 focus-visible:outline-none"
                                aria-pressed={course.selected}
                                aria-label={
                                  course.selected
                                    ? `Deselect ${course.code}`
                                    : `Select ${course.code}`
                                }
                              >
                                {course.selected ? (
                                  <CheckCircle className="h-4 w-4 text-primary-400" />
                                ) : (
                                  <Circle className="h-4 w-4" />
                                )}
                              </button>

                              {/* Course info */}
                              <span className="flex flex-1 flex-col gap-0.5 min-w-0">
                                <span className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-medium text-slate-200 truncate">
                                    {electiveSel ? electiveSel.code : course.code}
                                  </span>
                                  <span className={clsx("text-[10px] font-medium", catColor)}>
                                    {course.category}
                                  </span>
                                  <span className="text-[10px] text-slate-500 italic">
                                    elective slot
                                  </span>
                                </span>
                                <span className="text-xs text-slate-400 truncate">
                                  {electiveSel ? electiveSel.name : course.name}
                                </span>
                              </span>

                              {/* Status + credits */}
                              <span className="flex shrink-0 flex-col items-end gap-1">
                                <span
                                  className={clsx(
                                    "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium",
                                    statusCfg.className
                                  )}
                                >
                                  {statusCfg.label}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  {electiveSel ? electiveSel.credits : course.credits} cr
                                </span>
                              </span>
                            </div>

                            {/* Elective picker — only shown when row is selected */}
                            {course.selected && course.requirement_type && (
                              <ElectivePicker
                                reqType={course.requirement_type}
                                electiveLists={electiveLists}
                                selected={electiveSel}
                                onSelect={(opt) => setElectiveForSlot(key, opt)}
                              />
                            )}
                          </div>
                        );
                      }

                      // ── Regular (or duplicate) course row ──────────────────
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => toggleCourse(course.code, course.slot)}
                          disabled={isDupe}
                          className={clsx(
                            "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-quick",
                            isDupe
                              ? "cursor-not-allowed border-slate-800/40 bg-surface-base opacity-50"
                              : course.selected
                              ? "border-primary-500/30 bg-primary-500/8 hover:bg-primary-500/12"
                              : "border-slate-800/60 bg-surface-base hover:border-slate-700/60 hover:bg-surface-elevated"
                          )}
                          aria-pressed={!isDupe ? course.selected : undefined}
                        >
                          <span className="shrink-0 text-slate-500" aria-hidden="true">
                            {isDupe ? (
                              <CheckCircle className="h-4 w-4 text-amber-400/60" />
                            ) : course.selected ? (
                              <CheckCircle className="h-4 w-4 text-primary-400" />
                            ) : (
                              <Circle className="h-4 w-4" />
                            )}
                          </span>

                          <span className="flex flex-1 flex-col gap-0.5 min-w-0">
                            <span className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-slate-200 truncate">
                                {course.code}
                              </span>
                              <span className={clsx("text-[10px] font-medium", catColor)}>
                                {course.category}
                              </span>
                              {isDupe && (
                                <span className="text-[10px] text-amber-400/80">
                                  already added
                                </span>
                              )}
                            </span>
                            <span className="text-xs text-slate-400 truncate">
                              {course.name}
                            </span>
                          </span>

                          <span className="flex shrink-0 flex-col items-end gap-1">
                            <span
                              className={clsx(
                                "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium",
                                statusCfg.className
                              )}
                            >
                              {statusCfg.label}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {course.credits} cr
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
};
