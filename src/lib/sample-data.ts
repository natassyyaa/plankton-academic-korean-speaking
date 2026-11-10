/**
 * SAMPLE DATA for the design preview.
 * Everything here is placeholder content. Replace with real data from the
 * database / AI services in later stages. UI that shows this data must label it
 * with <SampleBadge />.
 */
import type { LangCode } from "./i18n";

export const sampleUser = {
  name: "Sample Student",
  initials: "SS",
  university: "Sample University",
  major: "Business Administration (MA)",
  semester: "2nd semester",
  nativeLanguage: "Vietnamese",
  level: "TOPIK Level 4",
  levelLabel: "Intermediate-High",
  levelProgress: 62,
  totalSessions: 48,
  streakDays: 9,
  weeklyGoalMinutes: 150,
  minutesThisWeek: 112,
};

export const sampleWeeklyActivity = [
  { day: "Mon", minutes: 18 },
  { day: "Tue", minutes: 25 },
  { day: "Wed", minutes: 0 },
  { day: "Thu", minutes: 32 },
  { day: "Fri", minutes: 15 },
  { day: "Sat", minutes: 22 },
  { day: "Sun", minutes: 0 },
];

export type SkillKey =
  | "grammar"
  | "vocabulary"
  | "fluency"
  | "pronunciation"
  | "academic"
  | "organisation";

export const skillLabels: Record<SkillKey, { en: string; ko: string }> = {
  grammar: { en: "Grammar", ko: "문법" },
  vocabulary: { en: "Vocabulary", ko: "어휘" },
  fluency: { en: "Fluency", ko: "유창성" },
  pronunciation: { en: "Pronunciation", ko: "발음" },
  academic: { en: "Academic expressions", ko: "학술 표현" },
  organisation: { en: "Answer organisation", ko: "답변 구성" },
};

export const sampleSkillScores: Record<SkillKey, number> = {
  grammar: 74,
  vocabulary: 68,
  fluency: 61,
  pronunciation: 70,
  academic: 57,
  organisation: 66,
};

export type PracticeType = "speaking" | "presentation" | "qna" | "group";

export const practiceTypeLabels: Record<PracticeType, string> = {
  speaking: "Academic Speaking",
  presentation: "Presentation",
  qna: "Professor Q&A",
  group: "Group Presentation",
};

export const sampleHistory: {
  id: string;
  type: PracticeType;
  title: string;
  titleKo: string;
  date: string;
  durationMin: number;
}[] = [
  { id: "h1", type: "qna", title: "Q&A on consumer behaviour research", titleKo: "소비자 행동 연구 질의응답", date: "2026-11-09", durationMin: 14 },
  { id: "h2", type: "presentation", title: "Midterm presentation rehearsal", titleKo: "중간 발표 리허설", date: "2026-11-08", durationMin: 22 },
  { id: "h3", type: "speaking", title: "Asking a professor for an extension", titleKo: "교수님께 기한 연장 요청하기", date: "2026-11-07", durationMin: 9 },
  { id: "h4", type: "group", title: "Marketing team project sync", titleKo: "마케팅 조별 과제 회의", date: "2026-11-06", durationMin: 31 },
  { id: "h5", type: "speaking", title: "Seminar discussion: AI in education", titleKo: "세미나 토론: 교육과 AI", date: "2026-11-05", durationMin: 17 },
  { id: "h6", type: "presentation", title: "Literature review summary", titleKo: "선행 연구 요약 발표", date: "2026-11-03", durationMin: 12 },
  { id: "h7", type: "qna", title: "Thesis proposal defence practice", titleKo: "논문 계획서 심사 연습", date: "2026-11-01", durationMin: 19 },
];

export const speakingScenarios = [
  {
    id: "classroom",
    title: "Classroom discussion",
    titleKo: "수업 토론",
    description: "Share ideas and respond to classmates during a seminar.",
    persona: { name: "Classmate Jiwoo", role: "AI classmate · sample persona" },
    opening: "오늘 읽은 논문에 대해 어떻게 생각하세요? 저는 연구 방법이 조금 아쉬웠어요.",
    openingEn: "What did you think of the paper we read today? I felt the research method was a bit lacking.",
  },
  {
    id: "professor",
    title: "Professor communication",
    titleKo: "교수님과의 소통",
    description: "Office hours, emails and polite requests to professors.",
    persona: { name: "Professor Kim", role: "AI professor · sample persona" },
    opening: "어서 와요. 오늘은 어떤 일로 찾아왔어요?",
    openingEn: "Come in. What brings you to my office today?",
  },
  {
    id: "group",
    title: "Group projects",
    titleKo: "조별 과제",
    description: "Divide tasks, negotiate deadlines and give updates.",
    persona: { name: "Teammate Minjun", role: "AI teammate · sample persona" },
    opening: "다음 주 발표 준비는 어떻게 나눌까요? 저는 자료 조사를 맡을 수 있어요.",
    openingEn: "How should we split the work for next week's presentation? I can take the research.",
  },
  {
    id: "opinion",
    title: "Expressing opinions",
    titleKo: "의견 표현하기",
    description: "Agree, disagree and support your view with evidence.",
    persona: { name: "Professor Lee", role: "AI professor · sample persona" },
    opening: "온라인 수업이 대면 수업보다 효과적이라는 주장에 대해 어떻게 생각해요?",
    openingEn: "What do you think about the claim that online classes are more effective than in-person ones?",
  },
] as const;

export type ScenarioId = (typeof speakingScenarios)[number]["id"];

export type Difficulty = "basic" | "intermediate" | "advanced";

export const sampleProfessorQuestions: Record<Difficulty, { ko: string; en: string }[]> = {
  basic: [
    { ko: "이 주제를 선택한 이유가 무엇인가요?", en: "Why did you choose this topic?" },
    { ko: "발표의 핵심 내용을 한 문장으로 말해 줄 수 있어요?", en: "Can you summarise your main point in one sentence?" },
    { ko: "자료는 어디에서 찾았어요?", en: "Where did you find your sources?" },
  ],
  intermediate: [
    { ko: "연구 방법을 선택한 근거를 설명해 주시겠어요?", en: "Could you explain the reasoning behind your research method?" },
    { ko: "이 결과가 한국 사회에도 적용될 수 있다고 생각하나요?", en: "Do you think these results apply to Korean society too?" },
    { ko: "연구의 한계점은 무엇이라고 생각하나요?", en: "What do you see as the limitations of your study?" },
  ],
  advanced: [
    { ko: "표본 크기가 결론의 타당성에 어떤 영향을 미친다고 보나요?", en: "How does your sample size affect the validity of your conclusions?" },
    { ko: "기존 선행 연구와 상반되는 결과를 어떻게 해석하겠어요?", en: "How would you interpret results that contradict previous studies?" },
    { ko: "이 연구를 후속 연구로 발전시킨다면 어떤 변수를 추가하겠어요?", en: "If you extended this research, which variables would you add?" },
  ],
};

export const sampleFeedbackReport = {
  sessionTitle: "Q&A on consumer behaviour research",
  sessionTitleKo: "소비자 행동 연구 질의응답",
  date: "2026-11-09",
  scores: sampleSkillScores,
  details: {
    grammar: "Connective endings such as -(으)ㄴ/는데 were used naturally; honorific verb endings were occasionally dropped.",
    vocabulary: "Good range of topic words; some everyday words could be replaced with academic alternatives.",
    fluency: "Several long pauses before complex answers. Filler words (어…, 그…) appeared often.",
    pronunciation: "Clear overall. Final consonant linking (연음) in phrases like '연구 결과를' needs attention.",
    academic: "Limited use of hedging expressions like '~(으)ㄹ 것으로 보입니다'.",
    organisation: "Answers had a clear conclusion but would benefit from stating the main point first.",
  } satisfies Record<SkillKey, string>,
  strengths: [
    "Polite and appropriate tone when addressing the professor",
    "Accurate use of research vocabulary (표본, 변수, 가설)",
    "Answers stayed on topic and ended with a clear conclusion",
  ],
  improvements: [
    {
      tip: "State your main point first, then give reasons.",
      before: "그러니까… 여러 가지 이유가 있는데요, 결국 가격이 중요한 것 같아요.",
      after: "결론부터 말씀드리면, 가격이 가장 중요한 요인입니다. 그 이유는 두 가지입니다.",
    },
    {
      tip: "Use hedging to sound more academic.",
      before: "이 결과는 맞아요.",
      after: "이 결과는 가설을 뒷받침하는 것으로 보입니다.",
    },
    {
      tip: "Keep honorific endings consistent with professors.",
      before: "제가 다시 확인할게.",
      after: "제가 다시 확인해 보겠습니다.",
    },
  ],
};

export type ExpressionCategory = "presentation" | "discussion" | "question" | "professor";

export const expressionCategories: { id: ExpressionCategory; label: string; labelKo: string }[] = [
  { id: "presentation", label: "Presentations", labelKo: "발표" },
  { id: "discussion", label: "Discussions", labelKo: "토론" },
  { id: "question", label: "Questions", labelKo: "질문" },
  { id: "professor", label: "Professor communication", labelKo: "교수님과의 소통" },
];

export type Expression = {
  id: string;
  category: ExpressionCategory;
  ko: string;
  romanization: string;
  meaning: Partial<Record<LangCode, string>> & { en: string };
  example: string;
};

export const expressions: Expression[] = [
  {
    id: "p1", category: "presentation", ko: "지금부터 발표를 시작하겠습니다.", romanization: "jigeumbuteo balpyoreul sijakhagetseumnida",
    meaning: { en: "I will now begin my presentation.", zh: "现在我开始我的演讲。", vi: "Bây giờ tôi xin bắt đầu bài thuyết trình.", id: "Sekarang saya akan memulai presentasi.", mn: "Одоо би илтгэлээ эхэлье.", ko: "발표를 시작할 때 쓰는 공식적인 표현" },
    example: "안녕하십니까. 지금부터 '소비자 행동 변화'에 대한 발표를 시작하겠습니다.",
  },
  {
    id: "p2", category: "presentation", ko: "다음 슬라이드를 보시겠습니다.", romanization: "daeum seullaideureul bosigetseumnida",
    meaning: { en: "Let's look at the next slide.", zh: "请看下一张幻灯片。", vi: "Mời các bạn xem slide tiếp theo.", id: "Mari kita lihat slide berikutnya.", mn: "Дараагийн слайдыг харцгаая.", ko: "슬라이드를 넘길 때 쓰는 표현" },
    example: "그럼 다음 슬라이드를 보시겠습니다. 이 그래프는 2025년 자료입니다.",
  },
  {
    id: "p3", category: "presentation", ko: "요약하자면", romanization: "yoyakhajamyeon",
    meaning: { en: "To summarise…", zh: "总而言之……", vi: "Tóm lại là…", id: "Singkatnya…", mn: "Товчлон хэлбэл…", ko: "내용을 정리할 때 쓰는 표현" },
    example: "요약하자면, 가격보다 브랜드 신뢰도가 더 큰 영향을 미쳤습니다.",
  },
  {
    id: "p4", category: "presentation", ko: "이상으로 발표를 마치겠습니다. 감사합니다.", romanization: "isangeuro balpyoreul machigetseumnida. gamsahamnida",
    meaning: { en: "That concludes my presentation. Thank you.", zh: "我的演讲到此结束，谢谢。", vi: "Bài thuyết trình của tôi xin kết thúc tại đây. Xin cảm ơn.", id: "Demikian presentasi saya. Terima kasih.", mn: "Ингээд илтгэлээ дуусгая. Баярлалаа.", ko: "발표를 마무리하는 표현" },
    example: "이상으로 발표를 마치겠습니다. 질문 있으시면 말씀해 주세요.",
  },
  {
    id: "d1", category: "discussion", ko: "제 생각은 조금 다릅니다.", romanization: "je saenggageun jogeum dareumnida",
    meaning: { en: "My view is a little different.", zh: "我的想法有点不同。", vi: "Suy nghĩ của tôi hơi khác một chút.", id: "Pendapat saya sedikit berbeda.", mn: "Миний бодол арай өөр байна.", ko: "정중하게 반대 의견을 말할 때" },
    example: "좋은 의견이지만, 제 생각은 조금 다릅니다. 왜냐하면…",
  },
  {
    id: "d2", category: "discussion", ko: "~라는 점에서 동의합니다.", romanization: "~raneun jeomeseo donguihamnida",
    meaning: { en: "I agree in the sense that…", zh: "在……这一点上我同意。", vi: "Tôi đồng ý ở điểm là…", id: "Saya setuju dalam hal…", mn: "…гэдэг утгаараа санал нийлж байна.", ko: "부분적으로 동의할 때" },
    example: "비용이 많이 든다는 점에서 동의합니다.",
  },
  {
    id: "d3", category: "discussion", ko: "예를 들어 설명하자면", romanization: "yereul deureo seolmyeonghajamyeon",
    meaning: { en: "To explain with an example…", zh: "举个例子来说……", vi: "Để giải thích bằng ví dụ…", id: "Sebagai contoh…", mn: "Жишээгээр тайлбарлавал…", ko: "예시를 들 때" },
    example: "예를 들어 설명하자면, 한국의 편의점 시장이 그렇습니다.",
  },
  {
    id: "d4", category: "discussion", ko: "다른 관점에서 보면", romanization: "dareun gwanjeomeseo bomyeon",
    meaning: { en: "From another perspective…", zh: "从另一个角度来看……", vi: "Nhìn từ góc độ khác…", id: "Dari sudut pandang lain…", mn: "Өөр өнцгөөс харвал…", ko: "새로운 시각을 제시할 때" },
    example: "다른 관점에서 보면, 이 정책은 학생들에게 부담이 될 수 있습니다.",
  },
  {
    id: "q1", category: "question", ko: "한 가지 여쭤봐도 될까요?", romanization: "han gaji yeojjwobwado doelkkayo?",
    meaning: { en: "May I ask you one thing?", zh: "我可以问一个问题吗？", vi: "Tôi có thể hỏi một điều được không ạ?", id: "Bolehkah saya bertanya satu hal?", mn: "Нэг зүйл асууж болох уу?", ko: "정중하게 질문을 시작할 때" },
    example: "발표 잘 들었습니다. 한 가지 여쭤봐도 될까요?",
  },
  {
    id: "q2", category: "question", ko: "~에 대해 좀 더 자세히 설명해 주시겠어요?", romanization: "~e daehae jom deo jasehi seolmyeonghae jusigesseoyo?",
    meaning: { en: "Could you explain … in more detail?", zh: "您能更详细地解释一下……吗？", vi: "Bạn có thể giải thích chi tiết hơn về … không?", id: "Bisakah Anda menjelaskan … lebih rinci?", mn: "…-ийн талаар дэлгэрэнгүй тайлбарлаж өгөх үү?", ko: "추가 설명을 요청할 때" },
    example: "연구 방법에 대해 좀 더 자세히 설명해 주시겠어요?",
  },
  {
    id: "q3", category: "question", ko: "제가 이해한 것이 맞는지 확인하고 싶습니다.", romanization: "jega ihaehan geosi manneunji hwaginhago sipseumnida",
    meaning: { en: "I'd like to check that I understood correctly.", zh: "我想确认一下我的理解是否正确。", vi: "Tôi muốn xác nhận xem mình hiểu có đúng không.", id: "Saya ingin memastikan pemahaman saya benar.", mn: "Би зөв ойлгосон эсэхээ шалгамаар байна.", ko: "이해한 내용을 확인할 때" },
    example: "제가 이해한 것이 맞는지 확인하고 싶습니다. 결국 표본이 부족했다는 말씀이신가요?",
  },
  {
    id: "q4", category: "question", ko: "좋은 질문 감사합니다.", romanization: "joeun jilmun gamsahamnida",
    meaning: { en: "Thank you for the good question.", zh: "谢谢您的好问题。", vi: "Cảm ơn câu hỏi hay của bạn.", id: "Terima kasih atas pertanyaannya.", mn: "Сайн асуулт асуусанд баярлалаа.", ko: "질문에 답하기 전 쓰는 표현" },
    example: "좋은 질문 감사합니다. 그 부분은 저도 고민했던 점입니다.",
  },
  {
    id: "pr1", category: "professor", ko: "교수님, 잠시 시간 괜찮으세요?", romanization: "gyosunim, jamsi sigan gwaenchaneuseyo?",
    meaning: { en: "Professor, do you have a moment?", zh: "教授，您现在有时间吗？", vi: "Thưa giáo sư, thầy/cô có chút thời gian không ạ?", id: "Profesor, apakah Anda punya waktu sebentar?", mn: "Багш аа, түр завтай юу?", ko: "교수님께 말을 걸 때" },
    example: "교수님, 잠시 시간 괜찮으세요? 과제에 대해 여쭤보고 싶은 것이 있습니다.",
  },
  {
    id: "pr2", category: "professor", ko: "제출 기한을 연장해 주실 수 있을까요?", romanization: "jechul gihaneul yeonjanghae jusil su isseulkkayo?",
    meaning: { en: "Could you extend the submission deadline?", zh: "您能延长提交期限吗？", vi: "Thầy/cô có thể gia hạn thời hạn nộp bài được không ạ?", id: "Bisakah Anda memperpanjang batas waktu pengumpulan?", mn: "Илгээх хугацааг сунгаж өгч болох уу?", ko: "기한 연장을 정중하게 요청할 때" },
    example: "죄송하지만, 건강 문제로 제출 기한을 연장해 주실 수 있을까요?",
  },
  {
    id: "pr3", category: "professor", ko: "면담을 신청하고 싶습니다.", romanization: "myeondameul sincheonghago sipseumnida",
    meaning: { en: "I would like to request a meeting.", zh: "我想申请面谈。", vi: "Em muốn xin một buổi gặp riêng.", id: "Saya ingin mengajukan pertemuan konsultasi.", mn: "Уулзалт товлохыг хүсэж байна.", ko: "면담(상담)을 요청할 때" },
    example: "교수님, 기말 논문 주제에 대해 면담을 신청하고 싶습니다.",
  },
  {
    id: "pr4", category: "professor", ko: "말씀해 주신 부분을 반영하겠습니다.", romanization: "malsseumhae jusin bubuneul banyeonghagetseumnida",
    meaning: { en: "I will reflect what you mentioned.", zh: "我会采纳您提到的意见。", vi: "Em sẽ tiếp thu những điều thầy/cô đã góp ý.", id: "Saya akan menerapkan masukan yang Anda sampaikan.", mn: "Таны хэлсэн зүйлийг тусгах болно.", ko: "피드백을 받아들일 때" },
    example: "감사합니다. 말씀해 주신 부분을 반영해서 다시 제출하겠습니다.",
  },
];

export const sampleGroupMembers = [
  { id: "m1", name: "You", initials: "YO", role: "Team lead", country: "Vietnam" },
  { id: "m2", name: "Sample member A", initials: "SA", role: "Research", country: "China" },
  { id: "m3", name: "Sample member B", initials: "SB", role: "Slides", country: "Indonesia" },
  { id: "m4", name: "Sample member C", initials: "SC", role: "Data analysis", country: "Mongolia" },
];

export const defaultPresentationSections = [
  { id: "s1", title: "Introduction", titleKo: "서론" },
  { id: "s2", title: "Background research", titleKo: "연구 배경" },
  { id: "s3", title: "Findings", titleKo: "연구 결과" },
  { id: "s4", title: "Conclusion & Q&A", titleKo: "결론 및 질의응답" },
];

export const pricingPlans = [
  {
    id: "free",
    name: "Starter",
    price: "₩0",
    period: "forever",
    description: "Try academic speaking practice.",
    features: ["5 practice sessions / month", "Expression library", "Basic feedback summary"],
    highlighted: false,
  },
  {
    id: "student",
    name: "Student",
    price: "₩9,900",
    period: "per month",
    description: "For semester-long preparation.",
    features: [
      "Unlimited speaking sessions",
      "Presentation simulator",
      "Professor Q&A simulations",
      "Detailed feedback reports",
    ],
    highlighted: true,
  },
  {
    id: "university",
    name: "University",
    price: "Custom",
    period: "for institutions",
    description: "For international offices and language centres.",
    features: ["Group presentation rooms", "Cohort progress overview", "Dedicated onboarding"],
    highlighted: false,
  },
];
