const express = require('express');
const bodyParser = require('body-parser');
const { verifyVC } = require('./verifyVC');
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

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});