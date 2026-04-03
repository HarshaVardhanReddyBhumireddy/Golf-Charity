import { Link } from 'react-router-dom';
import { Trophy, Heart, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-dark-700 bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-accent-lime rounded-lg flex items-center justify-center">
                <Trophy size={16} className="text-dark-900" />
              </div>
              <span className="font-display font-bold text-lg">Golf<span className="text-accent-lime">Charity</span></span>
            </Link>
            <p className="text-dark-300 text-sm leading-relaxed">
              Play golf. Win prizes. Change lives. The platform where your scores fund a better world.
            </p>
            <div className="flex gap-3 mt-4">
              {[Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-xl bg-dark-700 flex items-center justify-center text-dark-300 hover:text-white hover:bg-dark-600 transition-colors">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Platform</h4>
            <ul className="space-y-2.5">
              {[['Monthly Draw', '/draws'], ['Charities', '/charities'], ['Subscribe', '/subscribe'], ['How it Works', '/']].map(([l, h]) => (
                <li key={l}><Link to={h} className="text-dark-300 hover:text-white text-sm transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Account</h4>
            <ul className="space-y-2.5">
              {[['Dashboard', '/dashboard'], ['My Scores', '/dashboard/scores'], ['My Winnings', '/dashboard/winnings'], ['Settings', '/dashboard/settings']].map(([l, h]) => (
                <li key={l}><Link to={h} className="text-dark-300 hover:text-white text-sm transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Legal</h4>
            <ul className="space-y-2.5">
              {[['Privacy Policy', '#'], ['Terms of Service', '#'], ['Cookie Policy', '#'], ['Responsible Gaming', '#']].map(([l, h]) => (
                <li key={l}><a href={h} className="text-dark-300 hover:text-white text-sm transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-700 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-dark-400 text-sm">© 2026 GolfCharity. All rights reserved.</p>
          <p className="text-dark-400 text-sm flex items-center gap-1">
            Made with <Heart size={13} className="text-red-400" /> for a better world
          </p>
        </div>
      </div>
    </footer>
  );
}
