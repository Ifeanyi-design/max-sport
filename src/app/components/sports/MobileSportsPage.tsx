import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Bell, Play, Home, Zap, Calendar, User,
  ChevronRight, Trophy, TrendingUp, Wifi, Tv, Heart
} from "lucide-react";
import type { Screen } from "./types";

interface MobileSportsPageProps {
  setActiveScreen: (screen: Screen) => void;
}

const liveMatches = [
  { home: "Real Madrid", away: "Bayern", homeScore: 2, awayScore: 1, time: "67'", league: "UCL", hot: true },
  { home: "Man City", away: "Liverpool", homeScore: 1, awayScore: 1, time: "23'", league: "EPL" },
  { home: "Barcelona", away: "Atlético", homeScore: 3, awayScore: 0, time: "HT", league: "LL" },
  { home: "Juventus", away: "Inter", homeScore: 0, awayScore: 2, time: "78'", league: "SA" },
  { home: "PSG", away: "Marseille", homeScore: 1, awayScore: 0, time: "45'", league: "L1" },
];

const sports = ["⚽ Football", "🏀 Basketball", "🎾 Tennis", "🏎️ F1", "🥊 Boxing", "⛳ Golf", "🏋️ Athletics", "🏊 Swimming"];

const upcoming = [
  { match: "PSG vs Arsenal", league: "UCL SF", date: "Tomorrow 20:45" },
  { match: "Brazil vs Argentina", league: "International", date: "Jun 7 22:00" },
  { match: "Chelsea vs Arsenal", league: "Premier League", date: "Jun 9 16:00" },
];

const BOTTOM_NAV = [
  { id: 'home',     label: 'Home',     icon: Home,     screen: 'home'      as Screen },
  { id: 'live',     label: 'Live',     icon: Wifi,     screen: 'live-list' as Screen, isLive: true },
  { id: 'fixtures', label: 'Fixtures', icon: Calendar, screen: 'fixtures'  as Screen },
  { id: 'search',   label: 'Search',   icon: Search,   screen: 'search'    as Screen },
  { id: 'profile',  label: 'Profile',  icon: User,     screen: 'home'      as Screen },
];

export function MobileSportsPage({ setActiveScreen }: MobileSportsPageProps) {
  const [activeMobileTab, setActiveMobileTab] = useState('home');
  const [selectedSport, setSelectedSport] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ background: '#07070f', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '80px', paddingBottom: '40px' }}>
      <style>{`
        @keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes fabPulse {
          0%,100%{ box-shadow: 0 0 0 0 rgba(255,59,59,0.6), 0 8px 32px rgba(255,59,59,0.4); }
          50%{ box-shadow: 0 0 0 12px rgba(255,59,59,0), 0 8px 32px rgba(255,59,59,0.2); }
        }
        .mobile-scroll::-webkit-scrollbar { display: none; }
        .mobile-scroll { scrollbar-width: none; }
      `}</style>

      {/* Desktop annotation */}
      <div style={{ marginRight: '32px', maxWidth: '200px', paddingTop: '20px' }}>
        <button
          onClick={() => setActiveScreen('home')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px',
            background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)',
            borderRadius: '10px', padding: '8px 14px', cursor: 'pointer',
            fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 600,
            color: '#00d4ff', width: '100%',
          }}
        >
          ← Back to Desktop
        </button>
        <div style={{
          background: 'rgba(13,13,28,0.8)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '14px', padding: '16px',
        }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: '14px', fontWeight: 800,
            color: '#00d4ff', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px',
          }}>Mobile UX Notes</div>
          {[
            "Sticky bottom nav — thumb zone optimized",
            "Swipeable horizontal match cards",
            "Floating LIVE FAB — always accessible",
            "Collapsible sport categories",
            "Adaptive card sizes for small screens",
            "Gesture-based navigation (swipe left/right)",
          ].map((note, i) => (
            <div key={i} style={{
              display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start',
            }}>
              <div style={{
                width: '5px', height: '5px', borderRadius: '50%', background: '#00d4ff',
                flexShrink: 0, marginTop: '6px',
              }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: '#7b80a0', lineHeight: 1.5 }}>{note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Phone frame */}
      <div style={{
        width: '390px', height: '844px', borderRadius: '44px', overflow: 'hidden',
        background: '#07070f', position: 'relative', flexShrink: 0,
        border: '8px solid #1a1a2e',
        boxShadow: '0 30px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06), inset 0 0 0 1px rgba(255,255,255,0.04)',
      }}>
        {/* Status bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 24px 8px', background: '#07070f',
        }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 700, color: '#fff' }}>9:41</span>
          <div style={{
            width: '120px', height: '30px', background: '#0a0a1a', borderRadius: '20px',
            position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)',
          }} />
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end' }}>
              {[3, 5, 7, 9].map(h => (
                <div key={h} style={{ width: '3px', height: `${h}px`, background: '#fff', borderRadius: '1px' }} />
              ))}
            </div>
            <Wifi size={12} color="#fff" />
            <div style={{
              width: '22px', height: '11px', border: '1.5px solid #fff', borderRadius: '3px', position: 'relative',
            }}>
              <div style={{ position: 'absolute', inset: '2px', background: '#fff', borderRadius: '1px', width: '70%' }} />
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{
          height: 'calc(844px - 52px - 68px - 16px)', overflowY: 'auto', overflowX: 'hidden',
        }} className="mobile-scroll">

          {/* Top bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 16px 12px',
            background: 'linear-gradient(180deg, #07070f 0%, transparent 100%)',
            position: 'sticky', top: 0, zIndex: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '18px', fontWeight: 900, color: '#fff' }}>MAX</span>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '18px', fontWeight: 900, background: 'linear-gradient(135deg, #e53e3e, #ff6b6b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CINEMA</span>
              <div style={{ background: 'linear-gradient(135deg, #00d4ff, #00ff87)', borderRadius: '4px', padding: '2px 6px' }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '9px', fontWeight: 800, color: '#000', letterSpacing: '1px' }}>SPORTS</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Search size={14} color="#9095b8" />
              </button>
              <button style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
                <Bell size={14} color="#9095b8" />
                <div style={{ position: 'absolute', top: '6px', right: '6px', width: '7px', height: '7px', borderRadius: '50%', background: '#ff3b3b', border: '1.5px solid #07070f' }} />
              </button>
            </div>
          </div>

          {/* Hero live card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            style={{ margin: '0 12px 20px', cursor: 'pointer' }}
            onClick={() => setActiveScreen('live-list')}
          >
            <div style={{
              borderRadius: '20px', overflow: 'hidden', position: 'relative',
              background: 'linear-gradient(135deg, #0a1628, #0f0a1e)',
              border: '1px solid rgba(255,59,59,0.25)',
              boxShadow: '0 8px 40px rgba(255,59,59,0.12)',
            }}>
              <img
                src="https://images.unsplash.com/photo-1679391029864-d46f366a456b?w=800&q=80"
                alt="Match"
                style={{ width: '100%', height: '160px', objectFit: 'cover', opacity: 0.5 }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(7,7,15,0.95) 0%, transparent 50%)' }} />
              <div style={{ position: 'absolute', inset: 0, padding: '14px' }}>
                {/* Live badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 0 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    background: '#ff3b3b', borderRadius: '6px', padding: '3px 8px',
                  }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#fff', display: 'inline-block', animation: 'livePulse 1.4s infinite' }} />
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '10px', fontWeight: 800, color: '#fff', letterSpacing: '1px' }}>LIVE</span>
                  </div>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>Champions League · QF</span>
                </div>
              </div>

              {/* Bottom content */}
              <div style={{ padding: '0 16px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {/* Home */}
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%', margin: '0 auto 6px',
                      background: 'linear-gradient(135deg, #ffd700, #ffa500)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: '11px', fontWeight: 900, color: '#000',
                    }}>RMA</div>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 700, color: '#fff' }}>Real Madrid</span>
                  </div>
                  {/* Score */}
                  <div style={{ textAlign: 'center', padding: '0 12px' }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '38px', fontWeight: 900, color: '#fff', letterSpacing: '-2px', lineHeight: 1 }}>2—1</div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '14px', fontWeight: 800, color: '#ff3b3b', marginTop: '4px' }}>67'</div>
                  </div>
                  {/* Away */}
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%', margin: '0 auto 6px',
                      background: 'linear-gradient(135deg, #e63946, #c1121f)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: '11px', fontWeight: 900, color: '#fff',
                    }}>FCB</div>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 700, color: '#fff' }}>Bayern Munich</span>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  style={{
                    marginTop: '14px', width: '100%', padding: '11px',
                    borderRadius: '12px', border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #ff3b3b, #ff6b6b)',
                    fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 700, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}
                >
                  <Play size={14} fill="#fff" /> Watch Live
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Sport categories */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ padding: '0 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '15px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Browse Sports</span>
            </div>
            <div ref={scrollRef} className="mobile-scroll" style={{ display: 'flex', gap: '8px', padding: '0 16px', overflowX: 'auto' }}>
              {sports.map((sport, i) => (
                <motion.button
                  key={i} whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedSport(i)}
                  style={{
                    flexShrink: 0, padding: '8px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                    background: selectedSport === i
                      ? 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,255,135,0.15))'
                      : 'rgba(255,255,255,0.05)',
                    borderWidth: '1px', borderStyle: 'solid',
                    borderColor: selectedSport === i ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.07)',
                    fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 600,
                    color: selectedSport === i ? '#00d4ff' : '#7b80a0',
                    whiteSpace: 'nowrap',
                  }}
                >{sport}</motion.button>
              ))}
            </div>
          </div>

          {/* Live matches horizontal scroll */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ padding: '0 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '15px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live Now</span>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff3b3b', display: 'inline-block', animation: 'livePulse 1.4s infinite', boxShadow: '0 0 8px #ff3b3b' }} />
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '11px', fontWeight: 700, color: '#ff3b3b' }}>{liveMatches.length}</span>
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'Inter', sans-serif", fontSize: '11px', color: '#5e6280' }}>
                See all <ChevronRight size={12} />
              </button>
            </div>

            <div className="mobile-scroll" style={{ display: 'flex', gap: '10px', padding: '0 16px', overflowX: 'auto' }}>
              {liveMatches.map((m, i) => (
                <motion.div
                  key={i} whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveScreen('live-list')}
                  style={{
                    flexShrink: 0, width: '160px', borderRadius: '14px', padding: '12px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,59,59,0.2)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '9px', fontWeight: 700, color: '#5e6280', textTransform: 'uppercase' }}>{m.league}</span>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '11px', fontWeight: 800, color: '#ff3b3b' }}>{m.time}</span>
                  </div>
                  <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '24px', fontWeight: 900, color: '#fff', letterSpacing: '-1px', lineHeight: 1 }}>
                      {m.homeScore}—{m.awayScore}
                    </div>
                  </div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: '#9095b8', textAlign: 'center', lineHeight: 1.4 }}>
                    {m.home}<br /><span style={{ color: '#5e6280' }}>vs</span><br />{m.away}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Upcoming matches */}
          <div style={{ padding: '0 12px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', padding: '0 4px' }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '15px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Upcoming</span>
              <button onClick={() => setActiveScreen('fixtures')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'Inter', sans-serif", fontSize: '11px', color: '#00d4ff' }}>
                All Fixtures <ChevronRight size={12} />
              </button>
            </div>
            {upcoming.map((m, i) => (
              <motion.div
                key={i} whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px', borderRadius: '12px', marginBottom: '8px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
                  background: 'rgba(0,212,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Calendar size={16} color="#00d4ff" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 600, color: '#e0e4f8', marginBottom: '3px' }}>{m.match}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: '#5e6280' }}>{m.league} · {m.date}</div>
                </div>
                <button style={{
                  background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)',
                  borderRadius: '7px', padding: '5px 10px', cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif", fontSize: '10px', fontWeight: 600, color: '#00d4ff',
                  flexShrink: 0,
                }}>+ Set</button>
              </motion.div>
            ))}
          </div>

          {/* World Cup promo strip */}
          <div style={{ margin: '0 12px 24px' }}>
            <div style={{
              borderRadius: '16px', padding: '16px',
              background: 'linear-gradient(135deg, #1a0d00, #2d1a00)',
              border: '1px solid rgba(245,197,24,0.2)',
              display: 'flex', alignItems: 'center', gap: '14px',
            }}>
              <div style={{ fontSize: '32px', flexShrink: 0 }}>🏆</div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: '15px', fontWeight: 900,
                  color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px',
                }}>World Cup 2026</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: '#8b6f2a' }}>104 matches streaming live</div>
              </div>
              <button style={{
                background: 'linear-gradient(135deg, #f5c518, #ff9500)', border: 'none',
                borderRadius: '8px', padding: '8px 12px', cursor: 'pointer',
                fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 700, color: '#000',
                flexShrink: 0,
              }}>Remind</button>
            </div>
          </div>

          {/* Extra padding for bottom nav */}
          <div style={{ height: '20px' }} />
        </div>

        {/* Floating LIVE button (FAB) */}
        <motion.button
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          onClick={() => setActiveScreen('live-list')}
          style={{
            position: 'absolute', bottom: '88px', right: '16px', zIndex: 20,
            width: '56px', height: '56px', borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #ff3b3b, #ff6b6b)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1px',
            animation: 'fabPulse 2s ease-in-out infinite',
          }}
        >
          <Zap size={18} fill="#fff" color="#fff" />
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '8px', fontWeight: 900, color: '#fff', letterSpacing: '1px' }}>LIVE</span>
        </motion.button>

        {/* Bottom Navigation */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '68px', background: 'rgba(13,13,28,0.97)', backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center',
          paddingBottom: '4px',
        }}>
          {BOTTOM_NAV.map(item => {
            const isActive = activeMobileTab === item.id;
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  setActiveMobileTab(item.id);
                  if (item.screen) setActiveScreen(item.screen);
                }}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '8px 0',
                }}
              >
                <div style={{ position: 'relative' }}>
                  <item.icon
                    size={item.isLive ? 22 : 20}
                    color={isActive ? (item.isLive ? '#ff3b3b' : '#00d4ff') : '#42465e'}
                    fill={item.isLive && isActive ? '#ff3b3b' : 'none'}
                  />
                  {item.isLive && (
                    <div style={{
                      position: 'absolute', top: '-2px', right: '-4px',
                      width: '7px', height: '7px', borderRadius: '50%', background: '#ff3b3b',
                      border: '1.5px solid rgba(13,13,28,0.97)',
                      animation: 'livePulse 1.4s infinite',
                    }} />
                  )}
                </div>
                <span style={{
                  fontFamily: "'Inter', sans-serif", fontSize: '10px', fontWeight: isActive ? 700 : 500,
                  color: isActive ? (item.isLive ? '#ff3b3b' : '#00d4ff') : '#42465e',
                }}>{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Right annotation */}
      <div style={{ marginLeft: '32px', maxWidth: '200px', paddingTop: '20px' }}>
        <div style={{
          background: 'rgba(13,13,28,0.8)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '14px', padding: '16px',
        }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: '14px', fontWeight: 800,
            color: '#f5c518', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px',
          }}>Navigation Model</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: "Home", color: '#9095b8', desc: "Feed + hero" },
              { label: "Live ●", color: '#ff3b3b', desc: "Active matches" },
              { label: "Fixtures", color: '#00d4ff', desc: "Calendar + table" },
              { label: "Search", color: '#9095b8', desc: "Global search" },
              { label: "Profile", color: '#9095b8', desc: "Settings, history" },
            ].map(n => (
              <div key={n.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 700, color: n.color }}>{n.label}</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: '#3d4060' }}>{n.desc}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '6px', paddingTop: '8px' }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: '#5e6280', lineHeight: 1.5 }}>
                FAB "LIVE" button is always visible for instant access to live streams regardless of active tab.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
