import "./globals.css";
import RegisterSW from "@/components/RegisterSW";

export const metadata = {
  title: "Hevy Progress",
  description: "Tu progreso de entrenamiento, en vivo desde Hevy.",
  manifest: "/manifest.json",
  applicationName: "Hevy Progress",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Hevy Progress",
  },
};

export const viewport = {
  themeColor: "#0b0f14",
  width: "device-width",
  initialScale: 1,
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
