"use client";

import { useEffect } from "react";
import { Bookmark, Download, Mountain, Route, Timer, X } from "lucide-react";
import type { Course } from "@/lib/courses";
import { cn } from "@/lib/utils";
import ElevationChart from "./ElevationChart";
import { difficultyStyle } from "./CourseCard";

interface Props {
  course: Course;
  bookmarked: boolean;
  onClose: () => void;
  onToggleBookmark: () => void;
}

export default function CourseModal({ course, bookmarked, onClose, onToggleBookmark }: Props) {
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={course.title}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-primary/30 bg-slate-950 p-6 sm:rounded-3xl"
      >
        {course.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={course.imageUrl} alt="" className="-mx-6 -mt-6 mb-5 h-40 w-[calc(100%+3rem)] object-cover" />
        )}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex gap-2 text-xs font-semibold">
              <span className={cn("rounded-full px-2.5 py-1", difficultyStyle[course.difficulty])}>{course.difficulty}</span>
              <span className="rounded-full bg-primary/15 px-2.5 py-1 text-primary">{course.category}</span>
            </div>
            <h2 className="text-2xl font-bold">{course.title}</h2>
            <p className="text-sm text-slate-400">{course.startPoint}</p>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={onToggleBookmark}
              aria-pressed={bookmarked}
              aria-label={bookmarked ? "북마크 해제" : "북마크"}
              className="rounded-full p-2 text-slate-400 hover:text-accent"
            >
              <Bookmark className={cn("size-5", bookmarked && "fill-accent text-accent")} />
            </button>
            <button type="button" onClick={onClose} aria-label="닫기" className="rounded-full p-2 text-slate-400 hover:text-white">
              <X className="size-5" />
            </button>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-slate-300">{course.description}</p>

        <div className="mt-5 grid grid-cols-3 gap-3 text-center text-sm">
          {[
            { icon: Route, label: "거리", value: `${course.distance}km` },
            { icon: Mountain, label: "획득고도", value: `${course.elevationGain}m` },
            { icon: Timer, label: "예상시간", value: course.estimatedTime },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl bg-slate-900 p-3">
              <Icon className="mx-auto mb-1 size-5 text-primary" />
              <p className="text-xs text-slate-400">{label}</p>
              <p className="font-semibold">{value}</p>
            </div>
          ))}
        </div>

        <h3 className="mb-2 mt-6 text-sm font-semibold text-primary">고도 프로필</h3>
        <ElevationChart profile={course.elevationData} />

        <ul className="mt-4 flex flex-wrap gap-2 text-xs">
          {course.highlights.map((h) => (
            <li key={h} className="rounded-full border border-slate-700 px-3 py-1 text-slate-300">#{h}</li>
          ))}
        </ul>

        <a
          href="/gpx/sample.gpx"
          download={`${course.id}.gpx`}
          className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent py-3 font-bold text-slate-950 transition hover:opacity-90"
        >
          <Download className="size-5" /> GPX 다운로드
        </a>
      </div>
    </div>
  );
}
