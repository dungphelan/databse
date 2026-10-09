import { Plane, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">SkyTicket</span>
            </div>
            <p className="text-sm leading-relaxed">
              Nền tảng đặt vé máy bay trực tuyến hàng đầu Việt Nam. Nhanh chóng, an toàn, tiện lợi.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Về chúng tôi</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Giới thiệu</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Điều khoản</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Câu hỏi thường gặp</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Hỗ trợ</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> 1900 1234</li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> support@skyticket.vn</li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Quận 1, TP. HCM</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Theo dõi</h4>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm">
          © 2026 SkyTicket. Bản quyền đã được bảo hộ.
        </div>
      </div>
    </footer>
  );
}
