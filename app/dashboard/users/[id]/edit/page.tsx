"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Camera, Globe, MapPin, FileText, User } from "lucide-react";
import { BackButton } from "@/components/shared/back-button";
import { FormField } from "@/components/forms/field";
import { CustomSelect } from "@/components/shared/custom-select";
import { useUser, useUpdateUser } from "@/hooks/use-users";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { cn } from "@/lib/utils";

const GENDER_OPTIONS = [
  { value: "",                  label: "Select gender"        },
  { value: "Male",              label: "Male"                 },
  { value: "Female",            label: "Female"               },
  { value: "Non-binary",        label: "Non-binary"           },
  { value: "Prefer not to say", label: "Prefer not to say"   },
];
const RELATIONSHIP_OPTIONS = [
  { value: "",                   label: "Select status"        },
  { value: "Single",             label: "Single"               },
  { value: "Married",            label: "Married"              },
  { value: "In a relationship",  label: "In a relationship"    },
  { value: "Complicated",        label: "Complicated"          },
];

const profileSchema = z.object({
  fullName:           z.string().min(2, "Full name is required"),
  username:           z.string().min(2, "Username is required"),
  displayName:        z.string().min(1, "Display name is required"),
  dateOfBirth:        z.string().min(1, "Date of birth is required"),
  gender:             z.string().min(1, "Gender is required"),
  relationshipStatus: z.string().min(1, "Relationship status is required"),
  location:           z.string(),
  email:              z.string().email("Invalid email address"),
  phone:              z.string(),
  website:            z.string().refine((v) => v === "" || /^https?:\/\//.test(v), "Invalid URL"),
  bio:                z.string().max(500, "Bio must be under 500 characters"),
});

type ProfileSchema = z.infer<typeof profileSchema>;

const inputCn = (hasError: boolean) =>
  cn(
    "w-full rounded-lg border bg-white/[0.04] px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-[#3a4a6a] transition-all focus:outline-none focus:bg-white/[0.06]",
    hasError
      ? "border-red-500/50 focus:border-red-500"
      : "border-white/[0.09] focus:border-blue-500/50"
  );

const selectCn = (hasError: boolean) =>
  cn(
    "w-full appearance-none rounded-lg border bg-card px-3.5 py-2.5 text-sm text-slate-200 transition-all focus:outline-none cursor-pointer",
    hasError
      ? "border-red-500/50 focus:border-red-500"
      : "border-white/[0.09] focus:border-blue-500/50"
  );

export default function EditProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: user, isLoading } = useUser(id);
  const { mutateAsync: updateUser, isPending: isSaving } = useUpdateUser(id);
  const [coverImage, setCoverImage]   = useState<string | null>(null);
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const coverRef  = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);

  const {
    register, handleSubmit, reset, watch, setValue,
    formState: { errors, isDirty },
  } = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "", username: "", displayName: "", dateOfBirth: "",
      gender: "", relationshipStatus: "", location: "",
      email: "", phone: "", website: "", bio: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        fullName:           user.fullName,
        username:           user.username.replace("@", ""),
        displayName:        user.displayName,
        dateOfBirth:        user.dateOfBirth,
        gender:             user.gender,
        relationshipStatus: user.relationshipStatus,
        location:           user.location,
        email:              user.email,
        phone:              user.phone,
        website:            user.website,
        bio:                user.bio,
      });
      if (user.avatarUrl) setAvatarImage(user.avatarUrl);
    }
  }, [user, reset]);

  const bioLength = (watch("bio") ?? "").length;

  const onSubmit = async (data: ProfileSchema) => {
    await updateUser(data);
    router.push(`/dashboard/users/${id}`);
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (v: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) setter(URL.createObjectURL(file));
  };

  if (isLoading) return <EditSkeleton />;

  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1 p-6">
        <form
          id="profile-form"
          onSubmit={handleSubmit(onSubmit)}
          className="max-w-[900px] space-y-5"
        >
          {/* ── Page title row ── */}
          <div className="flex items-start justify-between">
            <div>
              <BackButton />
              <h1 className="mt-3 text-[22px] font-bold text-white">Account Settings</h1>
              <p className="mt-1 text-sm text-caption">
                Update member profile details and credentials.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 pt-0.5">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-lg border border-white/[0.15] px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.05]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !isDirty}
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>

          {/* ── Cover + avatar ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-xl border border-white/[0.08]"
          >
            {/* Cover photo */}
            <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[#0d1f4a] via-[#0f2356] to-[#1a3a7a]">
              {coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverImage} alt="Cover" className="absolute inset-0 h-full w-full object-cover" />
              )}
              {/* Dot-grid pattern overlay */}
              <div
                className="absolute inset-0 opacity-25"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(99,155,255,0.5) 1px, transparent 1px)",
                  backgroundSize: "26px 26px",
                }}
              />
              {/* Glow blobs */}
              <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-blue-600/20 blur-3xl" />
              <div className="absolute -bottom-6 right-16 h-32 w-32 rounded-full bg-indigo-600/20 blur-2xl" />

              <button
                type="button"
                onClick={() => coverRef.current?.click()}
                className="absolute right-4 top-4 flex items-center gap-1.5 rounded-lg border border-white/[0.18] bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/60"
              >
                <Camera size={12} /> Edit Cover
              </button>
              <input
                ref={coverRef} type="file" accept="image/*" className="hidden"
                aria-label="Upload cover image"
                onChange={(e) => handleImageUpload(e, setCoverImage)}
              />
            </div>

            {/* Avatar + identity */}
            <div className="bg-card px-6 pb-5 pt-0">
              <div className="-mt-10 flex items-end gap-4">
                {/* Avatar — circular to match Figma */}
                <div className="relative shrink-0">
                  <div className="h-24 w-24 overflow-hidden rounded-full border-[3px] border-card bg-[#1a2a4a]">
                    {avatarImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarImage} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-blue-400">
                        {user?.displayName?.[0] ?? "?"}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => avatarRef.current?.click()}
                    aria-label="Change avatar"
                    className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-blue-600 transition-colors hover:bg-blue-700"
                  >
                    <Camera size={11} className="text-white" />
                  </button>
                  <input
                    ref={avatarRef} type="file" accept="image/*" className="hidden"
                    aria-label="Upload avatar image"
                    onChange={(e) => handleImageUpload(e, setAvatarImage)}
                  />
                </div>

                {/* Identity text */}
                <div className="pb-1">
                  <span className="mb-1.5 inline-block rounded border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-blue-400">
                    Identity Anchor
                  </span>
                  <h2 className="text-xl font-bold leading-none text-white">
                    {user?.displayName}
                  </h2>
                  <p className="mt-0.5 text-sm text-caption">{user?.username}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Form sections ── */}
          <div className="grid grid-cols-[1fr_340px] gap-5">

            {/* Personal Information */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="space-y-5 rounded-xl border border-white/[0.08] bg-card p-6"
            >
              <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-3">
                <User size={15} className="text-blue-500" />
                <h3 className="text-[13px] font-semibold text-white">Personal Information</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField htmlFor="fullName" label="FULL NAME" error={errors.fullName?.message}>
                  <input id="fullName" {...register("fullName")}
                    className={inputCn(!!errors.fullName)} placeholder="Alex Rivera" />
                </FormField>

                <FormField htmlFor="username" label="USERNAME" error={errors.username?.message}>
                  <input id="username" {...register("username")} readOnly
                    className={cn(inputCn(false), "cursor-not-allowed opacity-55 text-caption")} />
                </FormField>

                <FormField htmlFor="displayName" label="DISPLAY NAME" error={errors.displayName?.message}>
                  <input id="displayName" {...register("displayName")}
                    className={inputCn(!!errors.displayName)} placeholder="The Flow Captain" />
                </FormField>

                <FormField htmlFor="dateOfBirth" label="DATE OF BIRTH" error={errors.dateOfBirth?.message}>
                  <input id="dateOfBirth" type="date" {...register("dateOfBirth")}
                    className={inputCn(!!errors.dateOfBirth)} />
                </FormField>

                <FormField htmlFor="gender" label="GENDER" error={errors.gender?.message}>
                  <CustomSelect
                    value={watch("gender")}
                    onChange={(v) => setValue("gender", v, { shouldDirty: true, shouldValidate: true })}
                    options={GENDER_OPTIONS}
                    hasError={!!errors.gender}
                    className="w-full"
                  />
                </FormField>

                <FormField htmlFor="relationshipStatus" label="RELATIONSHIP STATUS" error={errors.relationshipStatus?.message}>
                  <CustomSelect
                    value={watch("relationshipStatus")}
                    onChange={(v) => setValue("relationshipStatus", v, { shouldDirty: true, shouldValidate: true })}
                    options={RELATIONSHIP_OPTIONS}
                    hasError={!!errors.relationshipStatus}
                    className="w-full"
                  />
                </FormField>
              </div>

              {/* Location — full width */}
              <FormField htmlFor="location" label="LOCATION" error={errors.location?.message}>
                <div className="relative">
                  <MapPin size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-caption" />
                  <input id="location" {...register("location")}
                    className={cn(inputCn(!!errors.location), "pl-9")}
                    placeholder="New Hampshire, USA" />
                </div>
              </FormField>
            </motion.div>

            {/* Connectivity */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="space-y-5 rounded-xl border border-white/[0.08] bg-card p-6"
            >
              <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-3">
                <Globe size={15} className="text-blue-500" />
                <h3 className="text-[13px] font-semibold text-white">Connectivity</h3>
              </div>

              <FormField htmlFor="email" label="EMAIL ADDRESS" error={errors.email?.message}>
                <input id="email" type="email" {...register("email")}
                  className={inputCn(!!errors.email)} placeholder="alex.rivera@example.com" />
              </FormField>

              <FormField htmlFor="phone" label="PHONE NUMBER" error={errors.phone?.message}>
                <input id="phone" type="tel" {...register("phone")}
                  className={inputCn(!!errors.phone)} placeholder="+1(555) 234-5678" />
              </FormField>

              <FormField htmlFor="website" label="WEBSITE" error={errors.website?.message}>
                <div className="relative">
                  <Globe size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-caption" />
                  <input id="website" {...register("website")}
                    className={cn(inputCn(!!errors.website), "pl-9")}
                    placeholder="https://alexrivera.dev" />
                </div>
              </FormField>
            </motion.div>
          </div>

          {/* ── Professional Bio ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="rounded-xl border border-white/[0.08] bg-card p-6"
          >
            <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-3 mb-5">
              <FileText size={15} className="text-blue-500" />
              <h3 className="text-[13px] font-semibold text-white">Professional Bio</h3>
            </div>

            <FormField htmlFor="bio" label="" error={errors.bio?.message}>
              <textarea
                id="bio"
                {...register("bio")}
                rows={5}
                placeholder="Enter a brief description about the user, their role, and contributions..."
                className={cn(inputCn(!!errors.bio), "resize-none leading-relaxed")}
              />
              <p className="mt-1.5 text-right text-xs text-caption">
                Characters remaining: {500 - bioLength}
              </p>
            </FormField>
          </motion.div>

        </form>
      </main>
    </div>
  );
}

function EditSkeleton() {
  return (
    <div className="flex-1 space-y-5 p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-52 rounded-xl" />
      <div className="grid grid-cols-[1fr_340px] gap-5">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
      <Skeleton className="h-44 rounded-xl" />
    </div>
  );
}
