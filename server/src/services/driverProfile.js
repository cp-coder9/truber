/**
 * Driver profile builder — computes a rich profile from the driver record plus
 * booking history, including a deterministic (stable) rating distribution and a
 * small set of sample customer reviews so the client can preview real-feeling
 * profiles without a full review system.
 */

const REVIEW_POOL = [
  { from: 'Lerato M.', company: 'Acme Foods', text: 'Professional and on time. Truck was spotless and the driver kept me updated the whole route.', rating: 5 },
  { from: 'David N.', company: 'SteelMart', text: 'Very careful with the load. Would definitely use again.', rating: 5 },
  { from: 'Sarah vW.', company: 'Winelands', text: 'Smooth pickup and delivery. Slightly later than scheduled but communicated well.', rating: 4 },
  { from: 'Thabo K.', company: 'BuildRight', text: 'Great experience — friendly, experienced and handled the crane off-load safely.', rating: 5 },
  { from: 'Nomsa P.', company: 'AgriFresh', text: 'Cold chain stayed intact, good driver.', rating: 4 },
];

function driverProfile(driver, db) {
  const completed = db.bookings.filter((b) => b.driverId === driver.id && b.status === 'completed');
  const completedTrips = completed.length;
  const totalTrips = db.bookings.filter((b) => b.driverId === driver.id).length;
  const rating = Number(driver.rating) || 5;

  // Deterministic rating distribution based on the driver id + rating.
  const seed = (driver.id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const reviewCount = 18 + (seed % 60);
  const five = Math.round((reviewCount * (rating / 5)) * (0.72 + (seed % 10) / 100));
  const four = Math.round((reviewCount - five) * 0.6);
  const three = Math.max(0, reviewCount - five - four);
  const ratingBreakdown = [
    { stars: 5, count: five },
    { stars: 4, count: four },
    { stars: 3, count: three },
    { stars: 2, count: 0 },
    { stars: 1, count: 0 },
  ];

  // Sample reviews (stable subset).
  const reviews = REVIEW_POOL.slice(0, 2 + (seed % 3)).map((r) => ({
    ...r,
    rating: rating - (seed % 2) >= 4 ? r.rating : Math.max(4, r.rating - 1),
    date: new Date(Date.now() - ((seed + 3) * 86400000)).toISOString(),
  }));

  return {
    id: driver.id,
    name: driver.name,
    phone: driver.phone,
    email: driver.email || '',
    licenseNumber: driver.licenseNumber,
    licenseType: driver.licenseType,
    status: driver.status,
    rating,
    ratingCount: reviewCount,
    ratingBreakdown,
    yearsExperience: driver.yearsExperience,
    truckId: driver.truckId,
    location: driver.location,
    completedTrips,
    totalTrips,
    reviews,
    avatarColor: DriverColor(driver.name),
  };
}

function DriverColor(name) {
  const palette = ['#2a9d8f', '#0b2545', '#e8890a', '#2563eb', '#7c3aed', '#059669'];
  const sum = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return palette[sum % palette.length];
}

module.exports = { driverProfile };
