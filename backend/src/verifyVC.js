const { Resolver } = require('did-resolver');
const { getResolver } = require('ethr-did-resolver');
const { EthrDID } = require('ethr-did');

const chainNameOrId = 'sepolia';
const registryAddress = '0x03d5003bf0e79C5F5223588F347ebA39AfbC3818'; 
const rpcUrl = "https://sepolia.infura.io/v3/c907419d273445109b873583acc085e7";

// Function to remove the proof section for verification
function removeProofsSection(data) {
    const { proofs, ...rest } = data;
    return { proofs, dataToVerify: rest };
}

// Function to verify the proof of JSON data
async function verifyProof(proof, dataToVerify, role) {
    // Initialize result object
    const result = {
        matching_vc: false,
        matching_signer: false,
        signature_verified: false
    };

    // Setup the DID resolver
    const didResolver = new Resolver(getResolver({ rpcUrl: rpcUrl, name: chainNameOrId, registry: registryAddress }));
    const verificationDid = new EthrDID({ ...EthrDID.createKeyPair() });

    try {
        // Verify JWS and extract the signer, the VC, and the verified status
        const { verified, payload: { iat, iss, ...vc }, issuer: signer } = await verificationDid.verifyJWT(proof.jws, didResolver);

        // Check if VC encoded in the proof matches the actual VC
        const deepEqual = (obj1, obj2) => JSON.stringify(obj1) === JSON.stringify(obj2);
        result.matching_vc = deepEqual(vc, dataToVerify);

        // Check if proof was signed by the same DID that is in the document
        result.matching_signer = (signer === dataToVerify[role].id && signer === proof.verificationMethod);

        // Check if JWS was verified
        result.signature_verified = verified;

        // log errors in console
        if (!result.matching_vc) {
            console.error("JWS encoded VC for " + role + " does not match the actual VC.");
        }
        if (!result.matching_signer) {
            console.error("DID mismatch for " + role + ".");
        }
        if (!result.signature_verified) {
            console.error("JWS verification for " + role + " failed.");
        }

        // Print a success message if all checks pass
        if (result.matching_vc && result.matching_signer && result.signature_verified) {
            console.log("Proof for " + role + " is valid!");
        }

    } catch (error) {
        console.error("An error occurred during verification for " + role + ": ", error.message);
    }

    return result;
}

// Main function to read, verify, and output the result
async function verifyVC(vcjsonData, isCertificate) {
    // Extract the proof section and the data to verify
    const { proofs, dataToVerify } = removeProofsSection(vcjsonData);

    if (!proofs) {
        throw new Error('No proofs section found in the JSON file.');
    }

    // Verify issuerProof
    const issuerProofResult = await verifyProof(proofs.issuerProof, dataToVerify, "issuer");

    // If the VC is a certificate, there is no holderProof
    if (isCertificate) {
        return { issuer: issuerProofResult, holder: null };
    }

    // Verify holderProof
    const holderProofResult = await verifyProof(proofs.holderProof, dataToVerify, "holder");

    return {
        issuer: issuerProofResult,
        holder: holderProofResult
    };
}


module.exports = { verifyVC };