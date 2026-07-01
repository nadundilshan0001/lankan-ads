import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel | Lankan Ads",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
