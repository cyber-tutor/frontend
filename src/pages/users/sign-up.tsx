import { BaseLayout } from "../layouts/baseLayout";
import SignUpForm from "../../components/SignUpForm";

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