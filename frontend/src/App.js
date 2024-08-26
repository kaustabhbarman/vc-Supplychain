import React, { useState } from 'react';
import './App.css';
import axios from 'axios';
import ProductInfo from './ui/ProductInfo';
import CertificateInfo from './ui/CertificateInfo';
import SearchContainer from './ui/SearchContainer';


function App() {
  const [cid, setCid] = useState('');
  const [vc, setVC] = useState(null);
  const [isCertificate, setIsCertificate] = useState(false);
  const [error, setError] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [historyStack, setHistoryStack] = useState([]);
  const [loading, setLoading] = useState(false);

  const ipfs_base_link = "https://ipfs.filebase.io/ipfs/"

  const handleCidChange = (event) => {
    setCid(event.target.value);
  };

  const handleCidSubmit = async (cid) => {
    setLoading(true);
    setVerificationResult(null)
    setError(null);
    setVC(null);
    setIsCertificate(false);
    try {
      const response = await fetchVC(cid);
      if (response) {

        // Update the history stack
        setHistoryStack(prevStack => [...prevStack, vc]);

        // Determine if the VC is a certificate or a license
        const isCertificate = response.type.includes("LicenseCredential") || response.type.includes("CertificateCredential");
        setIsCertificate(isCertificate);

        // Call the backend API to verify the VC
        const result = await axios.post('http://localhost:3001/verify-vc', { vc: response, isCertificate });
        setVC(response);
        setVerificationResult(result.data.verified);
      } else {
        setError("Unable to fetch data. Please check the CID and try again.");
      }
    } catch (err) {
      setError("Verification could not be performed.");
      console.error(err);
    }
    finally {
      setLoading(false);
    }
  };

  async function fetchVC(cid) {
    try {
        // Use fetch to get the response from the URL
        const response = await fetch(ipfs_base_link + cid);

        // Check if the response status is OK (status code 200)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        // Parse the response as JSON
        const vcJsonData = await response.json();
        //check if vc is a certificate
        return vcJsonData
    } catch (error) {
        // Handle any errors that occur during the fetch
        console.error('Error fetching JSON data:', error);
    }
  }

  const handleGoBack = () => {
    if (historyStack.length > 0) {
      setError(null);
      setVerificationResult(null);
      const previousVC = historyStack[historyStack.length - 1];
      setHistoryStack(prevStack => prevStack.slice(0, -1)); // Remove the last item from the stack
      setVC(previousVC);
      setIsCertificate(previousVC.type.includes("LicenseCredential") || previousVC.type.includes("CertificateCredential"));
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <SearchContainer
          cid={cid}
          onCidChange={handleCidChange}
          onCidSubmit={handleCidSubmit}
        />

        {loading && (
          <div className="loading-spinner">Loading...</div>
        )}

        {!loading && verificationResult !== null && (
          <div className="verification-status">
            Verification Status: {verificationResult ? 'Verified' : 'Not Verified'}
          </div>
        )}

        {!loading && vc && (
          isCertificate ? (
            <CertificateInfo vc={vc} />
          ) : (
            <ProductInfo vc={vc} handleCidSubmit={handleCidSubmit} />
          )
        )}

        {!loading && error && (
          <p className="error-message">{error}</p>
        )}

        {!loading && historyStack.length > 1 && (
          <button onClick={handleGoBack} className="go-back-button">Go Back</button>
        )}

      </header>
    </div>
  );  
}

export default App;