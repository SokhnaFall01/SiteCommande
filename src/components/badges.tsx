const PRODUCT_STATUS: Record<string, { label: string; cls: string }> = {
  DRAFT: { label: "Brouillon", cls: "bg-gray-100 text-gray-700" },
  PENDING_PAYMENT: {
    label: "Paiement en attente",
    cls: "bg-amber-100 text-amber-800",
  },
  PUBLISHED: { label: "Publié", cls: "bg-brand-100 text-brand-800" },
};

const ORDER_STATUS: Record<string, { label: string; cls: string }> = {
  NEW: { label: "Nouvelle", cls: "bg-blue-100 text-blue-800" },
  CONTACTED: { label: "Contactée", cls: "bg-amber-100 text-amber-800" },
  CONFIRMED: { label: "Confirmée", cls: "bg-brand-100 text-brand-800" },
  CANCELLED: { label: "Annulée", cls: "bg-red-100 text-red-700" },
};

const PAYMENT_STATUS: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "En attente", cls: "bg-amber-100 text-amber-800" },
  PAID: { label: "Payé", cls: "bg-brand-100 text-brand-800" },
  FAILED: { label: "Échoué", cls: "bg-red-100 text-red-700" },
  CANCELLED: { label: "Annulé", cls: "bg-gray-100 text-gray-700" },
};

export function ProductStatusBadge({ status }: { status: string }) {
  const s = PRODUCT_STATUS[status] || PRODUCT_STATUS.DRAFT;
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

export function OrderStatusBadge({ status }: { status: string }) {
  const s = ORDER_STATUS[status] || ORDER_STATUS.NEW;
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

export function PaymentStatusBadge({ status }: { status: string }) {
  const s = PAYMENT_STATUS[status] || PAYMENT_STATUS.PENDING;
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}
