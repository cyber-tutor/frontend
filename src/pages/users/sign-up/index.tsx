import Head from "next/head";
import SignUpForm from "../../../components/authentication/SignUpForm";

const SignUpPage = () => {
  return (
    <div className="flex w-full justify-center">
      <Head>
        <title>Sign Up</title>
      </Head>
      <SignUpForm />
    </div>
  );
};

export default SignUpPage;
