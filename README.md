## Setup

to get the directory, run:

#### `git clone https://github.com/kaustabhbarman/vc-Supplychain.git`

## Starting the Frontend

In the frontend directory, run:

#### `npm install`
#### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see errors and logs in the console.

## Starting the Backend

In the backend directory, navigate to the src folder and run:

#### `npm install`
#### `node server.js`

Runs the server on port 3001.

The server will not reload when you make changes, it has to be restarted.\
You may also errors and logs in the console.

## Signing

In the signing directory, navigate to the src folder and run:

#### `npm install`

You can then run scripts to create identities and sign vc's.
These scripts are currently hardcoded to target the Battery Use Case Folder.

You can create an identity for a company in the form of keys and an address.
For that you have create a folder with the name of the company and then run:

#### `node generateIdentity "YOUR COMPANY NAME HERE"`

You can then sign vc's using this identity. For that you have to provide the location
of the vc, the signing company, and the role of the signing company(issuer/holder).

Run:

#### `node signVC "FOLDER/VC-NAME" "SIGNING COMPANY" "ROLE"`

An actuall call of this script would look like this example:

#### `node signVC "Battery Retailer/battery-vc.json" "Battery Retailer" "holder"`


