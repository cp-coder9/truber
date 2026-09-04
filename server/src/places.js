/**
 * Lightweight offline geocoder for South African cities & major towns.
 * Keeps the demo fully self-contained (no external maps/API keys required)
 * while still letting the user pick real locations around the country.
 */

const PLACES = [
  { name: 'Cape Town', province: 'Western Cape', lat: -33.9249, lng: 18.4241, aliases: ['cape town', 'capetown', 'ct'] },
  { name: 'Johannesburg', province: 'Gauteng', lat: -26.2041, lng: 28.0473, aliases: ['johannesburg', 'joburg', 'jhb', 'jozi'] },
  { name: 'Durban', province: 'KwaZulu-Natal', lat: -29.8587, lng: 31.0218, aliases: ['durban', 'dbn'] },
  { name: 'Pretoria', province: 'Gauteng', lat: -25.7479, lng: 28.2293, aliases: ['pretoria', 'pta', 'tshwane'] },
  { name: 'Gqeberha (Port Elizabeth)', province: 'Eastern Cape', lat: -33.9608, lng: 25.6022, aliases: ['gqeberha', 'port elizabeth', 'pe', 'p.e.'] },
  { name: 'Bloemfontein', province: 'Free State', lat: -29.0852, lng: 26.1596, aliases: ['bloemfontein', 'bloem', 'mangaung'] },
  { name: 'Mbombela (Nelspruit)', province: 'Mpumalanga', lat: -25.4585, lng: 30.9699, aliases: ['mbombela', 'nelspruit', 'nel'] },
  { name: 'Polokwane', province: 'Limpopo', lat: -23.9045, lng: 29.4689, aliases: ['polokwane', 'polok', 'pietersburg'] },
  { name: 'East London', province: 'Eastern Cape', lat: -33.0292, lng: 27.8546, aliases: ['east london', 'buffalo city'] },
  { name: 'Kimberley', province: 'Northern Cape', lat: -28.7282, lng: 24.7499, aliases: ['kimberley'] },
  { name: 'George', province: 'Western Cape', lat: -33.9597, lng: 22.4617, aliases: ['george'] },
  { name: 'Pietermaritzburg', province: 'KwaZulu-Natal', lat: -29.6006, lng: 30.3794, aliases: ['pietermaritzburg', 'pmb', 'maritzburg'] },
  { name: 'Rustenburg', province: 'North West', lat: -25.6671, lng: 27.2421, aliases: ['rustenburg'] },
  { name: 'Potchefstroom', province: 'North West', lat: -26.7167, lng: 27.1, aliases: ['potchefstroom', 'potch'] },
  { name: 'Stellenbosch', province: 'Western Cape', lat: -33.9321, lng: 18.8612, aliases: ['stellenbosch', 'stelly'] },
  { name: 'Witbank (eMalahleni)', province: 'Mpumalanga', lat: -25.8777, lng: 29.2194, aliases: ['witbank', 'emalahleni'] },
];

function search(query) {
  const q = String(query || '').toLowerCase().trim().replace(/\s+/g, '');
  if (!q) return [];
  return PLACES.filter((p) => {
    const name = p.name.toLowerCase().replace(/\s+/g, '');
    const province = p.province.toLowerCase().replace(/\s+/g, '');
    const aliases = (p.aliases || []).map((a) => a.replace(/\s+/g, ''));
    return name.includes(q) || province.includes(q) || aliases.some((a) => a.includes(q) || q.includes(a));
  }).slice(0, 10);
}

function all() {
  return PLACES;
}

module.exports = { search, all, PLACES };
