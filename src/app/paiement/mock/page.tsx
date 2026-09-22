import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { config } from "@/lib/config";
import { formatFCFA } from "@/lib/format";
import { mockPaymentDecision } from "@/actions/mock";

// Page de simulation de paiement (mode PAYMENT_PROVIDER=mock).
export default async function MockPaymentPage({
  searchParams,
}: {
  searchParams: { pid?: string };
}) {
  const user = await requireUser();
  const paymentId = searchParams.pid;
  if (!paymentId) notFound();

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { product: true },
  });
  if (!payment || payment.userId !== user.id) notFound();

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <div className="card text-center">
        <span className="badge bg-amber-100 text-amber-800">
          Mode test — aucun argent réel
        </span>
        <h1 className="mt-4 text-xl font-bold">Paiement mobile money</h1>
        <p className="mt-2 text-sm text-gray-600">
          Publication de l&apos;article
          <br />
          <strong>{payment.product.title}</strong>
        </p>
        <p className="mt-4 text-3xl font-extrabold text-brand-700">
          {formatFCFA(payment.amount)}
        </p>
        <p className="mt-1 text-xs text-gray-500">Devise : {config.devise}</p>

        <div className="mt-6 space-y-3">
          <form action={mockPaymentDecision}>
            <input type="hidden" name="paymentId" value={payment.id} />
            <input type="hidden" name="decision" value="pay" />
            <button type="submit" className="btn-primary w-full">
              Simuler un paiement réussi
            </button>
          </form>
          <form action={mockPaymentDecision}>
            <input type="hidden" name="paymentId" value={payment.id} />
            <input type="hidden" name="decision" value="cancel" />
            <button type="submit" className="btn-outline w-full">
              Annuler
            </button>
          </form>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          En production (PAYDUNYA), cette page est remplacée par l&apos;interface
          Wave / Orange Money / Free Money.
        </p>
      </div>
    </div>
  );
}
