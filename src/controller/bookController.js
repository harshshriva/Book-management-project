const mongoose = require('mongoose')
const userModel = require('../models/userModel')
const bookModel = require('../models/bookModel')
const reviewModel = require('../models/reviewModel')


const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    //if (typeof value === 'number') return false
    return true;
}

//========================================createBook Api==============================================


const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

const createBook = async function (req, res) {
    try {
        const requestBody = req.body;

        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'Invalid in request body' })
        }

        const { title, excerpt, userId, ISBN, category, subcategory, reviews, releasedAt } = requestBody;

        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: 'Title is required' })
        }

        const isTitleAlreadyUsed = await bookModel.findOne({ title });

        if (isTitleAlreadyUsed) {
            return res.status(400).send({ status: false, message: 'Title is already used' })
        }

        if (!isValid(excerpt)) {
            return res.status(400).send({ status: false, message: 'Excerpt is required' })
        }

        if (!isValid(userId)) {
            return res.status(400).send({ status: false, message: 'UserId is required' })
        }

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: `${userId} is an invalid ObjectId` })
        }

        const isUserIdExist = await userModel.findOne({ _id: userId })

        if (!isUserIdExist) return res.status(400).send({ status: false, message: `${userId} userId does not exist` })
          
        let user = req.userId    //by auth.js(decodede token userId)

        if (userId.toString() !== user) {
            return res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
        }
        if (!isValid(ISBN)) {
            return res.status(400).send({ status: false, message: 'ISBN is required' })
        }

        const isISBNAlreadyUsed = await bookModel.findOne({ ISBN: ISBN });

        if (isISBNAlreadyUsed) {
            return res.status(400).send({ status: false, message: `${ISBN} ISBN  is already in used` });
        }

        if (!isValid(category)) {
            return res.status(400).send({ status: false, message: 'Category is required' })
        }

        if (!isValid(subcategory)) {
            return res.status(400).send({ status: false, message: 'Subcategory is required' })
        }
        if (!isValid(reviews)) {
            return res.status(400).send({ status: false, message: 'Reviews is required' })
        }

        if (!isValid(releasedAt)) {
            return res.status(400).send({ status: false, message: `Release date is required` })
        }
        const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/
        if (!dateRegex.test(releasedAt)) {
            return res.status(400).send({ status: false, message: `Releas date must be "YYYY-MM-DD" this format` })
        }
        const allData = { title, excerpt, userId, ISBN, category, subcategory, reviews, releasedAt }
        const newBook = await bookModel.create(allData);

        return res.status(201).send({ status: true, message: `Books created successfully`, data: newBook });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message, msg: "server" });
    }
}


//======================================Get Api===============================================get books

const getBooks = async function (req, res) {

    try {
        const queryParams = req.query
        if(!isValidRequestBody(queryParams)){

        let books = await bookModel.find({isDeleted:false}).sort({ "title": 1 })
       
        return res.status(200).send({status:true, msg:'all book list',data:books})
        
    }
        // const{userId,category,subcategory} = queryParams
        if (!(queryParams.userId || queryParams.category || queryParams.subcategory)) {
            return res.status(400).send({ status: false, msg: 'query params details is required' })
        }

        const book = await bookModel.find({ $and: [queryParams, { isDeleted: false }] }).select({ "_id": 1, "title": 1, "excerpt": 1, "userId": 1, "category": 1, "releasedAt": 1, "reviews": 1 }).sort({ "title": 1 })

        if (book.length > 0) {
            res.status(200).send({ status: true, count: book.length, message: 'Books list', data: book })
        }
        else {
            res.status(404).send({ msg: "books not found" })
        }

    } catch (error) {
        res.status(500).send({ status: true, message: error.message })
    }
}

//======================================Get Api===============================================get by bookId

const getBooksById = async function (req, res) {
    try {
        const bookId = req.params.bookId;

        if (!bookId) {
            return res.status(400).send({ status: false, msg: "bookId must be present in request param " })
        }

        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, msg: "Please provide a Valid bookId" })
        }

        const bookDetails = await bookModel.findOne({ _id: bookId, isDeleted: false, });
        //finding the bookId
        if (!bookDetails) {
            return res.status(404).send({ status: true, msg: "No books found." }); //If no Books found in bookModel
        }
        // let userId = req.userId
        // if (bookDetails.userId != userId) {
        //  return res.status(403).send({ status: false, message: "Unauthorized access.", });
        //}

        const reviews = await reviewModel.find({ bookId: bookId }); //finding the bookId in review Model
        const finalBookDetails = { ...bookDetails._doc, reviewsData: reviews, }; //Storing data into new Object
        res.status(200).send({ status: true, msg: "Books list.", data: finalBookDetails });

    } catch (err) {
        console.log(err);
        res.status(500).send({ msg: err.message });
    }
};
//  =============================Put Api======================================


const updateBooks = async function (req, res) {
    try {
        let data = req.body;
        let Id = req.params.bookId

        if (!isValidObjectId(Id)) {
            return res.status(400).send({ status: false, msg: "Please enter a valid type of objectId" })
        }
        let book = await bookModel.findById({ _id: Id, isDeleted: false })
        if (!book) {
            return res.status(400).send({ status: false, msg: "book not found" })
        }
        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: 'Provide details to update the Book' })
        }
        if (!(data.title || data.ISBN || data.excerpt || data.releaseDate)) {
            return res.status(400).send({ status: false, message: 'please provide some details to update' })
        }
        if (data.title && !isValid(data.title)) {
            return res.status(400).send({ status: false, message: 'please provide the Title' })
        }
        let usedTitle = await bookModel.findOne({ title: data.title })
        if (usedTitle) {
            return res.status(400).send({ status: false, msg: "This title is already in use please enter a unique Title" })
        }
        if (data.ISBN && !isValid(data.ISBN)) {
            return res.status(400).send({ status: false, message: 'please provide the Title' })
        }
        let usedIsbn = await bookModel.findOne({ ISBN: data.ISBN })
        if (usedIsbn) {
            return res.status(400).send({ status: false, msg: "Book with this ISBN is already present " })
        }
        if (data.excerpt && !isValid(data.excerpt)) {
            return res.status(400).send({ status: false, message: 'please provide the excerpt' })
        }

        let userId = req.userId
        if (book.userId != userId) {
            return res.status(403).send({ status: false, message: "Unauthorized access.", });
        }



        let updateBook = await bookModel.findByIdAndUpdate({ _id: Id }, { title: data.title, excerpt: data.excerpt, releaseDate: data.releaseDate, ISBN: data.ISBN }, { new: true })
        return res.status(200).send({ status: true, msg: "updated successfully", data: updateBook })
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ msg: err.message });
    }
}


//================================Delete Api============================================delete books by bookId

const deleteBookId = async function (req, res) {
    try {

        let bookId = req.params.bookId

        if (!bookId) {
            return res.status(400).send({ status: false, msg: "bookId must be present in request param " })
        }

        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, msg: "Please provide a Valid bookId" })
        }

        const book = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!book) {
            return res.status(404).send({ status: false, message: `Book not exists or allready deleted` })
        }

        let userId = req.userId    //by auth.js(decodede token userId)

        if (book.userId.toString() !== userId) {
            return res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
        }

        await bookModel.findOneAndUpdate({ _id: bookId }, { $set: { isDeleted: true, deletedAt: new Date() } })
        return res.status(200).send({ status: true, message: `Success` })
    }
    catch (error) {
        return res.status(500).send({ error: false, error: error.message });
    }
}



module.exports.createBook = createBook;
module.exports.getBooks = getBooks
module.exports.getBooksById = getBooksById
module.exports.updateBook = updateBooks
module.exports.deleteBookId = deleteBookId