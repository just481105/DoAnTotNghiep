"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/services/api-client";

interface DashboardResponse {
  stats: {
    totalSubmissions: number;
    activeLearners: number;
    b1Completed: number;
    b2Completed: number;
    dueTodayCount: number;
  };
  topRankings: Array<{
    id: string;
    name: string;
    xp: number;
    rank: number;
    avatar: string;
  }>;
  retentionCurve: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  user: {
    id: string;
    fullName: string | null;
    email: string;
    streakDays: number;
    xpPoints: number;
    cefrLevel: string;
  } | null;
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchWithAuth<DashboardResponse>("/users/me/dashboard-stats")
      .then((result) => {
        if (active) setData(result);
      })
      .catch((error: unknown) => {
        console.warn("Không thể tải thống kê học tập:", error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { 
    stats: data?.stats, 
    topRankings: data?.topRankings,
    retentionCurve: data?.retentionCurve,
    user: data?.user,
    loading 
  };
}
