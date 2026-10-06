# أُنملة | UNMULAH

**وصول القرآن لكل إنسان.** أُنملة منصة قرآن عربية أولًا، تُصمَّم لتوسيع
الوصول أمام الصم ومستخدمي لغة الإشارة. تجمع النسخة الحالية بين القراءة
الموثقة لسورة الإخلاص، والهجاء الإصبعي، وتسميع تجريبي محلي بالكامل.

## لمن صُمّمت؟

للمستخدمين الصم ومستخدمي لغة الإشارة، وللمعلّمين والأسر الذين يريدون أداة
مساعدة هادئة للمراجعة. لا تحل النتائج محل المختصين أو التحقق الشخصي للحفظ.

## نطاق MVP الحالي

- فهرس عربي قابل للبحث لجميع سور القرآن (أسماء وأعداد الآيات فقط).
- قراءة موثقة محليًا لسورة الإخلاص بالرسم العثماني/حفص.
- تسميع بالإشارة لسورة الإخلاص فقط، على مستوى الحرف.
- مقارنة حتمية للتسلسل المقبول مع المرجع؛ لا تستخدم نموذجًا لغويًا أو LLM.
- معالجة كاميرا واستدلال ومقارنة محلية داخل المتصفح.
- سجل محاولات محلي يخزن أرقام المقارنة فقط، ولا يخزن فيديو أو صورًا.

النص الكامل لبقية السور، تصفح صفحات المصحف، التفسير الميسر، وأصول الإشارة
المرئية تبقى **قريبًا** إلى أن تتوفر مصادر رسمية وحقوق إعادة استخدام واضحة.

## رحلة المستخدم

`اقرأ → راجع → سمّع بالإشارة → راجع النتيجة`

1. افتح **القرآن** واختر سورة الإخلاص.
2. اقرأ النص، ثم أخفه لفتح مساحة التسميع.
3. شغّل الكاميرا بنفسك؛ لا تبدأ تلقائيًا.
4. ثبّت الإشارة، ارفع اليد لتأكيدها، ثم أنهِ المحاولة لرؤية مقارنة التسلسل.
5. افتح **تفاصيل التعرّف** عند الحاجة إلى أدلة تقنية شفافة.

## مسار الذكاء الاصطناعي

`camera → MediaPipe → 21 landmarks → wrist-centering + scale normalization → local MLP → target-constrained decoding → temporal stabilization → release → accepted sequence → deterministic alignment`

النموذج يعالج معالم اليد فقط. لا يوجد تعرف على الوجه، ولا رفع لإطارات الكاميرا،
ولا تسجيل فيديو. تفاصيل المسار في [ARCHITECTURE.md](docs/ARCHITECTURE.md).

## التشغيل المحلي

يتطلب Node.js حديثًا وnpm.

```sh
npm install
npm run dev
npm test
npm run typecheck
npm run build
```

يعمل خادم التطوير على المنفذ `5000`. في بيئات Windows المقيدة قد يحتاج Vite
إلى السماح بإنشاء عملية فرعية أثناء الاختبار أو البناء.

## التقنية

- React + TypeScript + Vite
- MediaPipe Hand Landmarker
- مصنف MLP محلي بأوزان Keras مصدّرة إلى Float32
- Canvas لرسم 21 معلمًا وارتباطاتها
- Vitest للمسار الحتمي للتسلسل والمقارنة

## السلامة والمصادر

لا يُولّد أُنملة نصًا قرآنيًا أو تفسيرًا. مصدر نص الإخلاص، مصدر النموذج،
الترخيص، وحدود إعادة التوزيع موثقة في [SOURCES.md](docs/SOURCES.md).

## القيود وخارطة الطريق

- التسميع الذكي حاليًا لسورة الإخلاص فقط وقد يخطئ.
- يلزم اختبار متخصصين ومستخدمين صم قبل أي ادعاء بموثوقية عملية.
- لم تُدمج أصول هجاء إصبعي مرئية؛ العارض جاهز لأصول موثقة فقط.
- لا توجد حسابات أو خادم أو قاعدة بيانات أو مزامنة سحابية.

راجع [DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) للعرض، و[DEPLOYMENT.md](docs/DEPLOYMENT.md)
للنشر الثابت لاحقًا.

## Delivery candidate

**أُنملة | Unmulah** is an Arabic-first, local-first Quran learning MVP for
Deaf and sign-language users. The current delivery candidate provides:

- a Quran-first page reader using the local official KFGQPC Hafs Smart display data;
- local hide/show memorization mode;
- inline sign-language recitation that stays inside the Quran reader;
- MediaPipe hand landmarks and a local browser MLP classifier;
- progressive reveal of trusted Quran display text and deterministic comparison feedback;
- Smart Text and detailed review flows;
- a local-only Quran Journey progress view, Library, and Profile.

### Run locally

```sh
npm install
npm run dev
```

### Validate

```sh
npm test
npm run typecheck
npm run build
npm run test:e2e
```

### Public deployment

The production deployment uses Vercel SPA rewrites through `vercel.json`.
**Public HTTPS URL: pending Vercel account authentication.**

Camera processing, landmarks, model inference, and comparison stay in the
browser. No camera frames, video, or audio are uploaded or recorded.
