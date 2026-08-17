import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Menu, X, Trophy, Home, Calendar, BarChart3,
  Users, Film, Clapperboard, Zap, Globe, ChevronRight
} from "lucide-react";

export type Screen = 'home' | 'live' | 'fixtures' | 'mobile';
export type AppMode = 'sports' | 'movies';

interface NavbarProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
}

const navItems = [
  { id: 'home', label: 'Home', icon: Home, screen: 'home' as Screen },
  { id: 'live', label: 'Live', icon: Zap, screen: 'live' as Screen, isLive: true },
  { id: 'fixtures', label: 'Fixtures', icon: Calendar, screen: 'fixtures' as Screen },
  { id: 'standings', label: 'Standings', icon: BarChart3, screen: 'fixtures' as Screen },
  { id: 'competitions', label: 'Competitions', icon: Trophy },
  { id: 'teams', label: 'Teams', icon: Users },
  { id: 'highlights', label: 'Highlights', icon: Film },
];

export function Navbar({ activeScreen, setActiveScreen, mode, setMode }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        .live-dot { animation: livePulse 1.4s ease-in-out infinite; }
        .nav-item-hover:hover { background: rgba(255,255,255,0.06) !important; color: #fff !important; }
      `}</style>

      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'linear-gradient(180deg, rgba(7,7,15,0.97) 0%, rgba(7,7,15,0.85) 80%, transparent 100%)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>

            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', cursor: 'pointer' }}>
                <span style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: '22px', fontWeight: 900,
                  letterSpacing: '-0.5px', color: '#fff', lineHeight: 1,
                }}>MAX</span>
                <span style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: '22px', fontWeight: 900,
                  letterSpacing: '-0.5px', lineHeight: 1,
                  background: 'linear-gradient(135deg, #e53e3e 0%, #ff6b6b 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>CINEMA</span>
              </div>
              <AnimatePresence>
                {mode === 'sports' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7, x: -6 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.7, x: -6 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    style={{
                      background: 'linear-gradient(135deg, #00d4ff 0%, #00ff87 100%)',
                      borderRadius: '5px', padding: '3px 8px', lineHeight: 1,
                    }}
                  >
                    <span style={{
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: '11px',
                      fontWeight: 800, letterSpacing: '1.5px', color: '#07070f',
                    }}>SPORTS</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop Nav Items */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: 1, justifyContent: 'center' }}
              className="hidden-mobile">
              {navItems.map((item) => {
                const isActive = item.screen ? activeScreen === item.screen : false;
                return (
                  <button
                    key={item.id}
                    onClick={() => item.screen && setActiveScreen(item.screen)}
                    className="nav-item-hover"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '6px 11px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                      fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: isActive ? 600 : 500,
                      letterSpacing: '0.01em',
                      color: isActive ? '#fff' : '#7b80a0',
                      background: isActive ? 'rgba(0,212,255,0.1)' : 'transparent',
                      transition: 'all 0.18s ease',
                      position: 'relative',
                    }}
                  >
                    {item.isLive && (
                      <span className="live-dot" style={{
                        width: '6px', height: '6px', borderRadius: '50%', background: '#ff3b3b',
                        boxShadow: '0 0 8px #ff3b3b88', flexShrink: 0,
                      }} />
                    )}
                    {item.label}
                    {isActive && (
                      <motion.div layoutId="nav-indicator" style={{
                        position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)',
                        width: '16px', height: '2px', borderRadius: '2px',
                        background: 'linear-gradient(90deg, #00d4ff, #00ff87)',
                      }} />
                    )}
                  </button>
                );
              })}

              {/* World Cup Hub */}
              <button
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(245,197,24,0.25)',
                  cursor: 'pointer', marginLeft: '4px',
                  fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 600,
                  color: '#f5c518', background: 'rgba(245,197,24,0.08)',
                  transition: 'all 0.18s ease',
                }}
              >
                <Globe size={13} />
                World Cup Hub
              </button>
            </div>

            {/* Right Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                style={{
                  width: '34px', height: '34px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.04)', cursor: 'pointer', color: '#7b80a0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
              >
                <Search size={15} />
              </button>

              {/* Mode Toggle */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setMode(mode === 'sports' ? 'movies' : 'sports')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 13px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 600,
                  letterSpacing: '0.03em', transition: 'all 0.2s',
                  ...(mode === 'sports'
                    ? { background: 'rgba(229,62,62,0.12)', color: '#ff6b6b', border: '1px solid rgba(229,62,62,0.2)' }
                    : { background: 'rgba(0,212,255,0.12)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)' }),
                }}
              >
                {mode === 'sports'
                  ? <><Clapperboard size={13} /> Cinema</>
                  : <><Zap size={13} /> Sports</>
                }
              </motion.button>

              {/* Avatar */}
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 700, color: '#fff',
                border: '2px solid rgba(255,255,255,0.1)',
              }}>
                JD
              </div>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{
                  width: '34px', height: '34px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.04)', cursor: 'pointer', color: '#7b80a0',
                  display: 'none', alignItems: 'center', justifyContent: 'center',
                }}
                className="mobile-hamburger"
              >
                {mobileOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
            </div>
          </div>

          {/* Search Drawer */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden', paddingBottom: '16px' }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px', padding: '12px 16px',
                }}>
                  <Search size={16} style={{ color: '#5e6280', flexShrink: 0 }} />
                  <input
                    autoFocus
                    placeholder="Search teams, leagues, tournaments, players..."
                    style={{
                      background: 'transparent', border: 'none', outline: 'none',
                      color: '#fff', fontFamily: "'Inter', sans-serif", fontSize: '14px', flex: 1,
                    }}
                  />
                  <span style={{
                    fontFamily: "'Inter', sans-serif", fontSize: '11px', color: '#3d4060',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '5px', padding: '2px 7px',
                  }}>ESC</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{
                overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(7,7,15,0.98)', padding: '8px 16px 16px',
              }}
            >
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { if (item.screen) setActiveScreen(item.screen); setMobileOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', padding: '12px 12px', borderRadius: '10px', border: 'none',
                    background: item.screen && activeScreen === item.screen ? 'rgba(0,212,255,0.08)' : 'transparent',
                    color: item.screen && activeScreen === item.screen ? '#00d4ff' : '#8b90ad',
                    fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: 500,
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <item.icon size={17} />
                    {item.label}
                    {item.isLive && (
                      <span style={{
                        background: '#ff3b3b', color: '#fff', fontSize: '9px', fontWeight: 800,
                        padding: '1px 6px', borderRadius: '4px', letterSpacing: '1px',
                      }}>LIVE</span>
                    )}
                  </div>
                  <ChevronRight size={14} style={{ opacity: 0.4 }} />
                </button>
              ))}
              <div style={{ margin: '8px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }} />
              <button
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  width: '100%', padding: '12px 12px', borderRadius: '10px', border: 'none',
                  background: 'rgba(245,197,24,0.06)', color: '#f5c518',
                  fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                }}
              >
                <Globe size={17} /> World Cup Hub
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <style>{`
        @media (max-width: 900px) {
          .hidden-mobile { display: none !important; }
          .mobile-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}
