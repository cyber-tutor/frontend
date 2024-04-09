import { BaseLayout } from "../../components/layouts/baseLayout";
import SignUpForm from "../../components/authentication/SignUpForm";

const SignUpPage = () => {
  return (
    <BaseLayout showSidebar={false}>
      <div className="flex w-full justify-center">
        <SignUpForm />
      </div>
    </BaseLayout>
  );
};

export default SignUpPage;
