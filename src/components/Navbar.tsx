import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Recycle,
  History,
  Info,
  ShieldCheck,
  User,
  Leaf,
  LogIn,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const { authMode, userEmail, ecoScore } = useApp();
  const navigate = useNavigate();

  return (
    <header className="bg-[#10B981] text-white shadow-md shadow-emerald-950/10 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2 sm:py-0 min-h-[64px] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        {/* Brand Logo & Title */}
        <Link
          to="/classify"
          className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-xl self-start sm:self-auto"
        >
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner group-hover:scale-105 transition-transform duration-200">
            <Recycle className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl text-white tracking-tight">Eco Scan</span>
            </div>
            <p className="text-[10px] text-emerald-100 hidden sm:block leading-tight">
              Smart Waste Segregation
            </p>
          </div>
        </Link>

        {/* Center Nav Links: Classify | History | About */}
        <nav
          id="main-navigation"
          aria-label="Main Navigation"
          className="flex items-center justify-center bg-emerald-900/30 p-1 rounded-2xl border border-emerald-400/25 backdrop-blur-md text-xs font-medium w-full sm:w-auto overflow-x-auto"
        >
          <NavLink
            to="/classify"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl transition-all duration-150 cursor-pointer ${isActive
                ? 'bg-white text-emerald-900 font-bold shadow-xs'
                : 'text-emerald-100 hover:text-white hover:bg-white/10'
              }`
            }
          >
            <Leaf className="w-3.5 h-3.5" />
            <span>Classify</span>
          </NavLink>

          <NavLink
            to="/history"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl transition-all duration-150 cursor-pointer ${isActive
                ? 'bg-white text-emerald-900 font-bold shadow-xs'
                : 'text-emerald-100 hover:text-white hover:bg-white/10'
              }`
            }
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl transition-all duration-150 cursor-pointer ${isActive
                ? 'bg-white text-emerald-900 font-bold shadow-xs'
                : 'text-emerald-100 hover:text-white hover:bg-white/10'
              }`
            }
          >
            <Info className="w-3.5 h-3.5" />
            <span>About</span>
          </NavLink>
        </nav>

        {/* Right Status Indicator: Guest vs Logged In */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 w-full sm:w-auto">
          {authMode === 'login' ? (
            <div className="flex items-center gap-2 max-w-full">
              {/* EcoScore Progress Ring */}
              <div
                id="user-ecoscore-indicator"
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 shadow-inner"
                title={`Your EcoScore: ${ecoScore}/100 • Eco-Champion Status`}
              >
                <div className="relative w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="14.5"
                      className="text-white/25"
                      strokeWidth="3.2"
                      stroke="currentColor"
                      fill="none"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="14.5"
                      stroke="#86EFAC"
                      strokeWidth="3.2"
                      strokeDasharray="91.1"
                      strokeDashoffset={91.1 - (91.1 * ecoScore) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-700 ease-out"
                      fill="none"
                    />
                  </svg>
                  <Leaf className="w-3 h-3 text-emerald-100 absolute pointer-events-none" />
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1 leading-none">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-100">
                      EcoScore
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-300 text-emerald-950 hidden md:inline-block">
                      Lv.4
                    </span>
                  </div>
                  <div className="flex items-baseline gap-0.5 leading-tight mt-0.5">
                    <span className="text-xs sm:text-sm font-extrabold text-white">
                      {ecoScore}
                    </span>
                    <span className="text-[10px] text-emerald-200 font-medium">/100</span>
                  </div>
                </div>
              </div>

              {/* User Avatar & Profile Link */}
              <button
                id="user-profile-btn"
                type="button"
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer"
                title={`Logged in as ${userEmail}`}
                aria-label="View Account"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-800 text-white font-bold text-xs flex items-center justify-center border border-emerald-400/40">
                  {userEmail ? userEmail[0].toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-semibold hidden lg:inline-block max-w-[100px] truncate text-white">
                  {userEmail.split('@')[0]}
                </span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Guest Status Badge */}
              <div
                id="guest-status-badge"
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 text-white text-[11px] font-medium"
                title="Guest Mode is active. No queries, IPs, or logs are retained."
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                <span className="hidden sm:inline">Guest Mode • Zero Storage</span>
                <span className="sm:hidden">Guest</span>
              </div>

              {/* Login Button */}
              <Link
                id="navbar-login-link"
                to="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-bold transition-all shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                <span>Login</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
