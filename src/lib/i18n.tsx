import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * Interface-language support. Korean is always the *learning* language; this only
 * controls UI labels and translated meanings. Strings missing in a language fall
 * back to English.
 */
export const LANGUAGES = [
  { code: "ko", label: "한국어", english: "Korean" },
  { code: "en", label: "English", english: "English" },
  { code: "zh", label: "简体中文", english: "Simplified Chinese" },
  { code: "vi", label: "Tiếng Việt", english: "Vietnamese" },
  { code: "id", label: "Bahasa Indonesia", english: "Indonesian" },
  { code: "mn", label: "Монгол", english: "Mongolian" },
] as const;

export type LangCode = (typeof LANGUAGES)[number]["code"];

const en = {
  "nav.dashboard": "Dashboard",
  "nav.speaking": "Academic Speaking",
  "nav.presentation": "Presentation Simulator",
  "nav.qna": "Professor Q&A",
  "nav.group": "Group Presentation",
  "nav.expressions": "Expression Library",
  "nav.history": "Practice History",
  "nav.settings": "Settings",
  "nav.practice": "Practice",
  "nav.learn": "Learn & track",
  "common.getStarted": "Get started",
  "common.sampleData": "Sample data",
  "common.preview": "Design preview",
  "common.previewNote": "AI features are not connected yet",
  "common.language": "Interface language",
  "common.backHome": "Back to home",
  "common.viewReport": "View report",
  "common.comingSoon": "Coming soon",
} as const;

export type I18nKey = keyof typeof en;
type Dict = Partial<Record<I18nKey, string>>;

const dictionaries: Record<LangCode, Dict> = {
  en,
  ko: {
    "nav.dashboard": "대시보드",
    "nav.speaking": "학술 말하기",
    "nav.presentation": "발표 시뮬레이터",
    "nav.qna": "교수님 질의응답",
    "nav.group": "조별 발표",
    "nav.expressions": "표현 사전",
    "nav.history": "연습 기록",
    "nav.settings": "설정",
    "nav.practice": "연습",
    "nav.learn": "학습 및 기록",
    "common.getStarted": "시작하기",
    "common.sampleData": "샘플 데이터",
    "common.preview": "디자인 미리보기",
    "common.previewNote": "AI 기능은 아직 연결되지 않았습니다",
    "common.language": "인터페이스 언어",
    "common.backHome": "홈으로",
    "common.viewReport": "리포트 보기",
    "common.comingSoon": "준비 중",
  },
  zh: {
    "nav.dashboard": "控制台",
    "nav.speaking": "学术口语",
    "nav.presentation": "演讲模拟",
    "nav.qna": "教授问答",
    "nav.group": "小组演讲",
    "nav.expressions": "表达词库",
    "nav.history": "练习记录",
    "nav.settings": "设置",
    "nav.practice": "练习",
    "nav.learn": "学习与追踪",
    "common.getStarted": "开始使用",
    "common.sampleData": "示例数据",
    "common.preview": "设计预览",
    "common.previewNote": "AI 功能尚未接入",
    "common.language": "界面语言",
    "common.backHome": "返回首页",
    "common.viewReport": "查看报告",
    "common.comingSoon": "即将推出",
  },
  vi: {
    "nav.dashboard": "Bảng điều khiển",
    "nav.speaking": "Nói học thuật",
    "nav.presentation": "Mô phỏng thuyết trình",
    "nav.qna": "Hỏi đáp với giáo sư",
    "nav.group": "Thuyết trình nhóm",
    "nav.expressions": "Thư viện biểu đạt",
    "nav.history": "Lịch sử luyện tập",
    "nav.settings": "Cài đặt",
    "nav.practice": "Luyện tập",
    "nav.learn": "Học & theo dõi",
    "common.getStarted": "Bắt đầu",
    "common.sampleData": "Dữ liệu mẫu",
    "common.preview": "Bản xem trước thiết kế",
    "common.previewNote": "Tính năng AI chưa được kết nối",
    "common.language": "Ngôn ngữ giao diện",
    "common.backHome": "Về trang chủ",
    "common.viewReport": "Xem báo cáo",
    "common.comingSoon": "Sắp ra mắt",
  },
  id: {
    "nav.dashboard": "Dasbor",
    "nav.speaking": "Berbicara Akademik",
    "nav.presentation": "Simulator Presentasi",
    "nav.qna": "Tanya Jawab Profesor",
    "nav.group": "Presentasi Kelompok",
    "nav.expressions": "Pustaka Ungkapan",
    "nav.history": "Riwayat Latihan",
    "nav.settings": "Pengaturan",
    "nav.practice": "Latihan",
    "nav.learn": "Belajar & pantau",
    "common.getStarted": "Mulai",
    "common.sampleData": "Data contoh",
    "common.preview": "Pratinjau desain",
    "common.previewNote": "Fitur AI belum terhubung",
    "common.language": "Bahasa antarmuka",
    "common.backHome": "Kembali ke beranda",
    "common.viewReport": "Lihat laporan",
    "common.comingSoon": "Segera hadir",
  },
  mn: {
    "nav.dashboard": "Хянах самбар",
    "nav.speaking": "Академик яриа",
    "nav.presentation": "Илтгэлийн симулятор",
    "nav.qna": "Профессорын асуулт",
    "nav.group": "Багийн илтгэл",
    "nav.expressions": "Хэллэгийн сан",
    "nav.history": "Дасгалын түүх",
    "nav.settings": "Тохиргоо",
    "nav.practice": "Дасгал",
    "nav.learn": "Суралцах ба хянах",
    "common.getStarted": "Эхлэх",
    "common.sampleData": "Жишээ өгөгдөл",
    "common.preview": "Дизайны урьдчилсан харагдац",
    "common.previewNote": "AI функц хараахан холбогдоогүй",
    "common.language": "Интерфейсийн хэл",
    "common.backHome": "Нүүр хуудас руу",
    "common.viewReport": "Тайлан харах",
    "common.comingSoon": "Удахгүй",
  },
};

export function translate(lang: LangCode, key: I18nKey): string {
  return dictionaries[lang]?.[key] ?? en[key];
}

const STORAGE_KEY = "plankton.lang";

type I18nContextValue = {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  t: (key: I18nKey) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");

  // Read the saved choice after hydration to avoid SSR mismatches.
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as LangCode | null;
    if (saved && LANGUAGES.some((l) => l.code === saved)) setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: LangCode) => {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({ lang, setLang, t: (key) => translate(lang, key) }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
