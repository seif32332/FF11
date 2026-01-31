"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
            } else {
                router.push("/dashboard");
            }
        } catch {
            setError("حدث خطأ أثناء تسجيل الدخول");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)' }}>
            <div className="w-full max-w-md">
                {/* الشعار */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))' }}>
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold mb-2">إدارة المهام</h1>
                    <p className="text-gray-400">سجّل دخولك للمتابعة</p>
                </div>

                {/* نموذج تسجيل الدخول */}
                <form onSubmit={handleSubmit} className="card">
                    {error && (
                        <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(226, 68, 92, 0.1)', color: 'var(--status-stuck)' }}>
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* البريد الإلكتروني */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                البريد الإلكتروني
                            </label>
                            <div className="relative">
                                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input pr-10"
                                    placeholder="email@example.com"
                                    required
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        {/* كلمة المرور */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                كلمة المرور
                            </label>
                            <div className="relative">
                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input pr-10 pl-10"
                                    placeholder="••••••••"
                                    required
                                    dir="ltr"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* تذكرني */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded" />
                                <span className="text-sm text-gray-400">تذكرني</span>
                            </label>
                            <Link href="/forgot-password" className="text-sm hover:underline" style={{ color: 'var(--primary-light)' }}>
                                نسيت كلمة المرور؟
                            </Link>
                        </div>

                        {/* زر الدخول */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full py-3 text-base"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    جاري تسجيل الدخول...
                                </>
                            ) : (
                                "تسجيل الدخول"
                            )}
                        </button>
                    </div>

                    {/* رابط إنشاء حساب */}
                    <div className="mt-6 text-center text-gray-400">
                        ليس لديك حساب؟{" "}
                        <Link href="/register" className="font-medium hover:underline" style={{ color: 'var(--primary-light)' }}>
                            أنشئ حساباً جديداً
                        </Link>
                    </div>
                </form>

                {/* حقوق النشر */}
                <p className="mt-8 text-center text-sm text-gray-500">
                    © 2026 إدارة المهام. جميع الحقوق محفوظة.
                </p>
            </div>
        </div>
    );
}
