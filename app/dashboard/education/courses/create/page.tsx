"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CourseForm, type CourseFormValues } from "@/components/education/course-form";
import { CourseModuleBuilder } from "@/components/education/course-module-builder";
import type { CourseModule } from "@/constants/education-mock-data";
import { useCreateCourse } from "@/hooks/use-courses";

export default function CreateCoursePage() {
  const router = useRouter();
  const createCourse = useCreateCourse();
  const [modules, setModules] = useState<CourseModule[]>([]);

  function handleSubmit(values: CourseFormValues) {
    createCourse.mutate(
      { ...values, modules },
      {
        onSuccess: () => {
          toast.success(`"${values.title}" created.`);
          router.push("/dashboard/education/courses");
        },
        onError: () => toast.error("Something went wrong. Please try again."),
      }
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <CourseForm submitLabel="Create Course" onSubmit={handleSubmit} isSubmitting={createCourse.isPending} />
      <div className="px-4 pb-10 sm:px-6">
        <CourseModuleBuilder modules={modules} onChange={setModules} />
      </div>
    </div>
  );
}
