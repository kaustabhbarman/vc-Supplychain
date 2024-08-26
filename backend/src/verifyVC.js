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

    // Setup the DID resolver
    const didResolver = new Resolver(getResolver({ rpcUrl: rpcUrl, name: chainNameOrId , registry: registryAddress}));
    const verificationDid = new EthrDID({ ...EthrDID.createKeyPair()});

    //verify jws and extract the signer, the vc and the verified status
    const { verified, payload: { iat, iss, ...vc }, issuer: signer } = await verificationDid.verifyJWT(proof.jws, didResolver);

    //check if vc encoded in the proof is the actual vc
    const deepEqual = (obj1, obj2) => JSON.stringify(obj1) === JSON.stringify(obj2);
    if(!deepEqual(vc, dataToVerify)){
        console.error("jws encoded VC for "+role+" does not match actual VC.");
        console.log("jws encoded VC:", vc);
        console.log("actual VC:", dataToVerify);
        return false;
    }

    //check if proof was signed by the same did that is in the document
    if(!(signer === dataToVerify[role].id && signer === proof.verificationMethod)){
        console.error("DID missmatch for "+role+".");
        console.log("jws DID", signer);
        console.log("VC DID:", dataToVerify[role].id);
        console.log("verificationMethod DID:", proof.verificationMethod);
        return false;
    }

    //check if jws was verified
    if(!verified){
        console.error("jws verification for "+role+" failed.");
        return false;
    }

    console.log("Proof for "+role+" is valid!");
    return true;
}

// Main function to read, verify, and output the result
async function verifyVC(vcjsonData, isCertificate) {

    // Extract the proof section and the data to verify
    const { proofs, dataToVerify } = removeProofsSection(vcjsonData);

    if (!proofs) {
        throw new Error('No proofs section found in the JSON file.');
    }
    // Verify issuerProof
    const issuerProofStatus = await verifyProof(proofs.issuerProof, dataToVerify, "issuer");
    
    //if the VC is a certificate, there is no holderproof
    if(isCertificate){
        return issuerProofStatus;
    }

    // Verify holderProof
    const holderProofStatus = await verifyProof(proofs.holderProof, dataToVerify, "holder");
    return (issuerProofStatus && holderProofStatus);
}


module.exports = { verifyVC };