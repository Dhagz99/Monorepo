

"use client";

import { ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {  LoginSchema, LoginSchema1, loginSchema1 } from "@repo/shared";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/UserContext";
import { useLogin } from "@/hooks/auth/useLogin";
import { toast } from "sonner";


export default function LoginPage() {

    const router = useRouter();
    const { refreshUser } = useAuth();

    const { mutateAsync, isPending, error } = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema1>({
    resolver: zodResolver(loginSchema1),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginSchema) => {
    await mutateAsync(data);
    toast.success("Login successful")
    await refreshUser();
    router.replace("/");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        {/* LEFT SIDE */}
        <div className="hidden lg:flex bg-gradient-to-br from-blue-900 to-blue-700 text-white p-12 flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <div>
                <h1 className="text-2xl font-bold">CIC Reporting System</h1>
                <p className="text-blue-100 text-sm">
                  Lending & Compliance Platform
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 z-10">
            <div>
              <h2 className="text-4xl font-bold leading-tight">
                Professional Loan Reporting Platform
              </h2>

              <p className="mt-4 text-blue-100 leading-relaxed text-sm">
                Securely manage borrowers, loans, and CIC submissions in one
                centralized platform.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-sm border border-white/10">
                <p className="text-3xl font-bold">1,245</p>
                <p className="text-sm text-blue-100 mt-1">Borrowers</p>
              </div>

              <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-sm border border-white/10">
                <p className="text-3xl font-bold">825</p>
                <p className="text-sm text-blue-100 mt-1">Active Loans</p>
              </div>
            </div>
          </div>

          <div className="text-sm text-blue-100 z-10">
            © 2025 CIC Reporting System
          </div>

          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-20 -left-20 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl" />
        </div>

        {/* RIGHT SIDE */}
        <div className="p-8 md:p-14 flex items-center">
          <div className="w-full max-w-md mx-auto">
            <div className="mb-10">
              <h2 className="text-4xl font-bold text-slate-800">
                Welcome Back
              </h2>

              <p className="text-slate-500 mt-3">
                Login to continue to your dashboard.
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {/* USERNAME */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Username
                </label>

                <input
                  type="text"
                  placeholder="Enter username"
                  {...register("username")}
                  className="w-full h-12 rounded-xl border border-slate-300 px-4 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />

                {errors.username && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Enter password"
                  {...register("password")}
                  className="w-full h-12 rounded-xl border border-slate-300 px-4 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />

                {errors.password && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-600">
                  <input type="checkbox" className="rounded" />
                  Remember me
                </label>

                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 transition text-white font-semibold shadow-lg shadow-blue-500/20"
              >
                {isSubmitting ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <div className="mt-10 text-center text-sm text-slate-500">
              Secure Enterprise Lending & CIC Compliance Platform
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
