const userModels = require("../model/userModel");
// const jwt = require("jsonwebtoken");
// const validator = require('validator')

const isValid = function(value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    if (typeof value === 'number') return false
    return true;
}

// globelly function to validate request body is empty or not

const isValidRequestBody = function(requestBody) {
    return Object.keys(requestBody).length > 0
}

const doLogin = async function(req, res) {
    try {

        let requestBody = req.body

        // request body validation 

        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide login details' })
            return
        }

        if (requestBody.email && requestBody.password) {

            // email id or password is velid or not check validation 

            let userEmail = await userModels.findOne({ email: requestBody.email });

            if (!userEmail) {
                return res.status(400).send({ status: true, msg: "Invalid user email" })
            }

            let userPassword = await userModels.findOne({ password: requestBody.password });

            if (!userPassword) {
                return res.status(400).send({ status: true, msg: "Invalid user password" })
            }

            // jwt token create and send back the user

            let payload = { _id: userEmail._id }

            let token = jwt.sign(payload, 'projectfourth', { expiresIn: '1800s' })

            res.header('x-api-key', token);

            res.status(200).send({ status: true, data: " user  login successfull", token: { token } })

        } else {

            res.status(400).send({ status: false, msg: "must contain email and password" })

        }

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message });
    }
};


// module.exports.createuser = createuser;
module.exports.doLogin = doLogin;




























//