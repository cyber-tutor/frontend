import React from "react";
import { BaseLayout } from "../layouts/baseLayout";
import SignInForm from "../../components/SignInForm";

const SignInPage = () => {
  return (
    <BaseLayout>
      <div className="flex w-full justify-center">
        <SignInForm />
      </div>
    </BaseLayout>
  );
};

export default SignInPage;