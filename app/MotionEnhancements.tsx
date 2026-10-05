"use client";
import { useEffect, useRef } from "react";

export default function MotionEnhancements() {
  const progressRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = document.querySelectorAll(".section-kicker,.section h2,.section-heading>p,.service-card,.platform-links>a,.steps article,.impact-panel,.promise-grid article,.ad-card-grid article,.space-grid article,.order-form-wrap,.final-cta>*,.proof article");
    targets.forEach((el,index)=>{el.classList.add("reveal-item");(el as HTMLElement).style.setProperty("--reveal-delay",`${Math.min(index%6,5)*70}ms`)});
    const observer = reduce ? null : new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("is-visible");observer?.unobserve(entry.target)}}),{threshold:.12,rootMargin:"0px 0px -7% 0px"});
    targets.forEach(el=>observer?observer.observe(el):el.classList.add("is-visible"));
    const onScroll=()=>{const max=document.documentElement.scrollHeight-window.innerHeight;if(progressRef.current)progressRef.current.style.transform=`scaleX(${max>0?window.scrollY/max:0})`};
    const onPointer=(e:PointerEvent)=>{document.documentElement.style.setProperty("--pointer-x",`${e.clientX}px`);document.documentElement.style.setProperty("--pointer-y",`${e.clientY}px`)};
    window.addEventListener("scroll",onScroll,{passive:true});window.addEventListener("pointermove",onPointer,{passive:true});onScroll();
    return()=>{observer?.disconnect();window.removeEventListener("scroll",onScroll);window.removeEventListener("pointermove",onPointer)};
  },[]);
  return <><div className="scroll-progress" aria-hidden="true"><span ref={progressRef}/></div><div className="pointer-glow" aria-hidden="true"/></>;
}
