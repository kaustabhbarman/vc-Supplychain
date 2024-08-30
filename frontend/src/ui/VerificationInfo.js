import React from 'react';
import './VerificationInfo.css';

const VerificationInfo = ({ signer, verification }) => {
  // Function to render icons based on boolean values
  const renderBooleanIcon = (value) => (value ? '✔️' : '❌');

  return (
    <div className="verification-info">
      <h2>Verification Information for {signer.name}</h2>
      <div className="verification-details">
        <div className="verification-item">
          <span className="label">Matching Content:</span>
          <span className="value">{renderBooleanIcon(verification.matching_vc)}</span>
        </div>
        <div className="verification-item">
          <span className="label">Matching Signer:</span>
          <span className="value">{renderBooleanIcon(verification.matching_signer)}</span>
        </div>
        <div className="verification-item">
          <span className="label">Signature Verified:</span>
          <span className="value">{renderBooleanIcon(verification.signature_verified)}</span>
        </div>
      </div>
      <div className="signer-id">
        <span className="label">DID:</span>
        <span className="value did" title={signer.id}>{signer.id}</span>
      </div>
    </div>
  );
};

export default VerificationInfo;
