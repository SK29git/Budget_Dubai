import React, { useState, useEffect } from 'react';
import { X, Check, CreditCard } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const CustomerEditModal: React.FC = () => {
  const {
    customer,
    customerCards,
    updateCustomer,
    saveCustomerContactCards,
    isCustomerEditOpen,
    setIsCustomerEditOpen,
  } = useWorkspace();

  const [name, setName] = useState(customer.name);
  const [mobile, setMobile] = useState(customer.mobile);
  const [email, setEmail] = useState(customer.email);
  const [nationality, setNationality] = useState(customer.nationality || '');
  const [addressLine1, setAddressLine1] = useState(customer.address?.addressLine1 || '');
  const [city, setCity] = useState(customer.address?.city || '');
  const [country, setCountry] = useState(customer.address?.country || '');
  const [cardLast4, setCardLast4] = useState(customerCards[0]?.cardNoLastFourDigits || '');
  const [cardBank, setCardBank] = useState(customerCards[0]?.bankName || '');
  const [cardExpiry, setCardExpiry] = useState(customerCards[0]?.expiry?.split('T')[0] || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(customer.name);
    setMobile(customer.mobile);
    setEmail(customer.email);
    setNationality(customer.nationality || '');
    setAddressLine1(customer.address?.addressLine1 || '');
    setCity(customer.address?.city || '');
    setCountry(customer.address?.country || '');
    const cards = customer.contactCards ?? customerCards;
    if (cards && cards[0]) {
      setCardLast4(cards[0].cardNoLastFourDigits || '');
      setCardBank(cards[0].bankName || '');
      setCardExpiry(cards[0].expiry?.split('T')[0] || '');
    } else {
      setCardLast4('');
      setCardBank('');
      setCardExpiry('');
    }
  }, [customer, customerCards, isCustomerEditOpen]);

  if (!isCustomerEditOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    updateCustomer({
      name,
      mobile,
      email,
      nationality: nationality || null,
      address: {
        ...customer.address,
        addressLine1: addressLine1 || null,
        city: city || null,
        country: country || null,
      },
    });
    if (cardLast4.trim()) {
      await saveCustomerContactCards([
        {
          id: customerCards[0]?.id ?? null,
          type: customerCards[0]?.type ?? 1,
          cardNoLastFourDigits: cardLast4,
          expiry: cardExpiry || '2030-12-31',
          nameOnCard: name,
          bankName: cardBank || null,
        },
      ]);
    }
    setSaving(false);
    setIsCustomerEditOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 select-none">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-fade-in">
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Edit Customer Details</h3>
          <button
            onClick={() => setIsCustomerEditOpen(false)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-2.5 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-0.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-0.5">Mobile Number</label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-0.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-0.5">Nationality</label>
              <input
                type="text"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                placeholder="e.g. UAE"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-0.5">Address Line</label>
            <input
              type="text"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-0.5">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-0.5">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Payment Card section */}
          <div className="p-2.5 bg-slate-50 rounded border border-slate-200 space-y-2">
            <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-700">
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              <span>Payment Card</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">Last 4 Digits</label>
                <input
                  type="text"
                  maxLength={4}
                  value={cardLast4}
                  onChange={(e) => setCardLast4(e.target.value)}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-[11px] font-mono bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">Bank Name</label>
                <input
                  type="text"
                  value={cardBank}
                  onChange={(e) => setCardBank(e.target.value)}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-[11px] bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">Expiry</label>
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  placeholder="YYYY-MM-DD"
                  className="w-full px-2 py-1 border border-slate-300 rounded text-[11px] font-mono bg-white"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCustomerEditOpen(false)}
              className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-50 rounded text-slate-700 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 text-white rounded font-semibold flex items-center space-x-1.5 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
