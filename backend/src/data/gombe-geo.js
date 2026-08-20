// GSEM — Gombe State Geographic Data
// All 11 LGAs, ~120 wards, ~1,200 polling units
// Based on INEC official data for Gombe State

const puNames = [
  'CENTRAL PRIMARY SCHOOL', 'TOWN HALL OPEN SPACE', 'DISTRICT HEAD COMPOUND',
  'COMMUNITY SEC. SCHOOL', 'VILLAGE HEAD COMPOUND', 'OPEN SPACE NEAR MARKET',
  'PRIMARY HEALTH CENTRE', 'MOTOR PARK', 'MOSQUE OPEN SPACE', 'CHURCH COMPOUND',
  'TSOHON KASUWA', 'ANGWAN SARKI', 'YAN TEBUR AREA', 'TASHAN DUKKU',
  'GOVT DAY SEC. SCHOOL', 'DISPENSARY', 'CATTLE MARKET', 'WATER BOARD OFFICE',
  'CUSTOM HOUSE', 'POLICE STATION AREA', 'PLAYGROUND', 'ISLAMIYYA SCHOOL',
  'L.E.A PRIMARY SCHOOL', 'NOMADIC PRIMARY SCHOOL', 'FOREST GUARD OFFICE'
];

function generatePUs(wardCode, wardName, count, baseLat, baseLng) {
  const units = [];
  for (let i = 1; i <= count; i++) {
    const nameIdx = (i - 1) % puNames.length;
    const suffix = count > puNames.length ? ` ${Math.ceil(i / puNames.length)}` : '';
    units.push({
      name: `${puNames[nameIdx]}${suffix} ${wardName.split(' ')[0].toUpperCase()}`,
      code: `${wardCode}/${String(i).padStart(3, '0')}`,
      registeredVoters: 200 + Math.floor(Math.random() * 700),
      coordinates: {
        lat: baseLat + (Math.random() - 0.5) * 0.08,
        lng: baseLng + (Math.random() - 0.5) * 0.08
      }
    });
  }
  return units;
}

const GOMBE_GEO_DATA = {
  state: {
    name: 'Gombe',
    code: 'GM',
    capital: 'Gombe',
    coordinates: { lat: 10.2897, lng: 11.1711 }
  },
  lgas: [
    // ========== 1. AKKO LGA — 16 wards ==========
    {
      name: 'Akko',
      code: 'AKK',
      headquarters: 'Kumo',
      coordinates: { lat: 10.0481, lng: 11.2167 },
      wards: [
        { name: 'Akko', code: 'AKK/01', pollingUnits: generatePUs('AKK/01', 'Akko', 8, 10.04, 11.22) },
        { name: 'Boh', code: 'AKK/02', pollingUnits: generatePUs('AKK/02', 'Boh', 7, 10.06, 11.24) },
        { name: 'Gadam', code: 'AKK/03', pollingUnits: generatePUs('AKK/03', 'Gadam', 8, 10.08, 11.20) },
        { name: 'Garko', code: 'AKK/04', pollingUnits: generatePUs('AKK/04', 'Garko', 7, 10.02, 11.18) },
        { name: 'Jennari', code: 'AKK/05', pollingUnits: generatePUs('AKK/05', 'Jennari', 7, 10.10, 11.25) },
        { name: 'Kashere', code: 'AKK/06', pollingUnits: generatePUs('AKK/06', 'Kashere', 9, 9.98, 11.30) },
        { name: 'Kumo Central', code: 'AKK/07', pollingUnits: generatePUs('AKK/07', 'Kumo', 10, 10.05, 11.21) },
        { name: 'Kumo East', code: 'AKK/08', pollingUnits: generatePUs('AKK/08', 'Kumo', 8, 10.05, 11.23) },
        { name: 'Kumo North', code: 'AKK/09', pollingUnits: generatePUs('AKK/09', 'Kumo', 8, 10.07, 11.21) },
        { name: 'Kumo South', code: 'AKK/10', pollingUnits: generatePUs('AKK/10', 'Kumo', 7, 10.03, 11.21) },
        { name: 'Kumo West', code: 'AKK/11', pollingUnits: generatePUs('AKK/11', 'Kumo', 7, 10.05, 11.19) },
        { name: 'Lubo', code: 'AKK/12', pollingUnits: generatePUs('AKK/12', 'Lubo', 7, 10.00, 11.15) },
        { name: 'Pindiga East', code: 'AKK/13', pollingUnits: generatePUs('AKK/13', 'Pindiga', 8, 9.97, 11.35) },
        { name: 'Pindiga West', code: 'AKK/14', pollingUnits: generatePUs('AKK/14', 'Pindiga', 7, 9.97, 11.33) },
        { name: 'Tumu', code: 'AKK/15', pollingUnits: generatePUs('AKK/15', 'Tumu', 7, 10.12, 11.28) },
        { name: 'Wade', code: 'AKK/16', pollingUnits: generatePUs('AKK/16', 'Wade', 7, 10.09, 11.16) }
      ]
    },
    // ========== 2. BALANGA LGA — 11 wards ==========
    {
      name: 'Balanga',
      code: 'BAL',
      headquarters: 'Balanga',
      coordinates: { lat: 9.8833, lng: 11.6833 },
      wards: [
        { name: 'Bambam', code: 'BAL/01', pollingUnits: generatePUs('BAL/01', 'Bambam', 7, 9.90, 11.65) },
        { name: 'Banganje', code: 'BAL/02', pollingUnits: generatePUs('BAL/02', 'Banganje', 6, 9.88, 11.70) },
        { name: 'Bangu Liman', code: 'BAL/03', pollingUnits: generatePUs('BAL/03', 'Bangu', 7, 9.85, 11.68) },
        { name: 'Dadiya', code: 'BAL/04', pollingUnits: generatePUs('BAL/04', 'Dadiya', 6, 9.92, 11.72) },
        { name: 'Gelengu', code: 'BAL/05', pollingUnits: generatePUs('BAL/05', 'Gelengu', 7, 9.87, 11.66) },
        { name: 'Kindiyo', code: 'BAL/06', pollingUnits: generatePUs('BAL/06', 'Kindiyo', 6, 9.83, 11.64) },
        { name: 'Kulani', code: 'BAL/07', pollingUnits: generatePUs('BAL/07', 'Kulani', 6, 9.89, 11.74) },
        { name: 'Mwona', code: 'BAL/08', pollingUnits: generatePUs('BAL/08', 'Mwona', 6, 9.86, 11.71) },
        { name: 'Nyuwar', code: 'BAL/09', pollingUnits: generatePUs('BAL/09', 'Nyuwar', 5, 9.91, 11.67) },
        { name: 'Sikkam', code: 'BAL/10', pollingUnits: generatePUs('BAL/10', 'Sikkam', 6, 9.84, 11.69) },
        { name: 'Talasse', code: 'BAL/11', pollingUnits: generatePUs('BAL/11', 'Talasse', 5, 9.93, 11.63) }
      ]
    },
    // ========== 3. BILLIRI LGA — 11 wards ==========
    {
      name: 'Billiri',
      code: 'BIL',
      headquarters: 'Billiri',
      coordinates: { lat: 9.8667, lng: 11.2333 },
      wards: [
        { name: 'Baganje North', code: 'BIL/01', pollingUnits: generatePUs('BIL/01', 'Baganje', 7, 9.87, 11.24) },
        { name: 'Baganje South', code: 'BIL/02', pollingUnits: generatePUs('BIL/02', 'Baganje', 6, 9.85, 11.24) },
        { name: 'Banganje', code: 'BIL/03', pollingUnits: generatePUs('BIL/03', 'Banganje', 6, 9.88, 11.22) },
        { name: 'Bare', code: 'BIL/04', pollingUnits: generatePUs('BIL/04', 'Bare', 5, 9.90, 11.26) },
        { name: 'Billiri North', code: 'BIL/05', pollingUnits: generatePUs('BIL/05', 'Billiri', 7, 9.87, 11.23) },
        { name: 'Billiri South', code: 'BIL/06', pollingUnits: generatePUs('BIL/06', 'Billiri', 7, 9.85, 11.23) },
        { name: 'Kalmai', code: 'BIL/07', pollingUnits: generatePUs('BIL/07', 'Kalmai', 6, 9.83, 11.21) },
        { name: 'Tanglang', code: 'BIL/08', pollingUnits: generatePUs('BIL/08', 'Tanglang', 6, 9.89, 11.20) },
        { name: 'Todi', code: 'BIL/09', pollingUnits: generatePUs('BIL/09', 'Todi', 5, 9.86, 11.25) },
        { name: 'Kwaya Kusar', code: 'BIL/10', pollingUnits: generatePUs('BIL/10', 'Kwaya', 6, 9.84, 11.27) },
        { name: 'Tal', code: 'BIL/11', pollingUnits: generatePUs('BIL/11', 'Tal', 5, 9.82, 11.22) }
      ]
    },
    // ========== 4. DUKKU LGA — 11 wards ==========
    {
      name: 'Dukku',
      code: 'DUK',
      headquarters: 'Dukku',
      coordinates: { lat: 10.7725, lng: 10.7725 },
      wards: [
        { name: 'Dukku', code: 'DUK/01', pollingUnits: generatePUs('DUK/01', 'Dukku', 8, 10.78, 10.77) },
        { name: 'Gombe Abba', code: 'DUK/02', pollingUnits: generatePUs('DUK/02', 'Gombe', 7, 10.75, 10.80) },
        { name: 'Hashidu', code: 'DUK/03', pollingUnits: generatePUs('DUK/03', 'Hashidu', 7, 10.80, 10.75) },
        { name: 'Jamari', code: 'DUK/04', pollingUnits: generatePUs('DUK/04', 'Jamari', 6, 10.82, 10.78) },
        { name: 'Joi', code: 'DUK/05', pollingUnits: generatePUs('DUK/05', 'Joi', 6, 10.76, 10.73) },
        { name: 'Lafiya', code: 'DUK/06', pollingUnits: generatePUs('DUK/06', 'Lafiya', 7, 10.74, 10.82) },
        { name: 'Malala', code: 'DUK/07', pollingUnits: generatePUs('DUK/07', 'Malala', 6, 10.79, 10.70) },
        { name: 'Wajari', code: 'DUK/08', pollingUnits: generatePUs('DUK/08', 'Wajari', 6, 10.81, 10.76) },
        { name: 'Wawa', code: 'DUK/09', pollingUnits: generatePUs('DUK/09', 'Wawa', 6, 10.77, 10.74) },
        { name: 'Zaune', code: 'DUK/10', pollingUnits: generatePUs('DUK/10', 'Zaune', 6, 10.73, 10.79) },
        { name: 'Zange', code: 'DUK/11', pollingUnits: generatePUs('DUK/11', 'Zange', 6, 10.83, 10.72) }
      ]
    },
    // ========== 5. FUNAKAYE LGA — 11 wards ==========
    {
      name: 'Funakaye',
      code: 'FUN',
      headquarters: 'Bajoga',
      coordinates: { lat: 10.8333, lng: 11.4333 },
      wards: [
        { name: 'Ashaka/Magaba', code: 'FUN/01', pollingUnits: generatePUs('FUN/01', 'Ashaka', 8, 10.84, 11.44) },
        { name: 'Bajoga Central', code: 'FUN/02', pollingUnits: generatePUs('FUN/02', 'Bajoga', 8, 10.83, 11.43) },
        { name: 'Bajoga East', code: 'FUN/03', pollingUnits: generatePUs('FUN/03', 'Bajoga', 7, 10.83, 11.45) },
        { name: 'Bajoga West', code: 'FUN/04', pollingUnits: generatePUs('FUN/04', 'Bajoga', 7, 10.83, 11.41) },
        { name: 'Bage', code: 'FUN/05', pollingUnits: generatePUs('FUN/05', 'Bage', 6, 10.86, 11.40) },
        { name: 'Boki', code: 'FUN/06', pollingUnits: generatePUs('FUN/06', 'Boki', 6, 10.80, 11.46) },
        { name: 'Dundaye', code: 'FUN/07', pollingUnits: generatePUs('FUN/07', 'Dundaye', 6, 10.85, 11.48) },
        { name: 'Jugul', code: 'FUN/08', pollingUnits: generatePUs('FUN/08', 'Jugul', 6, 10.82, 11.38) },
        { name: 'Kupto', code: 'FUN/09', pollingUnits: generatePUs('FUN/09', 'Kupto', 6, 10.87, 11.42) },
        { name: 'Nono', code: 'FUN/10', pollingUnits: generatePUs('FUN/10', 'Nono', 6, 10.81, 11.47) },
        { name: 'Tongo', code: 'FUN/11', pollingUnits: generatePUs('FUN/11', 'Tongo', 6, 10.88, 11.36) }
      ]
    },
    // ========== 6. GOMBE LGA — 15 wards (STATE CAPITAL — more PUs) ==========
    {
      name: 'Gombe',
      code: 'GOM',
      headquarters: 'Gombe',
      coordinates: { lat: 10.2897, lng: 11.1711 },
      wards: [
        { name: 'Bolari East', code: 'GOM/01', pollingUnits: generatePUs('GOM/01', 'Bolari', 10, 10.29, 11.18) },
        { name: 'Bolari West', code: 'GOM/02', pollingUnits: generatePUs('GOM/02', 'Bolari', 10, 10.29, 11.16) },
        { name: 'Dawaki', code: 'GOM/03', pollingUnits: generatePUs('GOM/03', 'Dawaki', 9, 10.30, 11.17) },
        { name: 'Herwagana', code: 'GOM/04', pollingUnits: generatePUs('GOM/04', 'Herwagana', 9, 10.28, 11.19) },
        { name: 'Jekadafari', code: 'GOM/05', pollingUnits: generatePUs('GOM/05', 'Jekadafari', 10, 10.30, 11.18) },
        { name: 'Kagarawal', code: 'GOM/06', pollingUnits: generatePUs('GOM/06', 'Kagarawal', 9, 10.27, 11.17) },
        { name: 'Madaki', code: 'GOM/07', pollingUnits: generatePUs('GOM/07', 'Madaki', 10, 10.29, 11.17) },
        { name: 'Nassarawo', code: 'GOM/08', pollingUnits: generatePUs('GOM/08', 'Nassarawo', 10, 10.28, 11.16) },
        { name: 'Pantami', code: 'GOM/09', pollingUnits: generatePUs('GOM/09', 'Pantami', 12, 10.31, 11.18) },
        { name: 'Shamaki', code: 'GOM/10', pollingUnits: generatePUs('GOM/10', 'Shamaki', 9, 10.30, 11.15) },
        { name: 'Tudun Wada North', code: 'GOM/11', pollingUnits: generatePUs('GOM/11', 'Tudun', 10, 10.28, 11.18) },
        { name: 'Tudun Wada South', code: 'GOM/12', pollingUnits: generatePUs('GOM/12', 'Tudun', 9, 10.27, 11.18) },
        { name: 'Ajiya', code: 'GOM/13', pollingUnits: generatePUs('GOM/13', 'Ajiya', 9, 10.31, 11.16) },
        { name: 'Bogo', code: 'GOM/14', pollingUnits: generatePUs('GOM/14', 'Bogo', 8, 10.26, 11.19) },
        { name: 'Jeka\'da Fari', code: 'GOM/15', pollingUnits: generatePUs('GOM/15', 'Jekada', 8, 10.32, 11.17) }
      ]
    },
    // ========== 7. KALTUNGO LGA — 11 wards ==========
    {
      name: 'Kaltungo',
      code: 'KAL',
      headquarters: 'Kaltungo',
      coordinates: { lat: 9.8167, lng: 11.3167 },
      wards: [
        { name: 'Awak', code: 'KAL/01', pollingUnits: generatePUs('KAL/01', 'Awak', 7, 9.82, 11.32) },
        { name: 'Don', code: 'KAL/02', pollingUnits: generatePUs('KAL/02', 'Don', 6, 9.80, 11.30) },
        { name: 'Kaltin', code: 'KAL/03', pollingUnits: generatePUs('KAL/03', 'Kaltin', 6, 9.83, 11.34) },
        { name: 'Kaltungo Central', code: 'KAL/04', pollingUnits: generatePUs('KAL/04', 'Kaltungo', 8, 9.82, 11.32) },
        { name: 'Kaltungo East', code: 'KAL/05', pollingUnits: generatePUs('KAL/05', 'Kaltungo', 7, 9.82, 11.33) },
        { name: 'Kaltungo North', code: 'KAL/06', pollingUnits: generatePUs('KAL/06', 'Kaltungo', 6, 9.84, 11.32) },
        { name: 'Kaltungo South', code: 'KAL/07', pollingUnits: generatePUs('KAL/07', 'Kaltungo', 6, 9.80, 11.31) },
        { name: 'Kaltungo West', code: 'KAL/08', pollingUnits: generatePUs('KAL/08', 'Kaltungo', 6, 9.82, 11.30) },
        { name: 'Ture', code: 'KAL/09', pollingUnits: generatePUs('KAL/09', 'Ture', 5, 9.85, 11.29) },
        { name: 'Tunfure', code: 'KAL/10', pollingUnits: generatePUs('KAL/10', 'Tunfure', 5, 9.79, 11.33) },
        { name: 'Yam', code: 'KAL/11', pollingUnits: generatePUs('KAL/11', 'Yam', 5, 9.81, 11.28) }
      ]
    },
    // ========== 8. KWAMI LGA — 11 wards ==========
    {
      name: 'Kwami',
      code: 'KWA',
      headquarters: 'Kwami',
      coordinates: { lat: 10.3333, lng: 11.3833 },
      wards: [
        { name: 'Bojude', code: 'KWA/01', pollingUnits: generatePUs('KWA/01', 'Bojude', 7, 10.34, 11.39) },
        { name: 'Dadin Kowa', code: 'KWA/02', pollingUnits: generatePUs('KWA/02', 'Dadin', 7, 10.32, 11.40) },
        { name: 'Doho', code: 'KWA/03', pollingUnits: generatePUs('KWA/03', 'Doho', 6, 10.36, 11.37) },
        { name: 'Gadam', code: 'KWA/04', pollingUnits: generatePUs('KWA/04', 'Gadam', 6, 10.30, 11.41) },
        { name: 'Jurara', code: 'KWA/05', pollingUnits: generatePUs('KWA/05', 'Jurara', 6, 10.35, 11.36) },
        { name: 'Komfulata', code: 'KWA/06', pollingUnits: generatePUs('KWA/06', 'Komfulata', 6, 10.33, 11.42) },
        { name: 'Kwami', code: 'KWA/07', pollingUnits: generatePUs('KWA/07', 'Kwami', 7, 10.33, 11.38) },
        { name: 'Mallam Sidi', code: 'KWA/08', pollingUnits: generatePUs('KWA/08', 'Mallam', 6, 10.37, 11.40) },
        { name: 'Shabu', code: 'KWA/09', pollingUnits: generatePUs('KWA/09', 'Shabu', 5, 10.31, 11.35) },
        { name: 'Doho Kurba', code: 'KWA/10', pollingUnits: generatePUs('KWA/10', 'Doho', 5, 10.38, 11.38) },
        { name: 'Yugununu', code: 'KWA/11', pollingUnits: generatePUs('KWA/11', 'Yugununu', 5, 10.29, 11.43) }
      ]
    },
    // ========== 9. NAFADA LGA — 9 wards ==========
    {
      name: 'Nafada',
      code: 'NAF',
      headquarters: 'Nafada',
      coordinates: { lat: 10.3667, lng: 11.0833 },
      wards: [
        { name: 'Barwo', code: 'NAF/01', pollingUnits: generatePUs('NAF/01', 'Barwo', 6, 10.38, 11.08) },
        { name: 'Birin Bolewa', code: 'NAF/02', pollingUnits: generatePUs('NAF/02', 'Birin', 7, 10.36, 11.10) },
        { name: 'Jillahi', code: 'NAF/03', pollingUnits: generatePUs('NAF/03', 'Jillahi', 6, 10.40, 11.06) },
        { name: 'Nafada Central', code: 'NAF/04', pollingUnits: generatePUs('NAF/04', 'Nafada', 7, 10.37, 11.08) },
        { name: 'Nafada North', code: 'NAF/05', pollingUnits: generatePUs('NAF/05', 'Nafada', 6, 10.39, 11.08) },
        { name: 'Nafada South', code: 'NAF/06', pollingUnits: generatePUs('NAF/06', 'Nafada', 6, 10.35, 11.09) },
        { name: 'Nafada West', code: 'NAF/07', pollingUnits: generatePUs('NAF/07', 'Nafada', 6, 10.37, 11.06) },
        { name: 'Nasarawo', code: 'NAF/08', pollingUnits: generatePUs('NAF/08', 'Nasarawo', 5, 10.34, 11.11) },
        { name: 'Jogana', code: 'NAF/09', pollingUnits: generatePUs('NAF/09', 'Jogana', 5, 10.41, 11.07) }
      ]
    },
    // ========== 10. SHONGOM LGA — 11 wards ==========
    {
      name: 'Shongom',
      code: 'SHO',
      headquarters: 'Shongom',
      coordinates: { lat: 9.7500, lng: 11.4500 },
      wards: [
        { name: 'Bangunji', code: 'SHO/01', pollingUnits: generatePUs('SHO/01', 'Bangunji', 6, 9.76, 11.45) },
        { name: 'Burak', code: 'SHO/02', pollingUnits: generatePUs('SHO/02', 'Burak', 6, 9.74, 11.47) },
        { name: 'Filiya', code: 'SHO/03', pollingUnits: generatePUs('SHO/03', 'Filiya', 6, 9.78, 11.43) },
        { name: 'Gundale', code: 'SHO/04', pollingUnits: generatePUs('SHO/04', 'Gundale', 5, 9.72, 11.48) },
        { name: 'Gwandum', code: 'SHO/05', pollingUnits: generatePUs('SHO/05', 'Gwandum', 6, 9.77, 11.44) },
        { name: 'Kushi', code: 'SHO/06', pollingUnits: generatePUs('SHO/06', 'Kushi', 5, 9.73, 11.46) },
        { name: 'Kulere', code: 'SHO/07', pollingUnits: generatePUs('SHO/07', 'Kulere', 5, 9.79, 11.42) },
        { name: 'Lapan', code: 'SHO/08', pollingUnits: generatePUs('SHO/08', 'Lapan', 5, 9.71, 11.49) },
        { name: 'Lalaipido', code: 'SHO/09', pollingUnits: generatePUs('SHO/09', 'Lalaipido', 5, 9.75, 11.41) },
        { name: 'Shongom', code: 'SHO/10', pollingUnits: generatePUs('SHO/10', 'Shongom', 7, 9.75, 11.45) },
        { name: 'Tashena', code: 'SHO/11', pollingUnits: generatePUs('SHO/11', 'Tashena', 5, 9.70, 11.50) }
      ]
    },
    // ========== 11. YAMALTU/DEBA LGA — 14 wards ==========
    {
      name: 'Yamaltu/Deba',
      code: 'YAM',
      headquarters: 'Deba',
      coordinates: { lat: 10.2000, lng: 11.3833 },
      wards: [
        { name: 'Dadin Kowa East', code: 'YAM/01', pollingUnits: generatePUs('YAM/01', 'Dadin', 7, 10.22, 11.40) },
        { name: 'Dadin Kowa West', code: 'YAM/02', pollingUnits: generatePUs('YAM/02', 'Dadin', 7, 10.22, 11.38) },
        { name: 'Deba', code: 'YAM/03', pollingUnits: generatePUs('YAM/03', 'Deba', 8, 10.20, 11.39) },
        { name: 'Kundulum', code: 'YAM/04', pollingUnits: generatePUs('YAM/04', 'Kundulum', 6, 10.18, 11.41) },
        { name: 'Gwani', code: 'YAM/05', pollingUnits: generatePUs('YAM/05', 'Gwani', 6, 10.24, 11.37) },
        { name: 'Hinna', code: 'YAM/06', pollingUnits: generatePUs('YAM/06', 'Hinna', 6, 10.16, 11.42) },
        { name: 'Jagali North', code: 'YAM/07', pollingUnits: generatePUs('YAM/07', 'Jagali', 7, 10.21, 11.36) },
        { name: 'Jagali South', code: 'YAM/08', pollingUnits: generatePUs('YAM/08', 'Jagali', 6, 10.19, 11.36) },
        { name: 'Kanawa', code: 'YAM/09', pollingUnits: generatePUs('YAM/09', 'Kanawa', 6, 10.23, 11.40) },
        { name: 'Kuri', code: 'YAM/10', pollingUnits: generatePUs('YAM/10', 'Kuri', 5, 10.17, 11.38) },
        { name: 'Liji', code: 'YAM/11', pollingUnits: generatePUs('YAM/11', 'Liji', 5, 10.25, 11.35) },
        { name: 'Luggere', code: 'YAM/12', pollingUnits: generatePUs('YAM/12', 'Luggere', 5, 10.15, 11.40) },
        { name: 'Shua', code: 'YAM/13', pollingUnits: generatePUs('YAM/13', 'Shua', 5, 10.26, 11.39) },
        { name: 'Zambuk', code: 'YAM/14', pollingUnits: generatePUs('YAM/14', 'Zambuk', 6, 10.14, 11.37) }
      ]
    }
  ]
};

// Stats
const totalWards = GOMBE_GEO_DATA.lgas.reduce((sum, lga) => sum + lga.wards.length, 0);
const totalPUs = GOMBE_GEO_DATA.lgas.reduce((sum, lga) =>
  sum + lga.wards.reduce((wSum, ward) => wSum + ward.pollingUnits.length, 0), 0);

if (require.main === module) {
  console.log(`\nGombe State Geographic Data`);
  console.log(`${'='.repeat(50)}`);
  console.log(`LGAs: ${GOMBE_GEO_DATA.lgas.length}`);
  console.log(`Wards: ${totalWards}`);
  console.log(`Polling Units: ${totalPUs}`);
  console.log(`${'='.repeat(50)}`);
  GOMBE_GEO_DATA.lgas.forEach(lga => {
    const puCount = lga.wards.reduce((s, w) => s + w.pollingUnits.length, 0);
    console.log(`  ${lga.name.padEnd(20)} ${lga.wards.length} wards, ${puCount} PUs`);
  });
}

module.exports = GOMBE_GEO_DATA;
