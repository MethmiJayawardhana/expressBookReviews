const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
	let accessToken;

	// Prefer session-stored access token
	if (req.session && req.session.authorization && req.session.authorization.accessToken) {
		accessToken = req.session.authorization.accessToken;
	}

	// Fallback to Authorization header: Bearer <token>
	if (!accessToken && req.headers && req.headers.authorization) {
		const authHeader = req.headers.authorization;
		if (authHeader.startsWith('Bearer ')) {
			accessToken = authHeader.slice(7);
		}
	}

	if (!accessToken) {
		return res.status(401).json({message: 'User not logged in'});
	}

	try {
		const decoded = jwt.verify(accessToken, 'access');
		// attach username for downstream handlers
		req.user = decoded.username;
		next();
	} catch (err) {
		return res.status(401).json({message: 'Invalid access token'});
	}
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
