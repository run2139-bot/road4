import { Bookmark, Mountain, Pencil, Route, Timer, Trash2 } from "lucide-react";
import type { Course } from "@/lib/courses";
import { cn } from "@/lib/utils";

export const difficultyStyle: Record<Course["difficulty"], string> = {
  초급: "bg-accent/15 text-accent",
  중급: "bg-yellow-400/15 text-yellow-300",
  상급: "bg-red-500/15 text-red-400",
};

interface Props {
  course: Course;
  bookmarked: boolean;
  /** 작성자 본인일 때만 수정/삭제 버튼을 노출합니다. */
  canEdit: boolean;
  onOpen: () => void;
  onToggleBookmark: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function CourseCard({ course, bookmarked, canEdit, onOpen, onToggleBookmark, onEdit, onDelete }: Props) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 transition hover:-translate-y-1 hover:border-primary/60 hover:shadow-[0_0_24px_-6px_#00f2fe]">
      <button
        type="button"
        onClick={onOpen}
        className="absolute inset-0 focus-visible:outline-2 focus-visible:outline-primary"
        aria-label={`${course.title} 상세 보기`}
      />
      {course.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={course.imageUrl} alt="" loading="lazy" className="h-36 w-full object-cover" />
      )}
      <div className="p-5">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold">
          <span className={cn("rounded-full px-2.5 py-1", difficultyStyle[course.difficulty])}>
            {course.difficulty}
          </span>
          <span className="rounded-full bg-primary/15 px-2.5 py-1 text-primary">
            {course.category}
          </span>
        </div>
        <h3 className="text-xl font-bold">{course.title}</h3>
        <p className="mt-1 text-sm text-slate-400">{course.startPoint}</p>
        <div className="mt-4 flex gap-4 text-sm text-slate-300">
          <span className="flex items-center gap-1"><Route className="size-4 text-primary" />{course.distance}km</span>
          <span className="flex items-center gap-1"><Mountain className="size-4 text-primary" />{course.elevationGain}m</span>
          <span className="flex items-center gap-1"><Timer className="size-4 text-primary" />{course.estimatedTime}</span>
        </div>
        {canEdit && (
          <div className="relative z-10 mt-4 flex justify-end gap-1 border-t border-slate-800 pt-3">
            <button
              type="button"
              onClick={onEdit}
              aria-label={`${course.title} 수정`}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-slate-400 transition hover:bg-slate-800 hover:text-primary"
            >
              <Pencil className="size-4" /> 수정
            </button>
            <button
              type="button"
              onClick={onDelete}
              aria-label={`${course.title} 삭제`}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-slate-400 transition hover:bg-slate-800 hover:text-red-400"
            >
              <Trash2 className="size-4" /> 삭제
            </button>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onToggleBookmark}
        aria-pressed={bookmarked}
        aria-label={bookmarked ? "북마크 해제" : "북마크"}
        className="absolute right-3 top-3 z-10 rounded-full bg-slate-950/60 p-2 text-slate-300 backdrop-blur transition hover:text-accent"
      >
        <Bookmark className={cn("size-5", bookmarked && "fill-accent text-accent")} />
      </button>
    </div>
  );
}
