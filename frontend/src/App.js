import React, { useState } from 'react';
import './App.css';
import axios from 'axios';
import ProductInfo from './ui/ProductInfo';
import CertificateInfo from './ui/CertificateInfo';
import VerificationInfo from './ui/VerificationInfo';
import SearchContainer from './ui/SearchContainer';


function App() {
  const [cid, setCid] = useState('');
  const [vc, setVC] = useState(null);
  const [isCertificate, setIsCertificate] = useState(false);
  const [error, setError] = useState(null);
  const [issuerVerification, setIssuerVerification] = useState(null);
  const [holderVerification, setHolderVerification] = useState(null);
  const [historyStack, setHistoryStack] = useState([]);
  const [loading, setLoading] = useState(false);

  const ipfs_base_link = "https://ipfs.filebase.io/ipfs/"

  const handleCidChange = (event) => {
    setCid(event.target.value);
  };

  const handleCidSubmit = async (cid) => {
    setLoading(true);
    setError(null);
    setVC(null);
    setHolderVerification(null)
    setIssuerVerification(null)
    setIsCertificate(false);
    try {
      const response = await fetchVC(cid);
      if (response) {
        setVC(response);

        // Determine if the VC is a certificate or a license
        const isCertificate = response.type.includes("LicenseCredential") || response.type.includes("CertificateCredential");
        setIsCertificate(isCertificate);

        // Call the backend API to verify the VC
        const result = await axios.post('http://localhost:3001/verify-vc', { vc: response, isCertificate });

        setIssuerVerification(result.data.issuer);
        setHolderVerification(result.data.holder);

        // Update the history stack with the complete state
        setHistoryStack(prevStack => [
          ...prevStack,
          {
            vc: response,
            issuerVerification: result.data.issuer,
            holderVerification: result.data.holder
          }
        ]);
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
    if (historyStack.length > 1) {
      setError(null);
      const previousState = historyStack[historyStack.length - 2];
      setHistoryStack(prevStack => prevStack.slice(0, -1)); // Remove the last item from the stack
      setVC(previousState.vc);
      setIssuerVerification(previousState.issuerVerification);
      setHolderVerification(previousState.holderVerification);
      setIsCertificate(previousState.vc.type.includes("LicenseCredential") || previousState.vc.type.includes("CertificateCredential"));
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

        {!loading && issuerVerification && vc && (
          <VerificationInfo signer={vc.issuer} verification={issuerVerification} />
        )}

        {!loading && holderVerification && vc && (
          <VerificationInfo signer={vc.holder} verification={holderVerification} />
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