import React, { useState, useEffect, useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import { schoolData } from './data';
import { 
  User, MapPin, Users, Send, Loader2, 
  Award, BookOpen, Phone, X, Download, ChevronDown, Sparkles, MessageCircle
} from 'lucide-react';

// --- KOMPONEN ICON MANUAL ---
const IconInstagram = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);
const IconYoutube = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2.5 7.1c.1-1.8 1.5-3.2 3.3-3.3 3.7-.3 8.7-.3 12.4 0 1.8.1 3.2 1.5 3.3 3.3.3 3.1.3 6.7 0 9.8-.1 1.8-1.5 3.2-3.3 3.3-3.7.3-8.7.3-12.4 0-1.8-.1-3.2-1.5-3.3-3.3-.3-3.1-.3-6.7 0-9.8Z"/><path d="m10 15 5-3-5-3v6Z"/></svg>
);
// ----------------------------

function App() {
  const [status, setStatus] = useState('idle');
  const [showFlyer, setShowFlyer] = useState(true);
  const [ticketData, setTicketData] = useState(null);
  const [jenisTinggal, setJenisTinggal] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // STATE INI HARUS ADA DI DALAM SINI:
  const [isTicketDownloaded, setIsTicketDownloaded] = useState(false);
  
  const ticketRef = useRef(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (showFlyer || status === 'success') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [showFlyer, status]);

  const scriptURL = 'https://script.google.com/macros/s/AKfycbzVpU6CMUAodWiKN_7OZgPeJSpBNrrheEvilG_lm1Ieamd7oxjA_MDYZTHAHT2llptP/exec';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    
    const form = e.target;
    const formData = new FormData(form);
    
    const jtSelect = formData.get('jenis_tinggal_select');
    if (jtSelect === 'Lainnya') {
      formData.set('jenis_tinggal', formData.get('jenis_tinggal_input'));
    } else {
      formData.set('jenis_tinggal', jtSelect);
    }
    
    // --- GENERATE NOMOR PENDAFTARAN OTOMATIS ---
    // Format: SPMB-[001-999]-[KodeSekolah]-[TahunAjaran]
    const random3Digit = String(Math.floor(Math.random() * 900) + 100).padStart(3, '0');
    const generatedNoUrut = `SPMB-${random3Digit}-${schoolData.kodeSekolah}-${schoolData.tahunAjaran}`;
    
    formData.append('nomor_pendaftaran', generatedNoUrut);

    const namaSiswa = formData.get('nama_lengkap');

    try {
      await fetch(scriptURL, { 
        method: 'POST', 
        body: formData,
        mode: 'no-cors' 
      });

      const date = new Date();
      const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      
      setTicketData({
        nama: namaSiswa,
        noUrut: generatedNoUrut, 
        tanggal: formattedDate
      });
      
      setStatus('success');
      form.reset();
      setJenisTinggal("");
      
    } catch (error) {
      console.error('Error!', error.message);
      setStatus('error');
      alert("Terjadi kesalahan koneksi. Pastikan internet Anda aktif.");
    }
  };

  const closeTicket = () => {
    setStatus('idle');
    setTicketData(null);
    setIsTicketDownloaded(false); // Reset status tombol WA saat form ditutup
  };

  const downloadTicketAsImage = async () => {
    if (!ticketRef.current) return;
    setIsDownloading(true);
    
    try {
      const dataUrl = await htmlToImage.toPng(ticketRef.current, {
        quality: 1.0,
        pixelRatio: 2, 
        backgroundColor: '#ffffff',
      });
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `Tiket-SPMB-${ticketData.nama.replace(/\s+/g, '-')}.png`;
      link.click();
    } catch (error) {
      console.error("Gagal mengunduh gambar tiket:", error);
      alert("Maaf, terjadi kesalahan saat menyimpan tiket. Pastikan Anda memberikan izin download jika diminta browser.");
    } finally {
      setIsDownloading(false);
    }
  };

  const sendToOfficialWA = () => {
    // Teks WA yang mengarahkan peserta untuk melampirkan gambar tiket
    const pesan = `Halo Panitia SPMB ${schoolData.name}.%0A%0ASaya telah mendaftar online dengan rincian:%0A*Nama:* ${ticketData.nama}%0A*No. Registrasi:* ${ticketData.noUrut}%0A%0ABerikut saya lampirkan gambar tiket pendaftaran saya. Mohon arahan selanjutnya. Terima kasih.`;
    window.open(`https://wa.me/${schoolData.whatsapp}?text=${pesan}`, '_blank');
  };

  const inputClass = "w-full p-3.5 mt-1.5 text-sm text-emerald-950 bg-white/60 backdrop-blur-sm border border-emerald-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-yellow-400/30 focus:border-yellow-400 focus:scale-[1.01] hover:border-yellow-300 outline-none transition-all duration-300 shadow-sm placeholder:text-gray-400 font-medium";
  const labelClass = "block text-xs sm:text-sm font-extrabold text-emerald-900 ml-1 tracking-wide uppercase";
  const cardClass = "bg-white/80 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.1)] transition-shadow duration-500";
  const sectionTitleClass = "flex items-center text-lg sm:text-xl font-extrabold text-emerald-950 mb-6 pb-3 border-b-2 border-yellow-400/50";

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans relative overflow-x-hidden selection:bg-yellow-400 selection:text-emerald-900">
      
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
          @keyframes float-reverse {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(20px) rotate(-5deg); }
          }
          @keyframes shimmer {
            100% { transform: translateX(100%); }
          }
          @keyframes slideUpFade {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .animate-float { animation: float 8s ease-in-out infinite; }
          .animate-float-reverse { animation: float-reverse 10s ease-in-out infinite; }
          .animate-slide-up-1 { animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.2s; opacity: 0; }
          .animate-slide-up-2 { animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.4s; opacity: 0; }
          .animate-slide-up-3 { animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.6s; opacity: 0; }
          
          .shimmer-effect::after {
            content: '';
            position: absolute;
            top: 0; right: 0; bottom: 0; left: 0;
            transform: translateX(-100%);
            background-image: linear-gradient(90deg, rgba(255,255,255,0) 0, rgba(255,255,255,0.4) 20%, rgba(255,255,255,0.4) 60%, rgba(255,255,255,0));
            animation: shimmer 2.5s infinite;
          }
        `}
      </style>

      {/* BACKGROUND DECORATIVE MELAYANG DINAMIS */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="animate-float absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-emerald-400/10 blur-[100px]"></div>
        <div className="animate-float-reverse absolute top-[20%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-yellow-400/10 blur-[120px]"></div>
        <div className="animate-float absolute -bottom-[10%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-teal-300/10 blur-[100px]"></div>
      </div>

      {/* 1. POPUP FLYER */}
      {showFlyer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-emerald-950/60 backdrop-blur-xl p-4 transition-all duration-500">
          <div className="animate-in zoom-in-90 duration-500 fade-in bg-white rounded-3xl overflow-hidden max-w-[340px] w-full relative shadow-[0_0_50px_rgba(250,204,21,0.3)] ring-2 ring-yellow-400/50">
            <button 
              onClick={() => setShowFlyer(false)} 
              className="absolute top-3 right-3 bg-black/20 hover:bg-red-500 backdrop-blur-md text-white rounded-full p-2 transition-all duration-300 z-20 hover:rotate-90"
            >
              <X size={16} strokeWidth={3} />
            </button>
            <div className="relative aspect-[4/5] bg-emerald-950 group overflow-hidden">
              <img src={schoolData.flyer} alt="Flyer SPMB" className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-all duration-1000 ease-out opacity-70" />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/50 to-transparent flex flex-col justify-end p-6 text-center">
                <div className="bg-yellow-400 text-emerald-950 text-xs font-black px-3 py-1 rounded-full w-max mx-auto mb-3 animate-pulse">{schoolData.tahunPelajaran}</div>
                <h3 className="text-3xl font-black text-white mb-2 drop-shadow-2xl translate-y-2 group-hover:translate-y-0 transition-transform duration-500">SPMB <span className="text-yellow-400">DIBUKA!</span></h3>
                <p className="text-emerald-100/90 text-sm font-medium translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100">Jadilah bagian dari generasi berprestasi dan berakhlak mulia.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowFlyer(false)}
              className="relative overflow-hidden w-full bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-black py-4 text-base transition-all uppercase tracking-widest shimmer-effect group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2 group-hover:scale-105 transition-transform">
                Isi Formulir Sekarang <Sparkles size={18} />
              </span>
            </button>
          </div>
        </div>
      )}

      {/* 2. TIKET BUKTI PENDAFTARAN (LANDSCAPE COMPACT - DIPERBESAR & WAJIB UNDUH) */}
      {status === 'success' && ticketData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-emerald-950/90 backdrop-blur-md p-4">
          <div className="flex flex-col items-center w-full max-w-lg animate-in zoom-in-95 duration-500">
            
            {/* Teks Peringatan Super Ringkas */}
            <p className="text-yellow-400 text-sm sm:text-base font-black mb-4 text-center tracking-wide uppercase drop-shadow-md">
              Tahap Akhir: Wajib Unduh Tiket & Konfirmasi WA!
            </p>

            {/* AREA TIKET (Desain Memanjang / Landscape) */}
            <div ref={ticketRef} className="w-full bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-row relative overflow-hidden">
              
              {/* Kiri: Bagian Stub/Potongan Tiket */}
              <div className="w-[35%] bg-gradient-to-b from-emerald-800 to-emerald-950 p-4 sm:p-6 flex flex-col items-center justify-center text-center border-r-2 border-dashed border-emerald-700/60 relative">
                <img 
                  src={schoolData.logo} 
                  alt="Logo" 
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-sm p-1.5 rounded-xl mb-3 shadow-lg" 
                  crossOrigin="anonymous" 
                />
                <h2 className="text-yellow-400 font-black text-xs sm:text-sm tracking-widest uppercase leading-tight">{schoolData.name}</h2>
                <p className="text-emerald-200 text-[9px] sm:text-[10px] font-bold mt-1.5 tracking-widest uppercase">T.A {schoolData.tahunPelajaran}</p>
                
                {/* Efek Bolongan Tiket (Kiri & Kanan Stub) */}
                <div className="absolute -left-3 top-1/2 w-6 h-6 bg-emerald-950 rounded-full transform -translate-y-1/2 shadow-inner"></div>
                <div className="absolute -right-[13px] top-1/2 w-6 h-6 bg-white rounded-full transform -translate-y-1/2 z-10"></div>
              </div>
              
              {/* Kanan: Bagian Detail Tiket */}
              <div className="w-[65%] p-5 sm:p-6 bg-gradient-to-br from-white to-slate-50 flex flex-col justify-center relative">
                
                <div className="mb-4 border-b border-gray-100 pb-2">
                  <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-widest font-black mb-0.5">Nama Peserta</p>
                  <h3 className="text-base sm:text-xl font-black text-emerald-950 uppercase leading-tight truncate">{ticketData.nama}</h3>
                </div>

                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-widest font-black mb-0.5">No. Registrasi</p>
                    <p className="font-black text-yellow-600 text-base sm:text-lg tracking-widest">{ticketData.noUrut}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-widest font-black mb-0.5">Tgl Masuk</p>
                    <p className="font-bold text-emerald-800 text-xs sm:text-sm">{ticketData.tanggal}</p>
                  </div>
                </div>

                <div className="mt-1 pt-3 border-t border-gray-100 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-green-500" />
                  <p className="text-[9px] sm:text-[10px] text-emerald-700 font-bold uppercase tracking-widest">Tersimpan di Sistem</p>
                </div>

                {/* Efek Bolongan Tiket Kanan */}
                <div className="absolute -right-3 top-1/2 w-6 h-6 bg-emerald-950 rounded-full transform -translate-y-1/2 shadow-inner"></div>
              </div>
            </div>

            {/* AREA TOMBOL AKSI (Berdampingan) */}
            <div className="w-full flex flex-row gap-3 mt-6">
              {/* Tombol Unduh */}
              <button 
                onClick={async () => {
                  await downloadTicketAsImage();
                  setIsTicketDownloaded(true); // Membuka kunci tombol WA setelah unduh selesai
                }}
                disabled={isDownloading}
                className="flex-1 flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-emerald-950 py-3.5 rounded-xl font-black transition shadow-lg text-xs sm:text-sm uppercase tracking-widest"
              >
                {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} 
                {isDownloading ? "Menyimpan..." : "1. Unduh Tiket"}
              </button>
              
              {/* Tombol WA (Disabled jika belum unduh) */}
              <button 
                onClick={sendToOfficialWA}
                disabled={!isTicketDownloaded}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-black transition shadow-lg text-xs sm:text-sm uppercase tracking-widest
                  ${isTicketDownloaded 
                    ? 'bg-green-500 hover:bg-green-600 text-white cursor-pointer' 
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed border-2 border-slate-400 opacity-60'
                  }`}
              >
                <Send size={18} /> 2. Kirim WA
              </button>
            </div>
            
            {/* Peringatan kecil jika tombol WA belum aktif */}
            {!isTicketDownloaded && (
              <p className="text-white/70 text-[10px] sm:text-xs mt-3 italic text-center">
                *Tombol Kirim WA akan aktif setelah Anda mengunduh tiket.
              </p>
            )}

            <button 
              onClick={closeTicket} 
              className="mt-5 text-white/50 hover:text-white py-1 font-bold transition text-xs sm:text-sm tracking-widest uppercase underline"
            >
              Tutup Jendela
            </button>

          </div>
        </div>
      )}

      {/* --- HERO SECTION MEGAH --- */}
      <div className={`relative bg-emerald-950 text-white min-h-[45vh] flex flex-col items-center justify-center pt-12 pb-40 px-4 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0 translate-y-10'}`}>
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src={schoolData.background} 
            alt="Background" 
            className="w-full h-full object-cover opacity-50 scale-105 animate-[pulse_10s_ease-in-out_infinite]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-emerald-950/60 to-emerald-950"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-400/5 to-transparent"></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center text-center w-full">
          <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-[2rem] shadow-[0_0_50px_rgba(16,185,129,0.3)] mb-6 border border-white/20 transform hover:scale-110 hover:rotate-3 transition duration-500 ease-out">
            <img 
              src={schoolData.logo} 
              alt={`Logo ${schoolData.name}`} 
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-contain bg-white p-1"
              onError={(e) => {e.target.src = "https://ui-avatars.com/api/?name=SMP+Islam+Caruy&background=10b981&color=fff&size=128&bold=true"}}
            />
          </div>
          
          <div className="flex items-center gap-2 mb-5 bg-gradient-to-r from-yellow-500 to-yellow-400 text-emerald-950 px-6 py-1.5 rounded-full shadow-lg shadow-yellow-500/20 transform hover:-translate-y-1 transition">
            <Award size={16} className="animate-pulse" />
            <span className="font-black text-xs sm:text-sm tracking-widest uppercase">{schoolData.accreditation}</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter mb-4 text-white drop-shadow-2xl [-webkit-text-stroke:1px_#facc15] sm:[-webkit-text-stroke:2px_#facc15]">
            {schoolData.name}
          </h1>
          
          <div className="max-w-3xl px-4 flex flex-col items-center">
            <div className="w-12 h-1 bg-yellow-400 rounded-full mb-4 opacity-50"></div>
            <p className="text-emerald-50 text-sm sm:text-lg font-medium italic leading-relaxed max-w-2xl drop-shadow-md">
              "{schoolData.vision}"
            </p>
          </div>
        </div>
      </div>

      {/* --- FORMULIR BERTUMPUK (OVERLAPPING) --- */}
      <main className="flex-grow px-4 sm:px-6 relative z-20 -mt-28 pb-20 max-w-5xl mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          
          {/* HEADER FORM */}
          <div className={`bg-white/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-xl border border-white text-center animate-slide-up-1`}>
            <h2 className="text-xl sm:text-3xl font-black text-emerald-950 uppercase tracking-widest">Pendaftaran SPMB Online</h2>
            <p className="text-slate-500 mt-2 text-xs sm:text-sm font-medium">
              Mohon isi formulir dengan teliti dan lengkap.
            </p>
          </div>

          {/* SECTION 1: DATA DIRI */}
          <section className={`${cardClass} animate-slide-up-1`}>
            <h3 className={sectionTitleClass}>
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-emerald-950 p-2.5 rounded-2xl mr-4 shadow-md transform -rotate-3"><User size={20} strokeWidth={2.5}/></div>
              Informasi Personal
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2 group">
                <label htmlFor="nama_lengkap" className={labelClass}>Nama Lengkap (Sesuai Ijazah/Akta)</label>
                <input type="text" id="nama_lengkap" name="nama_lengkap" placeholder="Ketik nama lengkap..." required className={inputClass} />
              </div>
              
              <div className="group">
                <label htmlFor="jenis_kelamin" className={labelClass}>Jenis Kelamin</label>
                <div className="relative">
                  <select id="jenis_kelamin" name="jenis_kelamin" required className={`${inputClass} appearance-none pr-10 cursor-pointer`}>
                    <option value="">-- Pilih --</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none" size={18} />
                </div>
              </div>
              
              <div className="group">
                <label htmlFor="no_wa" className={labelClass}>No WhatsApp Siswa <span className="text-slate-400 font-normal ml-1">(Opsional)</span></label>
                <input type="number" id="no_wa" name="no_wa" placeholder="0812..." className={inputClass} />
              </div>

              <div className="group">
                <label htmlFor="tempat_lahir" className={labelClass}>Tempat Lahir</label>
                <input type="text" id="tempat_lahir" name="tempat_lahir" placeholder="Kota/Kabupaten" required className={inputClass} />
              </div>

              <div className="group">
                <label htmlFor="tanggal_lahir" className={labelClass}>Tanggal Lahir</label>
                <input type="date" id="tanggal_lahir" name="tanggal_lahir" required className={`${inputClass} cursor-pointer`} />
              </div>

              <div className="sm:col-span-2 group">
                <label htmlFor="asal_sekolah" className={labelClass}>Asal Sekolah (SD/MI)</label>
                <input type="text" id="asal_sekolah" name="asal_sekolah" placeholder="Nama sekolah sebelumnya..." required className={inputClass} />
              </div>
            </div>
          </section>

          {/* SECTION 2: ALAMAT & TEMPAT TINGGAL */}
          <section className={`${cardClass} animate-slide-up-2`}>
            <h3 className={sectionTitleClass}>
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-emerald-950 p-2.5 rounded-2xl mr-4 shadow-md transform rotate-3"><MapPin size={20} strokeWidth={2.5}/></div>
              Alamat & Domisili
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div className="sm:col-span-2 p-5 bg-gradient-to-br from-emerald-50 to-yellow-50/30 rounded-2xl border border-emerald-100 shadow-inner mb-2">
                <label htmlFor="jenis_tinggal_select" className={labelClass}>Tinggal Bersama (Saat ini)</label>
                <div className="relative mt-1">
                  <select 
                    id="jenis_tinggal_select"
                    name="jenis_tinggal_select" 
                    value={jenisTinggal}
                    onChange={(e) => setJenisTinggal(e.target.value)}
                    required 
                    className={`${inputClass} !mt-0 appearance-none pr-10 cursor-pointer border-emerald-200`}
                  >
                    <option value="">-- Pilih Status Tempat Tinggal --</option>
                    <option value="Orang Tua">Bersama Orang Tua</option>
                    <option value="Wali">Bersama Wali</option>
                    <option value="Pondok Pesantren / Asrama">Pondok Pesantren / Asrama</option>
                    <option value="Lainnya">Lainnya (Ketik Sendiri)</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none" size={18} />
                </div>

                {jenisTinggal === 'Lainnya' && (
                  <div className="mt-4 animate-in slide-in-from-top-4 fade-in duration-500">
                    <label htmlFor="jenis_tinggal_input" className="block text-xs font-black text-yellow-600 ml-1 uppercase tracking-wider mb-1">Sebutkan Tempat Tinggal:</label>
                    <input 
                      type="text" 
                      id="jenis_tinggal_input"
                      name="jenis_tinggal_input" 
                      placeholder="Contoh: Kost, Panti Asuhan, dll..." 
                      required 
                      className={`${inputClass} !mt-0 border-yellow-300 ring-4 ring-yellow-400/10 focus:ring-yellow-400/40 shadow-sm`} 
                    />
                  </div>
                )}
              </div>

              <div className="sm:col-span-2 group">
                <label htmlFor="jln" className={labelClass}>Nama Jalan / Gang</label>
                <input type="text" id="jln" name="jln" placeholder="Jl. Merdeka No.10..." required className={inputClass} />
              </div>

              <div className="group">
                <label htmlFor="dusun" className={labelClass}>Dusun / Banjar</label>
                <input type="text" id="dusun" name="dusun" placeholder="Nama Dusun" required className={inputClass} />
              </div>

              <div className="flex gap-4">
                <div className="w-1/2 group">
                  <label htmlFor="rt" className={labelClass}>RT</label>
                  <input type="number" id="rt" name="rt" placeholder="03" required className={inputClass} />
                </div>
                <div className="w-1/2 group">
                  <label htmlFor="rw" className={labelClass}>RW</label>
                  <input type="number" id="rw" name="rw" placeholder="03" required className={inputClass} />
                </div>
              </div>

              <div className="group">
                <label htmlFor="desa_kelurahan" className={labelClass}>Desa / Kelurahan</label>
                <input type="text" id="desa_kelurahan" name="desa_kelurahan" placeholder="Nama Desa" required className={inputClass} />
              </div>

              <div className="group">
                <label htmlFor="kecamatan" className={labelClass}>Kecamatan</label>
                <input type="text" id="kecamatan" name="kecamatan" placeholder="Nama Kecamatan" required className={inputClass} />
              </div>

              <div className="group">
                <label htmlFor="kab_kota" className={labelClass}>Kabupaten / Kota</label>
                <input type="text" id="kab_kota" name="kab_kota" placeholder="Nama Kab/Kota" required className={inputClass} />
              </div>

              <div className="group">
                <label htmlFor="provinsi" className={labelClass}>Provinsi</label>
                <input type="text" id="provinsi" name="provinsi" placeholder="Jawa Tengah" required className={inputClass} />
              </div>
            </div>
          </section>

          {/* SECTION 3: ORANG TUA */}
          <section className={`${cardClass} animate-slide-up-3`}>
            <h3 className={sectionTitleClass}>
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-emerald-950 p-2.5 rounded-2xl mr-4 shadow-md transform -rotate-3"><Users size={20} strokeWidth={2.5}/></div>
              Data Orang Tua / Wali
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="group">
                <label htmlFor="nama_ayah" className={labelClass}>Nama Ayah</label>
                <input type="text" id="nama_ayah" name="nama_ayah" placeholder="Sesuai KK..." className={inputClass} />
              </div>
              
              <div className="group">
                <label htmlFor="nama_ibu" className={labelClass}>Nama Ibu</label>
                <input type="text" id="nama_ibu" name="nama_ibu" placeholder="Sesuai KK..." required className={inputClass} />
              </div>

              <div className="sm:col-span-2 group">
                <label htmlFor="no_hp_ortu" className={labelClass}>Nomor HP / WhatsApp Orang Tua</label>
                <input type="number" id="no_hp_ortu" name="no_hp_ortu" placeholder="Contoh: 0812..." required className={`${inputClass} border-emerald-300 bg-emerald-50/50`} />
                <p className="text-[11px] text-emerald-600 font-medium mt-2 ml-1 flex items-center gap-1">
                  <Sparkles size={12} /> Nomor ini akan dihubungi untuk informasi kelulusan.
                </p>
              </div>
            </div>
          </section>

          {/* SUBMIT BUTTON */}
          <div className="pt-2 animate-slide-up-3">
            <button 
              type="submit" 
              disabled={status === 'loading'}
              className={`relative overflow-hidden w-full flex items-center justify-center gap-3 py-5 px-6 text-lg sm:text-xl font-black rounded-2xl uppercase tracking-widest transition-all duration-300 transform group
                ${status === 'loading' 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed border-2 border-slate-300' 
                  : 'bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 text-emerald-950 hover:scale-[1.02] shadow-[0_20px_40px_-10px_rgba(250,204,21,0.5)] border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 shimmer-effect'}`}
            >
              <span className="relative z-10 flex items-center gap-2">
                {status === 'loading' ? (
                  <>
                    <Loader2 className="animate-spin h-7 w-7 text-emerald-900" />
                    MEMPROSES DATA...
                  </>
                ) : (
                  <>
                    KIRIM FORMULIR SEKARANG
                    <Send className="h-6 w-6 transform group-hover:translate-x-2 transition-transform duration-300" />
                  </>
                )}
              </span>
            </button>
          </div>

        </form>
      </main>

      {/* FOOTER */}
      <footer className="bg-emerald-950 text-emerald-100 pt-20 pb-8 relative mt-auto border-t-4 border-yellow-400">
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-6 mb-12 pb-12 border-b border-emerald-800/60">
            
            <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left pr-0 md:pr-10">
              <img 
                src={schoolData.logo} 
                alt="Logo SMP" 
                className="w-16 h-16 rounded-2xl mb-5 bg-white/10 backdrop-blur-sm p-1.5 border border-white/20"
                onError={(e) => {e.target.src = "https://ui-avatars.com/api/?name=SMP+Islam+Caruy&background=10b981&color=fff&size=64&bold=true"}}
              />
              <h4 className="font-black text-white text-2xl tracking-widest mb-3 uppercase">{schoolData.name}</h4>
              <p className="text-sm text-emerald-200/80 leading-relaxed font-medium">
                Pusat pendidikan menengah pertama yang berdedikasi untuk mencetak generasi cerdas, berakhlak mulia, dan berwawasan luas.
              </p>
            </div>

            <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left">
              <h4 className="font-black text-yellow-400 text-sm uppercase tracking-widest mb-6">Lokasi & Kontak</h4>
              <ul className="space-y-5">
                <li className="flex items-start gap-4 text-sm text-emerald-200/90 group">
                  <div className="bg-emerald-900/50 p-2 rounded-lg border border-emerald-800 group-hover:bg-yellow-400 group-hover:border-yellow-400 transition-colors"><MapPin size={18} className="text-emerald-400 group-hover:text-emerald-950 transition-colors" /></div>
                  <span className="leading-relaxed mt-1">{schoolData.address}</span>
                </li>
                <li className="flex items-center gap-4 text-sm text-emerald-200/90 group">
                  <div className="bg-emerald-900/50 p-2 rounded-lg border border-emerald-800 group-hover:bg-yellow-400 group-hover:border-yellow-400 transition-colors"><Phone size={18} className="text-emerald-400 group-hover:text-emerald-950 transition-colors" /></div>
                  <a href={`https://wa.me/${schoolData.whatsapp}`} target="_blank" rel="noreferrer" className="hover:text-yellow-400 transition font-bold text-base">
                    +{schoolData.whatsapp.replace(/(\d{2})(\d{4})(\d{4})(\d{3})/, "$1 $2-$3-$4")}
                  </a>
                </li>
              </ul>
            </div>

            <div className="md:col-span-3 flex flex-col items-center md:items-start text-center md:text-left">
              <h4 className="font-black text-yellow-400 text-sm uppercase tracking-widest mb-6">Media Sosial</h4>
              <div className="space-y-3 w-full max-w-[220px]">
                <a href={`https://instagram.com/${schoolData.instagram}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-emerald-100 font-bold hover:text-white transition group bg-emerald-900/40 p-3 rounded-xl border border-emerald-800 hover:border-pink-500 hover:bg-emerald-900 shadow-sm">
                  <IconInstagram size={18} className="text-pink-500 group-hover:scale-110 transition-transform" />
                  Instagram
                </a>
                <a href={schoolData.youtubeOfficial} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-emerald-100 font-bold hover:text-white transition group bg-emerald-900/40 p-3 rounded-xl border border-emerald-800 hover:border-red-500 hover:bg-emerald-900 shadow-sm">
                  <IconYoutube size={18} className="text-red-500 group-hover:scale-110 transition-transform" />
                  YT Official
                </a>
                <a href={schoolData.youtubeGallery} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-emerald-100 font-bold hover:text-white transition group bg-emerald-900/40 p-3 rounded-xl border border-emerald-800 hover:border-red-500 hover:bg-emerald-900 shadow-sm">
                  <IconYoutube size={18} className="text-red-500 group-hover:scale-110 transition-transform" />
                  YT Galeri
                </a>
              </div>
            </div>

          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
            <p className="text-emerald-500 text-center md:text-left">
              © {new Date().getFullYear()} {schoolData.name}. All rights reserved.
            </p>
            <p className="text-emerald-500">
              Developed by{' '}
              <a href={schoolData.creatorLink} target="_blank" rel="noreferrer" className="font-black tracking-widest hover:text-yellow-400 transition-colors ml-1 text-sm">
                <span className="text-white">Nabas</span><span className="text-yellow-400">tala</span>
              </a>
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;