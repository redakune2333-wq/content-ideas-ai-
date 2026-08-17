import { NextRequest, NextResponse } from "next/server";
import { YOUTUBE_API_BASE } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const { apiKey, videoUrl } = await req.json();

    if (!apiKey || !videoUrl) {
      return NextResponse.json({ error: "API Key and Video URL are required" }, { status: 400 });
    }

    // Extract video ID from URL
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    const comments: Array<{ text: string; author: string; likes: number }> = [];
    let nextPageToken: string | null = null;
    let pages = 0;
    const maxPages = 5; // Limit to ~500 comments max

    do {
      const params = new URLSearchParams({
        part: "snippet",
        videoId,
        maxResults: "100",
        key: apiKey,
        order: "relevance",
        ...(nextPageToken ? { pageToken: nextPageToken } : {}),
      });

      const res = await fetch(`${YOUTUBE_API_BASE}/commentThreads?${params}`);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return NextResponse.json(
          { error: err.error?.message || "YouTube API error" },
          { status: res.status }
        );
      }

      const data = await res.json();

      for (const item of data.items || []) {
        const snippet = item.snippet?.topLevelComment?.snippet;
        if (snippet) {
          comments.push({
            text: snippet.textDisplay || snippet.textOriginal || "",
            author: snippet.authorDisplayName || "Unknown",
            likes: snippet.likeCount || 0,
          });
        }
      }

      nextPageToken = data.nextPageToken || null;
      pages++;
    } while (nextPageToken && pages < maxPages);

    // Get video info
    const videoRes = await fetch(
      `${YOUTUBE_API_BASE}/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`
    );
    let videoInfo = null;
    if (videoRes.ok) {
      const vData = await videoRes.json();
      if (vData.items?.[0]) {
        videoInfo = {
          title: vData.items[0].snippet?.title,
          channel: vData.items[0].snippet?.channelTitle,
          views: vData.items[0].statistics?.viewCount,
          likes: vData.items[0].statistics?.likeCount,
          comments: vData.items[0].statistics?.commentCount,
        };
      }
    }

    return NextResponse.json({
      success: true,
      videoId,
      videoInfo,
      totalComments: comments.length,
      comments,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}
