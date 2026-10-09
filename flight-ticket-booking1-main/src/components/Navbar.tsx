import { Plane, Menu, X, LogOut, ChevronDown, Ticket, Wallet } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context';
import type { Page } from '@/types';
import LoginModal from './LoginModal';
import { formatPrice } from '@/data';

export default function Navbar() {
  const { page, navigate, user, logout, authLoading } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const navItems: { id: Page; label: string }[] = [
    { id: 'home', label: 'Trang chủ' },
    { id: 'list', label: 'Chuyến bay' },
    { id: 'tickets', label: 'Vé của tôi' },
    { id: 'transactions', label: 'Lịch sử giao dịch' },
  ];

  const go = (p: Page) => {
    navigate(p);
    setMenuOpen(false);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    setMenuOpen(false);
  };

  const avatarInitial = user ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => go('home')} className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <span className="block text-lg font-bold text-gray-900 leading-none">SkyTicket</span>
                <span className="block text-xs text-gray-400 leading-none mt-0.5">Đặt vé máy bay</span>
              </div>
            </button>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => go(item.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    page === item.id
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              {authLoading ? (
                <div className="ml-2 w-20 h-9 rounded-lg bg-gray-100 animate-pulse" />
              ) : user ? (
                <div ref={userMenuRef} className="relative ml-2">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold">
                      {avatarInitial}
                    </div>
                    <div className="text-left hidden lg:block">
                      <span className="block text-sm font-semibold text-gray-700 max-w-[120px] truncate">
                        {user.name}
                      </span>
                      <span className="block text-[11px] text-blue-600 font-medium">
                        {formatPrice(user.walletBalance)}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        <p className="text-xs text-blue-600 font-medium mt-1 flex items-center gap-1">
                          <Wallet className="w-3.5 h-3.5" />
                          {formatPrice(user.walletBalance)}
                        </p>
                      </div>
                      <button
                        onClick={() => { go('tickets'); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Ticket className="w-4 h-4" />
                        Vé của tôi
                      </button>
                      <button
                        onClick={() => { go('transactions'); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Wallet className="w-4 h-4" />
                        Lịch sử giao dịch
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setLoginOpen(true)}
                  className="ml-2 px-5 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-md shadow-blue-200 transition-all"
                >
                  Đăng nhập
                </button>
              )}
            </nav>

            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {menuOpen && (
            <nav className="md:hidden pb-4 flex flex-col gap-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => go(item.id)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium text-left transition-colors ${
                    page === item.id ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              {user ? (
                <>
                  <div className="mt-1 flex items-center gap-3 px-4 py-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold">
                      {avatarInitial}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-blue-600">{formatPrice(user.walletBalance)}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="mt-1 flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setLoginOpen(true); setMenuOpen(false); }}
                  className="mt-1 px-5 py-3 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600"
                >
                  Đăng nhập
                </button>
              )}
            </nav>
          )}
        </div>
      </header>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
