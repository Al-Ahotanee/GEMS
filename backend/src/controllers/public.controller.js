const { pool, cache } = require('../config/database');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

// Public Situation Room — NO AUTH required
const getSituationRoom = async (req, res) => {
  try {
    const cacheKey = 'situation_room';
    const cached = cache.get(cacheKey);
    if (cached) return ApiResponse.success(res, cached);

    let [elections] = await pool.query("SELECT id, title, election_date, status FROM elections WHERE status = 'ongoing' LIMIT 1");
    if (!elections.length) {
      const [latest] = await pool.query('SELECT id, title, election_date, status FROM elections ORDER BY election_date DESC LIMIT 1');
      if (!latest.length) return ApiResponse.notFound(res, 'No election found');
      elections.push(latest[0]);
    }
    const election = elections[0];

    const [candidates] = await pool.query(
      `SELECT c.id as candidate_id, c.full_name, c.party_code, c.party_name, c.photo_url,
              COALESCE(SUM(CASE WHEN rs.id IS NOT NULL THEN vd.votes ELSE 0 END), 0) as total_votes
       FROM candidates c
       LEFT JOIN vote_data vd ON vd.candidate_id = c.id
       LEFT JOIN result_submissions rs ON rs.id = vd.submission_id AND rs.status = 'verified' AND rs.election_id = ?
       WHERE c.election_id = ?
       GROUP BY c.id ORDER BY total_votes DESC`,
      [election.id, election.id]
    );

    const totalVotes = candidates.reduce((s, c) => s + Number(c.total_votes), 0);
    const candidateResults = candidates.map(c => ({
      ...c,
      total_votes: Number(c.total_votes),
      vote_percentage: totalVotes > 0 ? Number(((Number(c.total_votes) / totalVotes) * 100).toFixed(2)) : 0
    }));

    const [puStats] = await pool.query('SELECT COUNT(*) as total FROM polling_units');
    const [reportedStats] = await pool.query(
      `SELECT COUNT(*) AS total FROM result_submissions
       WHERE election_id = ? AND status <> 'rejected'`, [election.id]
    );
    const [verifiedStats] = await pool.query(
      `SELECT COUNT(*) AS total FROM result_submissions
       WHERE election_id = ? AND status = 'verified'`, [election.id]
    );
    const [regVoters] = await pool.query('SELECT COALESCE(SUM(registered_voters), 0) as total FROM polling_units');
    const [votesCast] = await pool.query(
      "SELECT COALESCE(SUM(total_votes_cast), 0) AS total FROM result_submissions WHERE election_id = ? AND status = 'verified'",
      [election.id]
    );

    // LGA breakdown
    const [lgaBreakdown] = await pool.query(
      `SELECT l.id as lga_id, l.name as lga_name, l.latitude, l.longitude,
              (SELECT COUNT(*) FROM polling_units WHERE lga_id = l.id) as total_polling_units,
              (SELECT COUNT(*) FROM result_submissions WHERE lga_id = l.id AND election_id = ? AND status <> 'rejected') as reported_polling_units,
              (SELECT COUNT(*) FROM result_submissions WHERE lga_id = l.id AND election_id = ? AND status = 'verified') as verified_polling_units
       FROM lgas l ORDER BY l.name`,
      [election.id, election.id]
    );

    for (const lga of lgaBreakdown) {
      lga.total_polling_units = Number(lga.total_polling_units || 0);
      lga.reported_polling_units = Number(lga.reported_polling_units || 0);
      lga.verified_polling_units = Number(lga.verified_polling_units || 0);
      const [lgaCands] = await pool.query(
        `SELECT c.id as candidate_id, c.full_name, c.party_code,
                COALESCE(SUM(CASE WHEN rs.id IS NOT NULL THEN vd.votes ELSE 0 END), 0) as total_votes
         FROM candidates c
         LEFT JOIN vote_data vd ON vd.candidate_id = c.id
         LEFT JOIN result_submissions rs ON rs.id = vd.submission_id AND rs.lga_id = ? AND rs.status = 'verified' AND rs.election_id = ?
         WHERE c.election_id = ? GROUP BY c.id ORDER BY c.position`,
        [lga.lga_id, election.id, election.id]
      );
      lga.candidates = lgaCands.map(c => ({ ...c, total_votes: Number(c.total_votes || 0) }));
      const [lgaTotals] = await pool.query(
        `SELECT
           COALESCE(SUM(p.registered_voters), 0) AS registered_voters,
           COALESCE(SUM(rs.total_votes_cast), 0) AS total_votes_cast
         FROM polling_units p
         LEFT JOIN result_submissions rs
           ON rs.polling_unit_id = p.id
          AND rs.election_id = ?
          AND rs.status = 'verified'
         WHERE p.lga_id = ?`,
        [election.id, lga.lga_id]
      );
      lga.total_registered_voters = Number(lgaTotals[0]?.registered_voters || 0);
      lga.total_votes_cast = Number(lgaTotals[0]?.total_votes_cast || 0);
      lga.reporting_percentage = lga.total_polling_units > 0
        ? Number(((lga.reported_polling_units / lga.total_polling_units) * 100).toFixed(1)) : 0;
      lga.turnout_percentage = lga.total_registered_voters > 0
        ? Number(((lga.total_votes_cast / lga.total_registered_voters) * 100).toFixed(2)) : 0;
    }

    const data = {
      election,
      candidates: candidateResults,
      total_polling_units: Number(puStats[0].total || 0),
      reported_polling_units: Number(reportedStats[0].total || 0),
      verified_polling_units: Number(verifiedStats[0].total || 0),
      total_registered_voters: Number(regVoters[0].total),
      total_votes_cast: Number(votesCast[0].total),
      turnout_percentage: Number(regVoters[0].total) > 0
        ? Number(((Number(votesCast[0].total) / Number(regVoters[0].total)) * 100).toFixed(2)) : 0,
      reporting_percentage: puStats[0].total > 0
        ? Number(((reportedStats[0].total / puStats[0].total) * 100).toFixed(1)) : 0,
      lga_breakdown: lgaBreakdown,
      last_updated: new Date().toISOString()
    };

    cache.set(cacheKey, data, 15);
    return ApiResponse.success(res, data);
  } catch (error) {
    logger.error('Situation room error:', error);
    return ApiResponse.error(res, 'Failed to load situation room data');
  }
};

const getSituationRoomLGA = async (req, res) => {
  try {
    const lgaId = parseInt(req.params.id);
    const [lgas] = await pool.query('SELECT id, name, state_id FROM lgas WHERE id = ?', [lgaId]);
    if (!lgas.length) return ApiResponse.notFound(res, 'LGA not found');

    let [elections] = await pool.query("SELECT id, title, election_date, status FROM elections WHERE status = 'ongoing' ORDER BY election_date DESC LIMIT 1");
    if (!elections.length) {
      const [latest] = await pool.query('SELECT id, title, election_date, status FROM elections ORDER BY election_date DESC LIMIT 1');
      elections = latest;
    }
    if (!elections.length) return ApiResponse.notFound(res, 'No election found');
    const election = elections[0];

    const [wards] = await pool.query(
      `SELECT w.id AS ward_id, w.name AS ward_name,
              (SELECT COUNT(*) FROM polling_units WHERE ward_id = w.id) AS total_pus,
              (SELECT COUNT(*) FROM result_submissions WHERE ward_id = w.id AND election_id = ? AND status <> 'rejected') AS reported_pus,
              (SELECT COUNT(*) FROM result_submissions WHERE ward_id = w.id AND election_id = ? AND status = 'verified') AS verified_pus
       FROM wards w WHERE w.lga_id = ? ORDER BY w.name`,
      [election.id, election.id, lgaId]
    );

    const [candidates] = await pool.query(
      `SELECT c.id as candidate_id, c.full_name, c.party_code,
              COALESCE(SUM(CASE WHEN rs.id IS NOT NULL THEN vd.votes ELSE 0 END), 0) as total_votes
       FROM candidates c
       LEFT JOIN vote_data vd ON vd.candidate_id = c.id
       LEFT JOIN result_submissions rs ON rs.id = vd.submission_id AND rs.lga_id = ? AND rs.status = 'verified' AND rs.election_id = ?
       WHERE c.election_id = ? GROUP BY c.id ORDER BY total_votes DESC`,
      [lgaId, election.id, election.id]
    );

    const normalizedWards = wards.map((ward) => ({
      ...ward,
      total_pus: Number(ward.total_pus || 0),
      reported_pus: Number(ward.reported_pus || 0),
      verified_pus: Number(ward.verified_pus || 0),
    }));
    const [lgaTotals] = await pool.query(
      `SELECT
         COALESCE(SUM(p.registered_voters), 0) AS registered_voters,
         COALESCE(SUM(rs.total_votes_cast), 0) AS total_votes_cast,
         COUNT(rs.id) FILTER (WHERE rs.status <> 'rejected') AS reported_polling_units,
         COUNT(rs.id) FILTER (WHERE rs.status = 'verified') AS verified_polling_units
       FROM polling_units p
       LEFT JOIN result_submissions rs
         ON rs.polling_unit_id = p.id AND rs.election_id = ?
       WHERE p.lga_id = ?`,
      [election.id, lgaId]
    );
    const lgaTotalsRow = lgaTotals[0] || {};
    const registeredVoters = Number(lgaTotalsRow.registered_voters || 0);
    const votesCast = Number(lgaTotalsRow.total_votes_cast || 0);
    const totalPollingUnits = normalizedWards.reduce((sum, ward) => sum + ward.total_pus, 0);
    const reportedPollingUnits = Number(lgaTotalsRow.reported_polling_units || 0);

    return ApiResponse.success(res, {
      lga: lgas[0],
      election,
      wards: normalizedWards,
      candidates: candidates.map(c => ({ ...c, total_votes: Number(c.total_votes || 0) })),
      total_polling_units: totalPollingUnits,
      reported_polling_units: reportedPollingUnits,
      verified_polling_units: Number(lgaTotalsRow.verified_polling_units || 0),
      total_registered_voters: registeredVoters,
      total_votes_cast: votesCast,
      turnout_percentage: registeredVoters > 0 ? Number(((votesCast / registeredVoters) * 100).toFixed(2)) : 0,
      reporting_percentage: totalPollingUnits > 0 ? Number(((reportedPollingUnits / totalPollingUnits) * 100).toFixed(1)) : 0,
    });
  } catch (error) {
    logger.error('Situation room LGA error:', error);
    return ApiResponse.error(res, 'Failed to load LGA data');
  }
};

const getEmbedData = async (req, res) => {
  try {
    const electionId = parseInt(req.params.electionId);
    const [elections] = await pool.query('SELECT id, title, election_date, status FROM elections WHERE id = ?', [electionId]);
    if (!elections.length) return ApiResponse.notFound(res, 'Election not found');

    const [candidates] = await pool.query(
      `SELECT c.full_name, c.party_code, c.party_name,
              COALESCE(SUM(CASE WHEN rs.id IS NOT NULL THEN vd.votes ELSE 0 END), 0) AS total_votes
       FROM candidates c
       LEFT JOIN vote_data vd ON vd.candidate_id = c.id
       LEFT JOIN result_submissions rs ON rs.id = vd.submission_id AND rs.status = 'verified' AND rs.election_id = ?
       WHERE c.election_id = ? GROUP BY c.id ORDER BY total_votes DESC`,
      [electionId, electionId]
    );

    const [puCount] = await pool.query('SELECT COUNT(*) as total FROM polling_units');
    const [reported] = await pool.query("SELECT COUNT(*) AS total FROM result_submissions WHERE election_id = ? AND status <> 'rejected'", [electionId]);

    res.json({
      election: elections[0],
      candidates: candidates.map(c => ({ ...c, total_votes: Number(c.total_votes) })),
      total_polling_units: Number(puCount[0].total || 0),
      reported_polling_units: Number(reported[0].total || 0),
      reporting_percentage: Number(puCount[0].total || 0) > 0
        ? Number(((Number(reported[0].total || 0) / Number(puCount[0].total || 0)) * 100).toFixed(1)) : 0
    });
  } catch (error) {
    logger.error('Embed data error:', error);
    return ApiResponse.error(res, 'Failed to load embed data');
  }
};

module.exports = { getSituationRoom, getSituationRoomLGA, getEmbedData };
