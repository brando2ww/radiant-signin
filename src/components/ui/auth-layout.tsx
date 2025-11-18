import React from 'react';
import logo from "@/assets/logo_velara_preto.png";
import heroImage from "@/assets/auth-hero.png";

// --- TYPE DEFINITIONS ---

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

interface AuthLayoutProps {
  children: React.ReactNode;
  testimonials?: Testimonial[];
}

// --- SUB-COMPONENTS ---

const TestimonialCard = ({ testimonial, delay }: { testimonial: Testimonial, delay: string }) => (
  <div className={`animate-[testimonial-in_0.6s_ease-out_forwards] opacity-0 ${delay} flex items-start gap-3 rounded-3xl bg-card/40 dark:bg-zinc-800/40 backdrop-blur-xl border border-white/10 p-5 w-64`}>
    <img src={testimonial.avatarSrc} className="h-10 w-10 object-cover rounded-2xl" alt="avatar" />
    <div className="text-sm leading-snug">
      <p className="flex items-center gap-1 font-medium text-yellow-400">{testimonial.name}</p>
      <p className="text-white">{testimonial.handle}</p>
      <p className="mt-1 text-white">{testimonial.text}</p>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, testimonials = [] }) => {

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row w-[100dvw]">
      {/* Left column: form content */}
      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="animate-[fade-slide-in_0.6s_ease-out_forwards] opacity-0 [animation-delay:100ms] flex flex-col gap-4 items-start self-start mb-6">
            <img src={logo} alt="Velara" className="h-[63px] w-auto dark:invert" />
          </div>
          
          {/* Dynamic form content */}
          {children}
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

// Export shared component
export const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-yellow-400/70 focus-within:bg-yellow-500/10">
    {children}
  </div>
);