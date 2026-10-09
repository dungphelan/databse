import { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, Plane, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/context';

export default function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { login, signUp } = useApp();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setError('');
      setEmail('');
      setPassword('');
      setName('');
      setMode('login');
      setShowPassword(false);
      setSuccess(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise(r => setTimeout(r, 600));

    if (mode === 'signup') {
      if (name.trim().length < 2) {
        setError('Vui lòng nhập họ tên');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, name);
      if (error) {
        setError(error);
        setLoading(false);
        return;
      }
    } else {
      const { error } = await login(email, password);
      if (error) {
        setError(error);
        setLoading(false);
        return;
      }
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-sky-500 to-blue-700 px-6 pt-6 pb-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-3">
            <Plane className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">
            {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
          </h2>
          <p className="text-sm text-blue-100 mt-1">
            {mode === 'login'
              ? 'Đăng nhập để đặt vé nhanh chóng hơn'
              : 'Tham gia SkyTicket để bắt đầu hành trình'}
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-10 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">Đăng nhập thành công!</p>
              <p className="text-sm text-gray-500 mt-1">Đang chuyển hướng...</p>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-5">
                <button
                  onClick={() => { setMode('login'); setError(''); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    mode === 'login' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => { setMode('signup'); setError(''); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    mode === 'signup' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  Đăng ký
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 mb-4 rounded-xl bg-red-50 text-red-600 text-sm animate-fade-in">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ và tên</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      required
                      className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold shadow-lg shadow-blue-200 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : mode === 'login' ? (
                    'Xác nhận đăng nhập'
                  ) : (
                    'Tạo tài khoản'
                  )}
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-4">
                Chế độ giả lập — nhập bất kỳ email và mật khẩu để đăng nhập.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
