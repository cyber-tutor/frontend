import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const Tip = () => {
  const [tip, setTip] = useState('');

  useEffect(() => {
    fetch('/tip.json')
      .then(response => response.json())
      .then(data => {
        const randomIndex = Math.floor(Math.random() * data.tips.length);
        setTip(data.tips[randomIndex]);
      });
  }, []);

  return (
    <div className='text-center'>Tip: {tip}</div>
  );
};

export default Tip;