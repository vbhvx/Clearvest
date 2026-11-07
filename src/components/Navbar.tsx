'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/router';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Target, 
  Calculator, 
  Compass, 
  PieChart, 
  Bot, 
  Lock, 
  FileCheck2, 
  LogOut, 
  User as UserIcon,
  Menu,
  X
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/v1/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success) {
          setCurrentUser(data.data);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/v1/auth/logout', { method: 'POST' });
    setCurrentUser(null);
    window.location.href = '/login';
  };

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: PieChart },
    { name: 'Goals', href: '/goals', icon: Target },
    { name: 'Planner', href: '/plan', icon: Calculator },
    { name: 'Explore', href: '/explore', icon: Compass },
    { name: 'Portfolio', href: '/portfolio', icon: PieChart },
    { name: 'Assistant', href: '/assistant', icon: Bot },
    { name: 'Privacy & DPDP', href: '/privacy', icon: Lock },
    { name: 'Regulatory Gates', href: '/admin/gates', icon: FileCheck2 },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      {/* Top Compliance & Sandbox Status Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 text-center flex items-center justify-center space-x-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="font-medium text-emerald-400">Sandbox Environment Active:</span>
        <span className="hidden sm:inline">Simulated market feeds & paper-trading. Live brokerage order execution and personalized advice fail closed on server per SEBI regulations.</span>
        <span className="sm:hidden">Simulated data mode</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <a href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-600/20 group-hover:bg-emerald-700 transition">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition">
                Clearvest
              </span>
              <span className="hidden md:block text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                India Financial Intelligence
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 opacity-70" />
                  <span>{item.name}</span>
                </a>
              );
            })}
          </nav>

          {/* User Status / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-full text-xs font-medium text-slate-800 border border-slate-200">
                  <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-semibold">{currentUser.profile?.fullName || currentUser.email}</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-emerald-700 font-bold">{currentUser.profile?.preferredCurrency || 'INR'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <a
                  href="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                >
                  Sign In
                </a>
                <a
                  href="/login"
                  className="px-4 py-1.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition shadow-emerald-600/20"
                >
                  Try Demo
                </a>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2.5 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 text-slate-500" />
                <span>{item.name}</span>
              </a>
            );
          })}
          <div className="pt-3 border-t border-slate-100">
            {currentUser ? (
              <div className="flex items-center justify-between px-2 pt-1">
                <div className="text-sm font-medium text-slate-800">
                  {currentUser.profile?.fullName || currentUser.email}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs text-rose-600 hover:underline flex items-center space-x-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <a
                  href="/login"
                  className="text-center py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg"
                >
                  Sign In
                </a>
                <a
                  href="/login"
                  className="text-center py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg"
                >
                  Demo Login
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
