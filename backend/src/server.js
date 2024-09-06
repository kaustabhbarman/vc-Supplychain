const express = require('express');
const bodyParser = require('body-parser');
const { verifyVC } = require('./verifyVC');
const { fetchVC } = require('./fetchVC');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

// Endpoint to verify VC
app.post('/verify-vc', async (req, res) => {
  try {
    const { vc, isCertificate } = req.body;
    if (!vc) {
      return res.status(400).json({ error: 'VC data is required.' });
    }
    // Call the verifyVC function
    // Call the verifyVC function
    const verificationResult = await verifyVC(vc, isCertificate);

    // Prepare the response
    const response = {
      message: 'VC verification complete.',
      issuer: verificationResult.issuer,
      holder: verificationResult.holder,
    };

    //return the response
    res.json(response);
  } catch (error) {
    console.error('Error verifying VC:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to fetch VC
app.post('/fetch-vc', async (req, res) => {
  try {
    const {cid} = req.body;
    if (!cid) {
      return res.status(400).json({ error: 'Cid is required.' });
    }
    // Call the fetch function
    const vcJsonData = await fetchVC(cid);

    // Prepare the response
    const response = {
      message: 'VC fetching complete.',
      vc: vcJsonData
    };

    //return the response
    res.json(response);
  } catch (error) {
    console.error('Error fetching VC:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});