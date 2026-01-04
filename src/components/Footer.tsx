import { Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-auto py-6 px-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-400">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img
            src="/favicon.png"
            alt="DhanTrack Logo"
            className="w-6 h-6"
          />
          <span className="text-white font-semibold">DhanTrack</span>
        </div>
        
        <p className="text-white/90 text-sm flex items-center gap-1">
          Made with <Heart className="w-4 h-4 text-white fill-white" /> for better finances
        </p>
        
        <p className="text-white/80 text-xs">
          © {new Date().getFullYear()} DhanTrack. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
