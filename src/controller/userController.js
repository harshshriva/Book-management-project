const userModels = require("../model/userModels");
 const jwt = require("jsonwebtoken");
 const validator = require('validator')

const isValid = function(value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    if (typeof value === 'number') return false
    return true;
}

// globelly function to validate request body is empty or not



const createUser = async function (req, res) {
    try{   
        let  userBody = req.body
       
        if (Object.keys(userBody) == 0) {
            return res.status(400).send({ status: false, msg: "userDetails must be provided" });
          }
        
    
       let { title , name, phone , email , password, address} = userBody // destructuring
    
     
       //----------------------------------------------------------------------------------------titleValidation
       if (!isValid(title))  {
        res.status(400).send({ status: false, message: 'title is required' })
           return
        }
        
        //----------------------------------------------------------------------------------------nameValidation
        if (!isValid(name)) {
          res.status(400).send({ status: false, message: 'name is required' })
            return
        }

        let duplicateName  = await userModels.findOne({name:userBody.name})
        if(duplicateName){
            return res.status(400).send({ status:false, msg: ' name already exists'})
        }
    
        //---------------------------------------------------------------------------------------phoneValidation
        if (!isValid(phone)) {
            res.status(400).send({ status: false, message: 'phone is required' })
              return
        }
    
        if (!(/^([+]\d{2})?\d{10}$/.test(userBody.phone))) {
            return res.status(400).send({ status: false, msg: "please provide a valid phone Number" })
        }
    
        let duplicatePhone  = await userModels.findOne({phone:userBody.phone})
        if(duplicatePhone){
            return res.status(400).send({ status:false, msg: 'Phone already exists'})
        }
        
        //---------------------------------------------------------------------------------------emailValidation
        if (!isValid(email)) {
            res.status(400).send({ status: false, message: 'Email is required' })
              return
        }
        
        if (!(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(userBody.email))) {
            return res.status(400).send({ status: false, msg: "Please provide a valid email" })
        }
    
        let duplicateEmail  = await userModels.findOne({email:userBody.email})
        if(duplicateEmail){
            return res.status(400).send({ status:false, msg: 'email already exists'})
        }
    
        //--------------------------------------------------------------------------------------passwordValidation
        if (!isValid(password)) {
            res.status(400).send({ status: false, message: 'password is required' })
              return
        }
    
        if( !( /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(userBody.password))) {
            return res.status(400).send({ status: false, msg: "Please provide a valid password" })
        }

        let duplicatePassword  = await userModels.findOne({password:userBody.password})
        if(duplicatePassword){
            return res.status(400).send({ status:false, msg: 'password already exists'})
        }
    
    //---------------------------------------------------------------------------------------------addressValidation
     
    if (!isValid(address)) {
        res.status(400).send({ status: false, message: 'address is required' })
          return
    }
    
    
    
    
    
    //---------------------------------------------------------------------------------------------userCreation
    const newUser = await userModels.create(userBody)
    res.status(201).send({ status:true, data:newUser, msg: "user created successfully"})
    
    }catch(err){
        res.status(500).send({status : false , msg : err.message})
    }
    }
    


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


module.exports.createUser = createUser;
module.exports.doLogin = doLogin;




























//