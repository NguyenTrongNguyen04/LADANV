/**
 * Auth page with animated switch between Login and Register
 * Visual style aligned to landing page using Tailwind and Motion
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { InputHTMLAttributes } from 'react';
import { ArrowLeft, CirclePlay, Mail, Lock, UserRound } from 'lucide-react';
import Logo from '@/components/Logo';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, isAuthenticated } from '@/lib/api';
import { heroBanner1 } from '@/assets';

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: JSX.Element;
};

const TextInput = ({ label, icon, ...props }: TextInputProps) => {
  return (
    <label className='grid gap-1'>
      <span className='text-sm text-muted-foreground'>{label}</span>
      <div className='flex items-center gap-2 rounded-md border border-foreground/10 bg-card px-3 py-2 focus-within:ring-1 focus-within:ring-primary'>
        {icon}
        <input
          {...props}
          className='w-full bg-transparent outline-none'
        />
      </div>
    </label>
  );
};

type Tab = 'login' | 'register';

const Auth = () => {
  const [active, setActive] = useState<Tab>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const initialDarkRef = useRef<boolean | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // redirect if already authenticated
    isAuthenticated().then((res) => {
      if (res.success) navigate('/');
    });
  }, [navigate]);

  // Force Light theme on Auth (both Login & Register)
  useEffect(() => {
    if (initialDarkRef.current === null) {
      initialDarkRef.current = document.documentElement.classList.contains('dark');
    }
    const root = document.documentElement;
    root.classList.remove('dark');
    return () => {
      // restore original theme when leaving page
      if (initialDarkRef.current === true) {
        document.documentElement.classList.add('dark');
      }
      if (initialDarkRef.current === false) {
        document.documentElement.classList.remove('dark');
      }
    };
  }, [active]);

  // Lightweight 2D particles with depth parallax (no external libs)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0, height = 0;

    type Dot = { x: number; y: number; z: number; vx: number; vy: number; r: number };
    let dots: Dot[] = [];

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * DPR;
      canvas.height = height * DPR;
      ctx.scale(DPR, DPR);
      // regenerate dots count based on area
      const count = Math.floor((width * height) / 18000);
      dots = Array.from({ length: count }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 1 + 0.2, // depth 0.2-1.2
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.8 + 0.8,
      }));
    };

    const step = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.06)';
      for (const d of dots) {
        d.x += d.vx * d.z;
        d.y += d.vy * d.z;
        if (d.x < -10) d.x = width + 10; if (d.x > width + 10) d.x = -10;
        if (d.y < -10) d.y = height + 10; if (d.y > height + 10) d.y = -10;

        const gradient = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r * 6);
        gradient.addColorStop(0, 'rgba(59,130,246,0.35)');
        gradient.addColorStop(1, 'rgba(59,130,246,0.0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r * (0.8 + d.z * 0.6), 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(step);
    };

    const onResize = () => { resize(); };
    resize();
    step();
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);

  const pageTitle = useMemo(() => (active === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'), [active]);
  const pageSub = useMemo(
    () => (active === 'login' ? 'Đăng nhập để tiếp tục hành trình chăm sóc da cùng LADANV.' : 'Gia nhập LADANV để cá nhân hóa mọi lựa chọn dành cho làn da bạn.'),
    [active]
  );

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const res = await loginUser({ email, password });
    setLoading(false);
    if (!res.success) return setError(res.message || 'Đăng nhập thất bại');
    navigate('/');
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const res = await registerUser({ name, email, password });
    setLoading(false);
    if (!res.success) return setError(res.message || 'Đăng ký thất bại');
    setActive('login');
  }

  return (
    <section className='relative min-h-screen overflow-hidden'>
      {/* Dynamic multi-layer gradient bg */}
      <motion.div
        className='absolute inset-0 -z-10'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Grid variant */}
        <div className='ai-grid'></div>
        <div className='ai-noise'></div>
      </motion.div>

      {/* Top-left logo + back */}
      <div className='fixed left-4 top-4 z-20 flex items-center gap-2'>
        <a href='/' className='rounded-md overflow-hidden'>
          <Logo />
        </a>
        <button
          onClick={() => navigate('/')}
          className='flex items-center gap-2 rounded-full border border-foreground/10 bg-white/70 px-4 py-2 text-sm shadow-sm backdrop-blur-md transition-all hover:bg-white/85 hover:shadow'
        >
          <ArrowLeft /> Về trang chủ
        </button>
      </div>

      {active === 'login' ? (
        <>
          {/* Centered login card */}
          <div className='container grid min-h-screen place-items-center py-10'>
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className='w-full max-w-[420px] rounded-2xl border border-foreground/10 bg-white/90 p-6 md:p-7 shadow-xl backdrop-blur-xl'
            >
              {/* Tabs on top to switch to Register */}
              <div className='mb-5 grid grid-cols-2 rounded-full border border-foreground/10 bg-foreground/5 p-1'>
                {(['login','register'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={()=>setActive(tab)}
                    className={`relative z-10 rounded-full px-4 py-2 text-sm transition-colors ${active===tab?'text-foreground':'text-muted-foreground'}`}
                  >
                    {tab==='login'?'Đăng nhập':'Đăng ký'}
                    {active===tab && (
                      <motion.span layoutId='auth-pill' className='absolute inset-0 -z-10 rounded-full bg-background shadow' />
                    )}
                  </button>
                ))}
              </div>

              <h2 className='text-2xl md:text-3xl font-semibold !leading-snug'>{pageTitle}</h2>
              <p className='text-sm md:text-base text-muted-foreground mb-5'>{pageSub}</p>

              {error && (
                <div className='mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground'>
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className='grid gap-3'>
                <TextInput
                  name='email'
                  label='Email'
                  type='email'
                  required
                  icon={<Mail size={16} />}
                  placeholder='you@example.com'
                  autoComplete='email'
                />
                <TextInput
                  name='password'
                  label='Mật khẩu'
                  type='password'
                  required
                  icon={<Lock size={16} />}
                  placeholder='••••••••'
                  autoComplete='current-password'
                />

                <Button disabled={loading} className='mt-2'>
                  {loading ? 'Đang xử lý…' : 'Đăng nhập'}
                </Button>
              </form>

              <div className='mt-6 text-center text-sm text-muted-foreground'>
                <button
                  type='button'
                  className='text-primary hover:underline'
                  onClick={() => setActive('register')}
                >
                  Chưa có tài khoản? Đăng ký ngay
                </button>
              </div>
            </motion.div>
          </div>
        </>
      ) : (
        <div className='container grid min-h-screen place-items-center py-10'>
          {/* Register Card (same style as login) */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className='w-full max-w-[420px] rounded-2xl border border-foreground/10 bg-white/90 p-6 md:p-7 shadow-xl backdrop-blur-xl'
          >
            <div className='mb-5 grid grid-cols-2 rounded-full border border-foreground/10 bg-foreground/5 p-1'>
              {(['login','register'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={()=>setActive(tab)}
                  className={`relative z-10 rounded-full px-4 py-2 text-sm transition-colors ${active===tab?'text-foreground':'text-muted-foreground'}`}
                >
                  {tab==='login'?'Đăng nhập':'Đăng ký'}
                  {active===tab && (
                    <motion.span layoutId='auth-pill' className='absolute inset-0 -z-10 rounded-full bg-background shadow' />
                  )}
                </button>
              ))}
            </div>
            <h2 className='text-2xl md:text-3xl font-semibold !leading-snug'>{pageTitle}</h2>
            <p className='text-sm md:text-base text-muted-foreground mb-5'>{pageSub}</p>
            {error && (<div className='mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground'>{error}</div>)}
            <form onSubmit={handleRegister} className='grid gap-3'>
              <TextInput name='name' label='Họ và tên' required icon={<UserRound size={16} />} placeholder='Nguyễn Văn A' autoComplete='name' />
              <TextInput name='email' label='Email' type='email' required icon={<Mail size={16} />} placeholder='you@example.com' autoComplete='email' />
              <TextInput name='password' label='Mật khẩu' type='password' required icon={<Lock size={16} />} placeholder='••••••••' autoComplete='new-password' />
              <Button disabled={loading} className='mt-2'>{loading ? 'Đang xử lý…' : 'Tạo tài khoản'}</Button>
            </form>
            <div className='mt-6 text-center text-sm text-muted-foreground'>
              <button type='button' className='text-primary hover:underline' onClick={() => setActive('login')}>Đã có tài khoản? Đăng nhập</button>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
};

export default Auth;


