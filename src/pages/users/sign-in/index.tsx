import Head from "next/head";
import SignInForm from "../../../components/authentication/SignInForm";

const SignInPage = () => {
  return (
    <div className="flex w-full justify-center">
      <Head>
        <title>Sign In</title>
      </Head>
      <SignInForm />
    </div>
  );
};

export default SignInPage;
