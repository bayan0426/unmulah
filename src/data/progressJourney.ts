export type JourneyMetric = 'reading' | 'listening' | 'sign' | 'review' | 'consistency' | 'memorization';

export type JourneyMilestone = {
  id: string;
  titleAr: string;
  descriptionAr: string;
  metric: JourneyMetric;
  threshold: number;
  icon: string;
};

export type JourneyStage = {
  id: string;
  titleAr: string;
  descriptionAr: string;
  unlockAfterCompleted: number;
  theme: 'garden' | 'lantern' | 'horizon';
  milestones: JourneyMilestone[];
};

export const JOURNEY_STAGES: JourneyStage[] = [
  {
    id: 'beginning', titleAr: 'البداية', descriptionAr: 'خطواتك الأولى مع القرآن.', unlockAfterCompleted: 0, theme: 'garden',
    milestones: [
      { id: 'first-reading', titleAr: 'أول قراءة', descriptionAr: 'ابدأ جلسة قراءة نشطة.', metric: 'reading', threshold: 1, icon: '▤' },
      { id: 'first-listening', titleAr: 'أول استماع', descriptionAr: 'استمع إلى تلاوة واحدة على الأقل.', metric: 'listening', threshold: 1, icon: '◖' },
      { id: 'first-sign', titleAr: 'بداية الإشارة', descriptionAr: 'أكمل أول محاولة تسميع بالإشارة.', metric: 'sign', threshold: 1, icon: '✋' },
      { id: 'first-review', titleAr: 'جلسة مراجعة', descriptionAr: 'سجّل مراجعة واحدة.', metric: 'review', threshold: 1, icon: '✦' },
      { id: 'three-active-days', titleAr: 'بداية الاستمرار', descriptionAr: 'أنجز نشاطًا حقيقيًا في 3 أيام.', metric: 'consistency', threshold: 3, icon: '◌' },
    ],
  },
  {
    id: 'continuity', titleAr: 'الاستمرار', descriptionAr: 'تثبيت عادة هادئة ومستدامة.', unlockAfterCompleted: 5, theme: 'lantern',
    milestones: [
      { id: 'reading-ten-minutes', titleAr: 'عشر دقائق قراءة', descriptionAr: 'اجمع 10 دقائق قراءة نشطة.', metric: 'reading', threshold: 10, icon: '▤' },
      { id: 'listening-fifteen-minutes', titleAr: 'رفيق الاستماع', descriptionAr: 'اجمع 15 دقيقة استماع فعلية.', metric: 'listening', threshold: 15, icon: '◖' },
      { id: 'five-sign-attempts', titleAr: 'خطوات بالإشارة', descriptionAr: 'أكمل 5 محاولات تسميع بالإشارة.', metric: 'sign', threshold: 5, icon: '✋' },
      { id: 'seven-active-days', titleAr: 'أسبوع من الصحبة', descriptionAr: 'أنجز نشاطًا في 7 أيام.', metric: 'consistency', threshold: 7, icon: '◌' },
    ],
  },
  {
    id: 'steadfastness', titleAr: 'الثبات', descriptionAr: 'تقدم متوازن عبر مسارات التعلم.', unlockAfterCompleted: 9, theme: 'horizon',
    milestones: [
      { id: 'reading-hour', titleAr: 'ساعة قراءة', descriptionAr: 'اجمع ساعة قراءة نشطة.', metric: 'reading', threshold: 60, icon: '▤' },
      { id: 'listening-hour', titleAr: 'ساعة استماع', descriptionAr: 'اجمع ساعة استماع فعلية.', metric: 'listening', threshold: 60, icon: '◖' },
      { id: 'fourteen-active-days', titleAr: 'خطى ثابتة', descriptionAr: 'أنجز نشاطًا في 14 يومًا.', metric: 'consistency', threshold: 14, icon: '◌' },
    ],
  },
];
