const fs = require('fs');
const { Resolver } = require('did-resolver');
const { getResolver } = require('ethr-did-resolver');
const { EthrDID } = require('ethr-did');

const chainNameOrId = 'sepolia'; // Replace with the correct network if needed

// Function to read JSON file
function readJsonFile(filePath) {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
}

// Function to remove the proof section for verification
function removeProofsSection(data) {
    const { proofs, ...rest } = data;
    return { proofs, dataToVerify: rest };
}

// Function to verify the proof of JSON data
async function verifyProof(proof, dataToVerify, role) {
    // Setup the DID resolver
    // create DID Resolver
    const registryAddress = '0x03d5003bf0e79C5F5223588F347ebA39AfbC3818'; 
    const rpcUrl = "https://sepolia.infura.io/v3/c907419d273445109b873583acc085e7";
    const didResolver = new Resolver(getResolver({ rpcUrl: rpcUrl, name: chainNameOrId , registry: registryAddress}));

    const verificationDid = new EthrDID({ ...EthrDID.createKeyPair()});

    //verify jws and extract the signer, the vc and the verified status
    const { verified, payload: { iat, iss, ...vc }, issuer: signer } = await verificationDid.verifyJWT(proof.jws, didResolver);

    //check if jws was verified
    if(!verified){
        console.error("jws verification for "+role+" failed.");
        return false;
    }

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

    console.log("Proof for "+role+" is valid!");
    return true;
}

// Main function to read, verify, and output the result
async function verifyVC(vcPath) {
    // Read the JSON file
    const jsonData = readJsonFile(vcPath);

    // Extract the proof section and the data to verify
    const { proofs, dataToVerify } = removeProofsSection(jsonData);

    if (!proofs) {
        console.error('No proof section found in the JSON file.');
        return;
    }
    // Verify each proof
    const issuerProofStatus = await verifyProof(proofs.issuerProof, dataToVerify, "issuer");
    const holderProofStatus = await verifyProof(proofs.holderProof, dataToVerify, "holder");
}

// Get command line arguments
const [vc] = process.argv.slice(2);

// Get the VC Path
const vcPath = "../../VC Use Cases/Battery Use Case/" + vc;

if (!vc) {
    console.error('Usage: node verifyJson.js <vc>');
    process.exit(1);
}

// Verify the JSON file and output the result
verifyVC(vcPath);
