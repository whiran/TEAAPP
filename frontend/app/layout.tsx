import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { ThemeProvider } from "../components/ThemeProvider";

export const metadata: Metadata = {
    title: "Ceylon Tea Intelligence Platform",
    description: "Geospatial intelligence and analytics for Ceylon tea estates",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <body className="antialiased bg-gray-900 dark:bg-gray-900">
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
