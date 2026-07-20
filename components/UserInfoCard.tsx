"use client";

import { UserRound } from "lucide-react";

interface UserInfoCardProps {
  name: string;
  email: string;
  photoURL?: string | null;
  year?: string;
  role?: string;
  className?: string;
}

export default function UserInfoCard({
  name,
  email,
  photoURL,
  year,
  role,
  className = "",
}: UserInfoCardProps) {
  const isAdmin = role === "admin" || role === "teacher";
  return (
    <div className={`flex items-center gap-3 px-2 pb-4 mb-2 border-b border-ink-900/8 ${className}`}>
      {photoURL ? (
        <img
          src={photoURL}
          alt=""
          className="h-10 w-10 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-iris-600 text-sm font-semibold text-white">
          {name ? name.charAt(0).toUpperCase() : <UserRound className="h-5 w-5" />}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-ink-900">{name}</p>
          {role && (
            <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
              isAdmin
                ? "bg-iris-500/10 text-iris-600"
                : "bg-emerald-500/10 text-emerald-600"
            }`}>
              {role}
            </span>
          )}
        </div>
        <p className="truncate text-xs text-ink-900/50">{email}</p>
        {year && <p className="text-xs text-ink-900/40">Year {year}</p>}
      </div>
    </div>
  );
}
