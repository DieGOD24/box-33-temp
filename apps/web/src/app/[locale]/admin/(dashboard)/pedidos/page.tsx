import { Suspense } from 'react'
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server'
import { requireAuth } from '@/lib/auth/session'
import { getOrders, getPayments } from '@/lib/api/admin'
import { formatCOP, formatDateTime } from '@/lib/format'
import { ADMIN_CARD, ADMIN_SUBTITLE, ADMIN_TITLE } from '@/components/admin/ui'
import { OrderStatusButton } from '@/components/admin/OrderStatusButton'
import { AdminPager } from '@/components/admin/AdminPager'

export default async function OrdersAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ pagina?: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.pagina ?? '1', 10) || 1)
  const token = await requireAuth()
  const [orders, payments, t, currentLocale] = await Promise.all([
    getOrders(token, page),
    getPayments(token, 1),
    getTranslations('admin.orders'),
    getLocale(),
  ])

  const statusLabel = (status: string) =>
    status === 'paid'
      ? t('statusPaid')
      : status === 'delivered'
        ? t('statusDelivered')
        : t('statusCancelled')

  return (
    <div className="flex flex-col gap-[22px]">
      <div>
        <h1 className={ADMIN_TITLE}>{t('title')}</h1>
        <p className={ADMIN_SUBTITLE}>{t('subtitle')}</p>
      </div>

      <div className={ADMIN_CARD}>
        {orders.items.length === 0 ? (
          <p className="text-bone/50 py-6 text-center">{t('empty')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-bone/15 font-condensed text-bone/50 border-b tracking-wider uppercase">
                  <th className="py-2 pr-3">{t('customer')}</th>
                  <th className="py-2 pr-3">{t('items')}</th>
                  <th className="py-2 pr-3">{t('total')}</th>
                  <th className="py-2 pr-3">{t('status')}</th>
                  <th className="py-2 pr-3">{t('date')}</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {orders.items.map((order) => (
                  <tr key={order.id} className="border-bone/10 border-b border-dashed align-top">
                    <td className="py-2.5 pr-3">
                      <span className="text-bone block">{order.customerName}</span>
                      <span className="text-bone/45 text-xs">{order.customerPhone}</span>
                    </td>
                    <td className="text-bone/70 py-2.5 pr-3">
                      {order.items
                        .map((i) => `${i.name} ×${i.quantity}${i.size ? ` (${i.size})` : ''}`)
                        .join(', ')}
                    </td>
                    <td className="font-led text-moss py-2.5 pr-3">
                      {formatCOP(order.totalCents)}
                    </td>
                    <td className="py-2.5 pr-3">
                      <span
                        className={`font-condensed inline-block border px-2 py-0.5 text-xs tracking-wider uppercase ${
                          order.status === 'paid'
                            ? 'border-wa/50 text-wa'
                            : order.status === 'delivered'
                              ? 'border-moss/50 text-moss'
                              : 'border-bone/30 text-bone/50'
                        }`}
                      >
                        {statusLabel(order.status)}
                      </span>
                    </td>
                    <td className="text-bone/45 py-2.5 pr-3 whitespace-nowrap">
                      {formatDateTime(order.createdAt, currentLocale)}
                    </td>
                    <td className="py-2.5 text-right">
                      {order.status === 'paid' && (
                        <OrderStatusButton orderId={order.id} label={t('markDelivered')} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Suspense fallback={null}>
          <AdminPager page={orders.page} pages={orders.pages} />
        </Suspense>
      </div>

      <div className={ADMIN_CARD}>
        <h2 className="font-condensed mb-3.5 text-lg font-bold tracking-[3px] uppercase">
          {t('payments')}
        </h2>
        <div className="flex flex-col">
          {payments.items.map((payment) => (
            <div
              key={payment.id}
              className="border-bone/10 flex flex-wrap items-center justify-between gap-2 border-b border-dashed py-2 text-sm"
            >
              <span className="font-led text-bone/60 text-xs">{payment.reference}</span>
              <span className="text-bone/70">{payment.customerName}</span>
              <span className="font-led text-bone">{formatCOP(payment.amountCents)}</span>
              <span
                className={`font-condensed border px-2 py-0.5 text-xs tracking-wider uppercase ${
                  payment.status === 'CONFIRMED'
                    ? 'border-wa/50 text-wa'
                    : payment.status === 'PENDING'
                      ? 'border-gold/50 text-gold'
                      : 'border-ember/50 text-ember'
                }`}
              >
                {t(`paymentStatus.${payment.status}`)}
              </span>
              <span className="text-bone/40 text-xs whitespace-nowrap">
                {formatDateTime(payment.createdAt, currentLocale)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
