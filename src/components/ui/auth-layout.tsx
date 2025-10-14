import React from 'react';
import { Testimonial } from './sign-in';

interface AuthLayoutProps {
  logo: string;
  heroImage: string;
  testimonials: Testimonial[];
  children: React.ReactNode;
}

const TestimonialCard = ({ testimonial, delay }: { testimonial: Testimonial, delay: string }) => (
  <div className={`animate-[testimonial-in_0.6s_ease-out_forwards] opacity-0 ${delay} flex items-start gap-3 rounded-3xl bg-card/40 dark:bg-zinc-800/40 backdrop-blur-xl border border-white/10 p-5 w-64`}>
    <img src={testimonial.avatarSrc} className="h-10 w-10 object-cover rounded-2xl" alt="avatar" />
    <div className="text-sm leading-snug">
      <p className="flex items-center gap-1 font-medium">{testimonial.name}</p>
      <p className="text-muted-foreground">{testimonial.handle}</p>
      <p className="mt-1 text-foreground/80">{testimonial.text}</p>
    </div>
  </div>
);

export const AuthLayout: React.FC<AuthLayoutProps> = ({ logo, heroImage, testimonials, children }) => {
  return (
    <div className="h-[100dvh] flex flex-col md:flex-row w-[100dvw]">
      {/* Left column: form area */}
      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 items-start self-start">
              <img src={logo} alt="Velara" className="h-[63px] w-auto dark:invert" />
              <span className="font-light text-foreground tracking-tighter">Bem-vindo</span>
            </div>
            
            {/* Dynamic form content goes here */}
            {children}
          </div>
        </div>
      </section>

      {/* Right column: hero image + testimonials (FIXED) */}
      <section className="hidden md:block flex-1 relative p-4">
        <div className="animate-[slide-right-in_0.8s_ease-out_forwards] opacity-0 [animation-delay:300ms] absolute inset-4 rounded-3xl bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }}></div>
        {testimonials.length > 0 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 px-8 w-full justify-center">
            <TestimonialCard testimonial={testimonials[0]} delay="[animation-delay:1000ms]" />
            {testimonials[1] && <div className="hidden xl:flex"><TestimonialCard testimonial={testimonials[1]} delay="[animation-delay:1200ms]" /></div>}
            {testimonials[2] && <div className="hidden 2xl:flex"><TestimonialCard testimonial={testimonials[2]} delay="[animation-delay:1400ms]" /></div>}
          </div>
        )}
      </section>
    </div>
  );
};