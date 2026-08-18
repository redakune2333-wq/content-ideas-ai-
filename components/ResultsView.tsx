"use client";

import { useState } from "react";
import { 
  MessageCircle, ThumbsUp, TrendingUp, Lightbulb, 
  HelpCircle, AlertTriangle, ChevronDown, ChevronUp,
  Copy, Check, Youtube, Eye, Heart
} from "lucide-react";

interface ResultsViewProps {
  result: any;
}

export default function ResultsView({ result }: ResultsViewProps) {
  const { videoInfo, totalComments, analysis } = result;
  const [expandedIdeas, setExpandedIdeas] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState<number | null>(null);

  const toggleIdea = (idx: number) => {
    const next = new Set(expandedIdeas);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setExpandedIdeas(next);
  };

  const copyIdea = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  const summary = analysis?.summary || {};
  const topTopics = analysis?.topTopics || [];
  const contentIdeas = analysis?.contentIdeas || [];
  const trendingQuestions = analysis?.trendingQuestions || [];
  const insights = analysis?.audienceInsights || {};

  return (
    <div className="space-y-4">
      {/* Video Info Card */}
      {videoInfo && (
        <div className="card">
          <div className="flex items-start gap-3">
            <Youtube className="w-5 h-5 text-red-500 shrink-0 mt-1" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{videoInfo.title}</h3>
              <p className="text-gray-400 text-xs">{videoInfo.channel}</p>
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {formatNumber(videoInfo.views)}</span>
                <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {formatNumber(videoInfo.likes)}</span>
                <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {formatNumber(videoInfo.comments)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<MessageCircle className="w-5 h-5 text-blue-400" />} label="تعليق محلل" value={totalComments} />
        <StatCard icon={<HelpCircle className="w-5 h-5 text-yellow-400" />} label="سؤال مكتشف" value={summary.questionsCount || 0} />
        <StatCard icon={<Lightbulb className="w-5 h-5 text-green-400" />} label="فكرة محتوى" value={contentIdeas.length} />
        <StatCard icon={<TrendingUp className="w-5 h-5 text-purple-400" />} label="موضوع متكرر" value={topTopics.length} />
      </div>

      {/* Audience Insights */}
      {insights && (
        <div className="card">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            رؤى الجمهور
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <span className="text-gray-500 text-xs block mb-1">مستوى المهارة</span>
              <span className="font-medium">{translateSkill(insights.skillLevel)}</span>
            </div>
            <div className="bg-[#1a1a1a] p-3 rounded-lg">
              <span className="text-gray-500 text-xs block mb-1">اللغة المفضلة</span>
              <span className="font-medium">{translateLang(insights.languagePreference)}</span>
            </div>
          </div>
          {insights.toolsMentioned?.length > 0 && (
            <div className="mt-3">
              <span className="text-gray-500 text-xs block mb-2">أدوات مذكورة</span>
              <div className="flex flex-wrap gap-2">
                {insights.toolsMentioned.map((t: string, i: number) => (
                  <span key={i} className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs">{t}</span>
                ))}
              </div>
            </div>
          )}
          {insights.mainPainPoints?.length > 0 && (
            <div className="mt-3">
              <span className="text-gray-500 text-xs block mb-2">نقاط الألم الرئيسية</span>
              <ul className="space-y-1">
                {insights.mainPainPoints.map((p: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <AlertTriangle className="w-3 h-3 text-orange-400 shrink-0 mt-1" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Content Ideas */}
      <div className="card">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-400" />
          اقتراحات الفيديوهات
        </h3>
        <div className="space-y-3">
          {contentIdeas.map((idea: any, idx: number) => (
            <div key={idx} className="idea-card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`tag tag-${idea.priority}`}>{translatePriority(idea.priority)}</span>
                    <span className="tag bg-gray-500/10 text-gray-400 border-gray-500/20">{translateFormat(idea.format)}</span>
                  </div>
                  <h4 className="font-semibold text-sm">{idea.title}</h4>
                  <p className="text-gray-400 text-xs mt-1">{idea.description}</p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    onClick={() => copyIdea(`${idea.title}\n${idea.description}`, idx)}
                    className="p-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-colors"
                  >
                    {copied === idx ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                  </button>
                  <button
                    onClick={() => toggleIdea(idx)}
                    className="p-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-colors"
                  >
                    {expandedIdeas.has(idx) ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                  </button>
                </div>
              </div>

              {expandedIdeas.has(idx) && (
                <div className="mt-3 pt-3 border-t border-[#222]">
                  <p className="text-xs text-gray-500 mb-2">التعليقات الداعمة:</p>
                  <div className="space-y-2">
                    {idea.evidence?.map((ev: string, i: number) => (
                      <div key={i} className="bg-[#1a1a1a] p-2.5 rounded-lg text-xs text-gray-300 border-r-2 border-blue-500/50">
                        "{ev}"
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-gray-500">الطلب المتوقع:</span>
                    <div className="flex-1 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" 
                        style={{ width: `${idea.estimatedDemand || 50}%` }} 
                      />
                    </div>
                    <span className="text-xs text-gray-400">{idea.estimatedDemand || 50}%</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Trending Questions */}
      {trendingQuestions.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-green-400" />
            الأسئلة المتكررة
          </h3>
          <div className="space-y-2">
            {trendingQuestions.map((q: any, i: number) => (
              <div key={i} className="flex items-start justify-between gap-3 bg-[#1a1a1a] p-3 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{q.question}</p>
                  <span className="text-xs text-gray-500">تكرار: {q.frequency} مرة</span>
                </div>
                {q.answersInVideo ? (
                  <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded shrink-0">مجاب عليها</span>
                ) : (
                  <span className="text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded shrink-0">غير مجاب عليها</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Topics */}
      {topTopics.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            المواضيع الأكثر ذكراً
          </h3>
          <div className="space-y-3">
            {topTopics.map((topic: any, i: number) => (
              <div key={i} className="bg-[#1a1a1a] p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{topic.topic}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{topic.mentions} مرة</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${topic.sentiment === "positive" ? "text-green-400 bg-green-400/10" : topic.sentiment === "negative" ? "text-red-400 bg-red-400/10" : "text-gray-400 bg-gray-400/10"}`}>
                      {topic.sentiment === "positive" ? "إيجابي" : topic.sentiment === "negative" ? "سلبي" : "محايد"}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  {topic.sampleComments?.map((c: string, j: number) => (
                    <p key={j} className="text-xs text-gray-500 border-r border-gray-700 pr-2">"{c}"</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="stat-card">
      <div className="mb-2">{icon}</div>
      <div className="text-2xl font-bold">{formatNumber(value)}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}

function formatNumber(n: number | string): string {
  const num = typeof n === "string" ? parseInt(n) || 0 : n;
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

function translatePriority(p: string): string {
  const map: Record<string, string> = { high: "عالي", medium: "متوسط", low: "منخفض" };
  return map[p] || p;
}

function translateFormat(f: string): string {
  const map: Record<string, string> = {
    tutorial: "تعليمي", comparison: "مقارنة", review: "مراجعة",
    qna: "سؤال وجواب", deep_dive: "تعمق", news: "أخبار"
  };
  return map[f] || f;
}

function translateSkill(s: string): string {
  const map: Record<string, string> = { beginner: "مبتدئ", intermediate: "متوسط", advanced: "متقدم", mixed: "متنوع" };
  return map[s] || s;
}

function translateLang(l: string): string {
  const map: Record<string, string> = { Arabic: "عربي", English: "إنجليزي", Mixed: "مختلط" };
  return map[l] || l;
}
