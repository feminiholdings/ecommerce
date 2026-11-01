import React, { useState } from 'react';
import { CustomerLayout } from '../../components/CustomerLayout';
import {
  ShieldCheck,
  FileText,
  RotateCcw,
  CreditCard,
  Truck,
  Lock,
  Scale,
  CheckCircle2,
  AlertCircle,
  Phone,
  Building,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';

export const PolicyView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'terms' | 'returns' | 'payments' | 'privacy' | 'delivery'>('all');

  return (
    <CustomerLayout>
      <div className="max-w-5xl mx-auto px-4 py-4 sm:py-8 space-y-8 select-none">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-[#02066F] via-[#030A91] to-[#0412B3] text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="scanner-beam" />
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold text-[#FACB00] border border-white/10">
              <Scale className="w-3.5 h-3.5" />
              <span>Official Policies, Terms & Conditions</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Policies & Terms of Service
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium leading-relaxed">
              Transparent, fair, and legally compliant standards governing uniform purchases, M-Pesa payments, KRA eTIMS fiscal invoices, returns, exchanges, and data protection at Naisiae Textiles Ltd.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-[11px] text-blue-200">
              <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Updated for 2026 Academic Year
              </span>
              <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                <Building className="w-3.5 h-3.5 text-[#FACB00]" />
                Republic of Kenya Laws Compliant
              </span>
            </div>
          </div>
        </div>

        {/* Quick Filter Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200">
          {[
            { id: 'all', label: 'All Policies & Terms', icon: FileText },
            { id: 'terms', label: 'Terms & Conditions', icon: Scale },
            { id: 'returns', label: 'Returns & Exchanges', icon: RotateCcw },
            { id: 'payments', label: 'Payments & eTIMS', icon: CreditCard },
            { id: 'delivery', label: 'Delivery & Pick-Up', icon: Truck },
            { id: 'privacy', label: 'Privacy & Data Policy', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#030A91] text-[#FACB00] shadow-md scale-102'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FACB00]' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ==================================================== */}
        {/* SECTION 1: TERMS AND CONDITIONS                      */}
        {/* ==================================================== */}
        {(activeTab === 'all' || activeTab === 'terms') && (
          <section id="terms" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#030A91] flex items-center justify-center font-black">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  Terms & Conditions of Sale and Service
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  General terms governing orders, store visits, and portal use
                </p>
              </div>
            </div>

            <div className="space-y-5 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <div className="space-y-1.5">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#030A91]" />
                  1. Acceptance of Terms
                </h3>
                <p className="pl-3 text-slate-600">
                  By accessing the Naisiae Textiles website, mobile catalog portal, or physical flagship locations (Uhuru Market HQ & Westlands branch), you agree to be legally bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use our services or place orders.
                </p>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#030A91]" />
                  2. Pricing & Currency
                </h3>
                <p className="pl-3 text-slate-600">
                  All prices listed on the Naisiae portal and in-store quotations are stated in Kenya Shillings (KES) and are inclusive of Value Added Tax (VAT at 16%) where statutory applicable. Naisiae Textiles reserves the right to adjust product pricing without prior notice due to raw fabric material cost fluctuations or currency shifts; however, confirmed and paid orders will not be subjected to retroactive price changes.
                </p>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#030A91]" />
                  3. Order Confirmation & Stock Availability
                </h3>
                <p className="pl-3 text-slate-600">
                  While we maintain extensive stock for leading national and county institutions (e.g. Kenya High, Alliance, Starehe, Pangani, Lenana, Nairobi School, KMTC, etc.), all orders are subject to physical stock confirmation. In the rare event of an unexpected inventory depletion, our team will immediately notify you and offer either an expedited tailored replenishment (within 24–48 hours) or a full refund.
                </p>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#030A91]" />
                  4. Custom Embroidery & Customized Tailoring
                </h3>
                <p className="pl-3 text-slate-600">
                  Orders requiring customized school monograms, custom logos, specialized crests, or bespoke student sizing measurements require customer sign-off prior to stitching. Once fabric has been cut or embroidered per customer request, customized orders cannot be cancelled or altered without incurring fabric loss charges.
                </p>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#030A91]" />
                  5. Customer Accounts & Verification
                </h3>
                <p className="pl-3 text-slate-600">
                  Customers authenticate securely using Google Sign-In to track their past purchases, electronic receipts, and dispatch states. You are responsible for maintaining the confidentiality of your credentials and all activity originating from your verified profile.
                </p>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#030A91]" />
                  6. Governing Law & Dispute Jurisdiction
                </h3>
                <p className="pl-3 text-slate-600">
                  These terms are governed by and construed in accordance with the laws of the Republic of Kenya. Any legal actions or proceedings arising out of or related to these terms shall be subject to the exclusive jurisdiction of the competent courts in Nairobi, Kenya.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ==================================================== */}
        {/* SECTION 2: RETURNS, EXCHANGES & REFUND POLICY        */}
        {/* ==================================================== */}
        {(activeTab === 'all' || activeTab === 'returns') && (
          <section id="returns" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#030A91] flex items-center justify-center font-black">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  Returns, Exchanges & Warranty Policy
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Hassle-free size exchanges, inspection standards, and defect guarantees
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#030A91] flex items-center justify-center font-bold text-xs">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">14-Day Exchange Window</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Garments may be returned for size swap or exchange within 14 calendar days from the date of purchase or courier delivery.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Original Condition</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Garments must be unworn, unwashed, unaltered, and accompanied by their original labels, barcodes, and eTIMS thermal receipt.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Quality Guarantee</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every Naisiae garment is backed by our fabric integrity guarantee against manufacturing tears, loose seams, or defective zippers.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700">
              <h3 className="font-bold text-slate-900 text-sm">Policy Details & Exclusions:</h3>
              <ul className="space-y-2.5 list-disc pl-5 text-slate-600">
                <li>
                  <strong>Size Swaps:</strong> Growing children frequently require size adjustments. We offer free in-store size exchanges across all standard uniform categories subject to branch inventory.
                </li>
                <li>
                  <strong>Custom & Monogrammed Garments:</strong> Uniforms customized with individual student names, personalized embroidery, or custom sizing cannot be refunded or exchanged unless a verifiable tailoring defect occurred on our part.
                </li>
                <li>
                  <strong>Intimate & Specialty Items:</strong> Socks, stockings, and swimsuits cannot be returned once opened or tried on due to public health and hygiene guidelines.
                </li>
                <li>
                  <strong>Refund Processing:</strong> Where an approved exchange cannot be fulfilled due to total stock exhaustion, refunds are returned to the original payment channel (e.g. M-Pesa reversal or store credit) within 24 to 48 business hours.
                </li>
              </ul>
            </div>
          </section>
        )}

        {/* ==================================================== */}
        {/* SECTION 3: PAYMENT TERMS & KRA eTIMS FISCAL INVOICING*/}
        {/* ==================================================== */}
        {(activeTab === 'all' || activeTab === 'payments') && (
          <section id="payments" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  Payment Terms & Official KRA eTIMS Invoicing
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Instant M-Pesa STK push, verified references, and tax compliant eTIMS receipts
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>
                Naisiae Textiles adheres strictly to Kenya Revenue Authority (KRA) eTIMS regulations. Every completed retail transaction and online order is fiscalized in real time.
              </p>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2 text-[#030A91] font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>KRA Electronic Tax Invoice Management (eTIMS)</span>
                </div>
                <p className="text-xs text-slate-600">
                  Upon completing checkout, an official thermal receipt containing the unique KRA Control Number, QR code validation URL, and VAT itemization is instantly generated. Customers can scan the QR code using any smartphone camera to verify fiscal validity directly with KRA servers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 space-y-1">
                  <h4 className="font-bold text-xs text-[#030A91]">M-Pesa STK Push Terms</h4>
                  <p className="text-[11px] text-slate-600">
                    Safaricom M-Pesa payments must originate from an active Kenyan mobile line (07XX / 01XX or 2547XX / 2541XX). Confirmation callbacks are validated automatically before order dispatch.
                  </p>
                </div>
                <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 space-y-1">
                  <h4 className="font-bold text-xs text-[#030A91]">Institutional & School Cheques</h4>
                  <p className="text-[11px] text-slate-600">
                    Direct bank deposits, school bursary cheques, and RTGS corporate payments are accepted for bulk institutional supply contracts upon bank clearance.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ==================================================== */}
        {/* SECTION 4: DELIVERY, SHIPPING & STORE PICKUP         */}
        {/* ==================================================== */}
        {(activeTab === 'all' || activeTab === 'delivery') && (
          <section id="delivery" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#030A91] flex items-center justify-center font-black">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  Delivery, Shipping & Store Pick-Up Terms
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Reliable dispatch across Nairobi and countrywide parcels
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-[#030A91]" />
                    In-Store Pick-Up (Free of Charge)
                  </h3>
                  <p className="text-xs text-slate-600">
                    Collect your ready uniform order directly from our Flagship Store at <strong>Uhuru Market, Stalls 412–415</strong> or our <strong>Westlands Branch</strong>. Orders are typically packaged and ready for collection within 1–2 hours of online payment.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    Countrywide Parcel Delivery
                  </h3>
                  <p className="text-xs text-slate-600">
                    We deliver across Kenya via trusted courier partners (Wells Fargo, G4S, Easy Coach, North Rift, and registered Matatu parcel offices). Standard delivery time is 24 hours within Nairobi and 24–48 hours for upcountry regions.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Please ensure your delivery phone number and designated destination town/pickup office are accurately entered at checkout to prevent courier delays.
                </span>
              </div>
            </div>
          </section>
        )}

        {/* ==================================================== */}
        {/* SECTION 5: PRIVACY & DATA PROTECTION POLICY          */}
        {/* ==================================================== */}
        {(activeTab === 'all' || activeTab === 'privacy') && (
          <section id="privacy" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#030A91] flex items-center justify-center font-black">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  Privacy & Data Protection Policy
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Compliance with the Kenya Data Protection Act 2019
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>
                Naisiae Textiles Ltd is committed to respecting and protecting the personal data of students, parents, schools, and portal visitors.
              </p>

              <div className="space-y-3">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">1. Data We Collect</h4>
                  <p className="text-xs text-slate-600 pl-3">
                    We only collect information necessary to complete and fiscalize your orders: customer name, verified email (via Google Sign-In), delivery phone number, selected school institution, uniform sizing, and payment reference numbers.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">2. Purpose of Processing</h4>
                  <p className="text-xs text-slate-600 pl-3">
                    Your information is utilized solely for order fulfillment, official eTIMS tax invoicing, customer support, notification of garment readiness, and fraud prevention. We never sell, rent, or lease customer data to third-party marketing companies.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">3. Security & Cloud Infrastructure</h4>
                  <p className="text-xs text-slate-600 pl-3">
                    Customer orders and audit trails are secured using industry-standard TLS encryption and hardened Firebase Firestore role-based access controls (RBAC) ensuring unauthorized entities cannot access customer accounts or order histories.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Contact & Support Help Desk */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xs">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center justify-center md:justify-start gap-2">
              <HelpCircle className="w-5 h-5 text-[#030A91]" />
              Questions Concerning Our Policies or Terms?
            </h3>
            <p className="text-xs text-slate-600 max-w-xl">
              Our customer service and legal compliance desk is available Monday through Saturday (8:00 AM – 6:30 PM EAT) to address any inquiries.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="tel:+254792021496"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#030A91] hover:bg-blue-900 text-[#FACB00] font-black text-xs shadow-md transition-all active:scale-95"
            >
              <Phone className="w-4 h-4" />
              <span>+254 792 021 496</span>
            </a>
            <a
              href="/contact"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs shadow-xs transition-all active:scale-95"
            >
              <span>Contact Us Form</span>
            </a>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};
