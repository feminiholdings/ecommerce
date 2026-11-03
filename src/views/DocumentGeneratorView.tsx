import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../api';
import { Product, Customer, Invoice, Quotation, PaymentReceipt, StaffUserItem } from '../types';
import {
  FileSpreadsheet,
  FileCheck,
  Receipt,
  Mail,
  Send,
  Lock,
  Unlock,
  KeyRound,
  Printer,
  Search,
  Plus,
  Trash2,
  Clock,
  Store,
  CheckCircle2,
  AlertCircle,
  Building2,
  ArrowRight,
  RefreshCw,
  Sun,
  Moon,
  X,
  CreditCard,
  DollarSign,
  User,
  ExternalLink,
  ChevronRight,
  Download
} from 'lucide-react';
import { InvoicePreviewModal } from '../components/InvoicePreviewModal';
import { QuotationPreviewModal } from '../components/QuotationPreviewModal';
import { ReceiptModal } from '../components/ReceiptModal';

type DocType = 'INVOICE' | 'QUOTATION' | 'RECEIPT' | 'RECENT';

interface LineItemInput {
  id: string;
  productId?: string;
  variantId?: string;
  productName: string;
  sku: string;
  school?: string;
  size: string;
  color?: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  isVat16: boolean;
}

export const DocumentGeneratorView: React.FC = () => {
  const { user, loginWithPin, logout, activeBranchId, branches, switchBranch } = useAuth();
  const { notify } = useNotification();
  const { theme, toggleTheme } = useTheme();

  // PIN Lock & Authentication State
  const [isPinLocked, setIsPinLocked] = useState<boolean>(!user);
  const [staffList, setStaffList] = useState<StaffUserItem[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffUserItem | null>(null);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [isVerifyingPin, setIsVerifyingPin] = useState<boolean>(false);
  const [isPinShaking, setIsPinShaking] = useState<boolean>(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<DocType>('INVOICE');

  // Shared Data
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Form Fields
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [schoolOrOrg, setSchoolOrOrg] = useState<string>('');
  const [customerKraPin, setCustomerKraPin] = useState<string>('');
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [sendEmailImmediately, setSendEmailImmediately] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [validUntil, setValidUntil] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [paymentTerms, setPaymentTerms] = useState<string>('Valid for 30 days. Prices inclusive of 16% VAT.');
  const [targetBranchId, setTargetBranchId] = useState<string>(activeBranchId || 'branch-nbi-cbd');

  // Receipt Specific Form Fields
  const [receiptAmount, setReceiptAmount] = useState<number | ''>('');
  const [receiptPaymentMethod, setReceiptPaymentMethod] = useState<'CASH' | 'MPESA' | 'CARD' | 'BANK_TRANSFER'>('MPESA');
  const [receiptPaymentRef, setReceiptPaymentRef] = useState<string>('');

  // Line Items (for Invoices & Quotes)
  const [lineItems, setLineItems] = useState<LineItemInput[]>([
    {
      id: `item-${Date.now()}`,
      productName: '',
      sku: '',
      size: 'Standard',
      quantity: 1,
      unitPrice: 0,
      discountAmount: 0,
      isVat16: true,
    },
  ]);

  // Product Picker helper state
  const [productSearch, setProductSearch] = useState<string>('');

  // Submission State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedDoc, setGeneratedDoc] = useState<{
    type: 'INVOICE' | 'QUOTATION' | 'RECEIPT';
    data: any;
    emailSent: boolean;
    recipient: string;
  } | null>(null);

  // Preview Modals
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [previewQuotation, setPreviewQuotation] = useState<Quotation | null>(null);
  const [previewReceipt, setPreviewReceipt] = useState<PaymentReceipt | null>(null);

  // Recent Documents Tab State
  const [recentFilter, setRecentFilter] = useState<'ALL' | 'INVOICES' | 'QUOTATIONS' | 'RECEIPTS'>('ALL');
  const [recentSearch, setRecentSearch] = useState<string>('');
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [recentQuotes, setRecentQuotes] = useState<Quotation[]>([]);
  const [recentReceipts, setRecentReceipts] = useState<PaymentReceipt[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState<boolean>(false);

  // Quick Re-email Modal
  const [quickEmailModal, setQuickEmailModal] = useState<{
    isOpen: boolean;
    docType: 'INVOICE' | 'QUOTATION' | 'RECEIPT';
    docId: string;
    docNumber: string;
    defaultEmail: string;
  }>({
    isOpen: false,
    docType: 'INVOICE',
    docId: '',
    docNumber: '',
    defaultEmail: '',
  });
  const [quickEmailTarget, setQuickEmailTarget] = useState<string>('');
  const [isSendingQuickEmail, setIsSendingQuickEmail] = useState<boolean>(false);

  // Sync authentication changes
  useEffect(() => {
    if (user) {
      setIsPinLocked(false);
    }
  }, [user]);

  // Load Staff users for PIN login
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const staff = await api.getStaffUsers();
        setStaffList(staff);
        if (staff.length > 0 && !selectedStaff) {
          setSelectedStaff(staff[0]);
        }
      } catch (err) {
        console.warn('Could not load staff list:', err);
      }
    };
    fetchStaff();
  }, [selectedStaff]);

  // Load Products & Customers
  const loadReferenceData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [prods, custs] = await Promise.all([
        api.getProducts().catch(() => []),
        api.getCustomers().catch(() => []),
      ]);
      setProducts(prods || []);
      setCustomers(custs || []);
    } catch (err: any) {
      console.warn('Failed loading reference data:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (!isPinLocked) {
      loadReferenceData();
    }
  }, [isPinLocked, loadReferenceData]);

  // Load Recent Docs when tab is opened
  const loadRecentDocs = useCallback(async () => {
    setIsLoadingRecent(true);
    try {
      const [invs, quots, recs] = await Promise.all([
        api.getInvoices({ limit: '50' } as any).catch(() => []),
        api.getQuotations({ limit: '50' } as any).catch(() => []),
        api.getReceipts({ limit: 50 }).catch(() => []),
      ]);
      setRecentInvoices(invs || []);
      setRecentQuotes(quots || []);
      setRecentReceipts(recs || []);
    } catch (err) {
      console.warn('Failed loading recent docs:', err);
    } finally {
      setIsLoadingRecent(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'RECENT' && !isPinLocked) {
      loadRecentDocs();
    }
  }, [activeTab, isPinLocked, loadRecentDocs]);

  // PIN Login Submission
  const handlePinSubmit = useCallback(
    async (pinToSubmit?: string) => {
      const pin = pinToSubmit || enteredPin;
      if (!selectedStaff) {
        setPinError('Please select a cashier account');
        return;
      }
      if (pin.length !== 6) {
        setPinError('Please enter your full 6-digit station PIN');
        setIsPinShaking(true);
        setTimeout(() => setIsPinShaking(false), 500);
        return;
      }

      setIsVerifyingPin(true);
      setPinError('');

      try {
        await loginWithPin({ userId: selectedStaff.id, pin });
        setIsPinLocked(false);
        setEnteredPin('');
        notify({
          type: 'SUCCESS',
          title: 'Workstation Unlocked',
          message: `Authenticated as ${selectedStaff.name}. Ready to generate documents.`,
        });
      } catch (err: any) {
        setIsPinShaking(true);
        setTimeout(() => setIsPinShaking(false), 500);
        setPinError(err.message || 'Incorrect PIN entered. Please try again.');
        setEnteredPin('');
      } finally {
        setIsVerifyingPin(false);
      }
    },
    [enteredPin, selectedStaff, loginWithPin, notify]
  );

  // Keypad presses
  const handleKeypadPress = useCallback(
    (num: string) => {
      if (enteredPin.length < 6 && !isVerifyingPin) {
        const nextPin = enteredPin + num;
        setEnteredPin(nextPin);
        setPinError('');
        if (nextPin.length === 6) {
          setTimeout(() => handlePinSubmit(nextPin), 60);
        }
      }
    },
    [enteredPin, isVerifyingPin, handlePinSubmit]
  );

  const handleKeypadBackspace = () => {
    if (enteredPin.length > 0 && !isVerifyingPin) {
      setEnteredPin((prev) => prev.slice(0, -1));
      setPinError('');
    }
  };

  const handleKeypadClear = () => {
    if (!isVerifyingPin) {
      setEnteredPin('');
      setPinError('');
    }
  };

  // Keyboard events for PIN Pad
  useEffect(() => {
    if (!isPinLocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleKeypadPress(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleKeypadBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleKeypadClear();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (enteredPin.length === 6) {
          handlePinSubmit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPinLocked, enteredPin, handleKeypadPress, handlePinSubmit]);

  // Lock station back to PIN screen
  const handleLockStation = () => {
    setIsPinLocked(true);
    setEnteredPin('');
    setPinError('');
    notify({
      type: 'INFO',
      title: 'Station Locked',
      message: 'Document station secured. Enter PIN to unlock.',
    });
  };

  // Autocomplete Customer Selection
  const handleSelectCustomer = (cust: Customer) => {
    setCustomerName(cust.name);
    setCustomerEmail(cust.email || '');
    setCustomerPhone(cust.phone || '');
    setRecipientEmail(cust.email || '');
    if (cust.schoolOrOrg) setSchoolOrOrg(cust.schoolOrOrg);
    if (cust.kraPin) setCustomerKraPin(cust.kraPin);
  };

  // Line Item Management
  const handleAddLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productName: '',
        sku: '',
        size: 'Standard',
        quantity: 1,
        unitPrice: 0,
        discountAmount: 0,
        isVat16: true,
      },
    ]);
  };

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length <= 1) {
      notify({ type: 'WARNING', title: 'Action Denied', message: 'At least one line item is required' });
      return;
    }
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateLineItem = (id: string, field: keyof LineItemInput, val: any) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: val };
        }
        return item;
      })
    );
  };

  const handlePickProduct = (itemId: string, product: Product, variantIndex: number = 0) => {
    const variant = product.variants?.[variantIndex] || product.variants?.[0];
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            productId: product.id,
            variantId: variant?.id,
            productName: product.name,
            sku: variant?.sku || `SKU-${product.id}`,
            school: product.school,
            size: variant?.size || 'Standard',
            color: variant?.color || 'Standard',
            unitPrice: variant?.sellingPrice || 1000,
            isVat16: product.taxCategory === 'VAT_16',
          };
        }
        return item;
      })
    );
  };

  // Calculations for Invoices & Quotations
  const subtotalNet = lineItems.reduce((acc, it) => {
    const lineTotal = it.quantity * it.unitPrice - (it.discountAmount || 0);
    const tax = it.isVat16 ? lineTotal - lineTotal / 1.16 : 0;
    return acc + (lineTotal - tax);
  }, 0);

  const totalVat = lineItems.reduce((acc, it) => {
    const lineTotal = it.quantity * it.unitPrice - (it.discountAmount || 0);
    const tax = it.isVat16 ? lineTotal - lineTotal / 1.16 : 0;
    return acc + tax;
  }, 0);

  const totalDiscounts = lineItems.reduce((acc, it) => acc + (Number(it.discountAmount) || 0), 0);
  const grandTotal = subtotalNet + totalVat;

  // Clear Form for next document
  const handleResetForm = () => {
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setSchoolOrOrg('');
    setCustomerKraPin('');
    setRecipientEmail('');
    setNotes('');
    setReceiptAmount('');
    setReceiptPaymentRef('');
    setLineItems([
      {
        id: `item-${Date.now()}`,
        productName: '',
        sku: '',
        size: 'Standard',
        quantity: 1,
        unitPrice: 0,
        discountAmount: 0,
        isVat16: true,
      },
    ]);
    setGeneratedDoc(null);
  };

  // Document Generator Submission
  const handleSubmitDocument = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      notify({ type: 'WARNING', title: 'Missing Info', message: 'Customer name is required' });
      return;
    }

    const emailToSendTo = recipientEmail.trim() || customerEmail.trim();
    if (sendEmailImmediately && (!emailToSendTo || !emailToSendTo.includes('@'))) {
      notify({
        type: 'WARNING',
        title: 'Recipient Email Needed',
        message: 'Please provide a valid recipient email address to send the document immediately.',
      });
      return;
    }

    setIsGenerating(true);

    try {
      if (activeTab === 'INVOICE') {
        // Validate items
        const formattedItems = lineItems.map((it) => {
          const qty = Number(it.quantity) || 1;
          const price = Number(it.unitPrice) || 0;
          const disc = Number(it.discountAmount) || 0;
          const total = qty * price - disc;
          const tax = it.isVat16 ? Number((total - total / 1.16).toFixed(2)) : 0;
          return {
            productId: it.productId || `custom-${Date.now()}`,
            variantId: it.variantId || `var-${Date.now()}`,
            productName: it.productName || 'Uniform Garment',
            sku: it.sku || `SKU-CUST-${Date.now()}`,
            size: it.size || 'Standard',
            quantity: qty,
            unitPrice: price,
            discountAmount: disc,
            taxRate: it.isVat16 ? 0.16 : 0,
            taxAmount: tax,
            total,
          };
        });

        const createdInvoice = await api.createInvoice({
          branchId: targetBranchId,
          customerName: customerName.trim(),
          customerEmail: emailToSendTo || undefined,
          customerPhone: customerPhone.trim() || undefined,
          customerKraPin: customerKraPin.trim() || undefined,
          items: formattedItems,
          dueDate,
          paymentTerms,
          notes: notes.trim() || undefined,
        });

        let emailDispatched = false;
        if (sendEmailImmediately && emailToSendTo) {
          try {
            await api.emailInvoice(createdInvoice.id, emailToSendTo);
            emailDispatched = true;
          } catch (mailErr: any) {
            console.warn('Automatic email dispatch failed:', mailErr);
          }
        }

        setGeneratedDoc({
          type: 'INVOICE',
          data: createdInvoice,
          emailSent: emailDispatched,
          recipient: emailToSendTo,
        });

        notify({
          type: 'SUCCESS',
          title: 'Invoice Issued',
          message: `Tax Invoice ${createdInvoice.invoiceNumber} created successfully! ${
            emailDispatched ? `Sent to ${emailToSendTo}` : ''
          }`,
        });
      } else if (activeTab === 'QUOTATION') {
        const formattedItems = lineItems.map((it) => {
          const qty = Number(it.quantity) || 1;
          const price = Number(it.unitPrice) || 0;
          const disc = Number(it.discountAmount) || 0;
          const total = qty * price - disc;
          const tax = it.isVat16 ? Number((total - total / 1.16).toFixed(2)) : 0;
          return {
            productId: it.productId || `custom-${Date.now()}`,
            variantId: it.variantId || `var-${Date.now()}`,
            productName: it.productName || 'Uniform Garment',
            sku: it.sku || `SKU-CUST-${Date.now()}`,
            size: it.size || 'Standard',
            quantity: qty,
            unitPrice: price,
            discountAmount: disc,
            taxRate: it.isVat16 ? 0.16 : 0,
            taxAmount: tax,
            total,
          };
        });

        const createdQuotation = await api.createQuotation({
          branchId: targetBranchId,
          customerName: customerName.trim(),
          customerEmail: emailToSendTo || undefined,
          customerPhone: customerPhone.trim() || undefined,
          schoolOrOrg: schoolOrOrg.trim() || undefined,
          items: formattedItems,
          validUntil,
          terms: paymentTerms,
          notes: notes.trim() || undefined,
        });

        let emailDispatched = false;
        if (sendEmailImmediately && emailToSendTo) {
          try {
            await api.emailQuotation(createdQuotation.id, emailToSendTo);
            emailDispatched = true;
          } catch (mailErr: any) {
            console.warn('Automatic email dispatch failed:', mailErr);
          }
        }

        setGeneratedDoc({
          type: 'QUOTATION',
          data: createdQuotation,
          emailSent: emailDispatched,
          recipient: emailToSendTo,
        });

        notify({
          type: 'SUCCESS',
          title: 'Quotation Generated',
          message: `Official Quotation ${createdQuotation.quotationNumber} ready. ${
            emailDispatched ? `Dispatched to ${emailToSendTo}` : ''
          }`,
        });
      } else if (activeTab === 'RECEIPT') {
        const amt = Number(receiptAmount);
        if (!amt || amt <= 0) {
          notify({ type: 'WARNING', title: 'Invalid Amount', message: 'Please enter a valid payment amount' });
          setIsGenerating(false);
          return;
        }

        const { receipt: createdReceipt } = await api.createReceipt({
          branchId: targetBranchId,
          customerName: customerName.trim(),
          customerEmail: emailToSendTo || undefined,
          customerPhone: customerPhone.trim() || undefined,
          amount: amt,
          paymentMethod: receiptPaymentMethod,
          paymentReference: receiptPaymentRef.trim() || undefined,
          notes: notes.trim() || undefined,
          items: lineItems.filter((i) => i.productName.trim().length > 0),
        });

        let emailDispatched = false;
        if (sendEmailImmediately && emailToSendTo) {
          try {
            await api.emailReceipt(createdReceipt.id, emailToSendTo);
            emailDispatched = true;
          } catch (mailErr: any) {
            console.warn('Automatic email dispatch failed:', mailErr);
          }
        }

        setGeneratedDoc({
          type: 'RECEIPT',
          data: createdReceipt,
          emailSent: emailDispatched,
          recipient: emailToSendTo,
        });

        notify({
          type: 'SUCCESS',
          title: 'Payment Receipt Created',
          message: `Receipt ${createdReceipt.receiptNumber} fiscalized! ${
            emailDispatched ? `Delivered to ${emailToSendTo}` : ''
          }`,
        });
      }
    } catch (err: any) {
      notify({
        type: 'ERROR',
        title: 'Generation Failed',
        message: err.message || 'Could not generate document. Please check connection.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Quick Re-email Handler for Existing Documents
  const handleTriggerQuickEmail = async () => {
    if (!quickEmailTarget || !quickEmailTarget.includes('@')) {
      notify({ type: 'WARNING', title: 'Invalid Email', message: 'Please enter a valid email address' });
      return;
    }
    setIsSendingQuickEmail(true);
    try {
      if (quickEmailModal.docType === 'INVOICE') {
        await api.emailInvoice(quickEmailModal.docId, quickEmailTarget);
      } else if (quickEmailModal.docType === 'QUOTATION') {
        await api.emailQuotation(quickEmailModal.docId, quickEmailTarget);
      } else if (quickEmailModal.docType === 'RECEIPT') {
        await api.emailReceipt(quickEmailModal.docId, quickEmailTarget);
      }
      notify({
        type: 'SUCCESS',
        title: 'Email Sent',
        message: `${quickEmailModal.docType} ${quickEmailModal.docNumber} sent to ${quickEmailTarget}`,
      });
      setQuickEmailModal({ isOpen: false, docType: 'INVOICE', docId: '', docNumber: '', defaultEmail: '' });
      setQuickEmailTarget('');
    } catch (err: any) {
      notify({ type: 'ERROR', title: 'Email Dispatch Failed', message: err.message || 'Error sending email' });
    } finally {
      setIsSendingQuickEmail(false);
    }
  };

  // ==========================================
  // VIEW 1: PIN AUTHENTICATION GATE SCREEN
  // ==========================================
  if (isPinLocked) {
    return (
      <div className="min-h-screen bg-[#F4F4F4] dark:bg-slate-950 flex flex-col justify-between select-none">
        {/* Top Header */}
        <div className="w-full bg-gradient-to-r from-[#02066F] via-[#030A91] to-[#0412B3] text-white py-5 px-4 shadow-md">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src="https://plain-eeur-prod-public.komododecks.com/202605/07/1sm3ITZIdJmYjyTcxmiP/image.png"
                alt="Naisia Logo"
                className="w-10 h-10 object-contain drop-shadow"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.png';
                }}
              />
              <div>
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-white leading-none">
                  Naisiae Document & Billing Hub
                </h1>
                <p className="text-[10px] sm:text-xs text-[#FACB00] font-bold tracking-wider uppercase mt-0.5">
                  Secure Independent Billing & Direct Email Station
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-[#FACB00]" /> : <Moon className="w-4 h-4" />}
              </button>
              <a
                href="/"
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
              >
                Exit to Home
              </a>
            </div>
          </div>
        </div>

        {/* PIN Entry Terminal Box */}
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div
            className={`max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-transform ${
              isPinShaking ? 'animate-shake' : ''
            }`}
          >
            {/* Terminal Header */}
            <div className="p-4 bg-[#030A91] text-white flex items-center justify-between shadow-inner">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-[#FACB00]" />
                <span className="font-black text-xs uppercase tracking-wider">Document Station Locked</span>
              </div>
              <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-blue-100">
                PIN REQUIRED
              </span>
            </div>

            <div className="p-6">
              {/* Staff / Admin Selector */}
              <div className="mb-4">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                  Select Administrator or Staff Profile:
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                  {staffList.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSelectedStaff(s);
                        setEnteredPin('');
                        setPinError('');
                      }}
                      className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all cursor-pointer ${
                        selectedStaff?.id === s.id
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-[#030A91] text-[#030A91] dark:text-[#FACB00] shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#030A91] text-[#FACB00] flex items-center justify-center font-bold text-xs shrink-0">
                        {s.name.slice(0, 1)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold truncate leading-tight">{s.name}</p>
                        <p className="text-[9px] text-slate-400 truncate">{s.branchName}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Profile Info */}
              {selectedStaff && (
                <div className="text-center mb-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Signing in as <strong className="text-slate-900 dark:text-white">{selectedStaff.name}</strong>
                  </p>
                </div>
              )}

              {/* 6-Digit PIN Display Dots */}
              <div className="flex items-center justify-center space-x-3 mb-5">
                {[0, 1, 2, 3, 4, 5].map((index) => {
                  const isFilled = enteredPin.length > index;
                  return (
                    <div
                      key={index}
                      className={`w-4 h-4 rounded-full transition-all duration-150 ${
                        isFilled
                          ? 'bg-[#030A91] dark:bg-[#FACB00] scale-125 shadow-sm'
                          : 'bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700'
                      }`}
                    />
                  );
                })}
              </div>

              {pinError && (
                <div className="mb-4 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-center space-x-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto mb-4">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeypadPress(digit)}
                    disabled={isVerifyingPin}
                    className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 text-slate-900 dark:text-white text-xl font-black border border-slate-200 dark:border-slate-700 shadow-2xs transition-all flex items-center justify-center cursor-pointer"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleKeypadClear}
                  disabled={isVerifyingPin}
                  className="h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-600 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center cursor-pointer uppercase"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  disabled={isVerifyingPin}
                  className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 text-slate-900 dark:text-white text-xl font-black border border-slate-200 dark:border-slate-700 shadow-2xs transition-all flex items-center justify-center cursor-pointer"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleKeypadBackspace}
                  disabled={isVerifyingPin}
                  className="h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-600 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center cursor-pointer"
                >
                  ⌫ Del
                </button>
              </div>

              {/* Submit unlock button */}
              <button
                type="button"
                onClick={() => handlePinSubmit()}
                disabled={isVerifyingPin || enteredPin.length !== 6}
                className="w-full py-3.5 rounded-2xl bg-[#030A91] hover:bg-blue-900 text-white font-black text-sm transition-all shadow-md active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2"
              >
                {isVerifyingPin ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#FACB00]" />
                    <span>Verifying Station PIN...</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4 text-[#FACB00]" />
                    <span>Unlock Document Hub</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="py-4 text-center text-xs text-slate-400">
          Naisia Textiles Ltd • Station Secured with 6-Digit PIN Encryption
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: UNLOCKED DOCUMENT HUB WORKSTATION
  // ==========================================
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Workstation Header */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-[#02066F] via-[#030A91] to-[#0412B3] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Brand info */}
          <div className="flex items-center space-x-3">
            <img
              src="https://plain-eeur-prod-public.komododecks.com/202605/07/1sm3ITZIdJmYjyTcxmiP/image.png"
              alt="Logo"
              className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.png';
              }}
            />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-xl font-black text-white leading-none">
                  Document & Billing Hub
                </h1>
                <span className="bg-[#FACB00] text-[#030A91] text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  PIN Unlocked
                </span>
              </div>
              <p className="text-[11px] text-blue-200 mt-0.5 font-medium">
                Issue Invoices, Quotations & Receipts • Instant Email Dispatch
              </p>
            </div>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Cashier Badge */}
            <div className="bg-white/10 border border-white/15 px-3 py-1.5 rounded-xl text-xs flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-[#FACB00] text-[#030A91] font-black text-[10px] flex items-center justify-center">
                {user?.name?.slice(0, 1) || 'S'}
              </div>
              <span className="font-bold text-white text-xs truncate max-w-[130px]">{user?.name || 'Staff'}</span>
            </div>

            {/* Branch Selector */}
            <select
              value={targetBranchId}
              onChange={(e) => {
                setTargetBranchId(e.target.value);
                switchBranch(e.target.value);
              }}
              className="bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id} className="text-slate-900 bg-white">
                  {b.name}
                </option>
              ))}
            </select>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-[#FACB00]" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Lock Station Button */}
            <button
              onClick={handleLockStation}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-100 hover:text-white border border-rose-300/30 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Lock Terminal"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock PIN</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('INVOICE')}
            className={`flex-1 min-w-[130px] py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'INVOICE'
                ? 'bg-[#030A91] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-[#FACB00]" />
            <span>1. Tax Invoice</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('QUOTATION')}
            className={`flex-1 min-w-[130px] py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'QUOTATION'
                ? 'bg-[#030A91] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileCheck className="w-4 h-4 text-[#FACB00]" />
            <span>2. Quotation / Estimate</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('RECEIPT')}
            className={`flex-1 min-w-[130px] py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'RECEIPT'
                ? 'bg-[#030A91] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Receipt className="w-4 h-4 text-[#FACB00]" />
            <span>3. Payment Receipt</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('RECENT')}
            className={`flex-1 min-w-[130px] py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'RECENT'
                ? 'bg-[#030A91] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4 text-[#FACB00]" />
            <span>4. Recent Docs & Re-Email</span>
          </button>
        </div>

        {/* Success Banner after Generation */}
        {generatedDoc && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-800 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm sm:text-base font-black text-emerald-900 dark:text-emerald-200">
                  {generatedDoc.type} Generated Successfully!
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                  Reference:{' '}
                  <strong>
                    {generatedDoc.data.invoiceNumber ||
                      generatedDoc.data.quotationNumber ||
                      generatedDoc.data.receiptNumber}
                  </strong>{' '}
                  • Customer: <strong>{generatedDoc.data.customerName}</strong>
                </p>
                {generatedDoc.emailSent ? (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                    Converted to official PDF & delivered to: <span className="underline ml-1">{generatedDoc.recipient}</span>
                  </p>
                ) : (
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                    Document saved. Click below to download the official PDF, view/print, or email to a recipient.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <a
                href={
                  generatedDoc.type === 'INVOICE'
                    ? `/api/invoices/${generatedDoc.data.id}/pdf`
                    : generatedDoc.type === 'QUOTATION'
                    ? `/api/quotations/${generatedDoc.data.id}/pdf`
                    : `/api/receipts/${generatedDoc.data.id}/pdf`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  if (generatedDoc.type === 'INVOICE') setPreviewInvoice(generatedDoc.data);
                  if (generatedDoc.type === 'QUOTATION') setPreviewQuotation(generatedDoc.data);
                  if (generatedDoc.type === 'RECEIPT') setPreviewReceipt(generatedDoc.data);
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>View / Print Document</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setQuickEmailModal({
                    isOpen: true,
                    docType: generatedDoc.type,
                    docId: generatedDoc.data.id,
                    docNumber:
                      generatedDoc.data.invoiceNumber ||
                      generatedDoc.data.quotationNumber ||
                      generatedDoc.data.receiptNumber,
                    defaultEmail: generatedDoc.recipient,
                  });
                  setQuickEmailTarget(generatedDoc.recipient || '');
                }}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 font-bold text-xs flex items-center space-x-1.5 hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email (PDF Attached)</span>
              </button>

              <button
                type="button"
                onClick={handleResetForm}
                className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-300 transition-colors cursor-pointer"
              >
                Create Another
              </button>
            </div>
          </div>
        )}

        {/* TAB 1, 2, 3: DOCUMENT GENERATOR FORM */}
        {activeTab !== 'RECENT' && (
          <form onSubmit={handleSubmitDocument} className="space-y-6">
            {/* Customer & Destination Email Section */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#030A91] dark:text-[#FACB00] flex items-center justify-center font-bold">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      1. Customer & Direct Email Recipient
                    </h2>
                    <p className="text-[11px] text-slate-500">Who is this document for, and where should it be delivered?</p>
                  </div>
                </div>

                {/* Quick Select from existing customer database */}
                {customers.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold text-slate-500">Pick Existing:</span>
                    <select
                      onChange={(e) => {
                        const found = customers.find((c) => c.id === e.target.value);
                        if (found) handleSelectCustomer(found);
                      }}
                      defaultValue=""
                      className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
                    >
                      <option value="" disabled>
                        Choose registered customer/school...
                      </option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.schoolOrOrg ? `(${c.schoolOrOrg})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Customer / Organization Name: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Nairobi School, Dr. Kamau, or Parent Name"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#030A91]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Send Document Directly to Email: <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => {
                        setRecipientEmail(e.target.value);
                        setCustomerEmail(e.target.value);
                      }}
                      placeholder="e.g. bursar@nairobischool.ac.ke"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#030A91]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Phone Number (M-Pesa / SMS):
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 0722123456"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#030A91]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    School / Campus / Institution:
                  </label>
                  <input
                    type="text"
                    value={schoolOrOrg}
                    onChange={(e) => setSchoolOrOrg(e.target.value)}
                    placeholder="e.g. Kenya Medical Training College"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#030A91]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Customer KRA PIN (Optional eTIMS):
                  </label>
                  <input
                    type="text"
                    value={customerKraPin}
                    onChange={(e) => setCustomerKraPin(e.target.value.toUpperCase())}
                    placeholder="e.g. P051234567Z"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-medium focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#030A91]"
                  />
                </div>

                {activeTab === 'INVOICE' && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Invoice Due Date:
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#030A91]"
                    />
                  </div>
                )}

                {activeTab === 'QUOTATION' && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Quote Validity Date:
                    </label>
                    <input
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#030A91]"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* RECEIPT SPECIFIC PAYMENT DETAILS */}
            {activeTab === 'RECEIPT' && (
              <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      2. Payment Amount & Tender Details
                    </h2>
                    <p className="text-[11px] text-slate-500">Record cash, M-Pesa, card, or bank transfer details</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Amount Paid (KES): <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">KES</span>
                      <input
                        type="number"
                        min="1"
                        required
                        value={receiptAmount}
                        onChange={(e) => setReceiptAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="e.g. 4500"
                        className="w-full pl-12 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-black font-mono text-[#030A91] dark:text-[#FACB00] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#030A91]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Payment Method:
                    </label>
                    <select
                      value={receiptPaymentMethod}
                      onChange={(e) => setReceiptPaymentMethod(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
                    >
                      <option value="MPESA">M-Pesa Mobile Money</option>
                      <option value="CASH">Cash Over The Counter</option>
                      <option value="BANK_TRANSFER">Bank EFT / RTGS Transfer</option>
                      <option value="CARD">Debit / Credit Card</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Transaction / Reference Number:
                    </label>
                    <input
                      type="text"
                      value={receiptPaymentRef}
                      onChange={(e) => setReceiptPaymentRef(e.target.value.toUpperCase())}
                      placeholder="e.g. QHA782190B or Cheque #102"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#030A91]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* LINE ITEMS SECTION (FOR ALL OR ITEMIZED RECEIPTS) */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      {activeTab === 'RECEIPT' ? '3. Optional Line Items & Breakdown' : '2. Items & Pricing Breakdown'}
                    </h2>
                    <p className="text-[11px] text-slate-500">Pick catalog items or type custom description</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="px-3 py-1.5 rounded-xl bg-[#030A91] hover:bg-blue-900 text-white font-bold text-xs flex items-center space-x-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item Row</span>
                  </button>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-3">
                {lineItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                        Item #{idx + 1}
                      </span>
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(item.id)}
                          className="text-rose-500 hover:text-rose-700 text-xs font-bold flex items-center space-x-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
                      {/* Pick from Products */}
                      <div className="md:col-span-2">
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                          Pick Catalog Product or Type Custom:
                        </label>
                        <div className="space-y-1">
                          <select
                            onChange={(e) => {
                              const prod = products.find((p) => p.id === e.target.value);
                              if (prod) handlePickProduct(item.id, prod);
                            }}
                            defaultValue=""
                            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                          >
                            <option value="" disabled>
                              Select from uniform catalogue...
                            </option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.school})
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={item.productName}
                            onChange={(e) => handleUpdateLineItem(item.id, 'productName', e.target.value)}
                            placeholder="Item description (e.g. Nairobi School Blazer)"
                            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                          />
                        </div>
                      </div>

                      {/* Size Variant */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                          Size:
                        </label>
                        <input
                          type="text"
                          value={item.size}
                          onChange={(e) => handleUpdateLineItem(item.id, 'size', e.target.value)}
                          placeholder="e.g. 28, 32, M"
                          className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                        />
                      </div>

                      {/* Quantity */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                          Qty:
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateLineItem(item.id, 'quantity', Math.max(1, Number(e.target.value)))}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold font-mono"
                        />
                      </div>

                      {/* Unit Price */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                          Unit Price (KES):
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateLineItem(item.id, 'unitPrice', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black font-mono text-[#030A91] dark:text-[#FACB00]"
                        />
                      </div>

                      {/* Line Total & VAT Toggle */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                          Line Total:
                        </label>
                        <div className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-black font-mono text-[#030A91] dark:text-[#FACB00]">
                          KES {((item.quantity * item.unitPrice) - (item.discountAmount || 0)).toLocaleString()}
                        </div>
                        <div className="mt-1 flex items-center space-x-1.5">
                          <input
                            type="checkbox"
                            id={`vat-${item.id}`}
                            checked={item.isVat16}
                            onChange={(e) => handleUpdateLineItem(item.id, 'isVat16', e.target.checked)}
                            className="rounded text-[#030A91]"
                          />
                          <label htmlFor={`vat-${item.id}`} className="text-[10px] text-slate-500 font-bold">
                            16% VAT
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals Summary (For Invoices & Quotes) */}
              {activeTab !== 'RECEIPT' && (
                <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                    <p>Subtotal (Excl. VAT): <strong>KES {subtotalNet.toLocaleString()}</strong></p>
                    <p>VAT (16% Standard): <strong>KES {totalVat.toLocaleString()}</strong></p>
                    {totalDiscounts > 0 && <p className="text-emerald-600">Total Discounts: -KES {totalDiscounts.toLocaleString()}</p>}
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Amount Due</span>
                    <span className="text-2xl font-black text-[#030A91] dark:text-[#FACB00] font-mono">
                      KES {grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* NOTES & TERMS */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Additional Notes / Payment Instructions:
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="e.g. M-Pesa Paybill: 522522, Account: Student Name. Goods once sold can be exchanged within 7 days."
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
              />
            </div>

            {/* EMAIL DISPATCH SETTING & SUBMISSION BAR */}
            <div className="bg-gradient-to-r from-blue-900 via-[#030A91] to-[#0412B3] text-white p-5 sm:p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-[#FACB00]" />
                  <span className="font-black text-sm sm:text-base text-white">Direct Email Dispatch</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-blue-100">
                  <input
                    type="checkbox"
                    id="auto-email"
                    checked={sendEmailImmediately}
                    onChange={(e) => setSendEmailImmediately(e.target.checked)}
                    className="w-4 h-4 rounded text-[#FACB00] focus:ring-0"
                  />
                  <label htmlFor="auto-email" className="font-semibold cursor-pointer">
                    Deliver official copy directly to{' '}
                    <strong className="text-white underline">{recipientEmail || customerEmail || 'recipient email'}</strong> upon generation
                  </label>
                </div>
              </div>

              <div className="flex items-center flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Reset Form
                </button>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-6 py-3.5 rounded-2xl bg-[#FACB00] hover:bg-yellow-400 text-[#030A91] font-black text-sm flex items-center space-x-2 shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#030A91]" />
                      <span>Generating & Fiscalizing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#030A91]" />
                      <span>
                        Generate & {sendEmailImmediately ? 'Send to Email' : 'Save Document'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 4: RECENT DOCUMENTS & RE-EMAIL HUB */}
        {activeTab === 'RECENT' && (
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-[#030A91] dark:text-[#FACB00]" />
                  <span>Recent Invoices, Quotations & Receipts</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Quickly view, reprint, or send any previously issued document to an email address
                </p>
              </div>

              <button
                type="button"
                onClick={loadRecentDocs}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5 self-start cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh List</span>
              </button>
            </div>

            {/* Filter buttons & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setRecentFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    recentFilter === 'ALL' ? 'bg-white dark:bg-slate-900 text-[#030A91] dark:text-[#FACB00] shadow-xs' : 'text-slate-500'
                  }`}
                >
                  All ({recentInvoices.length + recentQuotes.length + recentReceipts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRecentFilter('INVOICES')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    recentFilter === 'INVOICES' ? 'bg-white dark:bg-slate-900 text-[#030A91] dark:text-[#FACB00] shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Invoices ({recentInvoices.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRecentFilter('QUOTATIONS')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    recentFilter === 'QUOTATIONS' ? 'bg-white dark:bg-slate-900 text-[#030A91] dark:text-[#FACB00] shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Quotes ({recentQuotes.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRecentFilter('RECEIPTS')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    recentFilter === 'RECEIPTS' ? 'bg-white dark:bg-slate-900 text-[#030A91] dark:text-[#FACB00] shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Receipts ({recentReceipts.length})
                </button>
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={recentSearch}
                  onChange={(e) => setRecentSearch(e.target.value)}
                  placeholder="Search customer, number, email..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Documents List */}
            {isLoadingRecent ? (
              <div className="p-12 text-center text-slate-400 text-xs animate-pulse">
                Loading recent billing documents...
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {/* INVOICES */}
                {(recentFilter === 'ALL' || recentFilter === 'INVOICES') &&
                  recentInvoices
                    .filter((inv) => {
                      const q = recentSearch.toLowerCase();
                      return (
                        !q ||
                        inv.invoiceNumber.toLowerCase().includes(q) ||
                        inv.customerName.toLowerCase().includes(q) ||
                        (inv.customerEmail && inv.customerEmail.toLowerCase().includes(q))
                      );
                    })
                    .map((inv) => (
                      <div
                        key={inv.id}
                        className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-[#030A91] bg-white dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#030A91] dark:text-[#FACB00] flex items-center justify-center shrink-0">
                            <FileSpreadsheet className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-black text-xs text-slate-900 dark:text-white">
                                {inv.invoiceNumber}
                              </span>
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                                Invoice
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(inv.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                              {inv.customerName} {inv.customerEmail ? `(${inv.customerEmail})` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end space-x-3">
                          <span className="font-mono font-black text-sm text-[#030A91] dark:text-[#FACB00]">
                            KES {inv.totalAmount.toLocaleString()}
                          </span>

                          <div className="flex items-center space-x-1.5">
                            <a
                              href={`/api/invoices/${inv.id}/pdf`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900 text-red-700 dark:text-red-300 text-xs font-bold flex items-center space-x-1 cursor-pointer"
                              title="Download Official PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>PDF</span>
                            </a>

                            <button
                              type="button"
                              onClick={() => setPreviewInvoice(inv)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-xs font-bold flex items-center space-x-1 cursor-pointer"
                              title="Print / View"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setQuickEmailModal({
                                  isOpen: true,
                                  docType: 'INVOICE',
                                  docId: inv.id,
                                  docNumber: inv.invoiceNumber,
                                  defaultEmail: inv.customerEmail || '',
                                });
                                setQuickEmailTarget(inv.customerEmail || '');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-[#030A91] hover:bg-blue-900 text-white text-xs font-bold flex items-center space-x-1 cursor-pointer"
                              title="Send Email"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>Email</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                {/* QUOTATIONS */}
                {(recentFilter === 'ALL' || recentFilter === 'QUOTATIONS') &&
                  recentQuotes
                    .filter((q) => {
                      const query = recentSearch.toLowerCase();
                      return (
                        !query ||
                        q.quotationNumber.toLowerCase().includes(query) ||
                        q.customerName.toLowerCase().includes(query) ||
                        (q.customerEmail && q.customerEmail.toLowerCase().includes(query))
                      );
                    })
                    .map((q) => (
                      <div
                        key={q.id}
                        className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-[#030A91] bg-white dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-400 flex items-center justify-center shrink-0">
                            <FileCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-black text-xs text-slate-900 dark:text-white">
                                {q.quotationNumber}
                              </span>
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                                Quote
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(q.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                              {q.customerName} {q.schoolOrOrg ? `• ${q.schoolOrOrg}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end space-x-3">
                          <span className="font-mono font-black text-sm text-[#030A91] dark:text-[#FACB00]">
                            KES {q.totalAmount.toLocaleString()}
                          </span>

                          <div className="flex items-center space-x-1.5">
                            <a
                              href={`/api/quotations/${q.id}/pdf`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900 text-red-700 dark:text-red-300 text-xs font-bold flex items-center space-x-1 cursor-pointer"
                              title="Download Official PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>PDF</span>
                            </a>

                            <button
                              type="button"
                              onClick={() => setPreviewQuotation(q)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-xs font-bold flex items-center space-x-1 cursor-pointer"
                              title="Print / View"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setQuickEmailModal({
                                  isOpen: true,
                                  docType: 'QUOTATION',
                                  docId: q.id,
                                  docNumber: q.quotationNumber,
                                  defaultEmail: q.customerEmail || '',
                                });
                                setQuickEmailTarget(q.customerEmail || '');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-[#030A91] hover:bg-blue-900 text-white text-xs font-bold flex items-center space-x-1 cursor-pointer"
                              title="Send Email"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>Email</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                {/* RECEIPTS */}
                {(recentFilter === 'ALL' || recentFilter === 'RECEIPTS') &&
                  recentReceipts
                    .filter((r) => {
                      const query = recentSearch.toLowerCase();
                      return (
                        !query ||
                        r.receiptNumber.toLowerCase().includes(query) ||
                        r.customerName.toLowerCase().includes(query) ||
                        (r.paymentReference && r.paymentReference.toLowerCase().includes(query))
                      );
                    })
                    .map((r) => (
                      <div
                        key={r.id}
                        className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-[#030A91] bg-white dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <Receipt className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-black text-xs text-slate-900 dark:text-white">
                                {r.receiptNumber}
                              </span>
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                Receipt
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(r.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                              {r.customerName} • {r.paymentMethod} ({r.paymentReference || 'N/A'})
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end space-x-3">
                          <span className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">
                            KES {r.amount.toLocaleString()}
                          </span>

                          <div className="flex items-center space-x-1.5">
                            <a
                              href={`/api/receipts/${r.id}/pdf`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900 text-red-700 dark:text-red-300 text-xs font-bold flex items-center space-x-1 cursor-pointer"
                              title="Download Official PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>PDF</span>
                            </a>

                            <button
                              type="button"
                              onClick={() => setPreviewReceipt(r)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-xs font-bold flex items-center space-x-1 cursor-pointer"
                              title="Print / View"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setQuickEmailModal({
                                  isOpen: true,
                                  docType: 'RECEIPT',
                                  docId: r.id,
                                  docNumber: r.receiptNumber,
                                  defaultEmail: '',
                                });
                                setQuickEmailTarget('');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-[#030A91] hover:bg-blue-900 text-white text-xs font-bold flex items-center space-x-1 cursor-pointer"
                              title="Send Email"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>Email</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* QUICK RE-EMAIL POPUP MODAL */}
      {quickEmailModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-[#030A91] dark:text-[#FACB00]" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Send {quickEmailModal.docType} by Email
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQuickEmailModal({ isOpen: false, docType: 'INVOICE', docId: '', docNumber: '', defaultEmail: '' })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Converts <strong>{quickEmailModal.docNumber}</strong> to an official high-resolution PDF and dispatches it directly as an email attachment with KRA eTIMS fiscal verification:
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Recipient Email Address:
              </label>
              <input
                type="email"
                value={quickEmailTarget}
                onChange={(e) => setQuickEmailTarget(e.target.value)}
                placeholder="e.g. principal@school.com"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#030A91]"
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setQuickEmailModal({ isOpen: false, docType: 'INVOICE', docId: '', docNumber: '', defaultEmail: '' })}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSendingQuickEmail || !quickEmailTarget.includes('@')}
                onClick={handleTriggerQuickEmail}
                className="flex-1 py-2.5 rounded-xl bg-[#030A91] hover:bg-blue-900 text-white text-xs font-black shadow-md flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isSendingQuickEmail ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FACB00]" />
                    <span>Compiling PDF & Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-[#FACB00]" />
                    <span>Send PDF Attachment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODALS */}
      <InvoicePreviewModal
        invoice={previewInvoice}
        isOpen={Boolean(previewInvoice)}
        onClose={() => setPreviewInvoice(null)}
      />

      <QuotationPreviewModal
        quotation={previewQuotation}
        isOpen={Boolean(previewQuotation)}
        onClose={() => setPreviewQuotation(null)}
      />

      <ReceiptModal
        receipt={previewReceipt}
        isOpen={Boolean(previewReceipt)}
        onClose={() => setPreviewReceipt(null)}
      />
    </div>
  );
};
