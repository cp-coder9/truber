/**
 * Distance helpers. South African road networks mean a truck rarely travels in
 * a straight line, so we approximate road distance from straight-line
 * (haversine) distance with a winding factor.
 */

const EARTH_RADIUS_KM = 6371;

/**
 * Great-circle distance between two points in kilometres.
 */
function distanceBetweenLatLng(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Approximate road distance (km) from a straight-line distance. For short trips
 * we use a smaller winding factor; for long inter-provincial hauls the highway
 * network is comparatively direct.
 */
function roadDistance(straightKm) {
  const factor = straightKm < 20 ? 1.42 : straightKm < 200 ? 1.25 : 1.18;
  return straightKm * factor;
}

module.exports = { distanceBetweenLatLng, roadDistance };
