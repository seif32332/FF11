# نظام إدارة المهام (Monday Clone Arabic)

نظام إدارة مهام متكامل يدعم اللغة العربية (RTL) بشكل كامل، مستوحى من Monday.com.

## الميزات الرئيسية

### 1. إدارة اللوحات (Boards)
- إنشاء وتعديل وحذف اللوحات
- تخصيص الأعمدة (نصوص، أرقام، تواريخ، أشخاص، حالات)
- تحديث العناوين والألوان والأحجام

### 2. طرق عرض متعددة
- **جدول (Table):** العرض التقليدي للمهام
- **كانبان (Kanban):** سحب وإفلات البطاقات بين الحالات
- **خط زمن (Timeline):** عرض المهام على نطاق زمني
- **تقويم (Calendar):** عرض المهام في تقويم شهري

### 3. مركز الإشعارات
- تنبيهات فورية (Real-time) باستخدام Pusher
- شارات للرسائل غير المقروءة
- تمييز الإشعارات كمقروءة

### 4. البحث المتقدم
- بحث سريع (Cmd+K)
- بحث في اللوحات والمهام
- سجل البحث الحديث

### 5. إدارة الملفات
- رفع الملفات باستخدام Vercel Blob
- سحب وإفلات (Drag & Drop)
- معاينة الصور والملفات

## التقنيات المستخدمة

- **Framework:** Next.js 14 (App Router)
- **Database:** Prisma with PostgreSQL
- **Styling:** Tailwind CSS v3 (RTL support)
- **Auth:** NextAuth.js v4
- **Real-time:** Pusher
- **Storage:** Vercel Blob
- **Testing:** Playwright

## الإعداد والتشغيل

1. تثبيت الحزم:
```bash
npm install
```

2. إعداد قاعدة البيانات:
```bash
npx prisma generate
npx prisma db push
```

3. تشغيل الخادم المحلي:
```bash
npm run dev
```

## البيئة (Environment Variables)

يحتاج المشروع للمتغيرات التالية في ملف `.env`:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`
- `BLOB_READ_WRITE_TOKEN`
