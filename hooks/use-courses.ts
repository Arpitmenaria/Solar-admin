"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { coursesService, type CreateCourseInput, type UpdateCourseInput } from "@/services/courses.service";

export const courseKeys = {
  all: ["courses"] as const,
  list: () => ["courses", "list"] as const,
  stats: () => ["courses", "stats"] as const,
  detail: (id: string) => ["courses", "detail", id] as const,
};

export function useCourses() {
  return useQuery({ queryKey: courseKeys.list(), queryFn: coursesService.getCourses, staleTime: 30_000 });
}

export function useCourseStats() {
  return useQuery({ queryKey: courseKeys.stats(), queryFn: coursesService.getCourseStats, staleTime: 30_000 });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: () => coursesService.getCourseById(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCourseEnrollments(id: string) {
  return useQuery({
    queryKey: [...courseKeys.detail(id), "enrollments"],
    queryFn: () => coursesService.getCourseEnrollments(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCourseInput) => coursesService.createCourse(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: courseKeys.all }),
  });
}

export function useUpdateCourse(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateCourseInput) => coursesService.updateCourse(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: courseKeys.all }),
  });
}

export function useDeleteCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => coursesService.deleteCourse(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: courseKeys.all }),
  });
}
