# KPMT API - Kanban Project Management Tool API

An API designed to be flexible and easily extensible to fit any needs.

# NOTICE

* Code is experimental at best. Beware of broken logic, flawed security and everything in between.
* Frontend not provided. Feel free to create your own. 

# REQUIREMENTS

* Node.js v6
* MongoDB v3

# INSTALLATION

`npm install kpmt-io`

# CONFIGURATION

Copy `sample.json` to `production.json`. Modify per your settings.

# RUNNING

* `cd node_modules/kpmt-io/`  
* `NODE_ENV=production node app.js`
 
# PRODUCTION USAGE
 
Not recommended, but if you decide it's worth the risk, read below.
 
1. For making KPMT scalable and stable it is recommended to use a process manager such as PM2.
2. For best performance put KPMT behind a reverse proxy with proper load balancing (i.e. Nginx).  

# DEVELOPING AND TESTING:

* Copy `sample.json` to `development.json` and `testing.json`. Modify per your settings.
* Run tests: `npm test`
* Run linting: `npm run lint`
* Write code, Commit and Pull!