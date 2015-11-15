Flipper
=======

### Setup
1. Ensure `mongodb` is running: `sudo mongod`
2. Install the node modules and the project: `sudo npm install --save --unsafe-perm`
3. Reset the database: `npm run init`
4. Start the server: `sudo npm start`

### Linting (ESLint)
1. `npm run lint`


### Testing (currently not available)
1. `npm test`

### Running
1. Ensure `mongodb` is running: `sudo mongod`
2. Start the server: `sudo npm start`

### Resetting
1. `npm run init`

### Troubleshooting
- If you get the `EADDRINUSE` error stating that the port the server is trying to listen on is in use, then change the `port` number in the `config` section of `package.json`.
- If you get the `EACCESS` error, then make sure you are using `sudo` or are authenticated as root via `sudo su -`.
