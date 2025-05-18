import { useEffect, useRef } from 'react';

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let particles: Particle[] = [];
    let animationFrameId: number;
    let mouse = { x: null as number | null, y: null as number | null, radius: 150 };
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      baseX: number;
      baseY: number;
      density: number;
      
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.baseX = this.x; // Store original position
        this.baseY = this.y;
        this.size = Math.random() * 1.5 + 0.1;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.density = (Math.random() * 10) + 1; // Variable density for different movement speeds
        
        const colors = ['#00ff8c20', '#00e8ff20', '#ff00aa20']; // Transparent colors
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }
      
      update() {
        // Normal particle movement
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Screen boundaries handling
        if (this.x > canvas.width) this.x = 0;
        else if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        else if (this.y < 0) this.y = canvas.height;
        
        // Mouse interaction
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < mouse.radius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouse.radius - distance) / mouse.radius;
            
            // Smooth movement towards mouse with inverse density effect
            const directionX = forceDirectionX * force * this.density * 0.2;
            const directionY = forceDirectionY * force * this.density * 0.2;
            
            this.x += directionX;
            this.y += directionY;
          }
          
          // Gentle return to original flow when outside mouse influence
          if (distance > mouse.radius + 70) {
            const dx = this.baseX + this.speedX - this.x;
            const dy = this.baseY + this.speedY - this.y;
            this.x += dx * 0.01;
            this.y += dy * 0.01;
          }
        }
      }
      
      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      const particleCount = (canvas.width * canvas.height) / 15000;
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };
    
    const connectParticles = () => {
      if (!ctx) return;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i; j < particles.length; j++) {
          const distance = Math.sqrt(
            (particles[i].x - particles[j].x) ** 2 +
            (particles[i].y - particles[j].y) ** 2
          );
          
          if (distance < 120) {
            ctx.strokeStyle = `rgba(100, 100, 255, ${0.15 - distance / 120 * 0.15})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };
    
    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (const particle of particles) {
        particle.update();
        particle.draw();
      }
      
      connectParticles();
      animationFrameId = requestAnimationFrame(animate);
    };
    
    // Track mouse position with debouncing
    let timeout: number | null = null;
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.x;
      mouse.y = e.y;
      
      // Clear mouse position after inactivity to allow particles to return to normal flow
      if (timeout) {
        window.clearTimeout(timeout);
      }
      
      timeout = window.setTimeout(() => {
        mouse.x = null;
        mouse.y = null;
      }, 3000);
    };
    
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', resizeCanvas);
    
    resizeCanvas();
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      if (timeout) window.clearTimeout(timeout);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
};

export default ParticleBackground;
