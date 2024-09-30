import React from 'react';
import './CertificateInfo.css';

// component for displaying certificate information
const CertificateInfo = ({ vc }) => {
  return (
    <div className="certificate-info">
      <h2>Certificate Information</h2>
      <table>
        <tbody>
          <tr>
            <th>Type</th>
            <td>{vc.credentialSubject.license.type}</td>
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
            <th>Ressource</th>
            <td>{vc.credentialSubject.license.allowedResource}</td>
          </tr>
          <tr>
            <th>Country</th>
            <td>{vc.credentialSubject.license.country}</td>
          </tr>
          <tr>
            <th>Terms</th>
            <td>{vc.credentialSubject.terms.compliance}</td>
          </tr>
          <tr>
            <th>Issuance Date</th>
            <td>{vc.issuanceDate}</td>
          </tr>
          <tr>
            <th>Validity Period</th>
            <td>{vc.credentialSubject.license.validFrom} - {vc.credentialSubject.license.validTo}</td>
          </tr>
        </tbody>
      </table>
  </div>
  );
};

export default CertificateInfo;

