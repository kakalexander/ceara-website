"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Reveal-on-scroll, tilt 3D, magnetic buttons e header morph.
 * Roda uma vez por mudança de rota e observa elementos com
 * [data-reveal], [data-stagger], [data-tilt] e [data-magnetic].
 */
export function RevealInit(): null {
  const pathname = usePathname();

  useEffect(() => {
    // ----- 1. Reveal observer -----
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll("[data-reveal], [data-stagger]").forEach((el) => {
      revealObs.observe(el);
    });

    // ----- 2. Tilt 3D -----
    const tiltHandlers = new WeakMap<HTMLElement, { move: (e: MouseEvent) => void; leave: () => void }>();
    document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((card) => {
      const max = 8;
      const move = (e: MouseEvent) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        const rx = (0.5 - y) * max;
        const ry = (x - 0.5) * max;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
        card.style.setProperty("--mx", `${x * 100}%`);
        card.style.setProperty("--my", `${y * 100}%`);
      };
      const leave = () => {
        card.style.transform = "";
      };
      card.addEventListener("mousemove", move);
      card.addEventListener("mouseleave", leave);
      tiltHandlers.set(card, { move, leave });
    });

    // ----- 3. Magnetic buttons -----
    const magHandlers = new WeakMap<HTMLElement, { move: (e: MouseEvent) => void; leave: () => void }>();
    document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((btn) => {
      const strength = 12;
      const move = (e: MouseEvent) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${(x / r.width) * strength}px, ${(y / r.height) * strength}px)`;
      };
      const leave = () => {
        btn.style.transform = "";
      };
      btn.addEventListener("mousemove", move);
      btn.addEventListener("mouseleave", leave);
      magHandlers.set(btn, { move, leave });
    });

    // ----- 4. Header scroll morph -----
    const header = document.querySelector(".site-header");
    const onScroll = () => {
      if (!header) return;
      header.classList.toggle("is-scrolled", window.scrollY > 30);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // ----- 5. Hero split text -----
    const heroH1 = document.querySelector<HTMLElement>(".hero h1.split");
    if (heroH1 && !heroH1.querySelector(".word")) {
      const html = heroH1.innerHTML;
      heroH1.innerHTML = html.replace(/(<span class="red">|<\/span>)|(\S+)/g, (_match, tag: string | undefined, word: string | undefined) => {
        if (tag) return tag;
        return `<span class="word">${word ?? ""}</span>`;
      });
      heroH1.querySelectorAll<HTMLElement>(".word").forEach((w, i) => {
        w.style.animationDelay = `${0.1 + i * 0.08}s`;
      });
    }

    // ----- Cleanup -----
    return () => {
      revealObs.disconnect();
      window.removeEventListener("scroll", onScroll);
      document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((card) => {
        const h = tiltHandlers.get(card);
        if (h) {
          card.removeEventListener("mousemove", h.move);
          card.removeEventListener("mouseleave", h.leave);
        }
      });
      document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((btn) => {
        const h = magHandlers.get(btn);
        if (h) {
          btn.removeEventListener("mousemove", h.move);
          btn.removeEventListener("mouseleave", h.leave);
        }
      });
    };
  }, [pathname]);

  return null;
}
