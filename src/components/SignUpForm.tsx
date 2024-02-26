import React, { useState } from "react";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, db } from "../pages/firebase/config";
import { useRouter } from "next/router";
import { collection, addDoc } from "firebase/firestore";

const SignUpForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [createUserWithEmailAndPassword] =
    useCreateUserWithEmailAndPassword(auth);
  const router = useRouter();


  const handleSignUp = async (event: React.FormEvent) => {
    // This prevents the default behavior of a form submission is to reload the page. We don't want that because of async behavior.
    event.preventDefault();
    // This is the try-catch block that will handle the actual sign-up process. If it succeeds, they will be redirected to the sign-in page. If it fails, well, nothing really at the moment on the front end, YET. It logs the error to the console though.
    try {
      const res = await createUserWithEmailAndPassword(email, password);
  
      // If the user was successfully created, add a document to the 'users' collection
      if (res?.user) {
        const docRef = await addDoc(collection(db, "users"), {
          userId: res.user.uid,
          group: "control",
        });
        console.log("Document written with ID: ", docRef.id);
      }
  
      setEmail("");
      setPassword("");
  
      router.push("/users/sign-in");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-6">
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
        Sign Up
      </button>
    </form>
  );
};

export default SignUpForm;