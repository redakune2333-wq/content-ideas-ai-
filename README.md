# Content Ideas AI

حوّل تعليقات YouTube إلى أفكار محتوى باستخدام الذكاء الاصطناعي.

## الميزات

- 🔍 قراءة تعليقات أي فيديو YouTube عام
- 🤖 تحليل ذكي باستخدام Gemini
- 📊 إحصائيات شاملة (أسئلة، طلبات، شكاوى)
- 💡 اقتراحات فيديوهات مرتبة حسب الأولوية
- 📱 يعمل على الهاتف (PWA)
- 🔒 العميل يستخدم مفاتيحه الخاصة

## التثبيت

```bash
npm install
npm run dev
```

## البناء للإنتاج

```bash
npm run build
```

سيتم إنشاء مجلد `dist` جاهز للرفع على أي استضافة ثابتة (Vercel, Netlify, GitHub Pages).

## كيفية الاستخدام

1. افتح التطبيق في المتصفح
2. أدخل YouTube API Key و Gemini API Key (أو استخدم المفاتيح الافتراضية)
3. ألصق رابط فيديو YouTube
4. اضغط "تحليل"
5. احصل على أفكار محتوى مبنية على تعليقات الجمهور

## الحصول على API Keys

### YouTube API Key
1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. أنشئ مشروع جديد
3. فعل "YouTube Data API v3"
4. أنشئ API Key من Credentials

### Gemini API Key
1. اذهب إلى [Google AI Studio](https://aistudio.google.com/)
2. سجل الدخول بحساب Google
3. اذهب إلى Settings → API Keys
4. أنشئ مفتاح جديد

## هيكل المشروع

```
content-ideas-ai/
├── app/
│   ├── api/
│   │   ├── comments/route.ts    # جلب تعليقات YouTube
│   │   └── analyze/route.ts     # تحليل Gemini
│   ├── page.tsx                 # الصفحة الرئيسية
│   ├── layout.tsx               # التخطيط
│   └── globals.css              # الأنماط
├── components/
│   ├── SetupKeys.tsx            # إدخال المفاتيح
│   ├── Dashboard.tsx            # لوحة التحكم
│   └── ResultsView.tsx          # عرض النتائج
├── lib/
│   └── config.ts                # الإعدادات والمفاتيح الافتراضية
└── public/
    └── manifest.json            # PWA manifest
```

## ملاحظات أمنية

⚠️ **لا ترفع المفاتيح إلى GitHub.** المفاتيح الافتراضية في `lib/config.ts` للاختبار فقط. في الإنتاج، استخدم environment variables أو اجبر العميل على إدخال مفاتيحه.

## الترخيص

MIT License - استخدمه كما تشاء.
