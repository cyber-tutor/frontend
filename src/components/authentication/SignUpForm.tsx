import React, { useState } from 'react';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '../../pages/firebase/config';
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
import { createUserDocument } from '~/pages/firebase/firebase_functions';

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

  const header = <div className="mb-3 font-bold">Pick a password</div>;
  const footer = (
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
    <form onSubmit={handleSignUp} className="space-y-6">
      <div>
        <label htmlFor="email" className="text-start">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={handleEmailChange}
          required
          className="flex w-full justify-center rounded border-2 p-1"
        />
        {emailError && <p className="text-red-500">{emailError}</p>}
        <label htmlFor="name" className="text-start">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="flex w-full justify-center rounded border-2 p-1"
        />
      </div>
      <div>
        <label htmlFor="password" className="text-start">
          Password
        </label>
        <Password
          className="card flex w-full justify-center rounded border-2 p-1"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          header={header}
          footer={footer}
        />
      </div>
      <button
        type="submit"
        className="flex w-full justify-center rounded bg-blue-500 py-1 text-white"
        style={{ marginTop: "20rem" }}
      >
        Sign Up
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
        <FcGoogle className="mr-2" /> Sign up with Google
      </button>

      {isWeak && <p className="text-red-500">Password is weak</p>}
    </form>
  );
};

export default SignUpForm;
