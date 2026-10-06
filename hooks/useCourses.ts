"use client";

import { useCallback, useEffect, useState } from "react";
import type { Course } from "@/lib/courses";
import { createClient } from "@/utils/supabase/client";

interface CourseRow {
  id: string;
  title: string;
  start_point: string;
  description: string;
  distance: number;
  elevation_gain: number;
  estimated_time: string;
  difficulty: Course["difficulty"];
  category: Course["category"];
  highlights: string[];
  elevation_data: [number, number][];
  image_url: string | null;
  user_id: string | null;
}

const fromRow = (r: CourseRow): Course => ({
  id: r.id,
  title: r.title,
  startPoint: r.start_point,
  description: r.description,
  distance: Number(r.distance),
  elevationGain: Number(r.elevation_gain),
  estimatedTime: r.estimated_time,
  difficulty: r.difficulty,
  category: r.category,
  highlights: r.highlights ?? [],
  elevationData: r.elevation_data ?? [],
  imageUrl: r.image_url || undefined,
  userId: r.user_id ?? undefined,
});

// user_id 는 DB 기본값(auth.uid())으로 채워지므로 클라이언트에서 보내지 않습니다.
const toRow = (c: Omit<Course, "id" | "userId">) => ({
  title: c.title,
  start_point: c.startPoint,
  description: c.description,
  distance: c.distance,
  elevation_gain: c.elevationGain,
  estimated_time: c.estimatedTime,
  difficulty: c.difficulty,
  category: c.category,
  highlights: c.highlights,
  elevation_data: c.elevationData,
  image_url: c.imageUrl ?? null,
});

const supabase = createClient();

/** Supabase `courses` 테이블 기반 CRUD. 실패 시 throw 하며 error 상태에도 기록합니다. */
export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from("courses")
      .select()
      .order("created_at", { ascending: true });
    if (error) {
      setError(error.message);
    } else {
      setError(null);
      setCourses((data as CourseRow[]).map(fromRow));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  const run = useCallback(
    async (op: PromiseLike<{ error: { message: string } | null }>) => {
      const { error } = await op;
      if (error) {
        setError(error.message);
        throw new Error(error.message);
      }
      await refresh();
    },
    [refresh],
  );

  const addCourse = useCallback(
    (data: Omit<Course, "id">) => run(supabase.from("courses").insert(toRow(data))),
    [run],
  );

  const updateCourse = useCallback(
    ({ id, ...data }: Course) => run(supabase.from("courses").update(toRow(data)).eq("id", id)),
    [run],
  );

  const deleteCourse = useCallback(
    (id: string) => run(supabase.from("courses").delete().eq("id", id)),
    [run],
  );

  return { courses, loading, error, addCourse, updateCourse, deleteCourse };
}
