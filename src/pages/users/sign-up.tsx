import { BaseLayout } from "../layouts/baseLayout";
import SignUpForm from "../../components/authentication/SignUpForm";

const SignUpPage = () => {
  return (
    <BaseLayout>
      <div className="flex w-full justify-center">
        <SignUpForm />
      </div>
    </BaseLayout>
  );
};

export default SignUpPage;