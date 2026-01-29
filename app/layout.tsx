import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "ASPER - IT Department Club",
  description: "The official technical club of the IT Department.",
  icons: {
    icon: "https://res.cloudinary.com/dujwwjdkq/image/upload/v1768587223/Gemini_Generated_Image_ie1mzaie1mzaie1m_1_kgyx27.png",
    shortcut: "https://res.cloudinary.com/dujwwjdkq/image/upload/v1768587223/Gemini_Generated_Image_ie1mzaie1mzaie1m_1_kgyx27.png",
    apple: "https://res.cloudinary.com/dujwwjdkq/image/upload/v1768587223/Gemini_Generated_Image_ie1mzaie1mzaie1m_1_kgyx27.png",
  },
  openGraph: {
    images: ["https://res.cloudinary.com/dujwwjdkq/image/upload/v1768587223/Gemini_Generated_Image_ie1mzaie1mzaie1m_1_kgyx27.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${montserrat.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
