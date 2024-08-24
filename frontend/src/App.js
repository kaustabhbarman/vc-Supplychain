import React, { useState } from 'react';
import './App.css';
import axios from 'axios';


function App() {
  // State to store the search input value
  const [cid, setCid] = useState('');
  // State to store the product information
  const [vc, setVC] = useState(null);
  // State to store error messages
  const [error, setError] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);

  const ipfs_base_link = "https://ipfs.filebase.io/ipfs/"

  const handleCidChange = (event) => {
    setCid(event.target.value);
  };

  const handleCidSubmit = async (cid) => {
    setVerificationResult(null)
    setError(null);
    setVC(null);
    try {
      const response = await fetchVC(cid);
      if (response) {
        // Call the backend API to verify the VC
        const result = await axios.post('http://localhost:3001/verify-vc', { vc: response });
        setVC(response);
        setVerificationResult(result.data.verified);
      } else {
        setError("Unable to fetch data. Please check the CID and try again.");
      }
    } catch (err) {
      setError("Verification could not be performed.");
      console.error(err);
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
        return vcJsonData
    } catch (error) {
        // Handle any errors that occur during the fetch
        console.error('Error fetching JSON data:', error);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search for Product CID here..."
            value={cid}
            onChange={handleCidChange}
          />
          <button onClick={() => handleCidSubmit(cid)} className="search-button">
            Search
          </button>
        </div>
  
        {verificationResult !== null && (
          <p>Verification Status: {verificationResult ? 'Verified' : 'Not Verified'}</p>
        )}
  
        {vc ? (
          <div className="product-info">
            <h2>Product Information</h2>
            <table>
              <tbody>
                <tr>
                  <th>Product</th>
                  <td>{vc.credentialSubject.subjectDetails.product}</td>
                </tr>
                <tr>
                  <th>Seller</th>
                  <td>{vc.issuer.name}</td>
                </tr>
                <tr>
                  <th>Owner</th>
                  <td>{vc.holder.name}</td>
                </tr>
                <tr>
                  <th>Batch Number</th>
                  <td>{vc.credentialSubject.subjectDetails.batchNumber}</td>
                </tr>
                <tr>
                  <th>Quantity</th>
                  <td>{vc.credentialSubject.subjectDetails.quantity}</td>
                </tr>
              </tbody>
            </table>
  
            {(vc.credentialSubject.previousCredential || vc.credentialSubject.componentCredentials.length > 0 || vc.credentialSubject.certificateCredential) && (
            <div className="related-credentials">
              <h2>Related Credentials</h2>
              <table>
                <tbody>
                  {vc.credentialSubject.previousCredential && (
                    <tr>
                      <th>Previous Credential</th>
                      <td
                        className="clickable-credential"
                        onClick={() => handleCidSubmit(vc.credentialSubject.previousCredential.cid)}
                      >
                        {vc.credentialSubject.previousCredential.name}
                      </td>
                    </tr>
                  )}

                  {vc.credentialSubject.componentCredentials.length > 0 && (
                    <tr>
                      <th>Component Credentials</th>
                      <td>
                        {vc.credentialSubject.componentCredentials.map((component, index) => (
                          <p
                            key={index}
                            className="clickable-credential"
                            onClick={() => handleCidSubmit(component.cid)}
                          >
                            {component.name}
                          </p>
                        ))}
                      </td>
                    </tr>
                  )}

                  {vc.credentialSubject.certificateCredential && (
                    <tr>
                      <th>Certificate Credential</th>
                      <td
                        className="clickable-credential"
                        onClick={() => handleCidSubmit(vc.credentialSubject.certificateCredential.cid)}
                      >
                        {vc.credentialSubject.certificateCredential.name}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          </div>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : null}
      </header>
    </div>
  );  
}

export default App;