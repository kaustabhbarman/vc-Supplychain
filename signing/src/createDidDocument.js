const { EthrDID } = require('ethr-did');
const fs = require('fs');

// Function to create a DID and DID document
function createDID(accountData, controllerDid = null) {
    const ethrDid = new EthrDID({
        identifier: accountData.address,
        privateKey: accountData.privateKey,
    });

    // If controller did is not provided, it is assumed that the entity identified in the did is also the controller
    const controller = controllerDid || ethrDid.did;

    const didDocument = {
        '@context': 'https://w3id.org/did/v1',
        id: ethrDid.did,
        publicKey: [{
            id: `${ethrDid.did}#controller`,
            type: 'Secp256k1VerificationKey2018',
            controller: controller,
            ethereumAddress: ethrDid.address
        }],
        authentication: [{
            type: 'Secp256k1SignatureAuthentication2018',
            publicKey: `${ethrDid.did}#controller`
        }]
    };

    return {
        account: accountData,
        did: ethrDid.did,
        didDocument
    };
}

// Function to save the DID and DID document to a file
function saveDIDToFile(didData, filePath) {
    const data = JSON.stringify(didData, null, 2);
    fs.writeFileSync(filePath, data, 'utf-8');
    console.log('DID and DID Document saved to', filePath);
}

// Get the file path and account data from command line arguments
const filePath = process.argv[2];
const accountDataPath = process.argv[3];
const controllerDidPath = process.argv[4];

if (!filePath || !accountDataPath) {
    console.error('Usage: node createDid.js <outputFilePath> <accountDataFilePath> [<controllerDidFilePath>]');
    process.exit(1);
}

// Read the account data from the specified file
const accountData = JSON.parse(fs.readFileSync(accountDataPath, 'utf-8'));

// Optional: Read the controller DID from the specified file if provided
let controllerDid = null;
if (controllerDidPath) {
    const controllerDidData = JSON.parse(fs.readFileSync(controllerDidPath, 'utf-8'));
    controllerDid = controllerDidData.did;
}

// Create DID and save to the specified file
const didData = createDID(accountData, controllerDid);
saveDIDToFile(didData, filePath);
