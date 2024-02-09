import React, { useEffect, useState } from "react";
import { useAuthState, useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "../pages/firebase/config";
import { useRouter } from "next/router";
import { signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from "firebase/auth";
import { FcGoogle } from 'react-icons/fc';

const SignInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useAuthState(auth);



  const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);
  const router = useRouter();

  const emptyTextBoxes = () => {
    setEmail("");
    setPassword("");
  };

  const handleSignIn = async (event: React.FormEvent) => {
    // This prevents the default behavior of a form submission is to reload the page. We don't want that because of async behavior.
    event.preventDefault();
    // This is the try-catch block that will handle the actual sign-in process. If it succeeds, they will be redirected to the home page. If it fails, well, nothing really at the moment on the front end, YET. It logs the error to the console though.
    try {
      const res = await signInWithEmailAndPassword(email, password);
      emptyTextBoxes
      router.push("/");
    } catch (e) {
      console.error(e);
    }
  };

  const provider = new GoogleAuthProvider()
  const handleGoogleSignIn = async () => {
    emptyTextBoxes
    const result =  signInWithPopup(auth,provider);
    router.push("/");
  }

  useEffect(() => {
    console.log(user);
  }, [user])




  return (
    <form onSubmit={handleSignIn} className="space-y-6">
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
          className="flex w-full justify-center rounded p-1 border-2"
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
          className="flex w-full justify-center rounded p-1 border-2"
        />
      </div>
      <button
        type="submit"
        className="flex w-full justify-center rounded bg-blue-500 py-1 text-white"
      >
        Sign In
      </button>

      <div className="flex items-center justify-center my-4">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="flex-shrink mx-4 text-gray-600">or</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>


      <button
      onClick={handleGoogleSignIn}
      className="flex w-full justify-center items-center rounded bg-white py-2 px-4 border border-gray-300 shadow-sm hover:bg-gray-50"
      >
      <FcGoogle className="mr-2" /> Login with Google
      </button>


    </form>
  );
};

export default SignInForm;