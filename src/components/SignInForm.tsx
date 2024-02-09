import React, { useEffect, useState } from "react";
import { useAuthState, useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "../pages/firebase/config";
import { useRouter } from "next/router";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { FcGoogle } from 'react-icons/fc';

const SignInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Initialize signInError state for storing sign-in error messages
  const [signInError, setSignInError] = useState("");
  // useAuthState to observe the user's sign-in state
  const [user] = useAuthState(auth);
  // Destructure and use the signInWithEmailAndPassword hook from react-firebase-hooks
  const [signInWithEmailAndPassword, userCredential, , error] = useSignInWithEmailAndPassword(auth);
  const router = useRouter();

  // Function to clear input fields
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
  
  

  // Configure Google provider and handle Google sign-in
  const provider = new GoogleAuthProvider();
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
      emptyTextBoxes();
      router.push("/");
    } catch (e) {
      console.error(e);
     
    }
  };

  // Effect hook to handle authentication error from firebase
  useEffect(() => {
    if (error) {
      setSignInError(error.message);
    }
  }, [error]);

  return (
    <form onSubmit={handleSignIn} className="space-y-6">
      {/* Display sign-in error message */}
      {signInError && (
        <div className="mb-4 text-center text-red-500">
          {signInError}
        </div>
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
