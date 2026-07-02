"use client";

import { toast } from "sonner";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useDeleteCourse, useUpdateCourse } from "@/hooks/use-courses";

export type CourseAction = "PUBLISH" | "ARCHIVE" | "DELETE";

export interface PendingCourseAction {
  action: CourseAction;
  courseId: string;
  courseName: string;
}

const COPY: Record<CourseAction, { title: string; description: (name: string) => string; confirmLabel: string; variant: "default" | "destructive"; toastMessage: (name: string) => string }> = {
  PUBLISH: {
    title: "Publish this course?",
    description: (name) => `"${name}" will become visible to students immediately.`,
    confirmLabel: "Publish Course",
    variant: "default",
    toastMessage: (name) => `"${name}" published.`,
  },
  ARCHIVE: {
    title: "Archive this course?",
    description: (name) => `"${name}" will be hidden from students but keeps its enrollment history.`,
    confirmLabel: "Archive Course",
    variant: "destructive",
    toastMessage: (name) => `"${name}" archived.`,
  },
  DELETE: {
    title: "Delete this course?",
    description: (name) => `This permanently removes "${name}" and cannot be undone.`,
    confirmLabel: "Delete Course",
    variant: "destructive",
    toastMessage: (name) => `"${name}" deleted.`,
  },
};

interface CourseActionDialogProps {
  pending: PendingCourseAction | null;
  onClose: () => void;
  onSuccess?: (action: CourseAction) => void;
}

export function CourseActionDialog({ pending, onClose, onSuccess }: CourseActionDialogProps) {
  const updateCourse = useUpdateCourse(pending?.courseId ?? "");
  const deleteCourse = useDeleteCourse();
  const copy = pending ? COPY[pending.action] : null;

  const handleConfirm = () => {
    if (!pending || !copy) return;
    const { action, courseId, courseName } = pending;

    if (action === "DELETE") {
      deleteCourse.mutate(courseId, {
        onSuccess: () => { toast.success(copy.toastMessage(courseName)); onSuccess?.(action); },
        onError: () => toast.error("Something went wrong. Please try again."),
      });
    } else {
      updateCourse.mutate(
        { status: action === "PUBLISH" ? "PUBLISHED" : "ARCHIVED" },
        {
          onSuccess: () => { toast.success(copy.toastMessage(courseName)); onSuccess?.(action); },
          onError: () => toast.error("Something went wrong. Please try again."),
        }
      );
    }
    onClose();
  };

  return (
    <AlertDialog open={!!pending} onOpenChange={(open) => { if (!open) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{copy?.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {pending && copy ? copy.description(pending.courseName) : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant={copy?.variant ?? "default"} onClick={handleConfirm}>
            {copy?.confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
