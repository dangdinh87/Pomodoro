'use client';

import { useEffect, useRef, useState, useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/i18n-context';
import { cn } from '@/lib/utils';

interface GameState {
  score: number;
  level: number;
  isRunning: boolean;
  isGameOver: boolean;
}

interface SpaceShooterGameProps {
  fullscreen?: boolean;
  onGameEnd?: (score: number) => void;
}

// Max limits to prevent memory issues
const MAX_PROJECTILES = 50;
const MAX_ENEMIES = 20;
const MAX_PARTICLES = 100;
const STAR_COUNT = 40;

// Memoized game component
export const SpaceShooterGame = memo(function SpaceShooterGame({
  fullscreen = false,
  onGameEnd,
}: SpaceShooterGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationIdRef = useRef<number>(0);
  const isVisibleRef = useRef(true);
  const gameStateRef = useRef<GameState>({
    score: 0,
    level: 1,
    isRunning: false,
    isGameOver: false,
  });
  const framesRef = useRef(0);
  const lastUpdateRef = useRef(0);

  const [displayState, setDisplayState] = useState<GameState>({
    score: 0,
    level: 1,
    isRunning: false,
    isGameOver: false,
  });

  const { t } = useI18n();

  // Game objects refs
  const playerRef = useRef<Player | null>(null);
  const projectilesRef = useRef<Projectile[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<Star[]>([]);
  const shootIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Classes
  class Player {
    x: number;
    y: number;
    targetX: number;
    width = 30;
    height = 40;
    color = '#00ffff';

    constructor(canvasWidth: number, canvasHeight: number) {
      this.x = canvasWidth / 2;
      this.y = canvasHeight - 100;
      this.targetX = this.x;
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();
      ctx.translate(this.x, this.y);

      // Engine effect
      ctx.beginPath();
      ctx.moveTo(-5, 15);
      ctx.lineTo(0, 25 + (framesRef.current % 10));
      ctx.lineTo(5, 15);
      ctx.fillStyle = '#ff00de';
      ctx.fill();

      // Spaceship
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(15, 15);
      ctx.lineTo(0, 10);
      ctx.lineTo(-15, 15);
      ctx.closePath();
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.restore();
    }

    update(ctx: CanvasRenderingContext2D, canvasWidth: number) {
      this.x += (this.targetX - this.x) * 0.15;
      this.x = Math.max(15, Math.min(canvasWidth - 15, this.x));
      this.draw(ctx);
    }
  }

  class Projectile {
    x: number;
    y: number;
    radius = 4;
    velocityY = -12;

    constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#fff';
      ctx.fill();
    }

    update(ctx: CanvasRenderingContext2D) {
      this.y += this.velocityY;
      this.draw(ctx);
    }
  }

  class Enemy {
    x: number;
    y: number;
    radius: number;
    color: string;
    velocityX: number;
    velocityY: number;
    spin = 0;
    spinSpeed: number;

    constructor(canvasWidth: number, level: number) {
      this.radius = Math.random() * 12 + 10;
      this.x = Math.random() * (canvasWidth - this.radius * 2) + this.radius;
      this.y = -50;

      const colors = ['#ff0055', '#ffcc00', '#55ff00', '#00aaff'];
      this.color = colors[Math.floor(Math.random() * colors.length)];

      const speedMultiplier = 1 + (level * 0.08);
      this.velocityX = (Math.random() - 0.5) * 0.8;
      this.velocityY = (Math.random() * 1.2 + 1.5) * speedMultiplier;
      this.spinSpeed = (Math.random() - 0.5) * 0.08;
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.spin);

      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        ctx.lineTo(
          this.radius * Math.cos(i * Math.PI / 3),
          this.radius * Math.sin(i * Math.PI / 3)
        );
      }
      ctx.closePath();
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    }

    update(ctx: CanvasRenderingContext2D, canvasWidth: number) {
      this.x += this.velocityX;
      this.y += this.velocityY;
      this.spin += this.spinSpeed;

      if (this.x <= this.radius || this.x >= canvasWidth - this.radius) {
        this.velocityX *= -1;
      }
      this.draw(ctx);
    }
  }

  class Particle {
    x: number;
    y: number;
    radius: number;
    color: string;
    velocityX: number;
    velocityY: number;
    alpha = 1;
    friction = 0.94;

    constructor(x: number, y: number, color: string) {
      this.x = x;
      this.y = y;
      this.radius = Math.random() * 2.5;
      this.color = color;
      this.velocityX = (Math.random() - 0.5) * 4;
      this.velocityY = (Math.random() - 0.5) * 4;
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    }

    update(ctx: CanvasRenderingContext2D) {
      this.velocityX *= this.friction;
      this.velocityY *= this.friction;
      this.x += this.velocityX;
      this.y += this.velocityY;
      this.alpha -= 0.04;
      this.draw(ctx);
    }
  }

  class Star {
    x: number;
    y: number;
    radius: number;
    speed: number;
    alpha: number;

    constructor(canvasWidth: number, canvasHeight: number) {
      this.x = Math.random() * canvasWidth;
      this.y = Math.random() * canvasHeight;
      this.radius = Math.random() * 1.5;
      this.speed = Math.random() * 1.5 + 0.5;
      this.alpha = Math.random() * 0.6 + 0.2;
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
      ctx.fill();
    }

    update(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
      this.y += this.speed;
      if (this.y > canvasHeight) {
        this.y = 0;
        this.x = Math.random() * canvasWidth;
      }
      this.draw(ctx);
    }
  }

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }, []);

  const initStars = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    starsRef.current = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      starsRef.current.push(new Star(canvas.width, canvas.height));
    }
  }, []);

  const cleanupGame = useCallback(() => {
    cancelAnimationFrame(animationIdRef.current);
    if (shootIntervalRef.current) {
      clearInterval(shootIntervalRef.current);
      shootIntervalRef.current = null;
    }
    projectilesRef.current = [];
    enemiesRef.current = [];
    particlesRef.current = [];
  }, []);

  const endGame = useCallback(() => {
    const finalScore = gameStateRef.current.score;
    gameStateRef.current.isRunning = false;
    gameStateRef.current.isGameOver = true;
    cleanupGame();
    setDisplayState({ ...gameStateRef.current });

    // Notify parent about game end
    if (onGameEnd) {
      onGameEnd(finalScore);
    }
  }, [cleanupGame, onGameEnd]);

  const spawnEnemies = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || enemiesRef.current.length >= MAX_ENEMIES) return;

    const level = gameStateRef.current.level;
    let spawnRate = 70;
    if (level > 1) spawnRate = 60;
    if (level > 3) spawnRate = 50;
    if (level > 5) spawnRate = 40;

    if (framesRef.current % spawnRate === 0) {
      enemiesRef.current.push(new Enemy(canvas.width, level));
    }
  }, []);

  const animate = useCallback(() => {
    if (!gameStateRef.current.isRunning || !isVisibleRef.current) {
      if (gameStateRef.current.isRunning) {
        animationIdRef.current = requestAnimationFrame(animate);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    animationIdRef.current = requestAnimationFrame(animate);

    // Clear canvas completely with dark background (no trail effect to prevent gray buildup)
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars
    for (const star of starsRef.current) {
      star.update(ctx, canvas.width, canvas.height);
    }

    // Player
    playerRef.current?.update(ctx, canvas.width);

    // Particles
    if (particlesRef.current.length > MAX_PARTICLES) {
      particlesRef.current = particlesRef.current.slice(-MAX_PARTICLES);
    }
    particlesRef.current = particlesRef.current.filter(particle => {
      if (particle.alpha <= 0) return false;
      particle.update(ctx);
      return true;
    });

    // Projectiles
    if (projectilesRef.current.length > MAX_PROJECTILES) {
      projectilesRef.current = projectilesRef.current.slice(-MAX_PROJECTILES);
    }
    projectilesRef.current = projectilesRef.current.filter(projectile => {
      projectile.update(ctx);
      return projectile.y + projectile.radius >= 0;
    });

    // Enemies
    spawnEnemies();
    const player = playerRef.current;

    enemiesRef.current = enemiesRef.current.filter(enemy => {
      enemy.update(ctx, canvas.width);

      // Check projectile collision
      for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
        const projectile = projectilesRef.current[i];
        const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

        if (dist - enemy.radius - projectile.radius < 1) {
          // Explosion effect
          for (let j = 0; j < 5; j++) {
            particlesRef.current.push(new Particle(projectile.x, projectile.y, enemy.color));
          }

          gameStateRef.current.score += 100;
          if (gameStateRef.current.score % 1000 === 0) {
            gameStateRef.current.level++;
          }

          // Throttle state updates
          if (framesRef.current - lastUpdateRef.current > 5) {
            setDisplayState({ ...gameStateRef.current });
            lastUpdateRef.current = framesRef.current;
          }

          projectilesRef.current.splice(i, 1);
          return false;
        }
      }

      // Player collision
      if (player) {
        const distPlayer = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (distPlayer - enemy.radius - player.width / 2 < 1) {
          endGame();
          return false;
        }
      }

      return enemy.y <= canvas.height + 50;
    });

    framesRef.current++;
  }, [spawnEnemies, endGame]);

  const shoot = useCallback(() => {
    if (!gameStateRef.current.isRunning || !playerRef.current) return;
    if (projectilesRef.current.length < MAX_PROJECTILES) {
      projectilesRef.current.push(new Projectile(playerRef.current.x, playerRef.current.y - 10));
    }
  }, []);

  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    cleanupGame();

    playerRef.current = new Player(canvas.width, canvas.height);
    projectilesRef.current = [];
    enemiesRef.current = [];
    particlesRef.current = [];
    framesRef.current = 0;
    lastUpdateRef.current = 0;

    gameStateRef.current = {
      score: 0,
      level: 1,
      isRunning: true,
      isGameOver: false,
    };

    setDisplayState({ ...gameStateRef.current });
    initStars();

    shootIntervalRef.current = setInterval(shoot, 200);
    animate();
  }, [animate, shoot, initStars, cleanupGame]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (gameStateRef.current.isRunning && playerRef.current && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      playerRef.current.targetX = e.clientX - rect.left;
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (gameStateRef.current.isRunning && playerRef.current && canvasRef.current) {
      e.preventDefault();
      const rect = canvasRef.current.getBoundingClientRect();
      playerRef.current.targetX = e.touches[0].clientX - rect.left;
    }
  }, []);

  const handleVisibilityChange = useCallback(() => {
    isVisibleRef.current = document.visibilityState === 'visible';
  }, []);

  useEffect(() => {
    resizeCanvas();
    initStars();

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cleanupGame();
    };
  }, [resizeCanvas, initStars, handleMouseMove, handleTouchMove, handleVisibilityChange, cleanupGame]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex justify-center items-center overflow-hidden",
        fullscreen ? "w-full h-full" : "w-full h-[600px] rounded-lg"
      )}
      style={{ background: '#050510' }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* HUD */}
      {displayState.isRunning && (
        <div
          className={cn(
            "absolute left-0 w-full flex justify-between text-cyan-400 font-bold pointer-events-none px-6",
            fullscreen ? "top-20 text-xl" : "top-4 text-lg"
          )}
          style={{ textShadow: '0 0 10px #00ffff' }}
        >
          <span>Score: {displayState.score}</span>
          <span>Level: {displayState.level}</span>
        </div>
      )}

      {/* Start Screen */}
      {!displayState.isRunning && !displayState.isGameOver && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col justify-center items-center z-10 p-4">
          <h1
            className={cn(
              "text-white uppercase tracking-widest text-center font-bold mb-4",
              fullscreen ? "text-4xl md:text-5xl" : "text-3xl md:text-4xl"
            )}
            style={{ textShadow: '0 0 20px #ff00de, 0 0 40px #ff00de' }}
            suppressHydrationWarning
          >
            {t('entertainment.games.spaceShooter.title')}
          </h1>
          <p
            className={cn(
              "text-gray-300 mb-8 text-center max-w-md",
              fullscreen ? "text-base md:text-lg" : "text-sm md:text-base"
            )}
            suppressHydrationWarning
          >
            {t('entertainment.instructions')}
          </p>
          <Button
            onClick={initGame}
            className={cn(
              "bg-transparent text-cyan-400 border-2 border-cyan-400 uppercase tracking-wider font-bold",
              "hover:bg-cyan-400 hover:text-black transition-all",
              "hover:shadow-[0_0_30px_rgba(0,255,255,0.8)] hover:scale-105",
              fullscreen ? "px-10 py-4 text-xl" : "px-6 py-2 text-base"
            )}
            suppressHydrationWarning
          >
            {t('entertainment.playNow')}
          </Button>
        </div>
      )}

      {/* Game Over Screen */}
      {displayState.isGameOver && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col justify-center items-center z-10 p-4">
          <h1
            className={cn(
              "text-white uppercase tracking-widest text-center font-bold mb-2",
              fullscreen ? "text-4xl md:text-5xl" : "text-3xl md:text-4xl"
            )}
            style={{ textShadow: '0 0 20px #ff00de, 0 0 40px #ff00de' }}
          >
            Game Over!
          </h1>
          <div
            className={cn(
              "text-yellow-400 my-6 font-bold",
              fullscreen ? "text-6xl md:text-7xl" : "text-4xl md:text-5xl"
            )}
            style={{ textShadow: '0 0 20px #ffcc00' }}
          >
            {displayState.score}
          </div>
          <Button
            onClick={initGame}
            className={cn(
              "bg-transparent text-cyan-400 border-2 border-cyan-400 uppercase tracking-wider font-bold",
              "hover:bg-cyan-400 hover:text-black transition-all",
              "hover:shadow-[0_0_30px_rgba(0,255,255,0.8)] hover:scale-105",
              fullscreen ? "px-10 py-4 text-xl" : "px-6 py-2 text-base"
            )}
            suppressHydrationWarning
          >
            {t('entertainment.playNow')}
          </Button>
        </div>
      )}
    </div>
  );
});
