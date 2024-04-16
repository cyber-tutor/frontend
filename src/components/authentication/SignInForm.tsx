import React, { useEffect, useState } from "react";
import {
  useAuthState,
  useSignInWithEmailAndPassword,
} from "react-firebase-hooks/auth";
import { auth } from "../firebase/config";
import { useRouter } from "next/router";
import {
  signInWithPopup,
  GoogleAuthProvider,
  getAdditionalUserInfo,
} from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { createUserDocument } from "~/components/firebase/FirebaseFunctions";
import { Password } from "primereact/password";

const SignInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signInError, setSignInError] = useState("");
  const [user] = useAuthState(auth);
  const [signInWithEmailAndPassword, userCredential, , error] =
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
      router.push("/");
    } catch (e) {
      // console.error(e);
      setSignInError("An unexpected error occurred. Please try again.");
    }
  };

  const provider = new GoogleAuthProvider();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const additionalUserInfo = getAdditionalUserInfo(result);
      if (additionalUserInfo?.isNewUser) {
        const user = result.user;
        await createUserDocument(user, user.displayName || "");
      }
      router.push("/");
    } catch (e) {
      // console.error(e);
    }
  };

  useEffect(() => {
    if (error) {
      setSignInError(error.message);
    }
  }, [error]);

  return (
    <div
      className="flex h-screen flex-col lg:pl-64"
      style={{ marginTop: "-4rem" }}
    >
      <div className="flex flex-grow items-center justify-center">
        <div className="w-full max-w-sm rounded bg-white p-6 shadow-md">
          <h2 className="mb-6 text-center text-3xl font-bold">Sign In</h2>
          {signInError && (
            <p className="mb-4 text-center text-sm text-red-500">
              {signInError}
            </p>
          )}
          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <Password
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                toggleMask
                feedback={false} // Add this line
                className="w-full rounded border px-3 py-2 leading-tight focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 focus:outline-none"
            >
              Sign In
            </button>
            <div className="my-4 flex items-center justify-between">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-4 flex-shrink uppercase text-gray-600">
                or
              </span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            <button
              onClick={handleGoogleSignIn}
              className="flex w-full items-center justify-center rounded border bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <FcGoogle className="text-xl" />
              <span className="ml-2">Login with Google</span>
            </button>
          </form>

          <div className="my-4 border-t border-gray-300"></div>
          <p className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              className="flex w-full items-center justify-center rounded border bg-blue-500 px-4 py-2  text-white hover:bg-blue-600 focus:outline-none"
              onClick={() => router.push("/users/sign-up")}
            >
              Sign Up
            </button>
          </p>

          <button
            className="mt-4 flex w-full items-center justify-center rounded border border-t bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none"
            onClick={() => router.push("/")}
          >
            Home
          </button>
        </div>
      </div>
      <footer className="w-full bg-slate-50 py-4 text-center text-gray-900">
        <div className="mx-auto">
          <p>&copy; 2024 Cyber Tutor. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default SignInForm;
