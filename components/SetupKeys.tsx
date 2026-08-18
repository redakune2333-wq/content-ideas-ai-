"use client";

import { useState, useEffect } from "react";
import { Key, Eye, EyeOff, Youtube, Sparkles } from "lucide-react";
import { DEFAULT_KEYS } from "@/lib/config";

interface SetupKeysProps {
  onReady: (keys: { youtube: string; gemini: string }) => void;
}

export default function SetupKeys({ onReady }: SetupKeysProps) {
  const [youtubeKey, setYoutubeKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [showYoutube, setShowYoutube] = useState(false);
  const [showGemini, setShowGemini] = useState(false);
  const [useDefaults, setUseDefaults] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("content-ai-keys");
    if (saved) {
      try {
        const parsed = JSON.parse(atob(saved));
        setYoutubeKey(parsed.youtube || "");
        setGeminiKey(parsed.gemini || "");
        if (parsed.youtube && parsed.gemini) {
          setUseDefaults(false);
        }
      } catch {}
    }
  }, []);

  const handleSave = () => {
    const yt = useDefaults ? DEFAULT_KEYS.youtube : youtubeKey.trim();
    const gem = useDefaults ? DEFAULT_KEYS.gemini : geminiKey.trim();

    if (!yt || !gem) {
      alert("يرجى إدخال كلا المفتاحين");
      return;
    }

    localStorage.setItem("content-ai-keys", btoa(JSON.stringify({ youtube: yt, gemini: gem })));
    onReady({ youtube: yt, gemini: gem });
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Content Ideas AI</h1>
        <p className="text-gray-400 text-sm">حوّل تعليقات YouTube إلى أفكار محتوى</p>
      </div>

      <div className="card mb-4">
        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={useDefaults}
            onChange={(e) => setUseDefaults(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm text-gray-300">استخدام المفاتيح الافتراضية (للاختبار)</span>
        </label>
      </div>

      {!useDefaults && (
        <>
          <div className="card mb-4">
            <label className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-300">
              <Youtube className="w-4 h-4 text-red-500" />
              YouTube API Key
            </label>
            <div className="relative">
              <input
                type={showYoutube ? "text" : "password"}
                value={youtubeKey}
                onChange={(e) => setYoutubeKey(e.target.value)}
                placeholder="ألصق مفتاح YouTube API هنا"
                className="pr-10"
              />
              <button
                onClick={() => setShowYoutube(!showYoutube)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showYoutube ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              احصل عليه من: console.cloud.google.com → APIs → YouTube Data API v3
            </p>
          </div>

          <div className="card mb-6">
            <label className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-300">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showGemini ? "text" : "password"}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="ألصق مفتاح Gemini API هنا"
                className="pr-10"
              />
              <button
                onClick={() => setShowGemini(!showGemini)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              احصل عليه من: aistudio.google.com → API Keys
            </p>
          </div>
        </>
      )}

      <button onClick={handleSave} className="btn-primary w-full">
        <Key className="w-4 h-4 inline ml-2" />
        بدء التحليل
      </button>
    </div>
  );
}
