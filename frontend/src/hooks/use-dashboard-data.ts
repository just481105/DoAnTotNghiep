"use client";

import { useState, useEffect } from "react";

export function useDashboardData() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const BACKEND_URL = process.env.NEXT_PUBLIC_CORE_API_URL || "http://localhost:5001";
        const res = await fetch(`${BACKEND_URL}/users/me/dashboard-stats?userId=e6de30ce-ac04-487f-b376-163240602f84`);

        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (err) {
        console.warn("Không kết nối được NestJS Core API, sử dụng dữ liệu mặc định:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { 
    stats: data?.stats, 
    topRankings: data?.topRankings,
    retentionCurve: data?.retentionCurve,
    user: data?.user,
    loading 
  };
}
