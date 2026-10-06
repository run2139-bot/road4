"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { categories, difficulties, type Category, type Course, type Difficulty } from "@/lib/courses";
import { generateElevationData, summarizeElevation } from "@/lib/elevation";

const SAMPLE_IMAGES = [
  { label: "해안 (샘플)", url: "/images/coast.svg" },
  { label: "업힐 (샘플)", url: "/images/hill.svg" },
  { label: "평지 (샘플)", url: "/images/flat.svg" },
];
const CUSTOM = "custom";

interface Props {
  /** 있으면 수정 모드, 없으면 신규 작성 모드 */
  course?: Course;
  onSubmit: (data: Omit<Course, "id">) => Promise<void>;
  onClose: () => void;
}

const inputCls =
  "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-primary";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-xs font-medium text-slate-400">{label}</span>
      {children}
    </label>
  );
}

export default function CourseFormModal({ course, onSubmit, onClose }: Props) {
  const elev = course ? summarizeElevation(course.elevationData) : null;
  const initialImage = course?.imageUrl ?? SAMPLE_IMAGES[0].url;
  const isSample = SAMPLE_IMAGES.some((s) => s.url === initialImage);

  const [title, setTitle] = useState(course?.title ?? "");
  const [distance, setDistance] = useState(course ? String(course.distance) : "");
  const [elevationGain, setElevationGain] = useState(course ? String(course.elevationGain) : "");
  const [estimatedTime, setEstimatedTime] = useState(course?.estimatedTime ?? "");
  const [difficulty, setDifficulty] = useState<Difficulty>(course?.difficulty ?? "초급");
  const [category, setCategory] = useState<Category>(course?.category ?? "평지");
  const [startPoint, setStartPoint] = useState(course?.startPoint ?? "");
  const [description, setDescription] = useState(course?.description ?? "");
  const [startEle, setStartEle] = useState(elev ? String(elev.start) : "");
  const [peakEle, setPeakEle] = useState(elev ? String(elev.peak) : "");
  const [endEle, setEndEle] = useState(elev ? String(elev.end) : "");
  const [imageChoice, setImageChoice] = useState(isSample ? initialImage : CUSTOM);
  const [customImage, setCustomImage] = useState(isSample ? "" : (course?.imageUrl ?? ""));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const dist = Number(distance);
    const gain = Number(elevationGain);
    const s = Number(startEle);
    const p = Number(peakEle);
    const en = Number(endEle);

    if (!title.trim()) return setError("코스명을 입력해 주세요.");
    if (!(dist > 0)) return setError("거리는 0보다 커야 해요.");
    if (!(gain >= 0)) return setError("획득고도는 0 이상이어야 해요.");
    if (p < Math.max(s, en)) return setError("최고고도는 시작·종료 고도보다 낮을 수 없어요.");

    // 고도·거리가 그대로면 기존 그래프 데이터를 유지합니다.
    const unchanged =
      course &&
      elev &&
      dist === course.distance &&
      s === elev.start &&
      p === elev.peak &&
      en === elev.end;

    setError("");
    setSaving(true);
    try {
      await onSubmit({
      title: title.trim(),
      distance: dist,
      elevationGain: gain,
      estimatedTime: estimatedTime.trim() || "-",
      difficulty,
      category,
      startPoint: startPoint.trim(),
      description: description.trim(),
      highlights: course?.highlights ?? [],
      elevationData: unchanged ? course.elevationData : generateElevationData(dist, s, p, en),
      imageUrl: (imageChoice === CUSTOM ? customImage.trim() : imageChoice) || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했어요.");
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-label={course ? "코스 수정" : "코스 추가"}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="max-h-[92vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-t-3xl border border-primary/30 bg-slate-950 p-6 sm:rounded-3xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{course ? "코스 수정" : "코스 추가하기"}</h2>
          <button type="button" onClick={onClose} aria-label="닫기" className="rounded-full p-2 text-slate-400 hover:text-white">
            <X className="size-5" />
          </button>
        </div>

        <Field label="코스명">
          <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} required />
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <Field label="거리 (km)">
            <input className={inputCls} type="number" min="0" step="0.1" value={distance} onChange={(e) => setDistance(e.target.value)} required />
          </Field>
          <Field label="획득고도 (m)">
            <input className={inputCls} type="number" min="0" value={elevationGain} onChange={(e) => setElevationGain(e.target.value)} required />
          </Field>
          <Field label="예상소요시간">
            <input className={inputCls} placeholder="예: 2시간 30분" value={estimatedTime} onChange={(e) => setEstimatedTime(e.target.value)} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="난이도">
            <select className={inputCls} value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
              {difficulties.map((d) => <option key={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="카테고리">
            <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
        </div>

        <Field label="출발지">
          <input className={inputCls} value={startPoint} onChange={(e) => setStartPoint(e.target.value)} />
        </Field>

        <Field label="코스 설명">
          <textarea className={inputCls} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>

        <fieldset>
          <legend className="mb-1 text-xs font-medium text-slate-400">
            고도 데이터 (m) — 입력하면 고도 그래프가 자동 생성돼요
          </legend>
          <div className="grid grid-cols-3 gap-3">
            <input className={inputCls} type="number" placeholder="시작고도" aria-label="시작고도" value={startEle} onChange={(e) => setStartEle(e.target.value)} required />
            <input className={inputCls} type="number" placeholder="최고고도" aria-label="최고고도" value={peakEle} onChange={(e) => setPeakEle(e.target.value)} required />
            <input className={inputCls} type="number" placeholder="종료고도" aria-label="종료고도" value={endEle} onChange={(e) => setEndEle(e.target.value)} required />
          </div>
        </fieldset>

        <Field label="이미지">
          <select className={inputCls} value={imageChoice} onChange={(e) => setImageChoice(e.target.value)}>
            {SAMPLE_IMAGES.map((s) => <option key={s.url} value={s.url}>{s.label}</option>)}
            <option value={CUSTOM}>URL 직접 입력</option>
          </select>
        </Field>
        {imageChoice === CUSTOM && (
          <input className={inputCls} type="url" placeholder="https://..." aria-label="이미지 URL" value={customImage} onChange={(e) => setCustomImage(e.target.value)} />
        )}

        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm text-slate-300 hover:border-slate-500">
            취소
          </button>
          <button type="submit" disabled={saving} className="rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-2.5 text-sm font-bold text-slate-950 hover:opacity-90 disabled:opacity-50">
            {saving ? "저장 중…" : course ? "수정 완료" : "추가"}
          </button>
        </div>
      </form>
    </div>
  );
}
