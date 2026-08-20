const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000/api/v1';

async function runTest() {
  console.log('--- STARTING PHASE 2 CORE WORKFLOW TEST ---');

  const client = axios.create({ baseURL: API_URL });

  // 1. Log in as Ward Officer to raise dispute
  console.log('\n[1] Logging in as Ward Officer...');
  const wardLogin = await client.post('/auth/login', {
    email: 'ward1@gsem.ng',
    password: 'Ward@123456!'
  });
  const wardToken = wardLogin.data.data.accessToken;
  console.log('  ✓ Ward Officer logged in successfully');

  // 2. Ward Officer raises a dispute
  console.log('\n[2] Ward Officer raising a dispute...');
  let disputeId;
  try {
    const raiseRes = await client.post('/disputes', {
      election_id: 1,
      submission_id: 1, // Assume submission 1 exists from Phase 1
      title: 'Discrepancy in Ballot Count',
      description: 'The number of ballots cast exceeds the accredited voters.',
      category: 'malpractice',
      priority: 'high'
    }, {
      headers: { Authorization: `Bearer ${wardToken}` }
    });
    disputeId = raiseRes.data.data.id;
    console.log('  ✓ Dispute raised successfully (ID: ' + disputeId + ')');
  } catch (err) {
    throw new Error('Failed to raise dispute: ' + (err.response?.data?.message || err.message));
  }

  // 3. Add a comment to the dispute
  console.log('\n[3] Adding comment to dispute...');
  try {
    await client.post(`/disputes/${disputeId}/comments`, {
      comment: 'I have attached the EC8A form for review.'
    }, {
      headers: { Authorization: `Bearer ${wardToken}` }
    });
    console.log('  ✓ Comment added successfully');
  } catch (err) {
    throw new Error('Failed to add comment: ' + (err.response?.data?.message || err.message));
  }

  // 4. Escalate the dispute
  console.log('\n[4] Escalating the dispute to LGA level...');
  try {
    await client.put(`/disputes/${disputeId}/escalate`, {}, {
      headers: { Authorization: `Bearer ${wardToken}` }
    });
    console.log('  ✓ Dispute escalated successfully');
  } catch (err) {
    throw new Error('Failed to escalate dispute: ' + (err.response?.data?.message || err.message));
  }

  // 5. Super Admin Login
  console.log('\n[5] Logging in as Super Admin...');
  const adminLogin = await client.post('/auth/login', {
    email: 'admin@gsem.ng',
    password: 'Admin@GSEM2024!'
  });
  const adminToken = adminLogin.data.data.accessToken;
  console.log('  ✓ Super Admin logged in successfully');

  // 6. Super Admin resolves dispute
  console.log('\n[6] Super Admin resolving dispute...');
  try {
    await client.put(`/disputes/${disputeId}/resolve`, {
      resolution_notes: 'Reviewed EC8A and corrected the count in the database.',
      status: 'resolved'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('  ✓ Dispute resolved successfully');
  } catch (err) {
    throw new Error('Failed to resolve dispute: ' + (err.response?.data?.message || err.message));
  }

  // 7. Super Admin lists users
  console.log('\n[7] Super Admin listing users...');
  try {
    const usersRes = await client.get('/admin/users?limit=5', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('  ✓ Users listed successfully (Count: ' + usersRes.data.data.length + ')');
  } catch (err) {
    throw new Error('Failed to list users: ' + (err.response?.data?.message || err.message));
  }

  // 8. Super Admin creates an observer
  console.log('\n[8] Super Admin creating a new user (Observer)...');
  const uniqueEmail = `observer_${Date.now()}@gsem.ng`;
  try {
    await client.post('/admin/users', {
      email: uniqueEmail,
      phone: '080' + Math.floor(Math.random() * 100000000),
      password: 'Observer@123456!',
      first_name: 'Test',
      last_name: 'Observer',
      role: 'observer'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('  ✓ Observer user created successfully');
  } catch (err) {
    throw new Error('Failed to create user: ' + (err.response?.data?.message || err.message));
  }

  // 9. Super Admin checks Audit Logs
  console.log('\n[9] Super Admin checking audit logs...');
  try {
    const logsRes = await client.get('/admin/audit-logs?limit=5', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('  ✓ Audit logs fetched successfully (Count: ' + logsRes.data.data.length + ')');
  } catch (err) {
    throw new Error('Failed to fetch audit logs: ' + (err.response?.data?.message || err.message));
  }

  // 10. Ward Officer checks notifications
  console.log('\n[10] Ward Officer checking notifications...');
  try {
    const notifRes = await client.get('/notifications', {
      headers: { Authorization: `Bearer ${wardToken}` }
    });
    console.log('  ✓ Notifications fetched successfully (Count: ' + notifRes.data.data.length + ')');
  } catch (err) {
    throw new Error('Failed to fetch notifications: ' + (err.response?.data?.message || err.message));
  }

  console.log('\n--- PHASE 2 TEST COMPLETE ---');
}

runTest().catch(err => {
  console.error('\n[ERROR]', err.response?.data || err.message);
  process.exit(1);
});
