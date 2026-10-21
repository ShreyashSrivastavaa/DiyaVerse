"use client";

import React, { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [publicId, setPublicId] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          publicId: publicId.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit message");
      }

      setSubmitted(true);
      setName("");
      setEmail("");
      setPublicId("");
      setMessage("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to submit message. Please try again or email us directly.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-4xl">✉️</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-ivory-50 tracking-tight">
          Contact Us
        </h1>
        <p className="text-sm text-ivory-300">
          Have a question, feedback, or wish to request removal of a diya? We are here to help.
        </p>
      </div>

      <div className="bg-night-900/60 border border-night-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        {submitted ? (
          <div className="py-12 text-center space-y-3 animate-fade-in">
            <span className="text-4xl">🙏</span>
            <h2 className="text-xl font-serif font-bold text-flame-300">Thank you for writing to us</h2>
            <p className="text-sm text-ivory-300/80 max-w-md mx-auto">
              Your message has been received. Our team will review and respond as soon as possible.
            </p>
            <div className="pt-4">
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-xs text-flame-400 hover:text-flame-300 underline cursor-pointer"
              >
                Send another message
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-950/40 border border-red-500/40 rounded-xl text-red-200 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="contact-name" className="block text-xs font-medium text-ivory-300">
                Your Name
              </label>
              <input
                id="contact-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-2.5 bg-night-950 border border-night-800 rounded-xl text-sm text-ivory-50 placeholder-ivory-300/40 outline-none focus:border-flame-400 focus:ring-1 focus:ring-flame-400"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="contact-email" className="block text-xs font-medium text-ivory-300">
                Email Address
              </label>
              <input
                id="contact-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 bg-night-950 border border-night-800 rounded-xl text-sm text-ivory-50 placeholder-ivory-300/40 outline-none focus:border-flame-400 focus:ring-1 focus:ring-flame-400"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="contact-diya" className="block text-xs font-medium text-ivory-300">
                Diya ID (Optional, if requesting removal)
              </label>
              <input
                id="contact-diya"
                type="text"
                value={publicId}
                onChange={(e) => setPublicId(e.target.value)}
                placeholder="e.g. abc123XYZ9"
                className="w-full px-4 py-2.5 bg-night-950 border border-night-800 rounded-xl text-sm text-ivory-50 placeholder-ivory-300/40 outline-none focus:border-flame-400 focus:ring-1 focus:ring-flame-400 font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="contact-msg" className="block text-xs font-medium text-ivory-300">
                Message
              </label>
              <textarea
                id="contact-msg"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help you?"
                className="w-full px-4 py-2.5 bg-night-950 border border-night-800 rounded-xl text-sm text-ivory-50 placeholder-ivory-300/40 outline-none focus:border-flame-400 focus:ring-1 focus:ring-flame-400 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[48px] py-3 px-6 rounded-xl font-bold text-sm text-night-950 bg-flame-400 hover:bg-flame-300 transition-all shadow-[0_0_15px_rgba(255,159,28,0.3)] cursor-pointer outline-none focus:ring-2 focus:ring-flame-400 disabled:opacity-50"
            >
              {isSubmitting ? "Sending Message..." : "Send Message"}
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-night-800 text-center text-xs text-ivory-300/60">
          Prefer email? Reach us directly at{" "}
          <a href="mailto:namaste@diyaverse.in" className="text-flame-400 underline font-medium">
            namaste@diyaverse.in
          </a>
        </div>
      </div>
    </div>
  );
}
