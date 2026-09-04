const LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
  paid: 'Paid',
  unpaid: 'Unpaid',
  available: 'Available',
  on_trip: 'On Trip',
  maintenance: 'Maintenance',
  off: 'Off Duty',
};

export default function Badge({ status }) {
  return <span className={'badge ' + (status || '')}>{LABELS[status] || status}</span>;
}
