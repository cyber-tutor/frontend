import React, { useState } from "react";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, db } from "../../pages/firebase/config";
import { useRouter } from "next/router";
import { collection, addDoc } from "firebase/firestore";
import PasswordStrengthBar from 'react-password-strength-bar';
import { Password } from 'primereact/password';
import { Divider } from 'primereact/divider';
import "primereact/resources/themes/lara-light-cyan/theme.css";



const SignUpForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [isWeak, setIsWeak] = useState(false);

  const [createUserWithEmailAndPassword] =
    useCreateUserWithEmailAndPassword(auth);
  const router = useRouter();

  const handleSignUp = async (event: React.FormEvent) => {
    // This prevents the default behavior of a form submission is to reload the page. We don't want that because of async behavior.
    event.preventDefault();
    // This is the try-catch block that will handle the actual sign-up process. If it succeeds, they will be redirected to the sign-in page. If it fails, well, nothing really at the moment on the front end, YET. It logs the error to the console though.
    try {


      const strongRegex = /^(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?\/~`\-]).{8,}$/;
      
      if (!strongRegex.test(password)) {
        setIsWeak(true);
        return;
      }
      

      const res = await createUserWithEmailAndPassword(email, password);

      const isExperimental = Math.random() < 0.5;

      const group = isExperimental ? "experimental" : "control";

      // If the user was successfully created, add a document to the 'users' collection
      // Progress will be inserted on completion of sections so currently 
      // just empty map. Length can me modified by how many section are in each chapter
      if (res?.user) {
        const docRef = await addDoc(collection(db, "users"), {
          userId: res.user.uid,
          group: group,
          name: name,
          progress: {0: {0: 0, 1:0, 2:0, 3:0, 4:0, 5:0}, 1:{0: 0, 1:0, 2:0, 3:0, 4:0, 5:0}, 2:{0: 0, 1:0, 2:0, 3:0, 4:0, 5:0}, 3:{0: 0, 1:0, 2:0, 3:0, 4:0, 5:0}, 4:{0: 0, 1:0, 2:0, 3:0, 4:0, 5:0}, 5:{0: 0, 1:0, 2:0, 3:0, 4:0, 5:0}},
          proficiency: {0: 0, 1:0, 2:0, 3:0, 4:0, 5:0},
          scoresQuiz: {0: 0, 1:0, 2:0, 3:0, 4:0, 5:0},
          scoresTest: {0: 0, 1:0, 2:0, 3:0, 4:0, 5:0}
        });
      }

      setEmail("");
      setName("");
      setPassword("");

      router.push("/");
    } catch (e) {
      console.error(e);
    }
  };

  const header = <div className="font-bold mb-3">Pick a password</div>;
    const footer = (
        <>
            <Divider />
            <p className="mt-2">Suggestions</p>
            <ul className="pl-2 ml-2 mt-0 line-height-3">
                <li>At least one lowercase</li>
                <li>At least one uppercase</li>
                <li>At least one numeric</li>
                <li>Minimum 8 characters</li>
            </ul>
        </>
    );

  return (


    <form onSubmit={handleSignUp} className="space-y-6</form>">
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
        
        {/* <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="flex w-full justify-center rounded border-2 p-1"
        /> */}


        
        <Password className="card flex justify-content-center" id="" value={password} onChange={(e) => setPassword(e.target.value)} header={header} footer={footer} />
        {/* <PasswordStrengthBar password={password} /> */}
      </div>
      <button
        type="submit"
        className="flex w-full justify-center rounded bg-blue-500 py-1 text-white"
      >
        Sign Up
      </button>

      {isWeak && <p className="text-red-500">Password is weak</p>}
    </form>

  );
};

export default SignUpForm;