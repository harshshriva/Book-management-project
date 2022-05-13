const mongoose = require('mongoose')
const userModel = require('../models/userModel')
const bookModel = require('../models/bookModel')
const reviewModel = require('../models/reviewModel')

const regex = /^[a-zA-Z\s]*(?:[A-Za-z]+)*(?:[A-Za-z0-9]+)$/;
const num = /^\d{13}$/

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
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
        
        //if body is empty
        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'Invalid in request body' })
        }

        const { title, excerpt, userId, ISBN, category, subcategory, reviews, releasedAt } = requestBody;
        //title is empty or not match with regex
        if (!isValid(title) || !regex.test(title)) {
            return res.status(400).send({ status: false, message: 'Title is required' })
        }

        const isTitleAlreadyUsed = await bookModel.findOne({ title });
        //check title is already present
        if (isTitleAlreadyUsed) {
            return res.status(400).send({ status: false, message: 'Title is already used' })
        }

        //check if excerpt is  empty 
        if (!isValid(excerpt)) {
            return res.status(400).send({ status: false, message: 'Excerpt is required' })
        }

        //check if userId is  empty 
        if (!isValid(userId)) {
            return res.status(400).send({ status: false, message: 'UserId is required' })
        }

        //userId is a valid objectId
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: `${userId} is an invalid ObjectId` })
        }
        const isUserIdExist = await userModel.findOne({ _id: userId })

        if (!isUserIdExist) return res.status(400).send({ status: false, message: `${userId} userId does not exist` })

        //by auth.js(decodede token userId)
        let user = req.userId
        if (userId != user) {
            return res.status(401).send({ status: false, message: "Unauthorized access! Owner info doesn't match" });
        }

        //ISBN is empty or not match with regex
        if (!(isValid(ISBN)) || !num.test(ISBN)) {
            return res.status(400).send({ status: false, message: 'ISBN is required and must be of 13 numbers' })
        }
        const isISBNAlreadyUsed = await bookModel.findOne({ ISBN: ISBN });

        if (isISBNAlreadyUsed) {
            return res.status(400).send({ status: false, message: `${ISBN} ISBN  is already in used` });
        }

        //category is empty or not match with regex
        if (!isValid(category) || !(/^[a-zA-Z]+(\s[a-zA-Z]+)?$/).test(category)) {
            return res.status(400).send({ status: false, message: 'Category is required' })
        }

        //subcategory is empty or not match with regex
        if (!isValid(subcategory) || !(/^[a-zA-Z]+(\s[a-zA-Z]+)?$/).test(subcategory)) {
            return res.status(400).send({ status: false, message: 'Subcategory is required' })
        }

        //releasedAt is empty 
        if (!isValid(releasedAt)) {
            return res.status(400).send({ status: false, message: `Release date is required` })
        }

        //date match with regex
        const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/
        if (!dateRegex.test(releasedAt)) {
            return res.status(400).send({ status: false, message: `Releas date must be "YYYY-MM-DD" this format` })
        }
        const allData = { title, excerpt, userId, ISBN, category, subcategory, reviews, releasedAt }
        // creating data
        const newBook = await bookModel.create(allData);

        return res.status(201).send({ status: true, message: `Books created successfully`, data: newBook });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: err.message, msg: "server" });
    }
}


//======================================Get Api===============================================get books

const getBooks = async function (req, res) {

    try {
        const queryParams = req.query
        if (!isValidRequestBody(queryParams)) {
            // return all books that are not deleted and sort them in ascending
            let books = await bookModel.find({ isDeleted: false }).sort({ "title": 1 })
            return res.status(200).send({ status: true, msg: 'all book list', data: books })

        }
        // const{userId,category,subcategory} = queryParams
        if (!(queryParams.userId || queryParams.category || queryParams.subcategory)) {
            return res.status(400).send({ status: false, msg: 'query params details is required' })
        }
        //finding book with bookId and check is not deleted
        const book = await bookModel.find({ $and: [queryParams, { isDeleted: false }] }).select({ "_id": 1, "title": 1, "excerpt": 1, "userId": 1, "category": 1, "releasedAt": 1, "reviews": 1 }).sort({ "title": 1 })

        // if no book found 
        if (book.length > 0) {
            return res.status(200).send({ status: true, count: book.length, message: 'Books list', data: book })
        }
        else {
            return res.status(404).send({ msg: "books not found" })
        }

    } catch (err) {
        return res.status(500).send({ status: true, error: err.message })
    }
}

//======================================Get Api===============================================get by bookId

const getBooksById = async function (req, res) {
    try {
        const bookId = req.params.bookId;
        // if no bookId given
        if (!bookId) {
            return res.status(400).send({ status: false, msg: "bookId must be present in request param " })
        }
        // check that is a valid ObjectId
        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, msg: "Please provide a Valid bookId" })
        }
        const bookDetails = await bookModel.findOne({ _id: bookId, isDeleted: false, });
        //If no Books found in bookModel
        if (!bookDetails) {
            return res.status(404).send({ status: true, msg: "No books found." });
        }

        const reviews = await reviewModel.find({ bookId: bookId, isDeleted: false }); //finding the bookId in review Model
        const finalBookDetails = { ...bookDetails._doc, reviewsData: reviews, }; //Storing data into new Object
        return res.status(200).send({ status: true, msg: "Books list.", data: finalBookDetails });

    } catch (err) {
        return res.status(500).send({ error: err.message });
    }
};
//  =============================Put Api======================================


const updateBooks = async function (req, res) {
    try {
        let data = req.body;
        let Id = req.params.bookId
        // check that is a valid ObjectId
        if (!isValidObjectId(Id)) {
            return res.status(400).send({ status: false, msg: "Please enter a valid type of objectId" })
        }
        let book = await bookModel.findOne({ _id: Id, isDeleted: false })
        if (!book) {
            return res.status(400).send({ status: false, msg: "book not found" })
        }

        //by auth.js(decodede token userId)
        let userId = req.userId
        if (book.userId != userId) {
            return res.status(403).send({ status: false, message: "Unauthorized access.", });
        }

        // check the date is provide to update
        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: 'Provide details to update the Book' })
        }

        // check if the filter if provided to update
        if (!(data.title || data.ISBN || data.excerpt || data.releaseDate)) {
            return res.status(400).send({ status: false, message: 'please provide some details to update' })
        }

        //title is present and valid
        if (data.title && !isValid(data.title)) {
            return res.status(400).send({ status: false, message: 'please provide the Title' })
        }
        let usedTitle = await bookModel.findOne({ title: data.title })
        if (usedTitle) {
            return res.status(400).send({ status: false, msg: "This title is already in use please enter a unique Title" })
        }

        //ISBN is present and valid
        if (data.ISBN && !isValid(data.ISBN)) {
            return res.status(400).send({ status: false, message: 'please provide the ISBN' })
        }

        // match ISBN with regex
        if (!num.test(ISBN)) {
            return res.status(400).send({ status: false, message: "please provide " })
        }
        let usedIsbn = await bookModel.findOne({ ISBN: data.ISBN })
        if (usedIsbn) {
            return res.status(400).send({ status: false, msg: "Book with this ISBN is already present " })
        }

        //excerpt is present and valid 
        if (data.excerpt && !isValid(data.excerpt)) {
            return res.status(400).send({ status: false, message: 'please provide the excerpt' })
        }
        //  update the book 
        let updateBook = await bookModel.findByIdAndUpdate({ _id: Id }, { title: data.title, excerpt: data.excerpt, releaseDate: data.releaseDate, ISBN: data.ISBN }, { new: true })
        return res.status(200).send({ status: true, msg: "updated successfully", data: updateBook })
    }
    catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}


//================================Delete Api============================================delete books by bookId

const deleteBookId = async function (req, res) {
    try {

        let bookId = req.params.bookId
        // check if bookId is present or not
        if (!bookId) {
            return res.status(400).send({ status: false, msg: "bookId must be present in request param " })
        }
        // bookId is a valid objectId
        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, msg: "Please provide a Valid bookId" })
        }
        const book = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!book) {
            return res.status(404).send({ status: false, message: 'Book not exists or allready deleted' })
        }

        let userId = req.userId    //by auth.js(decodede token userId)
        if (book.userId != userId) {
            return res.status(401).send({ status: false, message: "Unauthorized access! Owner info doesn't match" });
        }
        // set the isDeleted true of that book with deleted date
        await bookModel.findOneAndUpdate({ _id: bookId }, { $set: { isDeleted: true, deletedAt: new Date() } })
        return res.status(200).send({ status: true, message: `Success` })
    }
    catch (error) {
        return res.status(500).send({ error: false, error: error.message });
    }
}

module.exports = { createBook, getBooks, getBooksById, updateBooks, deleteBookId }