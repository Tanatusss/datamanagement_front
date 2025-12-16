"use client";

import { useState } from "react";
import { Mail, Lock, LogIn, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState(""); // เดิม email → เปลี่ยนเป็น username
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const ok = await login(username, password);

    if (ok) {
      toast.success("Login success 🎉");
      setIsSubmitting(false);
      router.push("/");
    } else {
      toast.error("Username หรือ Password ไม่ถูกต้อง");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-2xl p-6 sm:p-8 border border-slate-200 bg-white shadow-[0_8px_20px_rgba(0,0,0,0.12)]">
        <div className="absolute inset-0 -z-10 rounded-2xl bg-linear-to-br from-cyan-200/20 to-sky-200/20 blur-xl" />

        <button
          onClick={() => router.push("/")}
          className="mb-6 inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          กลับหน้าแรก
        </button>

        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-slate-800">
            เข้าสู่ระบบ Data Management Platform
          </h1>
          <p className="text-sm text-slate-500">
            จัดการ data และ environment ได้ในที่เดียว
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">
              Username
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                placeholder="Enter your username"
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#1C3FAA] focus:border-[#3157E0]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-slate-600">
                Password
              </label>
              <button
                type="button"
                className="text-[#3157E0] hover:text-[#1C3FAA]"
              >
                ลืมรหัสผ่าน?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#1C3FAA] focus:border-[#3157E0]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#1C3FAA] px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-[#3157E0] active:bg-[#3157E0] disabled:opacity-60 disabled:cursor-wait"
          >
            <LogIn className="h-4 w-4" />
            {isSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
      </div>
    </main>
  );
}
