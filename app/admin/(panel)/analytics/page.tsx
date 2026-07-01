"use client";





import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import styles from "./page.module.css";

interface ChartData {
  adsPerDay: { date: string; value: number }[];
  usersPerDay: { date: string; value: number }[];
  revenuePerDay: { date: string; value: number }[];
  adsByCategory: { name: string; value: number }[];
  adsByTier: { name: string; value: number }[];
  adsByDistrict: { name: string; value: number }[];
  paymentStatus: { name: string; value: number }[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<ChartData | null>(null);
  const [days, setDays] = useState(30);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/admin/analytics?days=${days}`);
        const result = await res.json();
        if (res.ok && result.success) {
          setData(result.charts);
        } else {
          setError(result.error || "Failed to load charts.");
        }
      } catch {
        setError("Failed to communicate with analytics server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [days]);

  const PIE_COLORS = ["#ff4e50", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];
  const TIER_COLORS = ["#ef4444", "#3b82f6", "#9ca3af"];

  if (isLoading) {
    return (
      <div className={styles.loader}>
        <div className={styles.spinner}></div>
        <p>Calculating aggregates and plotting graphs...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>System Analytics & Trends</h1>
          <p className={styles.subtitle}>Track listing activity, user growth and daily payment collections.</p>
        </div>
        <div className={styles.periodSelector}>
          <button
            onClick={() => setDays(7)}
            className={`${styles.periodBtn} ${days === 7 ? styles.periodBtnActive : ""}`}
          >
            7 Days
          </button>
          <button
            onClick={() => setDays(30)}
            className={`${styles.periodBtn} ${days === 30 ? styles.periodBtnActive : ""}`}
          >
            30 Days
          </button>
          <button
            onClick={() => setDays(90)}
            className={`${styles.periodBtn} ${days === 90 ? styles.periodBtnActive : ""}`}
          >
            90 Days
          </button>
        </div>
      </header>

      {error && <div className={styles.errorBox}>{error}</div>}

      {data && (
        <div className={styles.dashboardGrid}>
          {}
          <section className={`${styles.card} ${styles.fullWidth}`}>
            <h2 className={styles.chartTitle}>Daily Revenue Trends (LKR)</h2>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.revenuePerDay}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={11} />
                  <YAxis stroke="#6b7280" fontSize={11} tickFormatter={(v) => `Rs.${v}`} />
                  <Tooltip
                    contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                    labelStyle={{ color: "#ffffff", fontWeight: "bold" }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {}
          <section className={styles.card}>
            <h2 className={styles.chartTitle}>Listings Posted Per Day</h2>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.adsPerDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={10} />
                  <YAxis stroke="#6b7280" fontSize={10} />
                  <Tooltip
                    contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                    labelStyle={{ color: "#ffffff" }}
                  />
                  <Bar dataKey="value" fill="#e11d48" radius={[4, 4, 0, 0]} name="Ads Posted" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {}
          <section className={styles.card}>
            <h2 className={styles.chartTitle}>User Registrations Per Day</h2>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.usersPerDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={10} />
                  <YAxis stroke="#6b7280" fontSize={10} />
                  <Tooltip
                    contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                    labelStyle={{ color: "#ffffff" }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Users Registered" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {}
          <section className={styles.card}>
            <h2 className={styles.chartTitle}>Listings by Category</h2>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={data.adsByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data.adsByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: "10px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>

          {}
          <section className={styles.card}>
            <h2 className={styles.chartTitle}>Ads Distribution by Tier</h2>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.adsByTier}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={11} />
                  <YAxis stroke="#6b7280" fontSize={11} />
                  <Tooltip
                    contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Listing Volume">
                    {data.adsByTier.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={TIER_COLORS[index % TIER_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
