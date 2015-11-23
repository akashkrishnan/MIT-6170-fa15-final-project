Flipper
=======

### Public Access
- http://flipper.aakay.net

### Local Setup
1. Ensure `mongodb` is running: `sudo mongod`
2. Install the node modules: `sudo npm install --save --unsafe-perm`
3. Reset the database: `npm run init`
4. Start the server: `sudo npm start`

### Linting (ESLint)
- `npm run lint`
- (These aren't supposed to pass right now.)

### Testing (Mocha)
- `npm test`
- (These aren't supposed to pass right now.)

### Running
1. Ensure `mongodb` is running: `sudo mongod`
2. Start the server: `sudo npm start`

### Resetting
- `npm run init`

### Troubleshooting
- If you get the `EADDRINUSE` error stating that the port the server is trying to listen on is in use, then change the `port` number in the `config` section of `package.json`.
- If you get the `EACCESS` error, then make sure you are using `sudo` or are authenticated as root via `sudo su -`.
