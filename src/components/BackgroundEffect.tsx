import React, { useEffect, useRef } from 'react';
import { useTheme } from './theme-provider';

const BackgroundEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);

    // Configure colors based on theme using portfolio's darktech colors
    const isDark = theme === 'dark';
    
    // For dark theme: use the darktech neon colors with reduced opacity
    // For light theme: use softer versions of the same color palette
    const starColors = isDark ? [
      'rgba(0, 232, 255, 0.5)',  // holo-cyan with reduced opacity
      'rgba(0, 255, 140, 0.5)',  // neon-green with reduced opacity
      'rgba(255, 0, 170, 0.5)'   // cyber-pink with reduced opacity
    ] : [
      'rgba(0, 186, 205, 0.35)',  // softer cyan with reduced opacity
      'rgba(0, 205, 112, 0.35)',  // softer green with reduced opacity
      'rgba(205, 0, 137, 0.35)'   // softer pink with reduced opacity
    ];

    // Create stars
    const starsCount = Math.floor(window.innerWidth * window.innerHeight / 20000);
    const stars: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      pulseOffset: number;
      pulseSpeed: number;
    }[] = [];

    for (let i = 0; i < starsCount; i++) {
      // Calculate distance from center for bias
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Generate random position
      let x, y, distanceFromCenter;
      do {
        x = Math.random() * canvas.width;
        y = Math.random() * canvas.height;
        
        // Calculate distance from center as a ratio (0-1)
        const dx = (x - centerX) / (canvas.width / 2);
        const dy = (y - centerY) / (canvas.height / 2);
        distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
        
        // Accept position with higher probability if further from center
        // This creates a subtle bias against central positioning
      } while (Math.random() > distanceFromCenter * 0.8);
      
      stars.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.15, // Slow, gentle movement
        vy: (Math.random() - 0.5) * 0.15,
        radius: Math.random() * 1.5 + 3, // Stars of various sizes
        color: starColors[Math.floor(Math.random() * starColors.length)],
        pulseOffset: Math.random() * Math.PI * 2, // For twinkling effect
        pulseSpeed: 0.01 + Math.random() * 0.03
      });
    }

    // Animation loop
    let animationFrameId: number;
    let frameCount = 0;
    
    const render = () => {
      frameCount++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw and update stars
      stars.forEach((star, index) => {
        // Update position
        star.x += star.vx;
        star.y += star.vy;
        
        // Wrap around edges instead of bouncing
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;
        
        // Calculate twinkling/pulsing effect
        const pulseSize = 0.2 * Math.sin(frameCount * star.pulseSpeed + star.pulseOffset) + 1;
        const currentRadius = star.radius * pulseSize;
        
        // Draw star with glow effect
        const gradient = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, currentRadius * 3
        );
        gradient.addColorStop(0, star.color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.fill();
        
        // Add glow
        ctx.beginPath();
        ctx.arc(star.x, star.y, currentRadius * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });
      
      // Draw connections between nearby stars
      const connectionDistance = Math.min(200, canvas.width * 0.2);
      
      ctx.globalCompositeOperation = 'lighter';
      
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < connectionDistance) {
            // Create gradient for line with reduced opacity
            const opacity = (1 - distance / connectionDistance) * 1.5; // Reduced opacity from 0.5 to 0.3
            
            const gradient = ctx.createLinearGradient(
              stars[i].x, stars[i].y,
              stars[j].x, stars[j].y
            );
            
            // Extract colors from the rgba values
            const color1 = stars[i].color.replace(/[^\d,]/g, '').split(',');
            const color2 = stars[j].color.replace(/[^\d,]/g, '').split(',');
            
            gradient.addColorStop(0, `rgba(${color1[0]}, ${color1[1]}, ${color1[2]}, ${opacity})`);
            gradient.addColorStop(1, `rgba(${color2[0]}, ${color2[1]}, ${color2[2]}, ${opacity})`);
            
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 0.5 * opacity;
            ctx.stroke();
          }
        }
      }
      
      ctx.globalCompositeOperation = 'source-over';
      
      animationFrameId = requestAnimationFrame(render);
    };
    
    render();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-[-1] w-full h-full bg-transparent pointer-events-none opacity-80" // Added opacity-80 class
      aria-hidden="true"
    />
  );
};

export default BackgroundEffect;