import React, { useState, useEffect } from 'react';

const TimerComponent: React.FC = () => {
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed(prevSeconds => prevSeconds + 1);
    }, 1000); 

    return () => clearInterval(timer);
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
