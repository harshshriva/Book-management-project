const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");


const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

// globelly function to validate request body is empty or not
const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}


const createUser = async function (req, res) {
    try {
        let userBody = req.body

        if (!isValidRequestBody(userBody)) {
            return res.status(400).send({ status: false, msg: "userDetails must be provided" });
        }

        let { title, name, phone, email, password, address } = userBody // destructuring

        //---------titleValidation
        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: 'title is required' })
        }
        //---------title validation
        if (!["Mr", "Miss", "Mrs"].includes(title)) {
            return res.status(400).send({ status: false, msg: "Title must includes['Mr','Miss','Mrs']" })
        }

        //---------nameValidation
        if (!isValid(name)) {
            return res.status(400).send({ status: false, message: 'name is required' })
        }
        //------match name with regex
        if (!(/^[a-zA-Z]+(\s[a-zA-Z]+)?$/).test(name)) {
            return res.status(400).send({ status: false, msg: "Please use valid type of name" })
        }

        //------phoneValidation
        if (!isValid(phone)) {
            return res.status(400).send({ status: false, message: 'phone is required' })
        }

        //-------match phone with regex
        if (!(/^\d{10}$/).test(phone)) {
            return res.status(400).send({ status: false, msg: "please provide a valid phone Number" })
        }
         //check if phone is already in use
        let duplicatePhone = await userModel.findOne({ phone: phone })
        if (duplicatePhone) {
            return res.status(400).send({ status: false, msg: 'Phone already exists' })
        }

        //-----emailValidation
        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: 'Email is required' })
        }

        //-------match email with regex
        if (!(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,20}$/).test(email)) {
            return res.status(400).send({ status: false, msg: "Please provide a email in correct format" })
        }
        //check if email is already in use
        let duplicateEmail = await userModel.findOne({ email: email })
        if (duplicateEmail) {
            return res.status(400).send({ status: false, msg: 'email already exists' })
        }

        //--------passwordValidation
        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: 'password is required' })

        }
        //--------match password with regex
        if (!(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(userBody.password))) {
            return res.status(400).send({ status: false, msg: "Please use first letter in uppercase, lowercase and number with min. 8 length" })
        }
        //----------addressValidation
        if (!isValid(address)) {
            return res.status(400).send({ status: false, message: 'address is required' })
        }
        if (address) {
            if (!isValid(address.street)) {
                return res.status(400).send({ status: false, message: 'street is required' })
                
            }
            //address match with regex 
            if ((!isValid(address.city))|| !(/^[a-zA-Z]*$/).test(address.city)) {
                return res.status(400).send({ status: false, message: 'city is required' })
               
            }
            //pincode match with regex
            if ((!isValid(address.pincode)) || !(/^\d{6}$/).test(address.pincode) ) {
                return res.status(400).send({ status: false, message: 'Enter the pincode and only in 6 digits'})
            }
        }
        //-------userCreation
        let newUser = await userModel.create(userBody)
        return res.status(201).send({ status: true, msg: "user created successfully", data: newUser })
    }
    catch (err) {
      return res.status(500).send({ status: false, msg: err.message })
    }
}


const login = async function (req, res) {

    try {
        let requestBody = req.body;
        // check the body is empty
        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'Invalid request parameters,Please provide login details' })
        }
        // Extract keys from param
        const { email, password } = requestBody;

        // email Validation 
        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: 'EmailId is required' })
        }

        //password validate
        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: 'Password is required' })
        }

        //check user in the database
        const user = await userModel.findOne({ email, password });

        if (!user) {
            return res.status(401).send({ status: false, message: 'Invalid login credentials' });
        }
        // creating jwt token
        const token = jwt.sign({
            userId: user._id.toString()
        }, 'uranium_project-3_group_44', {
            expiresIn: "60 min"
        })
        res.header("x-api-key", token);
        return res.status(200).send({ status: true, message: 'User login successfull', data: { token } });

    } catch (err) {
        return res.status(500).send({ status: false, error: err.message });
    }
}

module.exports = { createUser, login }