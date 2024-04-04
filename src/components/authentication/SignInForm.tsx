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
import { createUserDocument } from "~/components/firebase/firebase_functions";
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
        const user = result.user;
        await createUserDocument(user, user.displayName || '');
      }
      router.push("/");
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
    <div className="flex flex-col h-screen">
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-sm p-6 bg-white rounded shadow-md">
          <h2 className="mb-6 text-3xl font-bold text-center">Sign In</h2>
          {signInError && (
            <p className="mb-4 text-sm text-center text-red-500">{signInError}</p>
          )}
          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 mt-1 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Password
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                toggleMask
                className="w-full rounded border px-3 py-2 leading-tight focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600 focus:outline-none"
            >
              Sign In
            </button>
            <div className="my-4 flex items-center justify-between">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-4 flex-shrink text-gray-600 uppercase">or</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            <button
              onClick={handleGoogleSignIn}
              className="w-full px-4 py-2 text-sm text-gray-700 bg-white border rounded hover:bg-gray-50 flex items-center justify-center"
            >
              <FcGoogle className="text-xl" />
              <span className="ml-2">Login with Google</span>
            </button>
          </form>
        </div>
      </div>
      <footer className="w-full bg-white py-4 text-center text-gray-900">
        <div className="mx-auto">
          <p>&copy; 2024 Cyber Tutor. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );  
};

export default SignInForm;