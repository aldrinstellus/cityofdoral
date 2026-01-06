import type { Metadata } from "next";
import AdminLayoutClient from "./AdminLayoutClient";

export const metadata: Metadata = {
  title: {
    default: "Admin Portal - City of Doral",
    template: "%s | Admin - City of Doral",
  },
  description: "Administrative dashboard for City of Doral AI Assistant",
  icons: {
    icon: [
      {
        url: "/favicon-light.png?v=2",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon-dark.png?v=2",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: "/favicon-light.png?v=2",
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
