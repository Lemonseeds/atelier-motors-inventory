import React from 'react';
import { ArrowRight, ArrowUpRight, Check, Compass, Heart, Search, ShieldCheck, Sparkles } from 'lucide-react';

const journey = [
  {
    number: '01',
    icon: Search,
    title: 'Find your direction',
    text: 'Start with the shape of your life. Search by name, explore body styles, and use price filters to narrow the collection at your own pace.',
  },
  {
    number: '02',
    icon: Compass,
    title: 'See the full picture',
    text: 'Open a vehicle to take in its details, price, and current availability. The information you need should be easy to find and easy to compare.',
  },
  {
    number: '03',
    icon: Check,
    title: 'Make your move',
    text: 'Create an account when you are ready. Your selection updates the live inventory, so the collection always reflects what is available.',
  },
];

const principles = [
  {
    icon: Compass,
    title: 'Curiosity first',
    text: 'A grand tourer, an everyday SUV, an electric beginning. We make room for different kinds of drivers and different kinds of journeys.',
  },
  {
    icon: ShieldCheck,
    title: 'Clarity in the details',
    text: 'Every listing puts the essentials in view: model, category, year, price, description, and availability.',
  },
  {
    icon: Heart,
    title: 'The feeling matters',
    text: 'Performance and practicality have a place. So does the unmistakable feeling that a car is the one you want to drive.',
  },
];

const questions = [
  {
    question: 'Can I explore the collection without an account?',
    answer: 'Yes. You can browse the preview collection, search, filter, and view vehicle details before signing in. An account is needed to make a selection.',
  },
  {
    question: 'How do I know whether a vehicle is available?',
    answer: 'Each vehicle card shows its current stock status. Once you sign in, the collection is loaded from the live inventory and updates after a selection.',
  },
  {
    question: 'What happens when I select Purchase?',
    answer: 'The app records your selection by reducing that vehicle’s available inventory by one. It is a dealership inventory demo; payment and delivery are not processed here.',
  },
];

export function ExperienceSection({ onExplore }) {
  return (
    <section id="experience" className="shell scroll-mt-6 pt-20 sm:pt-28" aria-labelledby="experience-title">
      <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
        <div>
          <span className="eyebrow"><span className="h-1.5 w-1.5 rounded-full bg-royal" /> OUR EXPERIENCE</span>
          <h2 id="experience-title" className="display-heading mt-5 max-w-[580px] text-[clamp(2.5rem,5vw,4.7rem)]">
            The journey should feel as good as the <em className="font-normal text-steel">drive.</em>
          </h2>
        </div>
        <p className="max-w-[460px] text-sm leading-7 text-ink-soft lg:ml-auto lg:pb-2 sm:text-base">
          We built Atelier Motors around the best part of finding a car: possibility. Take your time, follow what catches your eye, and move from inspiration to a choice with the details in clear view.
        </p>
      </div>

      <div className="experience-stage relative mt-10 min-h-[450px] overflow-hidden bg-[#8098b9] sm:min-h-[530px]">
        <img src="/suv.webp" alt="Silver SUV in a quiet architectural setting" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-[center_58%]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#172844]/80 via-[#233e63]/28 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#172844]/55 via-transparent to-transparent" />
        <div className="relative z-1 flex min-h-[450px] flex-col justify-between p-6 text-white sm:min-h-[530px] sm:p-10">
          <span className="w-fit border border-white/45 bg-white/10 px-4 py-2 text-[10px] font-bold tracking-[.22em] backdrop-blur-lg">AN OPEN ROAD AHEAD</span>
          <div className="experience-glass max-w-md border border-white/35 bg-white/15 p-6 backdrop-blur-xl sm:p-8">
            <Sparkles size={22} strokeWidth={1.5} />
            <h3 className="mt-5 font-display text-2xl font-semibold leading-tight sm:text-3xl">Room to discover what moves you.</h3>
            <p className="mt-3 text-sm leading-6 text-white/85">From the first glance to the finer details, explore a collection made for more than getting from A to B.</p>
            <button type="button" onClick={onExplore} className="mt-6 inline-flex items-center gap-2 border-b border-white pb-1 text-xs font-bold transition hover:gap-3">
              Explore the collection <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {journey.map(({ number, icon: Icon, title, text }) => (
          <article key={number} className="border border-white/75 bg-white/65 p-6 shadow-card backdrop-blur-md sm:p-7">
            <div className="flex items-start justify-between text-steel">
              <Icon size={25} strokeWidth={1.4} />
              <span className="font-display text-xs font-bold tracking-[.18em]">{number} / 03</span>
            </div>
            <h3 className="mt-9 font-display text-xl font-semibold tracking-tight">{title}</h3>
            <p className="mt-3 text-[13px] leading-6 text-ink-soft">{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function AboutSection({ onExplore }) {
  return (
    <>
      <section id="about" className="shell scroll-mt-6 pt-20 sm:pt-28" aria-labelledby="about-title">
        <div className="about-stage relative overflow-hidden bg-[#243b63] text-white">
          <img src="/coupe.webp" alt="Performance coupe in a calm, modern setting" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-[60%_center] opacity-55" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#182a49]/95 via-[#20395c]/72 to-[#1e3452]/15" />
          <div className="relative z-1 grid min-h-[520px] items-end gap-12 p-7 sm:p-12 lg:grid-cols-[1fr_.55fr] lg:items-center lg:p-16">
            <div className="max-w-[630px]">
              <span className="text-[11px] font-extrabold tracking-[.22em] text-[#cfdef7]">ABOUT ATELIER MOTORS</span>
              <h2 id="about-title" className="display-heading mt-5 text-[clamp(2.6rem,5.5vw,5.3rem)]">
                A place for the cars you <em className="font-normal text-[#c7d9f3]">remember.</em>
              </h2>
              <p className="mt-6 max-w-[520px] text-sm leading-7 text-white/85 sm:text-base">
                Atelier Motors is a digital showroom built around the joy of finding the right car. We bring distinctive vehicles and useful details together in a calm, easy-to-explore space, so you can focus on what feels right for the road ahead.
              </p>
              <button type="button" onClick={onExplore} className="btn btn-white mt-8">
                Discover the collection <ArrowUpRight size={18} />
              </button>
            </div>
            <div className="about-glass border border-white/35 bg-white/12 p-6 backdrop-blur-xl lg:self-end">
              <span className="text-[10px] font-bold tracking-[.2em] text-[#d7e4fa]">OUR POINT OF VIEW</span>
              <p className="mt-4 font-display text-xl font-medium leading-snug sm:text-2xl">A car is never just a specification. It is how the next chapter begins.</p>
              <div className="mt-6 h-px bg-white/30" />
              <span className="mt-4 block text-xs tracking-wide text-white/75">The art of driving, thoughtfully presented.</span>
            </div>
          </div>
        </div>

        <div className="grid gap-10 border-b border-[#d7deea] px-1 py-16 md:grid-cols-[.8fr_1.2fr] md:gap-20 sm:py-20">
          <div>
            <span className="eyebrow">WHAT GUIDES US</span>
            <h3 className="display-heading mt-4 text-3xl sm:text-4xl">More than a list of cars.</h3>
            <p className="mt-5 max-w-sm text-sm leading-7 text-ink-soft">An inviting way to explore, information that helps you decide, and vehicles with a story worth starting.</p>
          </div>
          <div className="space-y-7">
            {principles.map(({ icon: Icon, title, text }, index) => (
              <div key={title} className="grid grid-cols-[40px_1fr] gap-4 border-b border-[#dbe2ed] pb-6 last:border-b-0">
                <Icon className="mt-1 text-steel" size={25} strokeWidth={1.4} />
                <div>
                  <div className="flex items-baseline justify-between gap-3">
                    <h4 className="font-display text-lg font-semibold">{title}</h4>
                    <span className="text-[10px] font-bold tracking-widest text-muted">0{index + 1}</span>
                  </div>
                  <p className="mt-2 max-w-lg text-[13px] leading-6 text-ink-soft">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="shell grid gap-10 py-20 lg:grid-cols-[.85fr_1.15fr] lg:gap-20 sm:py-24" aria-labelledby="questions-title">
        <div>
          <span className="eyebrow">GOOD TO KNOW</span>
          <h2 id="questions-title" className="display-heading mt-4 text-3xl sm:text-4xl">A little more clarity for the road ahead.</h2>
          <p className="mt-5 max-w-sm text-sm leading-7 text-ink-soft">How the showroom works, what you can explore, and what happens when you make a selection.</p>
        </div>
        <div className="space-y-3">
          {questions.map(({ question, answer }) => (
            <details key={question} className="group border border-white/80 bg-white/65 px-5 py-5 shadow-card backdrop-blur-md open:bg-white/85">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-display text-sm font-semibold marker:hidden sm:text-base">
                {question}<span className="text-xl font-light text-steel group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-4 max-w-xl text-[13px] leading-6 text-ink-soft">{answer}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
