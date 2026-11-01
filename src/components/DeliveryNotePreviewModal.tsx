import React, { useState } from 'react';
import { DeliveryNote } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Printer,
  X,
  Truck,
  CheckCircle2,
  Building,
  UserCheck,
  Calendar,
  FileSpreadsheet,
  FileCheck,
  MapPin,
  Phone,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { api } from '../api';
import { useNotification } from '../context/NotificationContext';

interface DeliveryNotePreviewModalProps {
  deliveryNote: DeliveryNote | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated?: (updatedNote: DeliveryNote) => void;
}

export const DeliveryNotePreviewModal: React.FC<DeliveryNotePreviewModalProps> = ({
  deliveryNote,
  isOpen,
  onClose,
  onStatusUpdated,
}) => {
  const { notify } = useNotification();
  const { user } = useAuth();

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showMarkDeliveredModal, setShowMarkDeliveredModal] = useState(false);
  const [receiverName, setReceiverName] = useState('');
  const [receiverTitle, setReceiverTitle] = useState('School Storekeeper / Bursar');
  const [receiverNotes, setReceiverNotes] = useState('All packages received intact and inspected.');

  if (!isOpen || !deliveryNote) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleMarkDelivered = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverName.trim()) {
      notify({ type: 'WARNING', title: 'Required', message: 'Please provide receiver name' });
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const res = await api.updateDeliveryNoteStatus(deliveryNote.id, {
        status: 'DELIVERED',
        receivedBy: receiverName.trim(),
        receivedByTitle: receiverTitle.trim(),
        receiverSignatureNote: receiverNotes.trim(),
      });
      notify({
        type: 'SUCCESS',
        title: 'Delivery Confirmed',
        message: `Delivery Note ${deliveryNote.deliveryNoteNumber} marked as DELIVERED to ${receiverName.trim()}`,
      });
      setShowMarkDeliveredModal(false);
      if (onStatusUpdated && res.deliveryNote) {
        onStatusUpdated(res.deliveryNote);
      }
    } catch (err: any) {
      notify({ type: 'ERROR', title: 'Update Failed', message: err.message || 'Could not update status' });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> DELIVERED
          </span>
        );
      case 'IN_TRANSIT':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-xs">
            <Truck className="w-3.5 h-3.5 mr-1 text-amber-600 animate-pulse" /> IN TRANSIT
          </span>
        );
      case 'DISPATCHED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 shadow-xs">
            <Clock className="w-3.5 h-3.5 mr-1 text-blue-600" /> DISPATCHED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300 shadow-xs">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200/80 flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Bar (Hidden on Print) */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between no-print print:hidden shrink-0 shadow-xs">
          <div className="flex items-center space-x-3">
            <img
              src="https://plain-eeur-prod-public.komododecks.com/202605/07/1sm3ITZIdJmYjyTcxmiP/image.png"
              alt="Naisia Textiles Logo"
              className="w-8 h-8 object-contain shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.png';
              }}
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                  Official Delivery Note / Waybill
                </span>
                {getStatusBadge(deliveryNote.status)}
              </div>
              <span className="font-mono text-[11px] text-slate-500">
                {deliveryNote.deliveryNoteNumber} • Branch: {deliveryNote.branchName}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {deliveryNote.status !== 'DELIVERED' && (
              <button
                type="button"
                onClick={() => setShowMarkDeliveredModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md inline-flex items-center"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-white" />
                <span>Mark as Received</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-[#030A91] hover:bg-blue-900 text-white text-xs font-bold transition-all shadow-md inline-flex items-center"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5 text-[#FACB00]" />
              <span>Print Waybill</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Delivery Note Document */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 text-xs text-slate-800 bg-white">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
            <div className="flex items-start space-x-3.5">
              <img
                src="https://plain-eeur-prod-public.komododecks.com/202605/07/1sm3ITZIdJmYjyTcxmiP/image.png"
                alt="Naisia Textiles Logo"
                className="w-16 h-16 object-contain shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.png';
                }}
              />
              <div>
                <h1 className="text-xl font-black text-[#030A91] tracking-tight">
                  NAISIA TEXTILES LTD
                </h1>
                <p className="text-[11px] text-slate-700 font-bold uppercase tracking-wider">
                  School & Institutional Uniform Manufacturers
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Uhuru Market, Jogoo Road • P.O. Box 48291 - 00100 GPO Nairobi
                </p>
                <p className="text-[10px] text-slate-500">
                  Tel: 0792021496 / 0112264870 • Email: info@naisiaetextiles.com • dispatch@naisiaetextiles.com
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs uppercase font-black px-3 py-1 rounded bg-[#030A91] text-white shadow-xs">
                DELIVERY NOTE / WAYBILL
              </span>
              <h2 className="text-lg font-black text-slate-900 mt-2 font-mono">
                {deliveryNote.deliveryNoteNumber}
              </h2>
              <div className="text-[11px] text-slate-600 space-y-0.5 mt-1 font-mono">
                <p>Dispatch Date: <strong className="text-slate-900">{deliveryNote.dispatchDate}</strong></p>
                {deliveryNote.deliveredDate && (
                  <p className="text-emerald-700 font-bold">Delivered: {deliveryNote.deliveredDate}</p>
                )}
                <p>Origin: <strong>{deliveryNote.branchName}</strong></p>
              </div>
            </div>
          </div>

          {/* Consignee & Carrier Dispatch Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Left: Customer / Consignee */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                DELIVER TO (CONSIGNEE / SCHOOL):
              </span>
              <p className="font-black text-sm text-slate-900">{deliveryNote.customerName}</p>
              {deliveryNote.schoolOrOrg && (
                <p className="font-bold text-xs text-[#030A91] mt-0.5 flex items-center">
                  <Building className="w-3.5 h-3.5 mr-1 shrink-0" />
                  {deliveryNote.schoolOrOrg}
                </p>
              )}
              <div className="mt-2 text-[11px] text-slate-600 space-y-1">
                <p className="flex items-start">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0 mt-0.5" />
                  <span><strong>Destination:</strong> {deliveryNote.deliveryAddress || 'Standard School Delivery'}</span>
                </p>
                {deliveryNote.customerPhone && (
                  <p className="flex items-center">
                    <Phone className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                    <span>Contact: {deliveryNote.customerPhone}</span>
                  </p>
                )}
                {deliveryNote.customerKraPin && (
                  <p className="font-mono text-[10px] text-slate-500">
                    PIN: {deliveryNote.customerKraPin}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Logistics & Order References */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                ORDER & LOGISTICS SPECIFICATIONS:
              </span>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">Invoice Number:</span>
                  <span className="font-mono font-bold text-[#030A91]">
                    {deliveryNote.invoiceNumber || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">LPO / Tender Reference:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {deliveryNote.lpoNumber || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">Carrier / Transport:</span>
                  <span className="font-semibold text-slate-800">
                    {deliveryNote.carrierType.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">Vehicle Registration:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {deliveryNote.vehicleRegistration || 'Company Van'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Driver / Logistics Agent:</span>
                  <span className="font-medium text-slate-800">
                    {deliveryNote.driverName ? `${deliveryNote.driverName} ${deliveryNote.driverPhone ? `(${deliveryNote.driverPhone})` : ''}` : 'Naisiae Logistics Team'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Dispatched Table */}
          <div>
            <table className="w-full text-left border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <thead>
                <tr className="border-b-2 border-slate-300 text-[10px] font-black uppercase text-slate-700 bg-slate-100">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-2 text-center">SKU / Code</th>
                  <th className="py-2.5 px-2 text-center">Size</th>
                  <th className="py-2.5 px-3 text-center bg-blue-50/50 text-[#030A91]">Qty Dispatched</th>
                  <th className="py-2.5 px-3 text-center">Qty Received</th>
                  <th className="py-2.5 px-3 text-left">Condition / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {deliveryNote.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-slate-400 font-sans">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-900">
                      {item.productName}
                    </td>
                    <td className="py-2.5 px-2 text-center text-slate-500 text-[10px]">
                      {item.sku || '-'}
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-slate-800">
                      {item.size || 'STD'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-black text-sm text-[#030A91] bg-blue-50/30">
                      {item.quantityDispatched}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                      {item.quantityReceived !== undefined ? item.quantityReceived : (
                        <span className="inline-block w-8 border-b border-slate-400 text-transparent">_</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-500 text-[10px]">
                      {item.notes || 'Good Condition • Factory Inspected'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-slate-50 font-black">
                  <td colSpan={4} className="py-3 px-3 text-right uppercase text-slate-700 text-[11px]">
                    Total Garments / Pieces Dispatched:
                  </td>
                  <td className="py-3 px-3 text-center text-sm font-black text-[#030A91] bg-blue-100/50">
                    {deliveryNote.totalQuantity} Pcs
                  </td>
                  <td colSpan={2} className="py-3 px-3 text-slate-500 text-[10px] font-normal italic">
                    All uniforms folded, sorted by size, packed in sealed bales.
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Notes / Instructions if any */}
          {deliveryNote.notes && (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 shadow-xs">
              <span className="font-bold uppercase tracking-wider block text-[10px]">Special Instructions:</span>
              <p className="mt-0.5">{deliveryNote.notes}</p>
            </div>
          )}

          {/* 3-Part Official Sign-off and Verification Block */}
          <div className="pt-2">
            <h3 className="text-[11px] font-black uppercase text-slate-700 tracking-wider mb-2">
              Official 3-Part Inspection & Custody Sign-Off:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[10px]">
              {/* 1. Dispatched by */}
              <div className="p-3 border-2 border-slate-200 rounded-2xl bg-white space-y-2 shadow-sm">
                <div className="flex items-center space-x-1.5 text-[#030A91] font-black">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>1. DISPATCHED BY (STORE)</span>
                </div>
                <div className="space-y-1 text-slate-600">
                  <p>Officer: <strong className="text-slate-900">{deliveryNote.dispatchedByName}</strong></p>
                  <p>Station: {deliveryNote.branchName}</p>
                  <p>Date: {deliveryNote.dispatchDate}</p>
                </div>
                <div className="pt-4 border-t border-dashed border-slate-300">
                  <p className="text-[9px] text-slate-400">Signature & Official Dispatch Stamp:</p>
                  <div className="h-8 border-b border-slate-400 border-dotted mt-2 flex items-end">
                    <span className="text-[10px] text-emerald-700 font-mono italic">Verified & Released</span>
                  </div>
                </div>
              </div>

              {/* 2. Transported by */}
              <div className="p-3 border-2 border-slate-200 rounded-2xl bg-white space-y-2 shadow-sm">
                <div className="flex items-center space-x-1.5 text-slate-800 font-black">
                  <Truck className="w-3.5 h-3.5 text-amber-600" />
                  <span>2. TRANSPORTED BY</span>
                </div>
                <div className="space-y-1 text-slate-600">
                  <p>Driver / Agent: <strong className="text-slate-900">{deliveryNote.driverName || 'Authorized Courier'}</strong></p>
                  <p>Vehicle Reg: <span className="font-mono font-bold text-slate-900">{deliveryNote.vehicleRegistration || 'KDA 482M'}</span></p>
                  <p>Carrier: {deliveryNote.carrierType.replace(/_/g, ' ')}</p>
                </div>
                <div className="pt-4 border-t border-dashed border-slate-300">
                  <p className="text-[9px] text-slate-400">Driver Signature & Contact:</p>
                  <div className="h-8 border-b border-slate-400 border-dotted mt-2"></div>
                </div>
              </div>

              {/* 3. Received by (School / Customer) */}
              <div className="p-3 border-2 border-slate-200 rounded-2xl bg-white space-y-2 shadow-sm">
                <div className="flex items-center space-x-1.5 text-emerald-800 font-black">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>3. RECEIVED BY (CONSIGNEE)</span>
                </div>
                <div className="space-y-1 text-slate-600">
                  <p>Name: <strong className="text-slate-900">{deliveryNote.receivedBy || '______________________'}</strong></p>
                  <p>Designation: {deliveryNote.receivedByTitle || 'Bursar / Storekeeper'}</p>
                  <p>Date Received: {deliveryNote.deliveredDate || '______ / ______ / 2026'}</p>
                </div>
                <div className="pt-2 border-t border-dashed border-slate-300 text-center">
                  <div className="h-12 border-2 border-slate-300 border-dashed rounded-lg flex items-center justify-center p-1 bg-slate-50">
                    <span className="text-[8px] font-bold uppercase text-slate-400 tracking-wider">
                      [ OFFICIAL SCHOOL / INSTITUTION STAMP ]
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legal / Goods Accepted disclaimer */}
          <div className="border-t border-slate-200 pt-3 text-[9px] text-slate-400 text-center space-y-0.5">
            <p>Goods received in good condition, correct sizes, and inspected per LPO / Tender terms. Any discrepancy must be reported within 48 hours of delivery.</p>
            <p className="font-bold text-slate-500">Naisiae Textiles Ltd • ISO Standard Garment Manufacturing & Supply</p>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between no-print print:hidden shrink-0 shadow-xs">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span>Dispatched By: <strong className="text-slate-700">{deliveryNote.dispatchedByName}</strong></span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-[#030A91] hover:bg-blue-900 text-white text-xs font-bold transition-all shadow-md inline-flex items-center"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5 text-[#FACB00]" />
              <span>Print Waybill</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mark Delivered Dialog Submodal */}
      {showMarkDeliveredModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200/80">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Acknowledge Goods Received</h3>
                  <p className="text-[11px] text-slate-500">Delivery Note {deliveryNote.deliveryNoteNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMarkDeliveredModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMarkDelivered} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Recipient Name (School / Consignee Officer) *
                </label>
                <input
                  type="text"
                  required
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="e.g. Mr. John Mwangi"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Designation / Role
                </label>
                <input
                  type="text"
                  value={receiverTitle}
                  onChange={(e) => setReceiverTitle(e.target.value)}
                  placeholder="e.g. Head of Stores / School Bursar"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Verification & Inspection Notes
                </label>
                <textarea
                  rows={2}
                  value={receiverNotes}
                  onChange={(e) => setReceiverNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMarkDeliveredModal(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-50 inline-flex items-center shadow-md"
                >
                  {isUpdatingStatus ? 'Updating...' : 'Confirm Delivery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
