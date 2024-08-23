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

  // Function to handle the search input change
  const handleCidChange = (event) => {
    setCid(event.target.value);
  };

  const handleCidSubmit = async () => {
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
        console.log(verificationResult)
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

        console.log(vcJsonData);
        return vcJsonData
    } catch (error) {
        // Handle any errors that occur during the fetch
        console.error('Error fetching JSON data:', error);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>Please provide the CID for your Product</p>
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="search CID here..."
            value={cid}
            onChange={handleCidChange}
          />
          <button onClick={handleCidSubmit} className="search-button">
            Search
          </button>
        </div>

        {verificationResult !== null && (
          <p>Verification Status: {verificationResult ? 'Verified' : 'Not Verified'}</p>
        )}
        {vc ? (
          <div className="product-info">
            <h2>Data for the Product: {vc.credentialSubject.subjectDetails.product}</h2>
            <p>Product: {vc.credentialSubject.subjectDetails.product}</p>
            <p>Seller: {vc.issuer.name}</p>
            <p>Owner: {vc.holder.name}</p>
            <p>Batch Number: {vc.credentialSubject.subjectDetails.batchNumber}</p>
            <p>Quantity: {vc.credentialSubject.subjectDetails.quantity}</p>
            <p>Previous Credential: {vc.credentialSubject.previousCredential}</p>
          </div>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : null}
      </header>
    </div>
  );
}

export default App;