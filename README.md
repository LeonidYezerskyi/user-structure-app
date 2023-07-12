USER-STRUCTURE-APP-SERVER

Tiny server app based on Node.js which implements simple organization user structure management operations.

The following user roles:
a. Administrator (top-most user)
b. Boss (any user with at least 1 subordinate)
c. Regular user (user without subordinates)

Each user except the Administrator have a boss (strictly one).

Theere are such REST API endpoints:
1. Register user
2. Authenticate as a user
3. Return list of users, taking into account the following:
- administrator should see everyone
- boss should see herself and all subordinates (recursively)
- regular user can see only herself
4. Change user's boss (only boss can do that and only for her subordinates).

The project is built using JavaScript, Node.js, Express.js, MongoDB, Postman, GitHub, bcryptjs, dotenv, express, 
express-joi-validation, joi, jsonwebtoken, mongoose.
