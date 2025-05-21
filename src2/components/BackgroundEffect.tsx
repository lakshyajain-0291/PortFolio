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

    // Configure colors based on theme
    const isDark = theme === 'dark';
    // Increase opacity for light mode to improve visibility
    const primaryColor = isDark ? 'rgba(56, 189, 248, 0.2)' : 'rgba(29, 78, 216, 0.3)';
    const secondaryColor = isDark ? 'rgba(96, 165, 250, 0.2)' : 'rgba(59, 130, 246, 0.3)';
    // Increased line opacity for light mode
    const lineColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(30, 58, 138, 0.15)';

    // Create nodes
    const particlesCount = Math.floor(window.innerWidth / 10);
    const nodes: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
    }[] = [];

    for (let i = 0; i < particlesCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 4,
        color: Math.random() > 0.5 ? primaryColor : secondaryColor,
      });
    }

    // Animation loop
    let animationFrameId: number;
    
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid
      const gridSize = 30;
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 0.3;
      
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      // Update and draw nodes
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;
        
        // Bounce off edges
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
        
        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
      });
      
      // Draw connections - increase opacity in light mode
      const maxDistance = 150;
      
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            // Boost opacity for light mode connections
            const opacity = isDark ? 0.05 : 0.15;
            ctx.strokeStyle = `rgba(${isDark ? '255,255,255' : '0,0,0'}, ${opacity * (1 - distance / maxDistance)})`;
            ctx.stroke();
          }
        }
      }
      
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
      className="fixed inset-0 z-[-1] w-full h-full bg-transparent pointer-events-none"
      aria-hidden="true"
    />
  );
};

export default BackgroundEffect;