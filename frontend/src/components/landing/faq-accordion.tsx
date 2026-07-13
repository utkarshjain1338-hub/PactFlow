"use client";

/**
 * PactFlow — FAQ Accordion Section Component
 * Section 11: Smooth animated glassmorphism accordion answering critical Web3 & security questions.
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, ShieldAlert, Cpu, Lock } from "lucide-react";

interface FAQItemProps {
  question: string;
  answer: string;
  badge: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, badge, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="border border-border-subtle rounded-2xl bg-surface-1/80 overflow-hidden backdrop-blur-xl transition-colors hover:border-border-default">
      <button
        onClick={onToggle}
        className="w-full p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold uppercase px-2.5 py-1 rounded bg-surface-2 text-brand-300 border border-border-subtle shrink-0">
            {badge}
          </span>
          <span className="text-base sm:text-lg font-bold text-text-primary leading-snug">
            {question}
          </span>
        </div>
        <div
          className={`p-1.5 rounded-xl bg-surface-2 text-text-secondary transition-transform duration-300 ${
            isOpen ? "rotate-180 bg-brand-500/20 text-brand-300" : ""
          }`}
        >
          <ChevronDown size={18} />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-6 pb-6 pt-1 text-sm text-text-secondary leading-relaxed border-t border-border-subtle/40">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      badge: "Soroban Escrow",
      question: "How does Soroban smart contract escrow differ from traditional bank escrow?",
      answer:
        "Traditional bank or marketplace escrow requires a centralized intermediary to custody funds, charging 10%–20% in fees while taking days or weeks to clear reviews. PactFlow deploys an immutable Rust contract (`pactflow_escrow`) directly to the Soroban WebAssembly runtime on Stellar. Funds are held entirely by deterministic code and settle instantly in ~1.2s for $0.0000015 once objective milestones are met.",
    },
    {
      badge: "Dispute Arbitration",
      question: "What happens if there is a dispute over deliverable quality?",
      answer:
        "Each PactFlow escrow is initialized with a 2-of-3 multisig arbiter structure composed of: (1) The Client, (2) The Freelancer, and (3) An impartial Level 4 Verified Arbiter or DAO committee. If either party raises a dispute, two signatures are required to unlock or refund the reserves, preventing unilateral theft or ransom.",
    },
    {
      badge: "Hardware Timelocks",
      question: "What happens if a freelancer abandons the project or a client goes unresponsive?",
      answer:
        "Every milestone stage incorporates strict Level 4 hardware timelocks. If a deliverable deadline passes without submission, the client can execute an automated on-chain refund after the timeout window. Conversely, if a freelancer submits valid work and the client fails to review within the SLA period, timelock rules allow automatic release or instant arbiter escalation.",
    },
    {
      badge: "Non-Custodial",
      question: "Does PactFlow ever store or transmit my wallet seed phrase?",
      answer:
        "Never. PactFlow is purely a non-custodial interface. All transactions are signed locally on your device using browser extensions or hardware wallets like Freighter, xBull, or Rabet. Your private keys never touch our servers, our Spring Boot backend, or PostgreSQL database.",
    },
    {
      badge: "Test Environment",
      question: "Can I test PactFlow without spending real XLM or USDC?",
      answer:
        "Yes! You can toggle between Mainnet, Futurenet, and Testnet directly in our Settings page (`/settings`). On Testnet, you can fund contracts using free testnet XLM directly from the Stellar Friendbot with zero financial risk.",
    },
  ];

  return (
    <section id="faq" className="py-28 px-4 sm:px-6 lg:px-8 bg-surface-1/90 border-t border-border-subtle relative">
      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-bold uppercase tracking-wider">
            <HelpCircle size={14} />
            <span>Frequently Asked Questions</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text-primary">
            Everything You Need to Know.
          </h2>

          <p className="text-base sm:text-lg text-text-secondary">
            Have questions about smart contract architecture or multisig security? We have answers.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <FAQItem
              key={faq.question}
              badge={faq.badge}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === idx}
              onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
