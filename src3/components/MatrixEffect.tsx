import React, { useEffect, useRef } from 'react';

interface MatrixEffectProps {
  themeColor?: string;
}

const MatrixEffect: React.FC<MatrixEffectProps> = ({ themeColor = '#00FF00' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to full screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Characters to display
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%"\'#&_(),.;:?!\\|{}<>[]^~あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん';
    const columns = Math.floor(canvas.width / 20); // Character width + spacing
    
    // Array to track the y position of each column
    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    // Function to draw the matrix rain
    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, .01)'; // Semi-transparent black for trail effect
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = themeColor; // Use the provided theme color
      ctx.font = '22px monospace';

      for (let i = 0; i < drops.length; i++) {
        // Random character
        const char = characters[Math.floor(Math.random() * characters.length)];
        
        // Draw character
        ctx.fillText(char, i * 20, drops[i] * 20);

        // Move to next position
        drops[i]++;

        // Reset to top if at bottom
        if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
      }
    };

    // Set up animation loop
    const intervalId = setInterval(draw, 50);

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Reset drops array for new width
      const newColumns = Math.floor(canvas.width / 20);
      drops.length = 0;
      for (let i = 0; i < newColumns; i++) {
        drops[i] = Math.random() * -100;
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('resize', handleResize);
    };
  }, [themeColor]); // Add themeColor as a dependency to re-render when it changes

  return <canvas ref={canvasRef} className="matrix-effect" aria-hidden="true"></canvas>;
};

export default MatrixEffect;