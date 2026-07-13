"use client";

/**
 * PactFlow — Testimonials Section Component
 * Section 9: Horizontal glassmorphism card showcase praising programmable trust.
 */
import React from "react";
import { motion } from "framer-motion";
import { Quote, Star, Award } from "lucide-react";

export function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "Before PactFlow, our DeFi startup spent $20,000 on legal fees dealing with an overseas contractor who vanished after receiving upfront funds. Programmable Soroban timelocks have completely solved this for us.",
      author: "Marcus Vance",
      role: "VP of Engineering @ CryptoScale Labs",
      rating: 5,
      verified: "Level 4 Client Identity",
    },
    {
      quote:
        "As a senior Rust and Wasm auditor, I used to wait up to 45 days for enterprise clients to release milestone invoices. With PactFlow's 2-of-3 multisig, my payment lands in my wallet in exactly 1.2 seconds once verified.",
      author: "Elena Rostova",
      role: "Senior Smart Contract Auditor",
      rating: 5,
      verified: "Top 1% Assignee",
    },
    {
      quote:
        "The separation of clean business logic in Spring Boot from financial custody in Soroban is an architectural masterpiece. We integrated PactFlow escrow vaults directly into our agency dashboard in two afternoons.",
      author: "Devon Chen",
      role: "Chief Technology Officer @ Web3 Foundry",
      rating: 5,
      verified: "Level 4 Verified Partner",
    },
    {
      quote:
        "Traditional Web2 marketplace fees were eating 20% of my team's revenue. Paying $0.0000015 per transaction on the Stellar network feels like discovering a superpower.",
      author: "Sarah Jenkins",
      role: "Founder @ Frontier AI Studios",
      rating: 5,
      verified: "Stellar Ecosystem Grantee",
    },
  ];

  return (
    <section className="py-28 px-4 sm:px-6 lg:px-8 bg-surface-1/90 border-t border-border-subtle relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[400px] bg-brand-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-bold uppercase tracking-wider">
            <Award size={14} />
            <span>Trusted By Web3 Leaders</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text-primary leading-tight">
            Why Top Engineering Teams <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-brand-400 to-amber-500">
              Switched to PactFlow.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
            Read how programmable escrow and zero-custody hardware timelocks transformed collaboration for startups and senior engineers.
          </p>
        </div>

        {/* Testimonial Glass Cards Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ scale: 1.01, y: -3 }}
              className="p-8 rounded-3xl bg-surface-0 border border-border-subtle hover:border-brand-500/40 transition-all shadow-xl backdrop-blur-xl flex flex-col justify-between space-y-6 group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: t.rating }, (_, i) => (
                      <Star key={i} size={15} fill="currentColor" />
                    ))}
                  </div>
                  <Quote size={24} className="text-brand-500/30 group-hover:text-brand-400/60 transition-colors" />
                </div>

                <p className="text-sm sm:text-base text-text-primary font-normal leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-text-primary">{t.author}</h4>
                  <p className="text-xs text-text-tertiary">{t.role}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-[10px] font-mono font-bold text-brand-300">
                  {t.verified}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
