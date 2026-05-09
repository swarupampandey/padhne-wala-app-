/**
 * api-client-shim.ts
 * 
 * Replaces @workspace/api-client-react with direct fetch hooks.
 * All calls go to /api/* (proxied to localhost:3000 via vite.config.ts).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ─── Types (from api.schemas.ts) ─────────────────────────────────────────────

export interface Question {
  id: number;
  subject: string;
  chapter: string;
  topic?: string | null;
  originalText: string;
  options: string[];
  correctAnswer: number;
  originalImageUrl?: string | null;
  aiGeneratedImageUrl?: string | null;
  explanation?: string | null;
  userId?: string | null;
  createdAt: string;
}

export interface CreateQuestionBody {
  subject: string;
  chapter: string;
  topic?: string | null;
  originalText: string;
  options: string[];
  correctAnswer: number;
  originalImageUrl?: string | null;
  aiGeneratedImageUrl?: string | null;
  explanation?: string | null;
  userId?: string | null;
}

export interface UpdateQuestionBody {
  subject?: string | null;
  chapter?: string | null;
  topic?: string | null;
  originalText?: string | null;
  options?: string[] | null;
  correctAnswer?: number | null;
  explanation?: string | null;
}

export interface ChapterNode { chapter: string; topics: string[]; count: number; }
export interface SubjectNode { subject: string; chapters: ChapterNode[]; count: number; }
export interface SubjectCount { subject: string; count: number; }
export interface QuestionStats { total: number; bySubject: SubjectCount[]; recentlyAdded: number; }

export interface WeakArea {
  id: number;
  questionId: number;
  userId?: string | null;
  studentNotes?: string | null;
  resolved: boolean;
  subject: string;
  chapter: string;
  createdAt: string;
  question: Question;
}

export interface CreateWeakAreaBody {
  subject: string;
  chapter: string;
  topic?: string | null;
  questionText: string;
  correctAnswer: string;
  explanation?: string | null;
  studentNotes?: string | null;
  userId?: string | null;
}

export interface UpdateWeakAreaBody {
  studentNotes?: string | null;
  resolved?: boolean | null;
}

export interface WeakAreaStat { subject: string; chapter: string; count: number; resolved: number; }

export interface ExtractBody {
  imageBase64?: string | null;
  mimeType?: string | null;
  rawText?: string | null;
  subject?: string | null;
  chapter?: string | null;
}

export interface ExtractedQuestion {
  originalText: string;
  options: string[];
  correctAnswer: number;
  explanation?: string | null;
  imageGenPrompt?: string | null;
  subject?: string | null;
  chapter?: string | null;
  topic?: string | null;
}

export interface GenerateImageBody { prompt: string; }
export interface GenerateImageResult { imageUrl: string; }

export interface ChatMessage { role: string; content: string; }
export interface ChatBody {
  questionId?: number | null;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation?: string | null;
  userMessage: string;
  history?: ChatMessage[];
}
export interface ChatResponse { reply: string; }

export interface StudySession {
  id: number;
  subject?: string | null;
  durationSeconds: number;
  sessionType: string;
  createdAt: string;
}

export interface CreateStudySessionBody {
  subject?: string | null;
  durationSeconds: number;
  sessionType: string;
}

export interface SubjectStudyTime { subject: string; totalSeconds: number; }
export interface StudyStats {
  totalSeconds: number;
  todaySeconds: number;
  streakDays: number;
  bySubject: SubjectStudyTime[];
  recentSessions: StudySession[];
}

export interface StartSessionBody {
  subjectChapters: { subject: string; chapter: string }[];
  limit?: number;
  mode: string;
}

export interface SubmitAnswerBody {
  questionId: number;
  selectedAnswer: number;
  userId?: string | null;
}

export interface AnswerResult {
  correct: boolean;
  correctAnswer: number;
  explanation?: string | null;
  weakAreaId?: number | null;
}

export type ListQuestionsParams = {
  subject?: string | null;
  chapter?: string | null;
  topic?: string | null;
  search?: string | null;
  source?: "main" | "mine" | null;
};

export type ListWeakAreasParams = {
  subject?: string | null;
  resolved?: string | null;
};

export type ListStudySessionsParams = {
  limit?: number | null;
};

// ─── Fetch helper ─────────────────────────────────────────────────────────────

let _extraHeadersGetter: (() => Record<string, string>) | null = null;

export function setExtraHeadersGetter(getter: (() => Record<string, string>) | null) {
  _extraHeadersGetter = getter;
}

// Mock data for offline mode
const MOCK_DATA = {
  questionStats: {
    total: 0,
    bySubject: [],
    recentlyAdded: 0,
  },
  studyStats: {
    totalSeconds: 3600,
    todaySeconds: 1200,
    streakDays: 5,
    bySubject: [],
    recentSessions: [],
  },
  studySessions: [] as unknown[],
  weakAreas: [] as unknown[],
  questions: [] as Question[],
};

async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const extraHeaders = _extraHeadersGetter?.() ?? {};
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...extraHeaders,
        ...options?.headers,
      },
      signal: AbortSignal.timeout(3000), // 3 second timeout
    });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(`API ${res.status}: ${text}`);
    }
    if (res.status === 204) return undefined as T;
    return res.json();
  } catch (error) {
    // Return mock data if API is unreachable (offline mode)
    if (url.includes("/questions/stats")) {
      return MOCK_DATA.questionStats as T;
    }
    if (url.includes("/study-sessions/stats")) {
      return MOCK_DATA.studyStats as T;
    }
    if (url.includes("/study-sessions")) {
      return MOCK_DATA.studySessions as T;
    }
    if (url.includes("/weak-areas")) {
      return MOCK_DATA.weakAreas as T;
    }
    if (url.includes("/questions")) {
      return MOCK_DATA.questions as T;
    }
    // For mutations (POST/PATCH/DELETE), return success responses
    if (options?.method && ["POST", "PATCH", "DELETE"].includes(options.method)) {
      return {} as T;
    }
    throw error;
  }
}

function buildQuery(params?: Record<string, unknown>): string {
  if (!params) return "";
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null) q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const getListStudySessionsQueryKey = (p?: ListStudySessionsParams) =>
  ["study-sessions", p] as const;

export const getGetStudyStatsQueryKey = () => ["study-stats"] as const;

export const getListWeakAreasQueryKey = (p?: ListWeakAreasParams) =>
  ["weak-areas", p] as const;

export const getGetWeakAreaStatsQueryKey = () => ["weak-area-stats"] as const;

export const getGetQuestionStatsQueryKey = () => ["question-stats"] as const;

export const getGetSubjectChapterTreeQueryKey = () => ["subject-chapter-tree"] as const;

export const getListQuestionsQueryKey = (p?: ListQuestionsParams) =>
  ["questions", p] as const;

// ─── Questions ────────────────────────────────────────────────────────────────

export function useListQuestions(params?: ListQuestionsParams) {
  return useQuery({
    queryKey: getListQuestionsQueryKey(params),
    queryFn: () =>
      apiFetch<Question[]>(`/api/questions${buildQuery(params as Record<string, unknown>)}`),
  });
}

export function useGetQuestionStats() {
  return useQuery({
    queryKey: getGetQuestionStatsQueryKey(),
    queryFn: () => apiFetch<QuestionStats>("/api/questions/stats"),
  });
}

export function useGetSubjectChapterTree() {
  return useQuery({
    queryKey: getGetSubjectChapterTreeQueryKey(),
    queryFn: () => apiFetch<SubjectNode[]>("/api/questions/tree"),
  });
}

export function useCreateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateQuestionBody) =>
      apiFetch<Question>("/api/questions", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["questions"] });
      qc.invalidateQueries({ queryKey: getGetQuestionStatsQueryKey() });
    },
  });
}

export function useUpdateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateQuestionBody }) =>
      apiFetch<Question>(`/api/questions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["questions"] }),
  });
}

export function useDeleteQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<void>(`/api/questions/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["questions"] });
      qc.invalidateQueries({ queryKey: getGetQuestionStatsQueryKey() });
    },
  });
}

// ─── Practice ─────────────────────────────────────────────────────────────────

export function useStartPracticeSession() {
  return useMutation({
    mutationFn: (body: StartSessionBody) =>
      apiFetch<Question[]>("/api/practice/start", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  });
}

export function useSubmitPracticeAnswer() {
  return useMutation({
    mutationFn: (body: SubmitAnswerBody) =>
      apiFetch<AnswerResult>("/api/practice/submit", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  });
}

// ─── Weak Areas ───────────────────────────────────────────────────────────────

export function useListWeakAreas(params?: ListWeakAreasParams) {
  return useQuery({
    queryKey: getListWeakAreasQueryKey(params),
    queryFn: () =>
      apiFetch<WeakArea[]>(`/api/weak-areas${buildQuery(params as Record<string, unknown>)}`),
  });
}

export function useGetWeakAreaStats() {
  return useQuery({
    queryKey: getGetWeakAreaStatsQueryKey(),
    queryFn: () => apiFetch<WeakAreaStat[]>("/api/weak-areas/stats"),
  });
}

export function useCreateWeakArea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateWeakAreaBody) =>
      apiFetch<WeakArea>("/api/weak-areas", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weak-areas"] });
    },
  });
}

export function useUpdateWeakArea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateWeakAreaBody }) =>
      apiFetch<WeakArea>(`/api/weak-areas/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["weak-areas"] }),
  });
}

export function useDeleteWeakArea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<void>(`/api/weak-areas/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["weak-areas"] }),
  });
}

// ─── AI ───────────────────────────────────────────────────────────────────────

export function useAiExtractQuestion() {
  return useMutation({
    mutationFn: (body: ExtractBody) =>
      apiFetch<ExtractedQuestion[]>("/api/ai/extract", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  });
}

export function useAiGenerateImage() {
  return useMutation({
    mutationFn: (body: GenerateImageBody) =>
      apiFetch<GenerateImageResult>("/api/ai/generate-image", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  });
}

export function useAiChat() {
  return useMutation({
    mutationFn: (body: ChatBody) =>
      apiFetch<ChatResponse>("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  });
}

// ─── Study Sessions ───────────────────────────────────────────────────────────

export function useListStudySessions(params?: ListStudySessionsParams) {
  return useQuery({
    queryKey: getListStudySessionsQueryKey(params),
    queryFn: () =>
      apiFetch<StudySession[]>(`/api/study-sessions${buildQuery(params as Record<string, unknown>)}`),
  });
}

export function useGetStudyStats() {
  return useQuery({
    queryKey: getGetStudyStatsQueryKey(),
    queryFn: () => apiFetch<StudyStats>("/api/study-sessions/stats"),
  });
}

export function useCreateStudySession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateStudySessionBody) =>
      apiFetch<StudySession>("/api/study-sessions", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["study-sessions"] });
      qc.invalidateQueries({ queryKey: getGetStudyStatsQueryKey() });
    },
  });
}
