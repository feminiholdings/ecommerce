import React, { useState, useEffect } from 'react';
import { CustomerLayout } from '../../components/CustomerLayout';
import { Mail, Phone, MapPin, Send, CheckCircle2, Sparkles, Clock } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const CONTACT_DRAFT_KEY = 'nais_contact_inquiry_draft';

export const ContactUsView: React.FC = () => {
  const { notify } = useNotification();

  // Restore draft state synchronously
  const [formData, setFormData] = useState(() => {
    try {
      const raw = localStorage.getItem(CONTACT_DRAFT_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // Ignore
    }
    return {
      name: '',
      email: '',
      phone: '',
      school: '',
      inquiryType: 'School Uniforms',
      message: '',
    };
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [wasRestored, setWasRestored] = useState(() => {
    try {
      const raw = localStorage.getItem(CONTACT_DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return Boolean(parsed.message || parsed.name || parsed.phone);
      }
    } catch {
      // Ignore
    }
    return false;
  });

  // Auto-save draft on every keystroke
  useEffect(() => {
    if (!submitted) {
      try {
        localStorage.setItem(CONTACT_DRAFT_KEY, JSON.stringify(formData));
      } catch {
        // Ignore
      }
    }
  }, [formData, submitted]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) {
      notify({
        type: 'WARNING',
        title: 'Missing Details',
        message: 'Please provide your name, phone number, and inquiry message.',
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      localStorage.removeItem(CONTACT_DRAFT_KEY);
      notify({
        type: 'SUCCESS',
        title: 'Inquiry Received',
        message: 'Thank you! Our Uhuru Market tailoring team will contact you shortly.',
      });
    }, 700);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      school: '',
      inquiryType: 'School Uniforms',
      message: '',
    });
    localStorage.removeItem(CONTACT_DRAFT_KEY);
    setWasRestored(false);
    setSubmitted(false);
  };

  return (
    <CustomerLayout>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8 pb-16">
        {/* Header Banner */}
        <div className="bg-white hover:bg-slate-50/50 p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-[#FACB00]" />
            <span className="text-[11px] font-black uppercase tracking-wider text-[#030A91]">
              Uhuru Market, Nairobi • Kenya
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#030A91] tracking-tight">
            Contact & Custom Uniform Inquiries
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
            Reach our master tailors and bulk school supply coordinators directly. All inquiries are answered within 2 hours.
          </p>
        </div>

        {/* Work Restoration Notice */}
        {wasRestored && !submitted && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-3.5 flex items-center justify-between text-xs text-blue-900 animate-in fade-in">
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-4 h-4 text-[#030A91]" />
              <span>We've automatically restored your inquiry draft so you don't lose what you typed!</span>
            </div>
            <button
              onClick={handleReset}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 underline ml-2"
            >
              Clear Draft
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Contact Details Card */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <h3 className="text-base font-black text-slate-900">Direct Contact</h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#030A91] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Phone & WhatsApp</span>
                    <a href="tel:0792021496" className="text-[#030A91] hover:underline font-mono font-bold block mt-0.5">
                      0792021496
                    </a>
                    <a href="tel:0112264870" className="text-[#030A91] hover:underline font-mono font-bold block">
                      0112264870
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#030A91] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Official Email</span>
                    <a href="mailto:support@naisiaetextiles.com" className="text-[#030A91] hover:underline font-medium block mt-0.5 break-all">
                      support@naisiaetextiles.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#030A91] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Manufacturing Complex</span>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">
                      Naisiae Complex, Uhuru Market, Jogoo Road, Nairobi, Kenya
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Opening Hours</span>
                    <p className="text-slate-600 mt-0.5">
                      Mon - Sat: 7:30 AM - 6:30 PM<br />
                      Sunday: 10:00 AM - 4:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Inquiry Form */}
          <div className="md:col-span-2">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
              {submitted ? (
                <div className="py-12 text-center space-y-4 animate-in fade-in zoom-in-95">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Inquiry Received Successfully!</h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    Thank you, <strong>{formData.name}</strong>. Our production desk has logged your request and will call you on <strong>{formData.phone}</strong> with full pricing and fabric details.
                  </p>
                  <button
                    onClick={handleReset}
                    className="mt-4 px-6 py-2.5 bg-[#030A91] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
                    <h3 className="text-base font-black text-slate-900">Send Inquiry / Quotation Request</h3>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Auto-saves continuously
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Mary Wanjiku"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#030A91]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Phone Number (M-Pesa / Call) *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="e.g. 0712345678"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#030A91]"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="e.g. mary@gmail.com"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#030A91]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        School / Institution Name
                      </label>
                      <input
                        type="text"
                        name="school"
                        value={formData.school}
                        onChange={handleChange}
                        placeholder="e.g. Nairobi Primary or KMTC"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#030A91]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Inquiry Category
                    </label>
                    <select
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#030A91]"
                    >
                      <option value="School Uniforms">School Uniforms (Primary / Secondary)</option>
                      <option value="KMTC Uniforms">KMTC & Medical Scrubs</option>
                      <option value="Customized Uniforms">Custom Corporate & Security Garments</option>
                      <option value="Bulk Order">Bulk Institutional Wholesale Order</option>
                      <option value="Embroidery & Badges">Custom Embroidery & Badges</option>
                      <option value="Other">Other Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Uniform Specifications or Inquiry Details *
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Specify garment types, quantities, sizes needed, colors, or any specific institutional embroidery..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#030A91]"
                      required
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-xs text-slate-500 hover:text-slate-800 hover:underline"
                    >
                      Reset Form
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-[#030A91] hover:bg-blue-900 text-white rounded-xl text-xs font-black flex items-center space-x-2 transition-all shadow-md active:scale-98 disabled:opacity-50"
                    >
                      <span>{isSubmitting ? 'Sending Request...' : 'Submit Inquiry / Request Quote'}</span>
                      <Send className="w-3.5 h-3.5 text-[#FACB00]" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

