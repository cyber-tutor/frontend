import { doc, updateDoc } from 'firebase/firestore';
import React, { useEffect } from 'react';
import { db } from '~/components/firebase/config';

interface TimerProps {
  secondsElapsed: number;
  setSecondsElapsed: React.Dispatch<React.SetStateAction<number>>;
}

const TimerComponent: React.FC<TimerProps> = ({ secondsElapsed, setSecondsElapsed }) => {
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed(prevSeconds => prevSeconds + 1);
    }, 1000);

    return () => {

      // Old method of pushing the time the user spent on the page to firestore

      // Hardcoded user id for now, for testing purposes
      // const userDocRef = doc(db, 'users', 'i84Tn9EtSxbm01wuhaGG');
      // updateDoc(userDocRef, {
      //   secondsElapsed: secondsElapsed 
      // });
      clearInterval(timer);
    }
  }, [secondsElapsed, setSecondsElapsed]);

  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
  
    const paddedSeconds = seconds.toString().padStart(2, '0');
    return `${minutes}:${paddedSeconds}`;
  };

  return (
    <div>
      <p className='hidden'>Time Elapsed: {formatTime(secondsElapsed)}</p>
    </div>
  );
}

export default TimerComponent;