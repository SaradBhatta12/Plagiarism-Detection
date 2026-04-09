"use client";

import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { logout } from "@/app/store/features/authSlice";
import { useLogoutMutation } from "@/app/store/api/apiSlice";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon, Shield } from "lucide-react";

export function Header() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [serverLogout, { isLoading }] = useLogoutMutation();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await serverLogout({}).unwrap();
    } catch (error) {
      console.error("Server logout failed:", error);
    } finally {
      dispatch(logout());
      router.push("/login");
    }
  };

  if (!isAuthenticated || !user) return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">

          <span className="text-xl font-bold tracking-tight text-slate-900">
            Plagiarism Dashboard
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden flex-col items-end sm:flex">
            <span className="text-sm font-medium text-slate-900">{user.name}</span>
            <span className="text-xs text-slate-500 capitalize">{user.role}</span>
          </div>
          <div className="h-10 w-10 items-center justify-center rounded-full bg-slate-100 flex">
            <UserIcon className="h-5 w-5 text-slate-600" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-slate-500 hover:text-red-500 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
