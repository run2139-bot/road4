"use client";

import { useEffect, useMemo, useState } from "react";
import { Bike, Plus, Search } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import Header from "@/components/Header";
import WeatherWidget from "@/components/WeatherWidget";
import CourseCard from "@/components/CourseCard";
import CourseModal from "@/components/CourseModal";
import CourseFormModal from "@/components/CourseFormModal";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useCourses } from "@/hooks/useCourses";
import { useUser } from "@/hooks/useUser";
import { signOut } from "@/services/authService";
import { categories, difficulties, type Category, type Course, type Difficulty } from "@/lib/courses";
import { cn } from "@/lib/utils";

const MIN_SLIDER_MAX = 100;

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm font-medium transition",
        active
          ? "border-primary bg-primary/15 text-primary"
          : "border-slate-700 text-slate-400 hover:border-slate-500",
      )}
    >
      {children}
    </button>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [distanceLimit, setDistanceLimit] = useState<number | null>(null);
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Course | undefined>();
  const [onlyMine, setOnlyMine] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const { bookmarks, toggle } = useBookmarks();
  const { courses, loading, error, addCourse, updateCourse, deleteCourse } = useCourses();
  const { user, loading: userLoading } = useUser();
  const sliderMax = Math.max(MIN_SLIDER_MAX, ...courses.map((c) => c.distance));
  const maxDistance = Math.min(distanceLimit ?? sliderMax, sliderMax);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  // 로그아웃되면 "내 작성 코스" 필터와 열려 있던 작성 폼을 정리합니다.
  useEffect(() => {
    if (user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOnlyMine(false);
    setFormOpen(false);
  }, [user]);

  const openForm = (course?: Course) => {
    // 로그인하지 않았다면 작성 폼 대신 로그인 모달을 띄웁니다.
    if (!user) {
      setAuthOpen(true);
      return;
    }
    setEditing(course);
    setFormOpen(true);
  };
  const handleSignOut = async () => {
    try {
      await signOut();
      setToast("로그아웃되었어요.");
    } catch (err) {
      setToast(err instanceof Error ? err.message : "로그아웃에 실패했어요.");
    }
  };
  const closeForm = () => setFormOpen(false);
  const handleDelete = async (course: Course) => {
    if (!window.confirm(`"${course.title}" 코스를 삭제할까요?`)) return;
    try {
      await deleteCourse(course.id);
      if (selectedId === course.id) setSelectedId(null);
    } catch {}
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter(
      (c) =>
        (!q || c.title.toLowerCase().includes(q) || c.startPoint.toLowerCase().includes(q)) &&
        (!difficulty || c.difficulty === difficulty) &&
        (!category || c.category === category) &&
        c.distance <= maxDistance &&
        (!onlyBookmarks || bookmarks.includes(c.id)) &&
        (!onlyMine || (!!user && c.userId === user.id)),
    );
  }, [courses, query, difficulty, category, maxDistance, onlyBookmarks, bookmarks, onlyMine, user]);

  const selected = courses.find((c) => c.id === selectedId) ?? null;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
      <Header
        user={user}
        loading={userLoading}
        onlyMine={onlyMine}
        onToggleMine={() => setOnlyMine((v) => !v)}
        onOpenAuth={() => setAuthOpen(true)}
        onSignOut={handleSignOut}
      />
      <header className="flex flex-col items-start justify-between gap-8 pb-14 pt-8 md:flex-row md:items-center">
        <div>
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-widest text-primary">
            <Bike className="size-5" /> BUSAN ROAD CYCLING
          </p>
          <h1 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-4xl font-extrabold leading-tight text-transparent sm:text-5xl">
            부산 로드바이크
            <br />
            라이딩 코스 추천
          </h1>
          <p className="mt-4 max-w-md text-slate-400">
            바다, 업힐, 강변까지. 오늘의 바람과 컨디션에 맞는 부산 코스를 골라보세요.
          </p>
          <button
            type="button"
            onClick={() => openForm()}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:opacity-90"
          >
            <Plus className="size-4" /> 코스 추가하기
          </button>
        </div>
        <WeatherWidget />
      </header>

      <section aria-label="필터" className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <label className="relative block">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="코스명 또는 지역 검색"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs text-slate-500">난이도</span>
          {difficulties.map((d) => (
            <Chip key={d} active={difficulty === d} onClick={() => setDifficulty(difficulty === d ? null : d)}>{d}</Chip>
          ))}
          <span className="ml-3 mr-1 text-xs text-slate-500">카테고리</span>
          {categories.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(category === c ? null : c)}>{c}</Chip>
          ))}
          <span className="ml-3" />
          <Chip active={onlyBookmarks} onClick={() => setOnlyBookmarks((v) => !v)}>
            북마크만 ({bookmarks.length})
          </Chip>
        </div>
        <label className="flex items-center gap-4 text-sm">
          <span className="whitespace-nowrap text-slate-400">
            최대 거리 <b className="text-primary">{maxDistance}km</b>
          </span>
          <input
            type="range"
            min={10}
            max={sliderMax}
            step={1}
            value={maxDistance}
            onChange={(e) => setDistanceLimit(Number(e.target.value))}
            className="w-full"
          />
        </label>
      </section>

      <section className="mt-8">
        {error && (
          <p role="alert" className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            데이터베이스 오류: {error}
          </p>
        )}
        <p className="mb-4 text-sm text-slate-400">
          {loading ? "코스를 불러오는 중…" : `${filtered.length}개의 코스`}
        </p>
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-slate-900/60" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-700 py-16 text-center text-slate-500">
            조건에 맞는 코스가 없어요.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <CourseCard
                key={c.id}
                course={c}
                bookmarked={bookmarks.includes(c.id)}
                canEdit={!!user && c.userId === user.id}
                onOpen={() => setSelectedId(c.id)}
                onToggleBookmark={() => toggle(c.id)}
                onEdit={() => openForm(c)}
                onDelete={() => handleDelete(c)}
              />
            ))}
          </div>
        )}
      </section>

      {selected && (
        <CourseModal
          course={selected}
          bookmarked={bookmarks.includes(selected.id)}
          onClose={() => setSelectedId(null)}
          onToggleBookmark={() => toggle(selected.id)}
        />
      )}

      {formOpen && (
        <CourseFormModal
          key={editing?.id ?? "new"}
          course={editing}
          onClose={closeForm}
          onSubmit={async (data) => {
            if (editing) await updateCourse({ ...data, id: editing.id });
            else await addCourse(data);
            closeForm();
          }}
        />
      )}

      {authOpen && (
        <AuthModal
          onClose={() => setAuthOpen(false)}
          onSuccess={(message) => {
            setAuthOpen(false);
            setToast(message);
          }}
        />
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl border border-primary/40 bg-slate-900 px-5 py-3 text-sm shadow-lg"
        >
          {toast}
        </div>
      )}
    </main>
  );
}
