import { NextRequest, NextResponse } from "next/server";
import { GEMINI_API_BASE, GEMINI_MODEL } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const { apiKey, comments, videoTitle } = await req.json();

    if (!apiKey || !comments || !Array.isArray(comments)) {
      return NextResponse.json({ error: "API Key and comments array required" }, { status: 400 });
    }

    // Filter short/empty comments
    const validComments = comments
      .filter((c: any) => c.text && c.text.trim().length > 3)
      .map((c: any) => c.text.trim());

    if (validComments.length === 0) {
      return NextResponse.json({ error: "No valid comments to analyze" }, { status: 400 });
    }

    // Sample comments if too many (Gemini has token limits)
    const sampleSize = Math.min(validComments.length, 300);
    const sampled = validComments.length > sampleSize 
      ? shuffleArray([...validComments]).slice(0, sampleSize)
      : validComments;

    const prompt = buildAnalysisPrompt(sampled, videoTitle);

    const res = await fetch(
      `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 4096,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.error?.message || "Gemini API error" },
        { status: res.status }
      );
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    // Parse JSON response
    let analysis;
    try {
      analysis = JSON.parse(rawText);
    } catch {
      // Try extracting JSON from markdown code block
      const jsonMatch = rawText.match(/```json\s*([\s\S]*?)```/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[1]);
      } else {
        // Fallback: wrap raw text
        analysis = { raw: rawText };
      }
    }

    return NextResponse.json({
      success: true,
      totalAnalyzed: sampled.length,
      analysis,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function buildAnalysisPrompt(comments: string[], videoTitle?: string): string {
  const commentsText = comments.map((c, i) => `${i + 1}. ${c}`).join("\n");

  return `You are an expert content strategist analyzing YouTube comments to generate video content ideas.

VIDEO TITLE: ${videoTitle || "Unknown"}

COMMENTS (${comments.length} comments):
${commentsText}

Analyze these comments and return ONLY a valid JSON object with this exact structure:

{
  "summary": {
    "totalComments": number,
    "questionsCount": number,
    "requestsCount": number,
    "complaintsCount": number,
    "praiseCount": number
  },
  "topTopics": [
    {
      "topic": "string - the topic name in Arabic",
      "mentions": number,
      "sentiment": "positive" | "negative" | "neutral",
      "sampleComments": ["string - 2-3 actual comment excerpts"]
    }
  ],
  "contentIdeas": [
    {
      "title": "string - suggested video title in Arabic",
      "description": "string - brief description of what the video should cover",
      "priority": "high" | "medium" | "low",
      "evidence": ["string - 2-3 actual comments supporting this idea"],
      "estimatedDemand": number,
      "format": "tutorial" | "comparison" | "review" | "qna" | "deep_dive" | "news"
    }
  ],
  "trendingQuestions": [
    {
      "question": "string - the question in Arabic",
      "frequency": number,
      "answersInVideo": boolean
    }
  ],
  "audienceInsights": {
    "skillLevel": "beginner" | "intermediate" | "advanced" | "mixed",
    "mainPainPoints": ["string"],
    "toolsMentioned": ["string - AI tools or software mentioned"],
    "languagePreference": "Arabic" | "English" | "Mixed"
  }
}

Rules:
- Return ONLY the JSON object, no markdown, no explanation
- All text values should be in Arabic (the same language as the comments)
- Be specific: instead of "explain AI tools", say "شرح أداة Claude 4 بالتفصيل"
- Prioritize ideas with strong evidence (multiple similar comments)
- If comments are mostly spam/short, note that in summary
- estimatedDemand is a number 1-100 based on comment frequency`;
}
