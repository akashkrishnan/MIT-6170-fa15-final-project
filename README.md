hsuresh_tcwong_medranom_akashk16_final
======================================

### Setup
1. Ensure mongodb is running: `mongod`
2. Install the node modules and the project: `npm install --save --unsafe-perm`
3. Reset the database: `npm run init`
4. Start the server: `npm start`

### Troubleshooting
1. If you get the `EADDRINUSE` error stating that the port the server is trying to listen on is in use, then change the `port` number in the `config` section of `package.json`.
