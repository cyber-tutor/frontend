import React from "react";
import { BaseLayout } from "../../components/layouts/BaseLayout";
import SignInForm from "../../components/authentication/SignInForm";

const SignInPage = () => {
  return (
    <BaseLayout showSidebar={false}>
      <div className="flex w-full justify-center">
        <SignInForm />
      </div>
    </BaseLayout>
  );
};

export default SignInPage;
