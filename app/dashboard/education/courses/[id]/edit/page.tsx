"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { CourseForm, type CourseFormValues } from "@/components/education/course-form";
import { CourseModuleBuilder } from "@/components/education/course-module-builder";
import { Skeleton } from "@/components/shared/loading-skeleton";
import type { Course, CourseModule } from "@/constants/education-mock-data";
import { useCourse, useUpdateCourse } from "@/hooks/use-courses";

function EditCourseForm({ course, id }: { course: Course; id: string }) {
  const router = useRouter();
  const updateCourse = useUpdateCourse(id);
  const [modules, setModules] = useState<CourseModule[]>(course.modules);

  const handleSubmit = (values: CourseFormValues) => {
    updateCourse.mutate(
      { ...values, modules },
      {
        onSuccess: (updated) => {
          toast.success(`"${updated.title}" course updated.`);
          router.push("/dashboard/education/courses");
        },
        onError: () => toast.error("Couldn't update the course. Please try again."),
      }
    );
  };

  return (
    <div className="flex flex-1 flex-col">
      <CourseForm
        defaultValues={course}
        submitLabel="Save Changes"
        showStatus
        onSubmit={handleSubmit}
        isSubmitting={updateCourse.isPending}
      />
      <div className="px-4 pb-10 sm:px-6">
        <CourseModuleBuilder modules={modules} onChange={setModules} />
      </div>
    </div>
  );
}

export default function EditCoursePage() {
  const { id } = useParams<{ id: string }>();
  const { data: course, isLoading } = useCourse(id);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-5 p-4 md:p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!course) {
    return <div className="flex flex-1 items-center justify-center text-muted-foreground">Course not found</div>;
  }

  return <EditCourseForm course={course} id={id} />;
}
