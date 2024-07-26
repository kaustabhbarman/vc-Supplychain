const fs = require('fs');
const { SignJWT } = require('jose');
const crypto = require('crypto');

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

// Function to extract private key from a file with headers and footers
function extractPrivateKey(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Match the private key part between the headers and footers
    const privateKeyMatch = fileContent.match(/private key:\s*-----BEGIN PRIVATE KEY-----\n([\s\S]*?)-----END PRIVATE KEY-----/);

    if (!privateKeyMatch) {
        throw new Error('Private key not found in the file.');
    }

    // Reconstruct the private key with appropriate formatting
    return `-----BEGIN PRIVATE KEY-----\n${privateKeyMatch[1].replace(/\s+/g, '')}\n-----END PRIVATE KEY-----`;
}

// Function to extract public key from a file with headers and footers
function extractPublicKeyRaw(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Match the public key part between the headers and footers
    const publicKeyMatch = fileContent.match(/public key:\s*-----BEGIN PUBLIC KEY-----\n([\s\S]*?)-----END PUBLIC KEY-----/);

    if (!publicKeyMatch) {
        throw new Error('Public key not found in the file.');
    }

    // Return raw public Key
    return publicKeyMatch[1].replace(/\s+/g, '');
}

// Function to generate JWS using RsaSignature2018
async function generateJWS(data, privateKey) {
    const key = crypto.createPrivateKey({
        key: privateKey,
        format: 'pem',
        type: 'pkcs8'
    });
    
    const jws = await new SignJWT({ data })
        .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
        .sign(key);
        
    return jws;
}

function removeProofsSection(data) {
    const { proofs, ...rest } = data;
    return rest;
}

// Function to add proof to JSON data based on role
function addProofToData(data, role, signature, publicKey) {
    const proof = {
        type: "RsaSignature2018",
        created: new Date().toISOString(), // Current date and time
        proofPurpose: "assertionMethod",
        verificationMethod: publicKey,
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
async function signJsonFile(inputFilePath, identityPath, role) {
    // Read JSON file
    const jsonData = readJsonFile(inputFilePath);

    // Remove proofs section to sign the vc without the proofs
    const dataToSign = removeProofsSection(jsonData);

    // Generate string representation of JSON data to sign
    const jsonString = JSON.stringify(dataToSign);

    // Extract private key from the specified file
    const privateKey = extractPrivateKey(identityPath);
    const publicKey = extractPublicKeyRaw(identityPath);

    // Generate digital signature
    const signature = await generateJWS(jsonString, privateKey);

    // Append signature to JSON data
    const updatedJsonData = addProofToData(jsonData, role, signature, publicKey);

    // Write the signed JSON data to a new file
    writeJsonFile(inputFilePath, updatedJsonData);

    console.log("vc signed!");
}

// Get command line arguments
const [inputFilePath, identityPath, role] = process.argv.slice(2);

if (!inputFilePath || !identityPath || !role) {
    console.error('Usage: node signJson.js <inputFilePath> <identityPath> <role>');
    process.exit(1);
}

// Sign the JSON file and save to the specified file
signJsonFile(inputFilePath, identityPath, role);
