import { useEffect, useState } from 'react';
import { api } from '../api';

const fmtMoney = (n) => 'R' + Number(n).toLocaleString('en-ZA', { maximumFractionDigits: 0 });

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '4px 0' }}>
      <span style={{ color: '#64748b' }}>{label}</span>
      <span style={{ fontWeight: 700, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

export default function InvoiceModal({ bookingId, onClose }) {
  const [inv, setInv] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/bookings/${bookingId}/invoice`).then((d) => setInv(d.invoice)).catch((e) => setError(e.message));
  }, [bookingId]);

  const print = () => window.print();

  if (!inv && !error) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
          <div className="loading"><span className="spinner" /> Loading invoice…</div>
        </div>
      </div>
    );
  }

  const rows = (inv && inv.items) || [];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>{(inv?.kind === 'receipt' ? 'Receipt' : 'Tax Invoice')}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕ Close</button>
        </div>

        {error && <div className="form-error">{error}</div>}

        {inv && (
          <>
            <div id="invoice-print" className="invoice-doc">
              <div className="invoice-head">
                <div>
                  <div className="invoice-brand">
                    <span className="invoice-logo">🚛</span>
                    <span className="invoice-brand-name">{inv.company.name}</span>
                  </div>
                  <div className="invoice-company">{inv.company.address} · {inv.company.city}</div>
                  <div className="invoice-company">{inv.company.country} · Reg {inv.company.regNo} · VAT {inv.company.vatNo}</div>
                </div>
                <div className="invoice-meta">
                  <div className="invoice-doc-title">{inv.kind === 'receipt' ? 'RECEIPT' : 'TAX INVOICE'}</div>
                  <div><span className="muted">No:</span> <b>{inv.invoiceNumber}</b></div>
                  <div><span className="muted">Booking:</span> {inv.reference}</div>
                  <div><span className="muted">Date:</span> {new Date(inv.issueDate).toLocaleDateString('en-ZA')}</div>
                  {inv.kind === 'invoice' && <div><span className="muted">Due:</span> {new Date(inv.dueDate).toLocaleDateString('en-ZA')}</div>}
                </div>
              </div>

              <div className="invoice-parties">
                <div>
                  <div className="muted small">BILL TO</div>
                  <div className="bold">{inv.billTo.name}</div>
                  {inv.billTo.company && <div>{inv.billTo.company}</div>}
                  {inv.billTo.email && <div className="muted">{inv.billTo.email}</div>}
                  {inv.billTo.phone && <div className="muted">{inv.billTo.phone}</div>}
                </div>
                <div className="text-right">
                  <div className="muted small">SERVICE</div>
                  <div className="bold">{inv.service.truckType}</div>
                  <div>{inv.service.distanceKm} km · {inv.service.weight} t</div>
                  <div className="muted">{inv.service.cargo}</div>
                </div>
              </div>

              <div className="invoice-route">
                <div className="muted small">ROUTE</div>
                <div>{inv.service.pickup} → {inv.service.dropoff}</div>
              </div>

              <table className="invoice-table">
                <thead><tr><th>Description</th><th className="text-right">Amount</th></tr></thead>
                <tbody>
                  {rows.map((it, i) => (
                    <tr key={i}>
                      <td><div className="bold">{it.label}</div><div className="muted small">{it.detail}</div></td>
                      <td className="text-right bold">{fmtMoney(it.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="invoice-totals">
                <Row label="Subtotal (excl. VAT)" value={fmtMoney(inv.subtotal)} />
                <Row label="VAT (15%)" value={fmtMoney(inv.vat)} />
                <Row label="Total (incl. VAT)" value={fmtMoney(inv.total)} />
                {inv.kind === 'receipt' && inv.paymentReference && (
                  <><Row label="Payment reference" value={inv.paymentReference} /><Row label="Method" value={(inv.paymentMethod || '').toUpperCase()} /></>
                )}
              </div>

              <div className="invoice-foot">
                {inv.kind === 'invoice' ? 'Payment due within 14 days. Please quote the invoice number with your EFT.' : 'Thank you for shipping with BridgeTech Logistics.'}
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={print}>🖨 Print / Save as PDF</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
