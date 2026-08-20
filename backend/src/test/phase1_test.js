const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API_URL = 'http://localhost:5000/api/v1';

async function runTest() {
  console.log('--- STARTING PHASE 1 CORE WORKFLOW TEST ---');

  const client = axios.create({ baseURL: API_URL });

  // 1. Agent Login
  console.log('\n[1] Logging in as PU Agent...');
  const agentLogin = await client.post('/auth/login', {
    email: 'agent@gsem.ng',
    password: 'Agent@123456!'
  });
  const agentToken = agentLogin.data.data.accessToken;
  const agentData = agentLogin.data.data.user;
  console.log('  ✓ Agent logged in successfully');
  
  // Create a dummy image for submission
  const dummyImagePath = path.join(__dirname, 'dummy_result.jpg');
  fs.writeFileSync(dummyImagePath, 'dummy image data');

  // 2. Submit Result
  console.log('\n[2] Agent submitting result...');
  const formData = new FormData();
  formData.append('election_id', '1');
  formData.append('polling_unit_id', agentData.polling_unit_id.toString());
  formData.append('registered_voters', '500');
  formData.append('accredited_voters', '300');
  formData.append('total_votes_cast', '300');
  formData.append('total_valid_votes', '290');
  formData.append('rejected_votes', '10');
  formData.append('votes', JSON.stringify([
    { candidate_id: 1, votes: 150 },
    { candidate_id: 2, votes: 100 },
    { candidate_id: 3, votes: 40 }
  ]));
  formData.append('images', fs.createReadStream(dummyImagePath));

  let submissionId;
  try {
    const submitRes = await client.post('/results', formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${agentToken}`
      }
    });
    submissionId = submitRes.data.data.id;
    console.log('  ✓ Result submitted successfully (ID: ' + submissionId + ')');
  } catch (err) {
    if (err.response?.status === 409) {
      console.log('  ! Result already submitted for this PU. We will try to fetch the existing submission ID.');
      const listRes = await client.get('/results?limit=1', {
        headers: { Authorization: `Bearer ${agentToken}` }
      });
      if (listRes.data.data.length > 0) {
        submissionId = listRes.data.data[0].id;
        console.log('  ✓ Fetched existing submission (ID: ' + submissionId + ')');
      } else {
        throw new Error('Could not fetch existing submission');
      }
    } else {
      throw new Error(err.response?.data?.message || err.message);
    }
  }

  // 3. Ward Officer Login
  console.log('\n[3] Logging in as Ward Officer...');
  const wardLogin = await client.post('/auth/login', {
    email: 'ward1@gsem.ng',
    password: 'Ward@123456!'
  });
  const wardToken = wardLogin.data.data.accessToken;
  const wardData = wardLogin.data.data.user;
  console.log('  ✓ Ward Officer logged in successfully');

  // 4. Verify Result
  console.log('\n[4] Ward Officer verifying result...');
  try {
    await client.put(`/results/${submissionId}/verify`, {}, {
      headers: { Authorization: `Bearer ${wardToken}` }
    });
    console.log('  ✓ Result verified successfully');
  } catch (err) {
    console.log('  ! Result might already be verified: ' + (err.response?.data?.message || err.message));
  }

  // 5. Submit Ward Collation
  console.log('\n[5] Ward Officer submitting ward collation...');
  try {
    await client.post('/collation/ward', {
      election_id: 1,
      ward_id: wardData.ward_id,
      pin: '123456'
    }, {
      headers: { Authorization: `Bearer ${wardToken}` }
    });
    console.log('  ✓ Ward Collation submitted successfully');
  } catch (err) {
    console.log('  ! Ward collation error: ' + (err.response?.data?.message || err.message));
  }

  // 6. LGA Coordinator Login
  console.log('\n[6] Logging in as LGA Coordinator...');
  const lgaLogin = await client.post('/auth/login', {
    email: 'gombe-lga@gsem.ng',
    password: 'LGA@123456!'
  });
  const lgaToken = lgaLogin.data.data.accessToken;
  const lgaData = lgaLogin.data.data.user;
  console.log('  ✓ LGA Coordinator logged in successfully');

  // 7. Submit LGA Collation
  console.log('\n[7] LGA Coordinator submitting LGA collation...');
  try {
    await client.post('/collation/lga', {
      election_id: 1,
      lga_id: lgaData.lga_id,
      pin: '123456'
    }, {
      headers: { Authorization: `Bearer ${lgaToken}` }
    });
    console.log('  ✓ LGA Collation submitted successfully');
  } catch (err) {
    console.log('  ! LGA collation error: ' + (err.response?.data?.message || err.message));
  }

  // 8. State Coordinator Login
  console.log('\n[8] Logging in as State Coordinator...');
  const stateLogin = await client.post('/auth/login', {
    email: 'coordinator@gsem.ng',
    password: 'Coord@123456!'
  });
  const stateToken = stateLogin.data.data.accessToken;
  console.log('  ✓ State Coordinator logged in successfully');

  // 9. Submit State Collation
  console.log('\n[9] State Coordinator submitting State collation...');
  try {
    await client.post('/collation/state', {
      election_id: 1,
      pin: '123456'
    }, {
      headers: { Authorization: `Bearer ${stateToken}` }
    });
    console.log('  ✓ State Collation submitted successfully');
  } catch (err) {
    console.log('  ! State collation error: ' + (err.response?.data?.message || err.message));
  }

  // 10. Dashboard API check
  console.log('\n[10] Checking Dashboard APIs...');
  const dashRes = await client.get('/dashboard/state', {
    headers: { Authorization: `Bearer ${stateToken}` }
  });
  console.log('  ✓ Dashboard loaded, total PUs reported: ' + dashRes.data.data.reported_polling_units);

  console.log('\n--- PHASE 1 TEST COMPLETE ---');
}

runTest().catch(err => {
  console.error('\n[ERROR]', err.response?.data?.message || err.message);
  process.exit(1);
});
