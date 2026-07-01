"use client";






import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./layout.module.css";
import {
  DashboardIcon,
  AdsIcon,
  UsersIcon,
  PaymentsIcon,
  StorageIcon,
  AnalyticsIcon,
  AdminUsersIcon,
  AuditLogsIcon,
  SignOutIcon,
  ExternalLinkIcon,
} from "@/components/AdminIcons";

interface LayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    const adminDataStr = localStorage.getItem("lankan_ads_admin");
    if (adminDataStr) {
      try {
        const adminData = JSON.parse(adminDataStr);
        setAdminEmail(adminData.email || "Administrator");
      } catch {
        setAdminEmail("Administrator");
      }
    } else {
      setAdminEmail("Administrator");
    }
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/admin/auth/logout", {
        method: "POST",
      });
      if (res.ok) {
        localStorage.removeItem("lankan_ads_admin");
        localStorage.removeItem("lankan_ads_token_role");
        localStorage.removeItem("lankan_ads_token");
        localStorage.removeItem("lankan_ads_phone");
        router.push("/admin/login");
        router.refresh();
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const navItems = [
    { label: "Dashboard", path: "/admin", icon: DashboardIcon },
    { label: "Ads Mod", path: "/admin/ads", icon: AdsIcon },
    { label: "Users Mod", path: "/admin/users", icon: UsersIcon },
    { label: "Payments", path: "/admin/payments", icon: PaymentsIcon },
    { label: "Storage Stats", path: "/admin/storage", icon: StorageIcon },
    { label: "Analytics", path: "/admin/analytics", icon: AnalyticsIcon },
    { label: "Admin Users", path: "/admin/admins", icon: AdminUsersIcon },
    { label: "Audit Logs", path: "/admin/audit", icon: AuditLogsIcon },
  ];

  return (
    <div className={styles.adminLayout}>
      {}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIconContainer}>
              {}
              <img
                src="/logo/logo-dark-mode.svg"
                alt="Lankan Ads Logo"
                className={styles.logoImage}
              />
            </div>
            <span className={styles.logoText}>
              <span className={styles.logoFirstLetter}>ල</span>
              <span className={styles.logoO}>o</span>
              <span className={styles.logoRest}>කන්</span>
              <span className={styles.logoAccent}>Ads</span>
            </span>
          </Link>
          <span className={styles.consoleBadge}>Control Console</span>
        </div>

        <div className={styles.adminInfo}>
          <div className={styles.avatar}>
            {adminEmail ? adminEmail[0].toUpperCase() : "A"}
          </div>
          <div className={styles.details}>
            <span className={styles.email} title={adminEmail}>{adminEmail}</span>
            <span className={styles.role}>System Admin</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
              >
                <span className={styles.navIcon}>
                  <Icon size={18} />
                </span>
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <span className={styles.navIcon}>
              <SignOutIcon size={18} />
            </span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {}
      <div className={styles.mainContainer}>
        <header className={styles.header}>
          <div className={styles.breadcrumb}>
            <span className={styles.breadcrumbRoot}>Control Panel</span>
            <span className={styles.breadcrumbDivider}>/</span>
            <span className={styles.breadcrumbCurrent}>
              {navItems.find((n) => n.path === pathname)?.label || "Overview"}
            </span>
          </div>
          <div className={styles.headerActions}>
            <Link href="/" className={styles.siteLink} target="_blank">
              <span className={styles.navIcon}>
                <ExternalLinkIcon size={14} />
              </span>
              <span>View Live Site</span>
            </Link>
          </div>
        </header>

        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
}
