import React from 'react';
import { ArrowRight, ArrowUpRight, Check, Compass, Heart, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { Reveal, RevealWords, useScene } from '../lib/motion.jsx';

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
  const stageRef = useScene();
  const journeyRef = useScene();

  return (
    <section id="experience" className="shell scroll-mt-6 pt-20 sm:pt-28" aria-labelledby="experience-title">
      <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
        <div>
          <Reveal as="span" className="eyebrow"><span className="h-1.5 w-1.5 rounded-full bg-royal" /> OUR EXPERIENCE</Reveal>
          <RevealWords as="h2" id="experience-title" className="display-heading mt-5 block max-w-[580px] text-[clamp(2.5rem,5vw,4.7rem)]">
            The journey should feel as good as the {<em className="font-normal text-steel">drive.</em>}
          </RevealWords>
        </div>
        <Reveal as="p" delay={250} className="max-w-[460px] text-sm leading-7 text-ink-soft lg:ml-auto lg:pb-2 sm:text-base">
          We built Atelier Motors around the best part of finding a car: possibility. Take your time, follow what catches your eye, and move from inspiration to a choice with the details in clear view.
        </Reveal>
      </div>

      <div ref={stageRef} data-scene className="relative mt-10">
        <div className="stage-frame will-move relative min-h-[460px] overflow-hidden bg-[#8098b9] sm:min-h-[600px]">
          <img src="/suv.webp" alt="Silver SUV in a quiet architectural setting" loading="lazy" className="stage-media will-move absolute h-[128%] w-full object-cover object-[center_58%]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#172844]/80 via-[#233e63]/28 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#172844]/55 via-transparent to-transparent" />
          <div className="relative z-1 flex min-h-[460px] flex-col justify-between p-6 text-white sm:min-h-[600px] sm:p-10">
            <span className="float-slow will-move w-fit border border-white/45 bg-white/20 px-4 py-2 text-[10px] font-bold tracking-[.22em] backdrop-blur-sm">AN OPEN ROAD AHEAD</span>
            <div className="float-fast will-move max-w-md border border-white/35 bg-white/20 p-6 backdrop-blur-sm sm:p-8">
              <Sparkles size={22} strokeWidth={1.5} />
              <h3 className="mt-5 font-display text-2xl font-semibold leading-tight sm:text-3xl">Room to discover what moves you.</h3>
              <p className="mt-3 text-sm leading-6 text-white/85">From the first glance to the finer details, explore a collection made for more than getting from A to B.</p>
              <button type="button" onClick={onExplore} className="mt-6 inline-flex items-center gap-2 border-b border-white pb-1 text-xs font-bold transition-all hover:gap-3">
                Explore the collection <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div ref={journeyRef} data-scene className="mt-5 grid gap-4 md:grid-cols-3 md:pt-6">
        {journey.map(({ number, icon: Icon, title, text }, index) => (
          <div key={number} className={`drift-${index + 1} will-move`}>
            <Reveal as="article" delay={index * 120} className="h-full border border-white/75 bg-white/75 p-6 shadow-card backdrop-blur-sm sm:p-7">
              <div className="flex items-start justify-between text-steel">
                <Icon size={25} strokeWidth={1.4} />
                <span className="font-display text-xs font-bold tracking-[.18em]">{number} / 03</span>
              </div>
              <h3 className="mt-9 font-display text-xl font-semibold tracking-tight">{title}</h3>
              <p className="mt-3 text-[13px] leading-6 text-ink-soft">{text}</p>
            </Reveal>
          </div>
        ))}
      </div>
    </section>
  );
}

const marqueeWords = ['Grand Touring', 'Coupe', 'SUV', 'Electric', 'Sedan', 'Performance'];

/** Two rows of oversized type that slide in opposite directions as you scroll. */
export function MarqueeBand() {
  const ref = useScene();
  const row = [...marqueeWords, ...marqueeWords, ...marqueeWords];

  return (
    <div ref={ref} data-scene aria-hidden="true" className="relative mt-24 select-none overflow-hidden py-6 sm:mt-32">
      <div className="marquee-row-a will-move flex w-max items-center gap-10 whitespace-nowrap font-display text-[clamp(3.2rem,9vw,8.5rem)] font-semibold leading-none tracking-[-.06em] text-ink">
        {row.map((word, i) => (
          <span key={`a-${i}`} className="flex items-center gap-10">
            {i % 2 ? <em className="font-normal text-steel">{word}</em> : word}
            <span className="inline-block h-3 w-3 rounded-full bg-royal sm:h-4 sm:w-4" />
          </span>
        ))}
      </div>
      <div className="marquee-row-b will-move mt-2 flex w-max items-center gap-10 whitespace-nowrap font-display text-[clamp(3.2rem,9vw,8.5rem)] font-semibold leading-none tracking-[-.06em]">
        {row.map((word, i) => (
          <span key={`b-${i}`} className="text-outline flex items-center gap-10">
            {word}
            <span className="font-normal">/</span>
          </span>
        ))}
      </div>
    </div>
  );
}

const statements = [
  { at: 0.42, text: 'Designed to be noticed.' },
  { at: 0.56, text: 'Engineered to be driven.' },
  { at: 0.7, text: 'Chosen to be kept.' },
];

/**
 * Pinned cinematic interlude: the sedan takes center stage in a full-bleed
 * architectural showcase while three statements arrive one after another.
 */
export function Interlude({ onExplore }) {
  const ref = useScene();

  return (
    <section ref={ref} data-scene className="relative h-[260vh] bg-[#0c1526]" aria-label="Atelier Motors philosophy">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Soft atmospheric gradients bridging mist to dark cinema stage */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-mist via-mist/40 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-mist via-mist/40 to-transparent" />

        <div className="pin-frame will-move absolute inset-0 overflow-hidden bg-[#0c1526]">
          <img
            src="/sedan.webp"
            alt="Luxury sedan in soft evening light"
            loading="lazy"
            className="pin-media will-move absolute inset-0 h-full w-full object-cover object-[center_60%] sm:object-[center_55%]"
          />
          <div className="pin-shade absolute inset-0 bg-gradient-to-t from-[#0a1220]/95 via-[#0e1a2d]/55 to-[#0a1220]/75" />
        </div>

        <div className="pin-intro pointer-events-none absolute inset-x-0 top-14 sm:top-20 z-10 text-center">
          <span className="inline-flex items-center gap-2.5 text-[11px] font-extrabold tracking-[.22em] text-[#9bb3f7]">
            <span className="h-1.5 w-1.5 rounded-full bg-royal" /> THE ATELIER STANDARD
          </span>
          <p className="mx-auto mt-3 max-w-md px-6 text-xs sm:text-sm text-white/85">
            Keep scrolling. Some cars deserve a slower reveal.
          </p>
        </div>

        <div className="relative z-1 flex h-full flex-col items-center justify-center px-6 text-center text-white">
          {statements.map(({ at, text }) => (
            <p key={text} className="pin-line will-move font-display text-[clamp(2.2rem,6vw,5.6rem)] font-semibold leading-[1.08] tracking-[-.04em]" style={{ '--at': at }}>
              {text}
            </p>
          ))}
          <div className="pin-line mt-10" style={{ '--at': 0.8 }}>
            <button type="button" onClick={onExplore} className="btn btn-white">
              Explore the collection <ArrowUpRight size={18} />
            </button>
          </div>
        </div>

        <div className="absolute inset-x-6 bottom-8 z-1 mx-auto flex max-w-[1400px] items-center gap-4 text-[10px] font-bold tracking-[.22em] text-white/80 sm:inset-x-10">
          <span>01</span>
          <span className="relative h-px flex-1 bg-white/25"><span className="pin-meter absolute inset-0 bg-white" /></span>
          <span>03</span>
        </div>
      </div>
    </section>
  );
}

export function AboutSection({ onExplore }) {
  const stageRef = useScene();

  return (
    <>
      <section id="about" className="shell scroll-mt-6 pt-20 sm:pt-28" aria-labelledby="about-title">
        <div ref={stageRef} data-scene className="relative">
        <div className="stage-frame will-move relative overflow-hidden bg-[#243b63] text-white">
          <img src="/coupe.webp" alt="Performance coupe in a calm, modern setting" loading="lazy" className="stage-media will-move absolute h-[128%] w-full object-cover object-[60%_center] opacity-55" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#182a49]/95 via-[#20395c]/72 to-[#1e3452]/15" />
          <div className="relative z-1 grid min-h-[560px] items-end gap-12 p-7 sm:p-12 lg:grid-cols-[1fr_.55fr] lg:items-center lg:p-16">
            <div className="max-w-[630px]">
              <Reveal as="span" className="block text-[11px] font-extrabold tracking-[.22em] text-[#cfdef7]">ABOUT ATELIER MOTORS</Reveal>
              <RevealWords as="h2" id="about-title" className="display-heading mt-5 block text-[clamp(2.6rem,5.5vw,5.3rem)]">
                A place for the cars you {<em className="font-normal text-[#c7d9f3]">remember.</em>}
              </RevealWords>
              <Reveal as="p" delay={200} className="mt-6 max-w-[520px] text-sm leading-7 text-white/85 sm:text-base">
                Atelier Motors is a digital showroom built around the joy of finding the right car. We bring distinctive vehicles and useful details together in a calm, easy-to-explore space, so you can focus on what feels right for the road ahead.
              </Reveal>
              <Reveal delay={320}>
                <button type="button" onClick={onExplore} className="btn btn-white mt-8">
                  Discover the collection <ArrowUpRight size={18} />
                </button>
              </Reveal>
            </div>
            <div className="float-fast will-move border border-white/35 bg-white/20 p-6 backdrop-blur-sm lg:self-end">
              <span className="text-[10px] font-bold tracking-[.2em] text-[#d7e4fa]">OUR POINT OF VIEW</span>
              <p className="mt-4 font-display text-xl font-medium leading-snug sm:text-2xl">A car is never just a specification. It is how the next chapter begins.</p>
              <div className="mt-6 h-px bg-white/30" />
              <span className="mt-4 block text-xs tracking-wide text-white/75">The art of driving, thoughtfully presented.</span>
            </div>
          </div>
        </div>
        </div>

        <div className="grid gap-10 border-b border-[#d7deea] px-1 py-16 md:grid-cols-[.8fr_1.2fr] md:gap-20 sm:py-20">
          <div className="md:sticky md:top-24 md:self-start">
            <Reveal as="span" className="eyebrow">WHAT GUIDES US</Reveal>
            <RevealWords as="h3" className="display-heading mt-4 block text-3xl sm:text-4xl">More than a list of cars.</RevealWords>
            <Reveal as="p" delay={200} className="mt-5 max-w-sm text-sm leading-7 text-ink-soft">An inviting way to explore, information that helps you decide, and vehicles with a story worth starting.</Reveal>
          </div>
          <div className="space-y-7">
            {principles.map(({ icon: Icon, title, text }, index) => (
              <Reveal key={title} delay={index * 110} className="grid grid-cols-[40px_1fr] gap-4 border-b border-[#dbe2ed] pb-6 last:border-b-0">
                <Icon className="mt-1 text-steel" size={25} strokeWidth={1.4} />
                <div>
                  <div className="flex items-baseline justify-between gap-3">
                    <h4 className="font-display text-lg font-semibold">{title}</h4>
                    <span className="text-[10px] font-bold tracking-widest text-muted">0{index + 1}</span>
                  </div>
                  <p className="mt-2 max-w-lg text-[13px] leading-6 text-ink-soft">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="shell grid gap-10 py-20 lg:grid-cols-[.85fr_1.15fr] lg:gap-20 sm:py-24" aria-labelledby="questions-title">
        <div>
          <Reveal as="span" className="eyebrow">GOOD TO KNOW</Reveal>
          <RevealWords as="h2" id="questions-title" className="display-heading mt-4 block text-3xl sm:text-4xl">A little more clarity for the road ahead.</RevealWords>
          <Reveal as="p" delay={200} className="mt-5 max-w-sm text-sm leading-7 text-ink-soft">How the showroom works, what you can explore, and what happens when you make a selection.</Reveal>
        </div>
        <div className="space-y-3">
          {questions.map(({ question, answer }, index) => (
            <Reveal as="details" key={question} delay={index * 100} className="group border border-white/80 bg-white/75 px-5 py-5 shadow-card backdrop-blur-sm open:bg-white/85">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-display text-sm font-semibold marker:hidden sm:text-base">
                {question}<span className="text-xl font-light text-steel group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-4 max-w-xl text-[13px] leading-6 text-ink-soft">{answer}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
