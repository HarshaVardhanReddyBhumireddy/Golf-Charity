import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Heart, Target, ArrowRight, Star, Users, Coins, TrendingUp, ChevronDown } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { charitiesAPI, drawsAPI } from '../services/api';

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.12 } } };

export default function HomePage() {
  const [charities, setCharities] = useState([]);
  const [upcomingDraw, setUpcomingDraw] = useState(null);

  useEffect(() => {
    charitiesAPI.getAll({ featured: 'true', limit: 3 }).then(r => setCharities(r.data.charities || [])).catch(() => {});
    drawsAPI.getUpcoming().then(r => setUpcomingDraw(r.data)).catch(() => {});
  }, []);

  const steps = [
    { icon: Target, title: 'Enter Your Scores', desc: 'Log your last 5 Stableford scores after each round. Simple, fast, done.' },
    { icon: Trophy, title: 'Win Monthly Prizes', desc: 'Your scores enter our draw. Match 3, 4, or 5 numbers to win prize pools.' },
    { icon: Heart, title: 'Support a Charity', desc: 'A portion of every subscription funds the charity you choose. Every month.' },
  ];

  const stats = [
    { label: 'Active Subscribers', value: '1,240+', icon: Users },
    { label: 'Total Donated', value: '£48,200', icon: Heart },
    { label: 'Prize Pool This Month', value: '£2,400', icon: Coins },
    { label: 'Charities Supported', value: '12', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-lime/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-sky/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-lime/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {/* Pill */}
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent-lime/10 border border-accent-lime/20 rounded-full text-accent-lime text-sm font-medium">
                <span className="w-1.5 h-1.5 bg-accent-lime rounded-full animate-pulse" />
                Monthly draw now open — £2,400 prize pool
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={fadeUp} className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight">
              Play Golf.<br />
              <span className="text-gradient">Win Prizes.</span><br />
              Change Lives.
            </motion.h1>

            {/* Sub */}
            <motion.p variants={fadeUp} className="text-dark-300 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
              The world's first subscription golf platform combining performance tracking, monthly prize draws, and genuine charitable impact.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link to="/register" className="btn-primary text-base px-8 py-4 glow-lime">
                Start for £20/month <ArrowRight size={18} />
              </Link>
              <Link to="/draws" className="btn-secondary text-base px-8 py-4">
                See how it works
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div variants={fadeUp} className="flex items-center justify-center gap-2 text-dark-400 text-sm pt-2">
              <div className="flex -space-x-2">
                {['JB', 'MR', 'SL', 'TD'].map(i => (
                  <div key={i} className="w-7 h-7 rounded-full bg-dark-600 border-2 border-dark-900 flex items-center justify-center text-xs font-bold text-dark-200">{i}</div>
                ))}
              </div>
              <span>Join 1,240+ golfers already playing for good</span>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-dark-500"
          >
            <span className="text-xs">Scroll to explore</span>
            <ChevronDown size={16} className="animate-bounce" />
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-dark-700 bg-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ label, value, icon: Icon }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center gap-1"
              >
                <Icon size={18} className="text-accent-lime mb-1" />
                <span className="font-display text-2xl font-bold text-white">{value}</span>
                <span className="text-dark-400 text-xs">{label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-accent-lime text-sm font-semibold tracking-widest uppercase mb-3">The Platform</p>
            <h2 className="section-title">Three things.<br />One subscription.</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="card p-8 group hover:border-accent-lime/30 transition-colors duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-accent-lime/10 border border-accent-lime/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icon size={22} className="text-accent-lime" />
                </div>
                <div className="w-6 h-0.5 bg-accent-lime/30 rounded mb-4" />
                <span className="text-dark-400 text-xs font-mono mb-2 block">0{i + 1}</span>
                <h3 className="font-display text-2xl font-bold text-white mb-3">{title}</h3>
                <p className="text-dark-300 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Prize Pool breakdown */}
      <section className="py-24 bg-dark-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-accent-gold text-sm font-semibold tracking-widest uppercase mb-3">Prize Pool</p>
              <h2 className="section-title mb-6">Win big.<br />Win <span className="text-gradient-gold">every month.</span></h2>
              <p className="text-dark-300 leading-relaxed mb-8">
                Enter your Stableford scores and let the draw engine do the rest. Match 3, 4, or 5 numbers — all from within your own scores — to claim your share.
              </p>
              <Link to="/subscribe" className="btn-primary">Join the draw <ArrowRight size={18} /></Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              {[
                { label: '5-Number Match', share: '40%', desc: 'Jackpot — rolls over if unclaimed!', color: 'accent-gold', glow: 'glow-gold' },
                { label: '4-Number Match', share: '35%', desc: 'Split equally among winners', color: 'accent-lime', glow: '' },
                { label: '3-Number Match', share: '25%', desc: 'Split equally among winners', color: 'accent-sky', glow: '' },
              ].map(({ label, share, desc, color, glow }) => (
                <div key={label} className={`card p-5 flex items-center gap-4 ${glow}`}>
                  <div className={`w-16 h-16 rounded-2xl bg-${color}/10 border border-${color}/30 flex items-center justify-center flex-shrink-0`}>
                    <span className={`font-display text-xl font-black text-${color}`}>{share}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{label}</p>
                    <p className="text-dark-300 text-sm">{desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Charities */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-red-400 text-sm font-semibold tracking-widest uppercase mb-3 flex items-center justify-center gap-2">
              <Heart size={14} className="fill-red-400" /> Charitable Impact
            </p>
            <h2 className="section-title">Your game.<br />Their future.</h2>
          </motion.div>

          {charities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {charities.map((ch, i) => (
                <motion.div
                  key={ch._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="card-hover p-6"
                >
                  <div className="w-12 h-12 rounded-xl bg-dark-700 flex items-center justify-center mb-4 text-2xl">
                    {ch.category === 'health' ? '🏥' : ch.category === 'sports' ? '⛳' : ch.category === 'environment' ? '🌿' : '💛'}
                  </div>
                  <span className="text-xs text-dark-400 uppercase tracking-wide">{ch.category}</span>
                  <h3 className="font-semibold text-white mt-1 mb-2">{ch.name}</h3>
                  <p className="text-dark-300 text-sm line-clamp-2">{ch.shortDescription}</p>
                  <div className="mt-4 flex items-center gap-1.5 text-accent-lime text-xs font-medium">
                    <Star size={11} className="fill-accent-lime" />
                    <span>Featured charity</span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {['Cancer Research UK', 'British Heart Foundation', 'Macmillan Cancer Support'].map((name, i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="w-12 h-12 bg-dark-700 rounded-xl mb-4" />
                  <div className="h-3 bg-dark-700 rounded w-1/3 mb-2" />
                  <div className="h-4 bg-dark-700 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-dark-700 rounded w-full" />
                </div>
              ))}
            </div>
          )}

          <div className="text-center">
            <Link to="/charities" className="btn-outline">Browse all charities <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-lime/5 via-transparent to-accent-sky/5" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="card p-12 border-dark-500"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-accent-lime/10 rounded-full text-accent-lime text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 bg-accent-lime rounded-full animate-pulse" /> Limited spots this month
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-black mb-4">
              Ready to play<br />for something bigger?
            </h2>
            <p className="text-dark-300 mb-8 max-w-xl mx-auto">
              £20/month. Cancel anytime. Every round you play could win you hundreds — while funding causes that matter.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-primary text-base px-8 py-4 glow-lime">
                Subscribe now <ArrowRight size={18} />
              </Link>
              <Link to="/draws" className="text-dark-300 hover:text-white text-sm transition-colors">
                See past draw results →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
