"use client";

/**
 * PactFlow — Landing Navbar Component
 * Sticky glassmorphism navigation header with Constellation branding and fast route jump.
 */
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Menu, X, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "The Problem", href: "#problem" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
    { label: "Security", href: "#security" },
    { label: "Architecture", href: "#architecture" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-surface-0/85 backdrop-blur-xl border-b border-border-subtle shadow-lg py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 via-brand-600 to-amber-600 p-0.5 shadow-brand-xs flex items-center justify-center group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-surface-0 rounded-[10px] flex items-center justify-center">
              <Sparkles size={18} className="text-brand-400 group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-text-primary flex items-center gap-1.5 font-sans">
              PactFlow
              <span className="text-[10px] font-mono bg-brand-500/15 text-brand-300 px-1.5 py-0.5 rounded border border-brand-500/30">
                Soroban v2.1
              </span>
            </span>
            <span className="text-[10px] text-text-tertiary font-mono tracking-wider uppercase">
              Constellation of Trust
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-surface-1/60 border border-border-subtle rounded-full px-4 py-1.5 backdrop-blur-md">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-all"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/escrows"
            className="text-xs font-semibold text-text-secondary hover:text-brand-300 px-3 py-2 transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck size={14} className="text-status-success" />
            Explore Vaults
          </Link>

          <Link href="/dashboard">
            <Button size="sm" variant="primary" rightIcon={<ArrowRight size={14} />}>
              Launch App
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl bg-surface-1 border border-border-subtle text-text-secondary hover:text-text-primary"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface-1 border-b border-border-subtle overflow-hidden px-4 py-6 space-y-4 shadow-xl"
          >
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-all"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="pt-4 border-t border-border-subtle flex flex-col gap-2.5">
              <Link href="/escrows" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="md" className="w-full justify-center">
                  Explore Vaults
                </Button>
              </Link>

              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" size="md" className="w-full justify-center">
                  Launch App
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
