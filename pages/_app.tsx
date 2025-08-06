// pages/_app.tsx
import "@/app/globals.css";  // same CSS you had in app/
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
