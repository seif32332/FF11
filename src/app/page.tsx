import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import {
  CheckCircle,
  BarChart3,
  Users,
  Zap,
  ArrowLeft,
  Layout,
  Calendar,
  Bell
} from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="header justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))' }}>
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">إدارة المهام</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn btn-ghost">
            تسجيل الدخول
          </Link>
          <Link href="/register" className="btn btn-primary">
            ابدأ مجاناً
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/10 to-transparent"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
            <Zap className="w-4 h-4" style={{ color: 'var(--primary-light)' }} />
            <span className="text-sm" style={{ color: 'var(--primary-light)' }}>نظام إدارة المهام الأكثر تطوراً</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            أدر مشاريعك بكفاءة
            <br />
            <span style={{ color: 'var(--primary-light)' }}>واحتفظ بتركيزك</span>
          </h1>

          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            نظام متكامل لإدارة المهام والمشاريع يساعد فريقك على التعاون بفعالية وتحقيق أهدافكم بسرعة
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="btn btn-primary px-8 py-4 text-lg">
              ابدأ مجاناً
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link href="#features" className="btn btn-secondary px-8 py-4 text-lg">
              اكتشف المزيد
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: 'var(--primary-light)' }}>+10K</div>
              <div className="text-gray-400 text-sm mt-1">مستخدم نشط</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: 'var(--status-done)' }}>99.9%</div>
              <div className="text-gray-400 text-sm mt-1">وقت التشغيل</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: 'var(--status-working)' }}>+50K</div>
              <div className="text-gray-400 text-sm mt-1">مهمة مكتملة</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">كل ما تحتاجه لإدارة مشاريعك</h2>
            <p className="text-gray-400 text-lg">أدوات قوية ومرنة تتكيف مع طريقة عملك</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="card card-hover">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
                <Layout className="w-6 h-6" style={{ color: 'var(--primary-light)' }} />
              </div>
              <h3 className="text-xl font-bold mb-2">ألواح مرنة</h3>
              <p className="text-gray-400">
                أنشئ ألواح مخصصة بأعمدة متنوعة تناسب سير عملك الفريد
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card card-hover">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(0, 200, 117, 0.15)' }}>
                <Users className="w-6 h-6" style={{ color: 'var(--status-done)' }} />
              </div>
              <h3 className="text-xl font-bold mb-2">تعاون الفريق</h3>
              <p className="text-gray-400">
                شارك المهام مع فريقك وتتبع التقدم في الوقت الفعلي
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card card-hover">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(253, 171, 61, 0.15)' }}>
                <Zap className="w-6 h-6" style={{ color: 'var(--status-working)' }} />
              </div>
              <h3 className="text-xl font-bold mb-2">أتمتة ذكية</h3>
              <p className="text-gray-400">
                أتمت المهام المتكررة وركز على ما يهم حقاً
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card card-hover">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(87, 155, 252, 0.15)' }}>
                <Calendar className="w-6 h-6" style={{ color: 'var(--status-new)' }} />
              </div>
              <h3 className="text-xl font-bold mb-2">عروض متعددة</h3>
              <p className="text-gray-400">
                اعرض بياناتك كجدول أو كانبان أو جدول زمني
              </p>
            </div>

            {/* Feature 5 */}
            <div className="card card-hover">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(226, 68, 92, 0.15)' }}>
                <BarChart3 className="w-6 h-6" style={{ color: 'var(--status-stuck)' }} />
              </div>
              <h3 className="text-xl font-bold mb-2">تقارير ولوحات</h3>
              <p className="text-gray-400">
                راقب تقدم مشاريعك بلوحات تحكم شاملة
              </p>
            </div>

            {/* Feature 6 */}
            <div className="card card-hover">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
                <Bell className="w-6 h-6" style={{ color: 'var(--primary-light)' }} />
              </div>
              <h3 className="text-xl font-bold mb-2">إشعارات فورية</h3>
              <p className="text-gray-400">
                ابق على اطلاع بكل التحديثات في الوقت الفعلي
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card text-center p-12" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(79, 70, 229, 0.1))' }}>
            <h2 className="text-3xl font-bold mb-4">ابدأ في إدارة مشاريعك اليوم</h2>
            <p className="text-gray-400 text-lg mb-8">
              انضم إلى آلاف الفرق الناجحة التي تستخدم نظامنا
            </p>
            <Link href="/register" className="btn btn-primary px-8 py-4 text-lg">
              ابدأ مجاناً - لا تحتاج بطاقة ائتمان
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4" style={{ borderColor: 'var(--border-color)' }}>
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">إدارة المهام</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2026 إدارة المهام. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  );
}
