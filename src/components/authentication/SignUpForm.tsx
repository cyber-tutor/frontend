import React, { useState } from 'react';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/config';
import { useRouter } from 'next/router';
import { Password } from 'primereact/password';
import { Divider } from 'primereact/divider';
import 'primereact/resources/themes/lara-light-cyan/theme.css';
import {
  GoogleAuthProvider,
  getAdditionalUserInfo,
  signInWithPopup,
} from 'firebase/auth';
import { FcGoogle } from 'react-icons/fc';
import { createUserDocument } from '~/components/firebase/firebase_functions';

const SignUpForm: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [isWeak, setIsWeak] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>('');

  const [createUserWithEmailAndPassword] = useCreateUserWithEmailAndPassword(auth);
  const router = useRouter();

  const provider = new GoogleAuthProvider();

  const handleGoogleSignIn = async (): Promise<void> => {
    try {
      const result = await signInWithPopup(auth, provider);
      const additionalUserInfo = getAdditionalUserInfo(result);
      if (additionalUserInfo?.isNewUser) {
        console.log('User is signing up for the first time.');
        const user = result.user;
        await createUserDocument(user, user.displayName || '');
      } else {
        console.log('User is an existing user.');
      }
      router.push('/');
    } catch (e) {
      console.error(e);
    }
  };

  const validateEmail = async (email: string): Promise<boolean> => {
    const apiUrl = `https://api.hunter.io/v2/email-verifier?email=${email}&api_key=${process.env.NEXT_PUBLIC_EMAIL_VERIFIER_HUNTER_API_KEY}`;
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      if (data.data && data.data.status === 'valid') {
        setEmailError('');
        return true;
      } else {
        setEmailError('Invalid email address');
        return false;
      }
    } catch (error) {
      console.error('Error validating email:', error);
      setEmailError('Error validating email');
      return false;
    }
  };

  const handleSignUp = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();

    // Validate the email address, don't delete this code

    // const isValidEmail = await validateEmail(email);
    // // Check if the email is valid before signing up
    // if (!isValidEmail) {
    //   return; // Exit the function if the email is not valid
    // }


    
    try {
      const strongRegex = /^(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?\/~`\-]).{8,}$/;
      if (!strongRegex.test(password)) {
        setIsWeak(true);
        return;
      }
      const res = await createUserWithEmailAndPassword(email, password);
      if (res?.user) {
        await createUserDocument(res.user, name);
        setEmail('');
        setName('');
        setPassword('');
        router.push('/initialsurvey/begin');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const emailValue = e.target.value;
    setEmail(emailValue);
  };

  const passwordHeader = <h6 className="text-white">Pick a password</h6>;
  const passwordFooter = (
    <>
      <Divider />
      <p className="mt-2">Suggestions</p>
      <ul className="line-height-3 ml-2 mt-0 pl-2">
        <li>At least one lowercase</li>
        <li>At least one uppercase</li>
        <li>At least one numeric</li>
        <li>At least one special character</li>
        <li>Minimum 8 characters</li>
        <li>Strong password ex: 7h!sI$C0oL</li>
      </ul>
    </>
  );

  return (
    <div className="flex flex-col h-screen">
    <div className="flex h-screen w-screen items-center justify-center bg-transparent">

      <div className="w-full max-w-xs bg-white rounded-lg shadow-md p-8 m-4">
        <h1 className="text-2xl font-bold mb-8 text-center">Create Account</h1>
        <form onSubmit={handleSignUp} className="space-y-6">
          <div className="mb-4">
            <label htmlFor="email" className="block mb-1 font-bold">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              required
              className="w-full rounded border px-3 py-2 leading-tight focus:border-blue-500 focus:outline-none"
            />
            {emailError && <p className="text-red-600">{emailError}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="name" className="block mb-1 font-bold">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded border px-3 py-2 leading-tight focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block mb-1 font-bold">Password</label>
            <Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              toggleMask
              footer={passwordFooter}
              className="w-full rounded border px-3 py-2 leading-tight focus:border-blue-500 focus:outline-none"
            />
            {isWeak && <p className="text-red-600">Password is weak</p>}
          </div>
          <button
            type="submit"
            className="w-full rounded bg-green-500 py-2 font-bold text-white hover:bg-green-600"
          >
            Sign Up
          </button>

          <div className="flex items-center justify-between my-6">
            <span className="w-1/5 border-b border-gray-300"></span>
            <p className="mx-4 text-xs text-gray-700 uppercase">or sign up with</p>
            <span className="w-1/5 border-b border-gray-300"></span>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center w-full rounded border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <FcGoogle className="text-2xl" />
            <span className="ml-2">Google</span>
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

export default SignUpForm;