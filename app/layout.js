import "./globals.css";
import RegisterSW from "@/components/RegisterSW";

const USER_NAME = process.env.NEXT_PUBLIC_USER_NAME || "Pol";

export const metadata = {
  title: `Hevy Progress · ${USER_NAME}`,
  description: "Tu progreso de entrenamiento, en vivo desde Hevy.",
  manifest: "/manifest.json",
  applicationName: "Hevy Progress",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Hevy Progress",
  },
  formatDetection: { telephone: false },
};

export const viewport = {
  themeColor: "#07090d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}
