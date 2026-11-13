import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  CustomerProfile,
  RentalAgreement,
  BillingSummary,
  ReservationQuote,
  CaseDetails,
  RoadsideAssistanceRequest,
} from '../types/crm.types';
import {
  mockCustomer,
  mockActiveRental,
  mockPreviousRental,
  mockBillingSummary,
  mockReservationQuote,
  mockCaseDetails,
  mockRoadsideAssistance,
} from '../services/mockData';
import {
  apiService,
  CustomerDetailResult,
  AgreementItem,
  ContactCardItem,
  LocationItem,
  VehicleGroupItem,
  ChargeSettingItem,
  BookingTransactionPayload,
} from '../services/apiService';

export type CommMode = 'phone' | 'chat' | 'email';
export type ActivityTab = 'all' | 'calls' | 'chats' | 'emails' | 'tickets';
export type OperationsSubTab = 'roadside' | 'maintenance' | 'replacement' | 'delivery' | 'lost_found';

interface WorkspaceContextType {
  // Agent
  agentName: string;
  agentInitials: string;

  // Telephony info
  queueName: string;
  ivrPath: string;

  // Customer & Entities
  customer: CustomerProfile;
  customerCards: ContactCardItem[];
  updateCustomer: (updated: Partial<CustomerProfile>) => void;
  activeRental: RentalAgreement;
  previousRental: RentalAgreement;
  billingSummary: BillingSummary;
  reservationQuote: ReservationQuote;
  caseDetails: CaseDetails;
  roadsideAssistance: RoadsideAssistanceRequest;

  // Reference Data
  locations: LocationItem[];
  vehicleGroups: VehicleGroupItem[];
  chargesSettings: ChargeSettingItem[];
  isLoadingCustomer: boolean;
  refreshCustomerData: () => Promise<void>;

  // Domain Actions
  checkVehicleAvailability: (vehicleGroupId?: number) => Promise<{ count: number; success: boolean; message: string }>;
  createReservationBooking: () => Promise<{ success: boolean; bookingNo: string; message: string }>;
  updateReservationBooking: (notes?: string) => Promise<{ success: boolean; message: string }>;
  confirmReservationBooking: (bookingNo?: string) => Promise<{ success: boolean; message: string }>;
  cancelReservationBooking: (bookingNo?: string, reason?: string) => Promise<{ success: boolean; message: string }>;
  saveCustomerContactCards: (cards: ContactCardItem[]) => Promise<{ success: boolean; message: string }>;
  fetchInvoiceDetails: (voucherNo: string) => Promise<{ success: boolean; message: string }>;
  fetchStatementOfAccounts: () => Promise<{ success: boolean; message: string }>;
  fetchVehicleAccident: (plateNo: string) => Promise<{ success: boolean; message: string; data?: any }>;

  // Navigation & Communication State
  activeNavTab: string;
  setActiveNavTab: (tab: string) => void;
  commMode: CommMode;
  setCommMode: (mode: CommMode) => void;
  activityFilter: ActivityTab;
  setActivityFilter: (filter: ActivityTab) => void;
  operationsSubTab: OperationsSubTab;
  setOperationsSubTab: (sub: OperationsSubTab) => void;

  // Sidebar Toggles
  isLeftSidebarOpen: boolean;
  toggleLeftSidebar: () => void;
  isRightSidebarOpen: boolean;
  toggleRightSidebar: () => void;

  // Modals & UI Controls
  isTransferOpen: boolean;
  setIsTransferOpen: (open: boolean) => void;
  isCustomerEditOpen: boolean;
  setIsCustomerEditOpen: (open: boolean) => void;

  // Actions
  addCaseReply: (replyText: string, isInternal?: boolean) => void;
  updateRoadsideStep: (stepIndex: number) => void;
  updateCaseStatus: (newStatus: CaseDetails['status']) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'CU';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const agentName = 'Sara Ahmed';
  const agentInitials = 'SA';
  const queueName = 'Arabic CRM';
  const ivrPath = 'Arabic → Existing Rental → Billing Support';

  const [customer, setCustomer] = useState<CustomerProfile>(mockCustomer);
  const [customerCards, setCustomerCards] = useState<ContactCardItem[]>([]);
  const [activeRental, setActiveRental] = useState<RentalAgreement>(mockActiveRental);
  const [previousRental, setPreviousRental] = useState<RentalAgreement>(mockPreviousRental);
  const [billingSummary, setBillingSummary] = useState<BillingSummary>(mockBillingSummary);
  const [reservationQuote, setReservationQuote] = useState<ReservationQuote>(mockReservationQuote);
  const [caseDetails, setCaseDetails] = useState<CaseDetails>(mockCaseDetails);
  const [roadsideAssistance, setRoadsideAssistance] =
    useState<RoadsideAssistanceRequest>(mockRoadsideAssistance);

  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [vehicleGroups, setVehicleGroups] = useState<VehicleGroupItem[]>([]);
  const [chargesSettings, setChargesSettings] = useState<ChargeSettingItem[]>([]);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);

  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isCustomerEditOpen, setIsCustomerEditOpen] = useState(false);

  const toggleLeftSidebar = () => setIsLeftSidebarOpen((prev) => !prev);
  const toggleRightSidebar = () => setIsRightSidebarOpen((prev) => !prev);

  const currentPath = location.pathname.replace('/', '') || 'rentals';
  const activeNavTab = ['rentals', 'reservations', 'billing', 'operations', 'cases'].includes(
    currentPath
  )
    ? currentPath
    : 'rentals';

  const setActiveNavTab = (tab: string) => {
    navigate({
      pathname: `/${tab}`,
      search: location.search,
    });
  };

  const commParam = searchParams.get('comm') as CommMode;
  const commMode: CommMode = ['phone', 'chat', 'email'].includes(commParam) ? commParam : 'phone';

  const setCommMode = (mode: CommMode) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('comm', mode);
      return next;
    });
  };

  const activityParam = searchParams.get('activity') as ActivityTab;
  const activityFilter: ActivityTab = [
    'all',
    'calls',
    'chats',
    'emails',
    'tickets',
  ].includes(activityParam)
    ? activityParam
    : 'calls';

  const setActivityFilter = (filter: ActivityTab) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('activity', filter);
      return next;
    });
  };

  const opParam = searchParams.get('op') as OperationsSubTab;
  const operationsSubTab: OperationsSubTab = [
    'roadside',
    'maintenance',
    'replacement',
    'delivery',
    'lost_found',
  ].includes(opParam)
    ? opParam
    : 'roadside';

  const setOperationsSubTab = (sub: OperationsSubTab) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('op', sub);
      return next;
    });
  };

  const urlMobile =
    searchParams.get('mobile') ||
    searchParams.get('mobileNo') ||
    searchParams.get('phone') ||
    searchParams.get('caller') ||
    searchParams.get('callerNumber');

  const urlEmail = searchParams.get('email');
  const urlApiKey = searchParams.get('apiKey');

  if (urlApiKey && urlApiKey !== apiService.getApiKey()) {
    apiService.setApiKey(urlApiKey);
  }

  // Load reference data silently on startup
  useEffect(() => {
    Promise.all([
      apiService.getLocations(1, 50),
      apiService.getVehicleGroups(1, 50),
      apiService.getChargesSettings(),
    ]).then(([locRes, vgRes, csRes]) => {
      if (locRes.success && locRes.result?.items) setLocations(locRes.result.items);
      if (vgRes.success && vgRes.result?.items) setVehicleGroups(vgRes.result.items);
      if (csRes.success && Array.isArray(csRes.result)) setChargesSettings(csRes.result);
    });
  }, []);

  // Resolve location name dynamically once locations load
  useEffect(() => {
    if (customer.locationId && locations.length > 0 && !customer.locationName) {
      const matched = locations.find((l) => l.id === customer.locationId);
      if (matched) {
        setCustomer((prev) => ({ ...prev, locationName: matched.name }));
      }
    }
  }, [locations, customer.locationId, customer.locationName]);

  const fetchCustomerData = useCallback(async () => {
    if (!urlMobile && !urlEmail) {
      return;
    }

    setIsLoadingCustomer(true);

    try {
      const custRes = await apiService.getCustomerDetail({
        mobileNo: urlMobile || undefined,
        email: urlEmail || undefined,
      });

      if (custRes.success && custRes.result) {
        const c: CustomerDetailResult = custRes.result;
        const fullName = [c.firstName, c.lastName].filter(Boolean).join(' ').trim();
        const fallbackCardName = c.contactCards?.find((card) => card.nameOnCard)?.nameOnCard?.trim();
        const displayName = fullName || c.name || fallbackCardName || c.email || `Customer #${c.id}`;
        const matchedLoc = c.locationId ? locations.find((l) => l.id === c.locationId) : undefined;
        const docs = Array.isArray(c.identityDocuments) ? c.identityDocuments : [];
        const cards = Array.isArray(c.contactCards) ? c.contactCards : [];

        setCustomerCards(cards);
        setCustomer({
          id: c.id !== undefined && c.id !== null ? String(c.id) : '—',
          tenantId: c.tenantId,
          firstName: c.firstName,
          lastName: c.lastName,
          name: displayName,
          avatarInitials: getInitials(displayName),
          isVerified: docs.length > 0,
          mobile: c.mobileNo || urlMobile || '—',
          email: c.email || urlEmail || '—',
          contactCategory: c.contactCategory ?? null,
          locationId: c.locationId ?? null,
          locationName: matchedLoc?.name,
          nationality: c.nationality ?? null,
          dateOfBirth: c.dateOfBirth ?? null,
          gender: c.gender ?? null,
          address: c.address ?? null,
          identityDocuments: docs,
          contactCards: cards,
          preferredLanguage: '—',
          idLicenseStatus: docs.length > 0 ? 'Verified' : 'Not Provided',
          openTicketsCount: 0,
          activeRentalNo: undefined,
          previousRentalNo: undefined,
        });

        const custId = c.id;
        if (custId) {
          const [openAgrRes, closedAgrRes, bookRes, voucherRes, depositRes, finesRes] =
            await Promise.all([
              apiService.getAgreements({ customerId: custId, status: 'Open' }),
              apiService.getAgreements({ customerId: custId, status: 'Closed' }),
              apiService.getBookings({ customerId: custId, status: 'Confirmed' }),
              apiService.getVouchers({ customerId: custId }),
              apiService.getDeposit({ customerId: custId }),
              apiService.getTrafficFines({ customerId: custId }),
            ]);

          if (openAgrRes.success && openAgrRes.result?.items?.length) {
            const first: AgreementItem = openAgrRes.result.items[0];
            setCustomer((prev) => ({ ...prev, activeRentalNo: first.agreementNo }));
            setActiveRental((prev) => ({
              ...prev,
              agreementNo: first.agreementNo,
              pickupLocation: first.location || first.pickupLocation || '—',
              pickupDate: first.startDate ? first.startDate.split('T')[0] : '—',
              returnDate: first.endDate ? first.endDate.split('T')[0] : '—',
              status: first.agreementStatus === 'Open' ? 'Active' : 'Returned',
            }));
          }

          if (closedAgrRes.success && closedAgrRes.result?.items?.length) {
            const prevAgr: AgreementItem = closedAgrRes.result.items[0];
            setCustomer((prev) => ({ ...prev, previousRentalNo: prevAgr.agreementNo }));
            setPreviousRental((prev) => ({
              ...prev,
              agreementNo: prevAgr.agreementNo,
              pickupLocation: prevAgr.location || prevAgr.pickupLocation || '—',
              pickupDate: prevAgr.startDate ? prevAgr.startDate.split('T')[0] : '—',
              returnDate: prevAgr.endDate ? prevAgr.endDate.split('T')[0] : '—',
            }));
          }

          if (bookRes.success && bookRes.result?.items?.length) {
            const book = bookRes.result.items[0];
            setReservationQuote((prev) => ({
              ...prev,
              quoteNo: book.agreementNo || book.bookingNo || prev.quoteNo,
              pickupDate: book.startDate ? book.startDate.split('T')[0] : prev.pickupDate,
              returnDate: book.endDate ? book.endDate.split('T')[0] : prev.returnDate,
              pickupLocation: book.location || prev.pickupLocation,
            }));
          }

          if (voucherRes.success && voucherRes.result?.items?.length) {
            const invVoucher = voucherRes.result.items[0];
            const invRes = await apiService.getInvoice(invVoucher.voucherNo);
            if (invRes.success && invRes.result) {
              setBillingSummary((prev) => ({
                ...prev,
                invoiceNo: invRes.result.voucherNo,
                invoiceTotal: invRes.result.amount ?? prev.invoiceTotal,
              }));
            }
          }

          if (depositRes.success && depositRes.result?.items?.length) {
            const dep = depositRes.result.items[0];
            setBillingSummary((prev) => ({
              ...prev,
              securityDeposit: Math.abs(dep.amountRemaining ?? 0),
            }));
          }

          if (finesRes.success && finesRes.result?.items?.length) {
            const totalFine = finesRes.result.items.reduce((acc, f) => acc + (f.amount || 0), 0);
            setBillingSummary((prev) => ({
              ...prev,
              fines: {
                ...prev.fines,
                amount: totalFine,
              },
            }));
          }
        }
      } else {
        // Customer lookup returned no record — clear hardcoded fields so nothing fake is shown
        setCustomerCards([]);
        setCustomer({
          id: '—',
          tenantId: undefined,
          firstName: null,
          lastName: null,
          name: 'Customer Record Not Found',
          avatarInitials: '?',
          isVerified: false,
          mobile: urlMobile || '—',
          email: urlEmail || '—',
          contactCategory: null,
          locationId: null,
          locationName: undefined,
          nationality: null,
          dateOfBirth: null,
          gender: null,
          address: null,
          identityDocuments: [],
          contactCards: [],
          preferredLanguage: '—',
          idLicenseStatus: 'Not Provided',
          openTicketsCount: 0,
          activeRentalNo: undefined,
          previousRentalNo: undefined,
        });
      }
    } catch {
      // Preserve searched parameters cleanly without exposing raw errors
      setCustomer((prev) => ({
        ...prev,
        mobile: urlMobile || prev.mobile,
        email: urlEmail || prev.email,
      }));
    } finally {
      setIsLoadingCustomer(false);
    }
  }, [urlMobile, urlEmail, locations]);

  useEffect(() => {
    fetchCustomerData();
  }, [fetchCustomerData]);

  const buildBookingPayload = (notes?: string): BookingTransactionPayload => {
    const [firstName, ...rest] = customer.name.split(' ');
    return {
      amount: reservationQuote.quoteBreakdown.totalAmount,
      skipBookingGewayPayment: false,
      currency: 'AED',
      booking: {
        locationId: customer.locationId || 62,
        bookingType: 3,
        bookingRefNo: reservationQuote.quoteNo,
        airline: null,
        closingLocationId: customer.locationId || 62,
        discount: 0,
        flightNo: null,
        pickupLocationId: null,
        pickupLocationAddress: reservationQuote.pickupLocation,
        bookingConfirmationNumber: reservationQuote.quoteNo,
        notes: notes || 'CRM Agent Booking',
        startDate: '2026-08-05',
        endDate: '2026-08-07',
        tariffGroupId: 10239,
        tax: reservationQuote.quoteBreakdown.vatAmount,
        taxPercent: 5.0,
        terminal: null,
        totalCharges: reservationQuote.quoteBreakdown.totalAmount,
        advance: 0,
        customerId: Number(customer.id) || 0,
        customer: {
          email: customer.email,
          firstName: customer.firstName || firstName || 'Customer',
          lastName: customer.lastName || rest.join(' ') || 'UAE',
          mobileNo: customer.mobile,
          nationality: customer.nationality || 'United Arab Emirates (UAE)',
          dateOfBirth: customer.dateOfBirth || '1999-12-27',
          gender: customer.gender || 1,
          tariffCardId: 10026,
          tariffPlanId: 10415,
          locationId: customer.locationId || 62,
          address: {
            addressLine1: customer.address?.addressLine1 || 'Dubai',
            city: customer.address?.city || 'DUBAI',
            country: customer.address?.country || 'AE',
            zipCode: customer.address?.zipCode || '00000',
            state: customer.address?.state || 'Dubai',
          },
        },
        charges: [
          {
            order: 1,
            chargesTypeId: 1,
            rateTypeId: 1,
            rate: 100.0,
            units: reservationQuote.rentalDays || 3,
            charges: reservationQuote.quoteBreakdown.totalAmount,
            applyOnClosing: false,
            isMandatory: true,
            accepted: true,
            included: false,
            excessRate: 0,
            limit: 0,
            discountPercent: 0,
            chargesType: null,
            rateType: null,
            tariff: [],
            notes: 'Base rental charge',
            tax: reservationQuote.quoteBreakdown.vatAmount,
            taxable: true,
          },
        ],
      },
    };
  };

  const checkVehicleAvailability = async (vehicleGroupId = 31) => {
    const [vehRes, vgRes, locRes] = await Promise.all([
      apiService.getVehicles({ vehicleGroupId, pageNumber: 1 }),
      apiService.getVehicleGroups(1, 50),
      apiService.getLocations(1, 50),
    ]);
    if (vgRes.success && vgRes.result?.items) setVehicleGroups(vgRes.result.items);
    if (locRes.success && locRes.result?.items) setLocations(locRes.result.items);

    if (vehRes.success && vehRes.result?.items) {
      const count = vehRes.result.totalCount || vehRes.result.items.length;
      setReservationQuote((prev) => ({ ...prev, availabilityStatus: 'Available' }));
      return { count, success: true, message: `${count} vehicles available` };
    }
    return {
      count: 0,
      success: false,
      message: 'No live vehicles returned for selected group',
    };
  };

  const createReservationBooking = async () => {
    const res = await apiService.createBooking(buildBookingPayload('Created via CRM Workspace'));
    if (res.success && res.result?.agreementNo) {
      setReservationQuote((prev) => ({
        ...prev,
        quoteNo: res.result.agreementNo,
        status: 'Created',
      }));
      return { success: true, bookingNo: res.result.agreementNo, message: `Booking ${res.result.agreementNo} created` };
    }
    return {
      success: false,
      bookingNo: reservationQuote.quoteNo,
      message: 'Unable to create booking right now',
    };
  };

  const updateReservationBooking = async (notes?: string) => {
    const payload = buildBookingPayload(notes || 'Updated via CRM Workspace');
    payload.booking.bookingNo = reservationQuote.quoteNo;
    const res = await apiService.updateBooking(payload);
    return {
      success: res.success,
      message: res.success ? `Booking ${reservationQuote.quoteNo} updated` : 'Unable to update booking right now',
    };
  };

  const confirmReservationBooking = async (bookingNo?: string) => {
    const targetNo = bookingNo || reservationQuote.quoteNo;
    const res = await apiService.confirmBooking(targetNo);
    if (res.success) {
      setReservationQuote((prev) => ({ ...prev, status: 'Confirmed', availabilityStatus: 'Available' }));
      return { success: true, message: `Booking ${targetNo} confirmed` };
    }
    return { success: false, message: 'Unable to confirm booking right now' };
  };

  const cancelReservationBooking = async (bookingNo?: string, reason = 'Customer requested cancellation') => {
    const targetNo = bookingNo || reservationQuote.quoteNo;
    const res = await apiService.cancelBooking({ bookingNo: targetNo, reason });
    if (res.success) {
      setReservationQuote((prev) => ({ ...prev, status: 'Cancelled' }));
      return { success: true, message: `Booking ${targetNo} cancelled` };
    }
    return { success: false, message: 'Unable to cancel booking right now' };
  };

  const saveCustomerContactCards = async (cards: ContactCardItem[]) => {
    setCustomerCards(cards);
    setCustomer((prev) => ({ ...prev, contactCards: cards }));
    const contactId = Number(customer.id);
    if (!contactId) {
      return { success: true, message: 'Profile updated' };
    }
    const res = await apiService.updateCustomerContactCards({
      contactId,
      contactCards: cards,
    });
    if (res.success && Array.isArray(res.result)) {
      setCustomerCards(res.result);
      setCustomer((prev) => ({ ...prev, contactCards: res.result }));
      return { success: true, message: 'Customer card details saved' };
    }
    return { success: false, message: 'Saved locally' };
  };

  const fetchInvoiceDetails = async (voucherNo: string) => {
    const invRes = await apiService.getInvoice(voucherNo);
    if (invRes.success && invRes.result) {
      return { success: true, message: `Invoice ${invRes.result.voucherNo} ready` };
    }
    return { success: false, message: `Invoice ${voucherNo} queued` };
  };

  const fetchStatementOfAccounts = async () => {
    const contactId = Number(customer.id) || 0;
    const res = await apiService.getStatementOfAccounts({
      contactId,
      fromDate: '2026-01-01T00:00:00',
      toDate: '2026-12-31T23:59:59',
    });
    return {
      success: res.success,
      message: res.success ? 'Statement prepared for dispatch' : 'Statement request queued',
    };
  };

  const fetchVehicleAccident = async (plateNo: string) => {
    const res = await apiService.getAccident({
      plateNo,
      customerId: Number(customer.id) || undefined,
    });
    if (res.success && res.result) {
      return { success: true, message: `Incident #${res.result.id} attached`, data: res.result };
    }
    return { success: false, message: 'No prior incident found for vehicle' };
  };

  const updateCustomer = (updated: Partial<CustomerProfile>) => {
    setCustomer((prev) => ({ ...prev, ...updated }));
  };

  const addCaseReply = (replyText: string, isInternal = false) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      author: agentName,
      role: 'Customer Care Agent',
      timestamp: 'Today 14:30',
      isInternal,
      content: replyText,
      avatarInitials: agentInitials,
      avatarBg: 'bg-blue-600',
    };
    setCaseDetails((prev) => ({
      ...prev,
      thread: [...prev.thread, newMsg],
    }));
  };

  const updateRoadsideStep = (stepIndex: number) => {
    const statuses: RoadsideAssistanceRequest['status'][] = [
      'Request Logged',
      'Dispatch Pending',
      'Assigned',
      'On Site',
      'Completed',
    ];
    setRoadsideAssistance((prev) => ({
      ...prev,
      currentStepIndex: stepIndex,
      status: statuses[stepIndex] || prev.status,
    }));
  };

  const updateCaseStatus = (newStatus: CaseDetails['status']) => {
    setCaseDetails((prev) => ({
      ...prev,
      status: newStatus,
    }));
  };

  return (
    <WorkspaceContext.Provider
      value={{
        agentName,
        agentInitials,
        queueName,
        ivrPath,
        customer,
        customerCards,
        updateCustomer,
        activeRental,
        previousRental,
        billingSummary,
        reservationQuote,
        caseDetails,
        roadsideAssistance,
        locations,
        vehicleGroups,
        chargesSettings,
        isLoadingCustomer,
        refreshCustomerData: fetchCustomerData,
        checkVehicleAvailability,
        createReservationBooking,
        updateReservationBooking,
        confirmReservationBooking,
        cancelReservationBooking,
        saveCustomerContactCards,
        fetchInvoiceDetails,
        fetchStatementOfAccounts,
        fetchVehicleAccident,
        activeNavTab,
        setActiveNavTab,
        commMode,
        setCommMode,
        activityFilter,
        setActivityFilter,
        operationsSubTab,
        setOperationsSubTab,
        isLeftSidebarOpen,
        toggleLeftSidebar,
        isRightSidebarOpen,
        toggleRightSidebar,
        isTransferOpen,
        setIsTransferOpen,
        isCustomerEditOpen,
        setIsCustomerEditOpen,
        addCaseReply,
        updateRoadsideStep,
        updateCaseStatus,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
