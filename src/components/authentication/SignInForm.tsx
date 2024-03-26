import React, { useEffect, useState } from "react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "../../pages/firebase/config";
import { useRouter } from "next/router";
import {
  signInWithPopup,
  GoogleAuthProvider,
  getAdditionalUserInfo,
} from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { createUserDocument } from "~/pages/firebase/firebase_functions";

const SignInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signInError, setSignInError] = useState("");
  const [signInWithEmailAndPassword, , , error] =
    useSignInWithEmailAndPassword(auth);
  const router = useRouter();

  const emptyTextBoxes = () => {
    setEmail("");
    setPassword("");
  };

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSignInError("");

    try {
      await signInWithEmailAndPassword(email, password);
      emptyTextBoxes();
    } catch (e) {
      console.error(e);

      setSignInError("An unexpected error occurred. Please try again.");
    }
  };

  const provider = new GoogleAuthProvider();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const additionalUserInfo = getAdditionalUserInfo(result);
      if (additionalUserInfo?.isNewUser) {
        console.log("User is signing up for the first time.");
        const user = result.user;

        await createUserDocument(user, user.displayName ?? "");
      } else {
        console.log("User is an existing user.");
      }
      await router.push("/");
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (error) {
      setSignInError(error.message);
    }
  }, [error]);

  return (
    <form onSubmit={handleSignIn} className="space-y-6">
      {signInError && (
        <div className="mb-4 text-center text-red-500">{signInError}</div>
      )}
      <div>
        <label htmlFor="email" className="text-start">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex w-full justify-center rounded border-2 p-1"
        />
      </div>
      <div>
        <label htmlFor="password" className="text-start">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="flex w-full justify-center rounded border-2 p-1"
        />
      </div>
      <button
        type="submit"
        className="flex w-full justify-center rounded bg-blue-500 py-1 text-white"
      >
        Sign In
      </button>

      <div className="my-4 flex items-center justify-center">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-4 flex-shrink text-gray-600">or</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <button
        onClick={handleGoogleSignIn}
        className="flex w-full items-center justify-center rounded border border-gray-300 bg-white px-4 py-2 shadow-sm hover:bg-gray-50"
      >
        <FcGoogle className="mr-2" /> Login with Google
      </button>
    </form>
  );
};

export default SignInForm;
