const bcrypt = require('bcryptjs');
const { pool } = require('./database');
const GOMBE_GEO = require('../data/gombe-geo');
require('dotenv').config();

async function firstValue(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows[0];
}

async function seed() {
  try {
    const lgaIds = {};
    const wardIds = {};
    let firstGombeWardId = null;
    let firstGombePUId = null;
    let gombeIdLGA = null;

    for (const lga of GOMBE_GEO.lgas) {
      const row = await firstValue(
        `INSERT INTO lgas (name, code, headquarters, latitude, longitude)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [lga.name, lga.code, lga.headquarters, lga.coordinates.lat, lga.coordinates.lng],
      );
      const lgaId = row?.id || (await firstValue('SELECT id FROM lgas WHERE code = ?', [lga.code])).id;
      lgaIds[lga.code] = lgaId;
      if (lga.code === 'GOM') gombeIdLGA = lgaId;
    }

    for (const lga of GOMBE_GEO.lgas) {
      const lgaId = lgaIds[lga.code];
      for (const ward of lga.wards) {
        const row = await firstValue(
          `INSERT INTO wards (lga_id, name, code)
           VALUES (?, ?, ?)
           ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
           RETURNING id`,
          [lgaId, ward.name, ward.code],
        );
        const wardId = row?.id || (await firstValue('SELECT id FROM wards WHERE code = ?', [ward.code])).id;
        wardIds[ward.code] = wardId;
        if (lga.code === 'GOM' && !firstGombeWardId) firstGombeWardId = wardId;
      }
    }

    for (const lga of GOMBE_GEO.lgas) {
      const lgaId = lgaIds[lga.code];
      for (const ward of lga.wards) {
        const wardId = wardIds[ward.code];
        for (const pu of ward.pollingUnits) {
          const row = await firstValue(
            `INSERT INTO polling_units (ward_id, lga_id, name, code, inec_pu_code, registered_voters, latitude, longitude)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
             RETURNING id`,
            [wardId, lgaId, pu.name, pu.code, pu.code, pu.registeredVoters, pu.coordinates?.lat || null, pu.coordinates?.lng || null],
          );
          if (lga.code === 'GOM' && wardId === firstGombeWardId && !firstGombePUId) {
            firstGombePUId = row?.id || (await firstValue('SELECT id FROM polling_units WHERE code = ?', [pu.code])).id;
          }
        }
      }
    }

    const election = await firstValue(
      `INSERT INTO elections (title, election_type, election_date, election_year, status, state, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [
        '2027 Gombe State Gubernatorial Election',
        'gubernatorial',
        '2027-03-06',
        2027,
        'ongoing',
        'Gombe',
        'The 2027 Gombe State Gubernatorial Election to elect the next Governor of Gombe State, Nigeria.',
      ],
    );
    const electionId = election?.id || (await firstValue("SELECT id FROM elections WHERE title LIKE '%2027%' ORDER BY id LIMIT 1")).id;

    const candidates = [
      { full_name: 'Prof. Ibrahim Isa Pantami', party_code: 'PDP', party_name: 'Peoples Democratic Party', position: 1 },
      { full_name: 'Muhammadu Inuwa Yahaya', party_code: 'APC', party_name: 'All Progressives Congress', position: 2 },
      { full_name: 'Abubakar Mohammed Garba', party_code: 'NNPP', party_name: 'New Nigeria Peoples Party', position: 3 },
      { full_name: 'Ibrahim Alkali', party_code: 'LP', party_name: 'Labour Party', position: 4 },
    ];
    for (const candidate of candidates) {
      await pool.query(
        `INSERT INTO candidates (election_id, full_name, party_code, party_name, position)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT (election_id, party_code) DO UPDATE SET full_name = EXCLUDED.full_name, party_name = EXCLUDED.party_name, position = EXCLUDED.position`,
        [electionId, candidate.full_name, candidate.party_code, candidate.party_name, candidate.position],
      );
    }

    const passwordHashes = {
      admin: await bcrypt.hash('Admin@GSEM2024!', 12),
      coordinator: await bcrypt.hash('Coord@123456!', 12),
      lga: await bcrypt.hash('LGA@123456!', 12),
      ward: await bcrypt.hash('Ward@123456!', 12),
      agent: await bcrypt.hash('Agent@123456!', 12),
      observer: await bcrypt.hash('Observer@123!', 12),
    };
    const users = [
      ['admin@gsem.ng', '+2348000000001', passwordHashes.admin, 'System', 'Administrator', 'super_admin', 'active', null, null, null],
      ['coordinator@gsem.ng', '+2348000000002', passwordHashes.coordinator, 'State', 'Coordinator', 'state_coordinator', 'active', null, null, null],
      ['gombe-lga@gsem.ng', '+2348000000003', passwordHashes.lga, 'Gombe LGA', 'Coordinator', 'lga_coordinator', 'active', gombeIdLGA, null, null],
      ['ward1@gsem.ng', '+2348000000004', passwordHashes.ward, 'Ward One', 'Officer', 'ward_officer', 'active', gombeIdLGA, firstGombeWardId, null],
      ['agent@gsem.ng', '+2348000000005', passwordHashes.agent, 'PU', 'Agent', 'pu_agent', 'active', gombeIdLGA, firstGombeWardId, firstGombePUId],
      ['observer@gsem.ng', '+2348000000006', passwordHashes.observer, 'Election', 'Observer', 'observer', 'active', null, null, null],
    ];
    for (const user of users) {
      await pool.query(
        `INSERT INTO users (email, phone, password_hash, first_name, last_name, role, status, lga_id, ward_id, polling_unit_id, email_verified)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)
         ON CONFLICT (email) DO UPDATE SET status = EXCLUDED.status, role = EXCLUDED.role, lga_id = EXCLUDED.lga_id, ward_id = EXCLUDED.ward_id, polling_unit_id = EXCLUDED.polling_unit_id`,
        user,
      );
    }

    const configs = [
      ['app_name', 'GSEM', 'Application name'],
      ['app_tagline', 'Counting Every Vote. Protecting Every Voice.', 'Application tagline'],
      ['election_state', 'Gombe', 'Target state'],
      ['max_upload_size', '10485760', 'Max file upload size in bytes'],
      ['max_images_per_submission', '5', 'Max images per result submission'],
      ['offline_sync_enabled', 'true', 'Enable offline sync'],
      ['maintenance_mode', 'false', 'Maintenance mode toggle'],
    ];
    for (const config of configs) {
      await pool.query(
        `INSERT INTO system_config (config_key, config_value, description)
         VALUES (?, ?, ?)
         ON CONFLICT (config_key) DO UPDATE SET config_value = EXCLUDED.config_value, description = EXCLUDED.description`,
        config,
      );
    }

    const counts = {};
    for (const table of ['lgas', 'wards', 'polling_units', 'elections', 'candidates', 'users']) {
      const row = await firstValue(`SELECT COUNT(*)::INTEGER AS count FROM ${table}`);
      counts[table] = row.count;
    }
    console.log(`Seed complete: ${JSON.stringify(counts)}`);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

if (require.main === module) seed();

module.exports = { seed };
