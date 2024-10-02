import React from 'react';
import './ProductInfo.css';

// component for displaying product information
const ProductInfo = ({ vc, handleCidSubmit }) => {
  return (
    <div className="product-info">
      <h2>Product Information</h2>
      <table>
        <tbody>
          <tr>
            <th>Product</th>
            <td>{vc.credentialSubject.subjectDetails.product}</td>
          </tr>
          <tr>
            <th>Issuer</th>
            <td>{vc.issuer.name}</td>
          </tr>
          <tr>
            <th>Holder</th>
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
          <tr>
            <th>Issuance Date</th>
            <td>{vc.issuanceDate}</td>
          </tr>
          <tr>
            <th>Transaction ID</th>
            <td>{vc.credentialSubject.transactionId}</td>
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
  );
};

export default ProductInfo;
