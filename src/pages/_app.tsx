import type { AppProps } from "next/app";
import { NextUIProvider } from "@nextui-org/react";

import "~/styles/globals.css";
import "survey-core/defaultV2.min.css";
import "primereact/resources/themes/lara-light-cyan/theme.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <NextUIProvider>
      <Component {...pageProps} />
    </NextUIProvider>
  );
}
