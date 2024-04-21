import { type AppType } from "next/app";
import { NextUIProvider } from "@nextui-org/react";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import "survey-react/survey.css";
import "primereact/resources/themes/lara-light-cyan/theme.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <NextUIProvider>
      <Component {...pageProps} />
    </NextUIProvider>
  );
};

export default api.withTRPC(MyApp);
