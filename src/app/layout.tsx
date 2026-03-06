import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Tanindo Seeds — B2B Distribution Platform",
    description:
        "India's trusted B2B seed distribution platform. Register as a business buyer, browse certified seed varieties, and manage your orders.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
