# Meeting Scheduler

Make and view meetings or class schedules and use a real-time 
online whiteboard in your browser on desktop, tablet, or smartphone.

* Registered users can be selected conveniently in drop-down menus when scheduling meetings. 
* Each user can see their meeting times and dates on login. 
* Sign up and Login authenticates users and ensures confidentiality from outsiders.
* Users can communicate and sketch diagrams on a shared real-time whiteboard.
* Content Security Policy protects the site from inline script and style hacks. 

This project uses React, Javascript, NodeJS, Express, Nginx, Socket.IO, Canvas, MongoDB, Webpack, Flexbox, SCSS, JSON Web Tokens (JWT), and Content Security Policy (CSP). A previous implementation uses PostgreSQL instead of MongoDB.

![schedulerpage.png](https://github.com/tom4244/Meeting_Scheduler_with_MongoDB/blob/master/src/app/img/schedulerpage.png?raw=true)

![whiteboard.png](https://github.com/tom4244/Meeting_Scheduler_with_MongoDB/blob/master/src/app/img/whiteboard.png?raw=true)

# Installation
* The site is configured to use an Express server for both http and socket.io with an Nginx server as a reverse proxy. The Express server is configured in the server/index.js file. An example nginx.conf file for Nginx server configuration with the needed "proxy pass" set up is included. 
* Select the port to be used for the socket.io server (such as 3000) and put it in config.js.
* Choose a jwt (JSON web token) secret and put it in server/config.js. 
* Create a MongoDB database with collections as in the included example_collections.txt example file.  
* The project is configured by default for localhost http to enable a quick setup for local experimentation, but with necessary changes for https included in comments. Certificate paths should be included in server/config.js.
* Install nodeJS and yarn.
* Run "yarn install" to install all needed nodejs packages and dependencies.
* Start the Nginx server (if used) and Mongo DB database.
* Run "npm start" to start the Express server.

# Notes
* To enhance security from inline scripting and styling hacks, inline scripting and styling were minimized and Content Security Policy (CSP) was implemented. Styled Components (SC) was originally used, but since it functions primarily by converting SC statements to inline styling, SC was converted to SCSS files.
