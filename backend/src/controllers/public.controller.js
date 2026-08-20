const { pool, cache } = require('../config/database');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

// Public Situation Room — NO AUTH required
const getSituationRoom = async (req, res) => {
  try {
    const cacheKey = 'situation_room';
    const cached = cache.get(cacheKey);
    if (cached) return ApiResponse.success(res, cached);

    let [elections] = await pool.query('SELECT id, title, election_date, status FROM elections WHERE status = "ongoing" LIMIT 1');
    if (!elections.length) {
      const [latest] = await pool.query('SELECT id, title, election_date, status FROM elections ORDER BY election_date DESC LIMIT 1');
      if (!latest.length) return ApiResponse.notFound(res, 'No election found');
      elections.push(latest[0]);
    }
    const election = elections[0];

    const [candidates] = await pool.query(
      `SELECT c.id as candidate_id, c.full_name, c.party_code, c.party_name, c.photo_url,
              COALESCE(SUM(vd.votes), 0) as total_votes
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
      'SELECT COUNT(*) as total FROM result_submissions WHERE election_id = ?', [election.id]
    );
    const [verifiedStats] = await pool.query(
      'SELECT COUNT(*) as total FROM result_submissions WHERE election_id = ? AND status = "verified"', [election.id]
    );
    const [regVoters] = await pool.query('SELECT COALESCE(SUM(registered_voters), 0) as total FROM polling_units');
    const [votesCast] = await pool.query(
      'SELECT COALESCE(SUM(total_votes_cast), 0) as total FROM result_submissions WHERE election_id = ? AND status = "verified"',
      [election.id]
    );

    // LGA breakdown
    const [lgaBreakdown] = await pool.query(
      `SELECT l.id as lga_id, l.name as lga_name, l.latitude, l.longitude,
              (SELECT COUNT(*) FROM polling_units WHERE lga_id = l.id) as total_polling_units,
              (SELECT COUNT(*) FROM result_submissions WHERE lga_id = l.id AND election_id = ?) as reported_polling_units,
              (SELECT COUNT(*) FROM result_submissions WHERE lga_id = l.id AND election_id = ? AND status = 'verified') as verified_polling_units
       FROM lgas l ORDER BY l.name`,
      [election.id, election.id]
    );

    for (const lga of lgaBreakdown) {
      const [lgaCands] = await pool.query(
        `SELECT c.id as candidate_id, c.full_name, c.party_code,
                COALESCE(SUM(vd.votes), 0) as total_votes
         FROM candidates c
         LEFT JOIN vote_data vd ON vd.candidate_id = c.id
         LEFT JOIN result_submissions rs ON rs.id = vd.submission_id AND rs.lga_id = ? AND rs.status = 'verified' AND rs.election_id = ?
         WHERE c.election_id = ? GROUP BY c.id ORDER BY c.position`,
        [lga.lga_id, election.id, election.id]
      );
      lga.candidates = lgaCands.map(c => ({ ...c, total_votes: Number(c.total_votes) }));
      lga.reporting_percentage = lga.total_polling_units > 0
        ? Number(((lga.reported_polling_units / lga.total_polling_units) * 100).toFixed(1)) : 0;
    }

    const data = {
      election,
      candidates: candidateResults,
      total_polling_units: puStats[0].total,
      reported_polling_units: reportedStats[0].total,
      verified_polling_units: verifiedStats[0].total,
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

    const [elections] = await pool.query('SELECT id, title, election_date, status FROM elections WHERE status = "ongoing" LIMIT 1');
    if (!elections.length) return ApiResponse.notFound(res, 'No active election');
    const election = elections[0];

    const [wards] = await pool.query(
      `SELECT w.id as ward_id, w.name as ward_name,
              (SELECT COUNT(*) FROM polling_units WHERE ward_id = w.id) as total_pus,
              (SELECT COUNT(*) FROM result_submissions WHERE ward_id = w.id AND election_id = ? AND status = 'verified') as verified_pus
       FROM wards w WHERE w.lga_id = ? ORDER BY w.name`,
      [election.id, lgaId]
    );

    const [candidates] = await pool.query(
      `SELECT c.id as candidate_id, c.full_name, c.party_code,
              COALESCE(SUM(vd.votes), 0) as total_votes
       FROM candidates c
       LEFT JOIN vote_data vd ON vd.candidate_id = c.id
       LEFT JOIN result_submissions rs ON rs.id = vd.submission_id AND rs.lga_id = ? AND rs.status = 'verified' AND rs.election_id = ?
       WHERE c.election_id = ? GROUP BY c.id ORDER BY total_votes DESC`,
      [lgaId, election.id, election.id]
    );

    return ApiResponse.success(res, {
      lga: lgas[0],
      election,
      wards,
      candidates: candidates.map(c => ({ ...c, total_votes: Number(c.total_votes) }))
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
      `SELECT c.full_name, c.party_code, c.party_name, COALESCE(SUM(vd.votes), 0) as total_votes
       FROM candidates c
       LEFT JOIN vote_data vd ON vd.candidate_id = c.id
       LEFT JOIN result_submissions rs ON rs.id = vd.submission_id AND rs.status = 'verified' AND rs.election_id = ?
       WHERE c.election_id = ? GROUP BY c.id ORDER BY total_votes DESC`,
      [electionId, electionId]
    );

    const [puCount] = await pool.query('SELECT COUNT(*) as total FROM polling_units');
    const [reported] = await pool.query('SELECT COUNT(*) as total FROM result_submissions WHERE election_id = ?', [electionId]);

    res.json({
      election: elections[0],
      candidates: candidates.map(c => ({ ...c, total_votes: Number(c.total_votes) })),
      total_polling_units: puCount[0].total,
      reported_polling_units: reported[0].total,
      reporting_percentage: puCount[0].total > 0
        ? Number(((reported[0].total / puCount[0].total) * 100).toFixed(1)) : 0
    });
  } catch (error) {
    logger.error('Embed data error:', error);
    return ApiResponse.error(res, 'Failed to load embed data');
  }
};

module.exports = { getSituationRoom, getSituationRoomLGA, getEmbedData };
