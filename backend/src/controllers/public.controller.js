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

    // Comprehensive State-Wide Vote Metrics
    const [submissionAggregates] = await pool.query(
      `SELECT
         COALESCE(SUM(accredited_voters), 0) AS total_accredited_voters,
         COALESCE(SUM(total_votes_cast), 0) AS total_votes_cast,
         COALESCE(SUM(total_valid_votes), 0) AS total_valid_votes,
         COALESCE(SUM(rejected_votes), 0) AS total_rejected_votes
       FROM result_submissions
       WHERE election_id = ? AND status = 'verified'`,
      [election.id]
    );

    const totalRegVoters = Number(regVoters[0]?.total || 0);
    const totalAccreditedVoters = Number(submissionAggregates[0]?.total_accredited_voters || 0);
    const totalVotesCast = Number(submissionAggregates[0]?.total_votes_cast || 0);
    const totalValidVotes = Number(submissionAggregates[0]?.total_valid_votes || 0);
    const totalRejectedVotes = Number(submissionAggregates[0]?.total_rejected_votes || 0);

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

    const validDenom = totalValidVotes > 0 ? totalValidVotes : totalVotesCast;
    const candidateResults = candidates.map(c => ({
      ...c,
      total_votes: Number(c.total_votes),
      vote_percentage: validDenom > 0 ? Number(((Number(c.total_votes) / validDenom) * 100).toFixed(2)) : 0
    }));

    // LGA breakdown with full granular metrics
    const [lgaBreakdown] = await pool.query(
      `SELECT l.id as lga_id, l.name as lga_name, l.code as lga_code, l.latitude, l.longitude,
              (SELECT COUNT(*) FROM polling_units WHERE lga_id = l.id) as total_polling_units,
              (SELECT COUNT(*) FROM result_submissions WHERE lga_id = l.id AND election_id = ? AND status <> 'rejected') as reported_polling_units,
              (SELECT COUNT(*) FROM result_submissions WHERE lga_id = l.id AND election_id = ? AND status = 'verified') as verified_polling_units,
              (SELECT COALESCE(SUM(registered_voters), 0) FROM polling_units WHERE lga_id = l.id) as total_registered_voters
       FROM lgas l ORDER BY l.name`,
      [election.id, election.id]
    );

    for (const lga of lgaBreakdown) {
      lga.total_polling_units = Number(lga.total_polling_units || 0);
      lga.reported_polling_units = Number(lga.reported_polling_units || 0);
      lga.verified_polling_units = Number(lga.verified_polling_units || 0);
      lga.total_registered_voters = Number(lga.total_registered_voters || 0);

      const [lgaAggs] = await pool.query(
        `SELECT
           COALESCE(SUM(accredited_voters), 0) AS accredited_voters,
           COALESCE(SUM(total_votes_cast), 0) AS total_votes_cast,
           COALESCE(SUM(total_valid_votes), 0) AS total_valid_votes,
           COALESCE(SUM(rejected_votes), 0) AS rejected_votes
         FROM result_submissions
         WHERE election_id = ? AND lga_id = ? AND status = 'verified'`,
        [election.id, lga.lga_id]
      );
      const lgaAgg = lgaAggs[0] || {};
      lga.total_accredited_voters = Number(lgaAgg.accredited_voters || 0);
      lga.total_votes_cast = Number(lgaAgg.total_votes_cast || 0);
      lga.total_valid_votes = Number(lgaAgg.total_valid_votes || 0);
      lga.rejected_votes = Number(lgaAgg.rejected_votes || 0);

      lga.reporting_percentage = lga.total_polling_units > 0
        ? Number(((lga.reported_polling_units / lga.total_polling_units) * 100).toFixed(1)) : 0;
      lga.turnout_percentage = lga.total_registered_voters > 0
        ? Number(((lga.total_votes_cast / lga.total_registered_voters) * 100).toFixed(2)) : 0;
      lga.accreditation_percentage = lga.total_registered_voters > 0
        ? Number(((lga.total_accredited_voters / lga.total_registered_voters) * 100).toFixed(2)) : 0;

      const [lgaCands] = await pool.query(
        `SELECT c.id as candidate_id, c.full_name, c.party_code,
                COALESCE(SUM(CASE WHEN rs.id IS NOT NULL THEN vd.votes ELSE 0 END), 0) as total_votes
         FROM candidates c
         LEFT JOIN vote_data vd ON vd.candidate_id = c.id
         LEFT JOIN result_submissions rs ON rs.id = vd.submission_id AND rs.lga_id = ? AND rs.status = 'verified' AND rs.election_id = ?
         WHERE c.election_id = ? GROUP BY c.id ORDER BY total_votes DESC`,
        [lga.lga_id, election.id, election.id]
      );
      const lgaValid = lga.total_valid_votes > 0 ? lga.total_valid_votes : lga.total_votes_cast;
      lga.candidates = lgaCands.map(c => ({
        ...c,
        total_votes: Number(c.total_votes || 0),
        vote_percentage: lgaValid > 0 ? Number(((Number(c.total_votes || 0) / lgaValid) * 100).toFixed(2)) : 0
      }));

      const top1 = lga.candidates[0];
      const top2 = lga.candidates[1];
      lga.leading_party = top1 && top1.total_votes > 0 ? top1.party_code : 'N/A';
      lga.leading_candidate = top1 && top1.total_votes > 0 ? top1.full_name : 'N/A';
      lga.lead_margin = top1 && top2 ? Number(top1.total_votes || 0) - Number(top2.total_votes || 0) : Number(top1?.total_votes || 0);
    }

    const leader = candidateResults[0];
    const runnerUp = candidateResults[1];
    const leadMargin = leader && runnerUp ? Number(leader.total_votes || 0) - Number(runnerUp.total_votes || 0) : Number(leader?.total_votes || 0);

    const data = {
      election,
      candidates: candidateResults,
      total_polling_units: Number(puStats[0].total || 0),
      reported_polling_units: Number(reportedStats[0].total || 0),
      verified_polling_units: Number(verifiedStats[0].total || 0),
      total_registered_voters: totalRegVoters,
      total_accredited_voters: totalAccreditedVoters,
      total_votes_cast: totalVotesCast,
      total_valid_votes: totalValidVotes,
      rejected_votes: totalRejectedVotes,
      accreditation_percentage: totalRegVoters > 0
        ? Number(((totalAccreditedVoters / totalRegVoters) * 100).toFixed(2)) : 0,
      turnout_percentage: totalRegVoters > 0
        ? Number(((totalVotesCast / totalRegVoters) * 100).toFixed(2)) : 0,
      valid_vote_percentage: totalVotesCast > 0
        ? Number(((totalValidVotes / totalVotesCast) * 100).toFixed(2)) : 0,
      rejected_vote_percentage: totalVotesCast > 0
        ? Number(((totalRejectedVotes / totalVotesCast) * 100).toFixed(2)) : 0,
      reporting_percentage: puStats[0].total > 0
        ? Number(((reportedStats[0].total / puStats[0].total) * 100).toFixed(1)) : 0,
      leading_party: leader && leader.total_votes > 0 ? leader.party_code : 'N/A',
      leading_candidate: leader && leader.total_votes > 0 ? leader.full_name : 'N/A',
      lead_margin: leadMargin,
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
    const [lgas] = await pool.query('SELECT id, name, code, state_id, latitude, longitude FROM lgas WHERE id = ?', [lgaId]);
    if (!lgas.length) return ApiResponse.notFound(res, 'LGA not found');
    const lga = lgas[0];

    let [elections] = await pool.query("SELECT id, title, election_date, status FROM elections WHERE status = 'ongoing' ORDER BY election_date DESC LIMIT 1");
    if (!elections.length) {
      const [latest] = await pool.query('SELECT id, title, election_date, status FROM elections ORDER BY election_date DESC LIMIT 1');
      elections = latest;
    }
    if (!elections.length) return ApiResponse.notFound(res, 'No election found');
    const election = elections[0];

    // LGA Top-Level Totals
    const [lgaRegVoters] = await pool.query(
      'SELECT COALESCE(SUM(registered_voters), 0) AS total_registered_voters FROM polling_units WHERE lga_id = ?',
      [lgaId]
    );
    const [lgaVerifiedAgg] = await pool.query(
      `SELECT
         COALESCE(SUM(accredited_voters), 0) AS total_accredited_voters,
         COALESCE(SUM(total_votes_cast), 0) AS total_votes_cast,
         COALESCE(SUM(total_valid_votes), 0) AS total_valid_votes,
         COALESCE(SUM(rejected_votes), 0) AS total_rejected_votes
       FROM result_submissions
       WHERE election_id = ? AND lga_id = ? AND status = 'verified'`,
      [election.id, lgaId]
    );

    const [puCounts] = await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM polling_units WHERE lga_id = ?) AS total_polling_units,
         (SELECT COUNT(*) FROM result_submissions WHERE lga_id = ? AND election_id = ? AND status <> 'rejected') AS reported_polling_units,
         (SELECT COUNT(*) FROM result_submissions WHERE lga_id = ? AND election_id = ? AND status = 'verified') AS verified_polling_units`,
      [lgaId, lgaId, election.id, lgaId, election.id]
    );

    const totalReg = Number(lgaRegVoters[0]?.total_registered_voters || 0);
    const totalAccred = Number(lgaVerifiedAgg[0]?.total_accredited_voters || 0);
    const totalCast = Number(lgaVerifiedAgg[0]?.total_votes_cast || 0);
    const totalValid = Number(lgaVerifiedAgg[0]?.total_valid_votes || 0);
    const totalRejected = Number(lgaVerifiedAgg[0]?.total_rejected_votes || 0);
    const totalPUs = Number(puCounts[0]?.total_polling_units || 0);
    const reportedPUs = Number(puCounts[0]?.reported_polling_units || 0);
    const verifiedPUs = Number(puCounts[0]?.verified_polling_units || 0);

    // Candidates in this LGA
    const [candidates] = await pool.query(
      `SELECT c.id as candidate_id, c.full_name, c.party_code, c.party_name, c.photo_url,
              COALESCE(SUM(CASE WHEN rs.id IS NOT NULL THEN vd.votes ELSE 0 END), 0) as total_votes
       FROM candidates c
       LEFT JOIN vote_data vd ON vd.candidate_id = c.id
       LEFT JOIN result_submissions rs ON rs.id = vd.submission_id AND rs.lga_id = ? AND rs.status = 'verified' AND rs.election_id = ?
       WHERE c.election_id = ? GROUP BY c.id ORDER BY total_votes DESC`,
      [lgaId, election.id, election.id]
    );

    const validDenom = totalValid > 0 ? totalValid : totalCast;
    const candidateResults = candidates.map(c => ({
      ...c,
      total_votes: Number(c.total_votes || 0),
      vote_percentage: validDenom > 0 ? Number(((Number(c.total_votes || 0) / validDenom) * 100).toFixed(2)) : 0
    }));

    // Wards in this LGA
    const [wardRows] = await pool.query(
      `SELECT w.id AS ward_id, w.name AS ward_name, w.code AS ward_code,
              (SELECT COUNT(*) FROM polling_units WHERE ward_id = w.id) AS total_polling_units,
              (SELECT COUNT(*) FROM result_submissions WHERE ward_id = w.id AND election_id = ? AND status <> 'rejected') AS reported_polling_units,
              (SELECT COUNT(*) FROM result_submissions WHERE ward_id = w.id AND election_id = ? AND status = 'verified') AS verified_polling_units,
              (SELECT COALESCE(SUM(registered_voters), 0) FROM polling_units WHERE ward_id = w.id) AS total_registered_voters
       FROM wards w WHERE w.lga_id = ? ORDER BY w.name`,
      [election.id, election.id, lgaId]
    );

    const enrichedWards = [];
    for (const w of wardRows) {
      const [wardAgg] = await pool.query(
        `SELECT
           COALESCE(SUM(accredited_voters), 0) AS accredited_voters,
           COALESCE(SUM(total_votes_cast), 0) AS total_votes_cast,
           COALESCE(SUM(total_valid_votes), 0) AS total_valid_votes,
           COALESCE(SUM(rejected_votes), 0) AS rejected_votes
         FROM result_submissions
         WHERE election_id = ? AND ward_id = ? AND status = 'verified'`,
        [election.id, w.ward_id]
      );
      const wAgg = wardAgg[0] || {};
      const wTotalPUs = Number(w.total_polling_units || 0);
      const wReportedPUs = Number(w.reported_polling_units || 0);
      const wVerifiedPUs = Number(w.verified_polling_units || 0);
      const wReg = Number(w.total_registered_voters || 0);
      const wAccred = Number(wAgg.accredited_voters || 0);
      const wCast = Number(wAgg.total_votes_cast || 0);
      const wValid = Number(wAgg.total_valid_votes || 0);
      const wRej = Number(wAgg.rejected_votes || 0);

      // Ward top candidate
      const [wardCands] = await pool.query(
        `SELECT c.party_code, c.full_name,
                COALESCE(SUM(CASE WHEN rs.id IS NOT NULL THEN vd.votes ELSE 0 END), 0) as total_votes
         FROM candidates c
         LEFT JOIN vote_data vd ON vd.candidate_id = c.id
         LEFT JOIN result_submissions rs ON rs.id = vd.submission_id AND rs.ward_id = ? AND rs.status = 'verified' AND rs.election_id = ?
         WHERE c.election_id = ? GROUP BY c.id ORDER BY total_votes DESC LIMIT 1`,
        [w.ward_id, election.id, election.id]
      );
      const topCand = wardCands[0];

      enrichedWards.push({
        ward_id: w.ward_id,
        ward_name: w.ward_name,
        ward_code: w.ward_code,
        total_polling_units: wTotalPUs,
        reported_polling_units: wReportedPUs,
        verified_polling_units: wVerifiedPUs,
        total_registered_voters: wReg,
        total_accredited_voters: wAccred,
        total_votes_cast: wCast,
        total_valid_votes: wValid,
        rejected_votes: wRej,
        reporting_percentage: wTotalPUs > 0 ? Number(((wReportedPUs / wTotalPUs) * 100).toFixed(1)) : 0,
        turnout_percentage: wReg > 0 ? Number(((wCast / wReg) * 100).toFixed(2)) : 0,
        accreditation_percentage: wReg > 0 ? Number(((wAccred / wReg) * 100).toFixed(2)) : 0,
        leading_party: topCand && topCand.total_votes > 0 ? topCand.party_code : 'N/A',
        leading_candidate: topCand && topCand.total_votes > 0 ? topCand.full_name : 'N/A',
      });
    }

    const leader = candidateResults[0];
    const runnerUp = candidateResults[1];
    const margin = leader && runnerUp ? Number(leader.total_votes || 0) - Number(runnerUp.total_votes || 0) : Number(leader?.total_votes || 0);

    return ApiResponse.success(res, {
      lga,
      election,
      candidates: candidateResults,
      wards: enrichedWards,
      total_polling_units: totalPUs,
      reported_polling_units: reportedPUs,
      verified_polling_units: verifiedPUs,
      total_registered_voters: totalReg,
      total_accredited_voters: totalAccred,
      total_votes_cast: totalCast,
      total_valid_votes: totalValid,
      rejected_votes: totalRejected,
      accreditation_percentage: totalReg > 0 ? Number(((totalAccred / totalReg) * 100).toFixed(2)) : 0,
      turnout_percentage: totalReg > 0 ? Number(((totalCast / totalReg) * 100).toFixed(2)) : 0,
      valid_vote_percentage: totalCast > 0 ? Number(((totalValid / totalCast) * 100).toFixed(2)) : 0,
      rejected_vote_percentage: totalCast > 0 ? Number(((totalRejected / totalCast) * 100).toFixed(2)) : 0,
      reporting_percentage: totalPUs > 0 ? Number(((reportedPUs / totalPUs) * 100).toFixed(1)) : 0,
      lead_margin: margin,
      leading_party: leader && leader.total_votes > 0 ? leader.party_code : 'N/A',
      leading_candidate: leader && leader.total_votes > 0 ? leader.full_name : 'N/A',
      last_updated: new Date().toISOString()
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
