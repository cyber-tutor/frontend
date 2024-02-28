import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { db } from '~/pages/firebase/config';

const TimerComponent: React.FC = () => {
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  

  

  useEffect(() => {

    let secondsElapsed = 0; 

    const timer = setInterval(() => {
      setSecondsElapsed(prevSeconds => {
        secondsElapsed = prevSeconds + 1; 
        return secondsElapsed; 
      });
    }, 1000); 

    return () => {
      // Hardcoded user id for now, for testing purposes
      const userDocRef = doc(db, 'users', 'i84Tn9EtSxbm01wuhaGG');
      updateDoc(userDocRef, {
        secondsElapsed: secondsElapsed 
      });
      clearInterval(timer);
    }
    
  }, []);

  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
  
    const paddedSeconds = seconds.toString().padStart(2, '0');
    return `${minutes}:${paddedSeconds}`;
  };

  return (
    <div>
      <p>Time Elapsed: {formatTime(secondsElapsed)}</p>
    </div>
  );
}

export default TimerComponent;
