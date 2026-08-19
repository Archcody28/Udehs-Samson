import { useEffect, useState } from 'react';

interface TypingTextProps {
  texts: string[];
  speed?: number;
  deleteSpeed?: number;
  pause?: number;
  className?: string;
}

export function TypingText({
  texts,
  speed = 80,
  deleteSpeed = 40,
  pause = 2000,
  className,
}: TypingTextProps) {
  const [display, setDisplay] = useState('');
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = texts[index % texts.length];

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          setDisplay(current.slice(0, display.length + 1));
          if (display.length + 1 === current.length) {
            setTimeout(() => setIsDeleting(true), pause);
          }
        } else {
          setDisplay(current.slice(0, display.length - 1));
          if (display.length === 1) {
            setIsDeleting(false);
            setIndex((prev) => prev + 1);
          }
        }
      },
      isDeleting ? deleteSpeed : speed
    );

    return () => clearTimeout(timeout);
  }, [display, index, isDeleting, texts, speed, deleteSpeed, pause]);

  return (
    <span className={className}>
      {display}
      <span className="animate-pulse text-blue-500">|</span>
    </span>
  );
}
