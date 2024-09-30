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
      //fetch vc from ipfs
      const response = await axios.post('http://localhost:3001/fetch-vc', { cid });
      setVC(response.data.vc);
      // Determine if the VC is a certificate or a license
      const isCertificate = response.data.vc.type.includes("LicenseCredential") || response.data.vc.type.includes("CertificateCredential");
      setIsCertificate(isCertificate);

      // Call the backend API to verify the VC
      const result = await axios.post('http://localhost:3001/verify-vc', { vc: response.data.vc, isCertificate });

      setIssuerVerification(result.data.issuer);
      setHolderVerification(result.data.holder);

      // Update the history stack with the complete state
      setHistoryStack(prevStack => [
        ...prevStack,
        {
          vc: response.data.vc,
          issuerVerification: result.data.issuer,
          holderVerification: result.data.holder
        }
      ]);
    } catch (err) {
      setError("Something went wrong while fetching and verifying the VC. Please check the CID and try again.");
      console.error(err);
    }
    finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    if (historyStack.length > 1) {
      setError(null);
      const previousState = historyStack[historyStack.length - 2];
      setHistoryStack(prevStack => prevStack.slice(0, -1)); 
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