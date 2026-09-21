import type { Metadata } from "next";
import { Oxanium, Source_Code_Pro } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { GlobalBackground } from "@/components/ui/global-background";

const oxanium = Oxanium({
  variable: "--font-oxanium",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SISFO SDIA Cairo - SD Islam Al-Azhar Cairo Palembang",
  description: "Sistem Informasi Sekolah SD Islam Al-Azhar Cairo Palembang",
  icons: {
    icon: "/images/logo-alazhar-cairo.avif",
    shortcut: "/images/logo-alazhar-cairo.avif",
    apple: "/images/logo-alazhar-cairo.avif",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      dir="ltr"
      suppressHydrationWarning
      className={`${oxanium.variable} ${sourceCodePro.variable} h-full antialiased`}
    >
      <body dir="ltr" className="min-h-full flex flex-col font-sans bg-transparent text-foreground relative">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <GlobalBackground />
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
