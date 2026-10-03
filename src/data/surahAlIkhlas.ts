export const quranSource = {
  surahNumber: 112,
  surahName: "الإخلاص",
  riwaya: "حفص عن عاصم",
  script: "الرسم العثماني",
  sourceName: "مجمع الملك فهد لطباعة المصحف الشريف",
  sourceUrl: "https://qurancomplex.gov.sa/en/techquran/dev/",
  datasetName: "KFGQPC Hafs Uthmanic Data",
  datasetVersion: "0.18",
  datasetDate: "2021-10-25",
  mirrorUrl: "https://github.com/thetruetruth/quran-data-kfgqpc",
  mirrorCommit: "281dbbe8eed1370daa5a023b6cd81655cbfd6473",
  sourceFile: "hafs/data/hafsData_v18.json",
  sourceFileSha256:
    "5d8bb91726e482839d0057633cb1973031e4d706fa9604eea5e08892f20ba140",
  verses: [
    {
      number: 1,
      text: "قُلۡ هُوَ ٱللَّهُ أَحَدٌ ١",
    },
    {
      number: 2,
      text: "ٱللَّهُ ٱلصَّمَدُ ٢",
    },
    {
      number: 3,
      text: "لَمۡ يَلِدۡ وَلَمۡ يُولَدۡ ٣",
    },
    {
      number: 4,
      text: "وَلَمۡ يَكُن لَّهُۥ كُفُوًا أَحَدُۢ ٤",
    },
  ],
} as const;

export type SurahVerse = (typeof quranSource.verses)[number];