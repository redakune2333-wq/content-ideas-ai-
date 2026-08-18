"use client";

import { useState } from "react";
import { Link2, Loader2, BarChart3, AlertCircle } from "lucide-react";
import ResultsView from "./ResultsView";

interface DashboardProps {
  keys: { youtube: string; gemini: string };
}

export default function Dashboard({ keys }: DashboardProps) {
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!videoUrl.trim()) {
      setError("أدخل رابط الفيديو");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Step 1: Fetch comments
      const commentsRes = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: keys.youtube, videoUrl: videoUrl.trim() }),
      });

      const commentsData = await commentsRes.json();

      if (!commentsRes.ok || !commentsData.success) {
        throw new Error(commentsData.error || "فشل جلب التعليقات");
      }

      // Step 2: Analyze with Gemini
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: keys.gemini,
          comments: commentsData.comments,
          videoTitle: commentsData.videoInfo?.title,
        }),
      });

      const analyzeData = await analyzeRes.json();

      if (!analyzeRes.ok || !analyzeData.success) {
        throw new Error(analyzeData.error || "فشل التحليل");
      }

      setResult({
        videoInfo: commentsData.videoInfo,
        totalComments: commentsData.totalComments,
        analysis: analyzeData.analysis,
      });
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold">Content Ideas AI</h1>
        <p className="text-gray-400 text-sm">ألصق رابط فيديو YouTube واحصل على أفكار محتوى</p>
      </div>

      <div className="card mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
          />
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="btn-primary whitespace-nowrap"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin inline ml-1" />
            ) : (
              <BarChart3 className="w-4 h-4 inline ml-1" />
            )}
            {loading ? "جاري التحليل..." : "تحليل"}
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {result && <ResultsView result={result} />}
    </div>
  );
}
