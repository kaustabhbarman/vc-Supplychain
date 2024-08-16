const fs = require('fs');
const { EthrDID } = require('ethr-did');

// Function to read JSON file
function readJsonFile(filePath) {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
}

// Function to write JSON file
function writeJsonFile(filePath, jsonData) {
    const data = JSON.stringify(jsonData, null, 2);
    fs.writeFileSync(filePath, data, 'utf-8');
}

function getSigner(identityPath) {

    // read Identity Document
    const identity = JSON.parse(fs.readFileSync(identityPath, 'utf8'));

    // create signer (did) from identity
    const chainNameOrId = 'sepolia';
    const signer = new EthrDID({ ...identity, chainNameOrId});

    return signer

}

function removeProofsSection(data) {
    const { proofs, ...rest } = data;
    return rest;
}

// Function to add proof to JSON data based on role
function addProofToData(data, role, signature, signer) {
    const proof = {
        type: "EcdsaSecp256k1Signature2019",
        created: new Date().toISOString(), // Current date and time
        proofPurpose: "assertionMethod",
        verificationMethod: signer.did,
        jws: signature
    };

    // Ensure the proofs section exists
    if (!data.proofs) {
        data.proofs = {};
    }

    // Update the appropriate proof based on role
    if (role === 'issuer') {
        data.proofs.issuerProof = proof;
    } else if (role === 'holder') {
        data.proofs.holderProof = proof;
    } else {
        throw new Error('Invalid role specified. Must be "issuer" or "holder".');
    }

    return data;
}

// Main function to read, sign, and write JSON file
async function signJsonFile(vcPath, identityPath, role) {
    // Read JSON file
    const jsonData = readJsonFile(vcPath);

    // Remove proofs section to sign the vc without the proofs
    const dataToSign = removeProofsSection(jsonData);

    // create signer (did) from the identity document
    const signer = getSigner(identityPath);

    // Generate digital signature
    const signature = await signer.signJWT(dataToSign);

    // Generate digital signature Append signature to JSON data
    const jsonDataWithProof = addProofToData(jsonData, role, signature, signer);

    // Write the signed JSON data to a new file
    writeJsonFile(vcPath, jsonDataWithProof);

    console.log("vc signed!");
}

// Get command line arguments
const [vc, entity, role] = process.argv.slice(2);

// get identity for the entity signing the vc
const identityPath = "../../VC Prototype/Battery Use Case/"+entity+"/identity.txt"
// get vc Path
const vcPath = "../../VC Prototype/Battery Use Case/"+vc

if (!vc || !entity || !role) {
    console.error('Usage: node signJson.js <vc> <entity> <role>');
    process.exit(1);
}

// Sign the JSON file and save to the specified file
signJsonFile(vcPath, identityPath, role);
