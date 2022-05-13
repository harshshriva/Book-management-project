const mongoose = require('mongoose')
const reviewModel = require('../models/reviewModel')
const bookModel = require('../models/bookModel')
const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    //if (typeof value === 'number') return false
    return true;
}
const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}
const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}
const reviewCreate = async function (req, res) {
    try {
        let data = req.body
        let Id = req.params.bookId
        const { bookId, rating, reviewedBy, review } = data
        // check that body is empty or not
        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, messaage: "Pleage provide review details in request body" })
        }

        // bookId is a valid object ID
        if (!isValidObjectId(Id)) {
            return res.status(400).send({ status: false, messaage: "Pleage provide valid bookId" })
        }

        // provide valid bookId in body
        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, messaage: "BookId is required" })
        }

        // check that both are same or not
        if (Id != bookId) {
            return res.status(400).send({ status: false, messaage: "Book ID not same" })
        }
        let validBookId = await bookModel.findOne({ _id: Id, isDeleted: false })
        if (!validBookId) {
            return res.status(400).send({ status: false, messaage: "Book doesn't exist" })
        }

        // if reviwedBy name is present than match with regex
        if (reviewedBy && !(/^[a-zA-Z]+(\s[a-zA-Z]+)?$/).test(reviewedBy)) {
            return res.status(400).send({ status: false, messaage: "please enter the name in righ" })
        }

        // check that review is provided
        if (review && !isValid(review)) {
            return res.status(400).send({ status: false, message: "Please enter the review" })
        }
        if ((rating < 1 || rating > 5)) {
            return res.status(400).send({ status: false, message: "Rating should be in range of number 1 to 5" })
        }
        
        data.reviewedAt = new Date()
        let reviews = await reviewModel.create(data)
        // increase the reviews count in same book
        let updateBook = await bookModel.findOneAndUpdate({ _id: Id }, { $inc: { reviews: +1 } }, { new: true })
        return res.status(201).send({ status: true, message: "success", data: reviews, updatedBook: updateBook })
    }
    catch (err) {
        return res.send({ error: err.message })
    }
}

const updateReview = async function (req, res) {
    try {
        let data = req.body
        let Id = req.params.bookId
        let reviewId = req.params.reviewId

        const { rating, reviewedBy, review } = data

        // check reviewId is a valid ObjectId
        if (!isValidObjectId(reviewId)) {
            return res.status(400).send({ status: false, messaage: "Pleage provide valid reviewId" })
        }
        const existreviewId = await reviewModel.findOne({ _id: reviewId, isDeleted: false })
        if (!existreviewId) {
            return res.status(400).send({ status: false, messaage: "review not found" })
        }

        // check bookId is a valid ObjectId
        if (!isValidObjectId(Id)) {
            return res.status(400).send({ status: false, messaage: "Pleage provide valid bookId" })
        }
        const existBookId = await bookModel.findOne({ _id: Id, isDeleted: false })
        if (!existBookId) {
            return res.status(400).send({ status: false, messaage: "book not found" })
        }

        // check the data is provided to update the review
        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, messaage: "Pleage provide review details to update review " })
        }

        // reviewedBy is present or match with regex
        if (!isValid(reviewedBy) || !(/^[a-zA-Z]+(\s[a-zA-Z]+)?$/).test(reviewedBy)) {
            return res.status(400).send({ status: false, messaage: "please enter the name who review the book" })
        }

        // check the review is enter in body
        if (review && !isValid(review)) {
            return res.status(400).send({ status: false, message: "Please enter the review" })
        }

        // rating must be greater than 1 and less than 5
        if ((rating < 1 || rating > 5)) {
            return res.status(400).send({ status: false, message: "Rating should be in range of number 1 to 5" })
        }

        // update the review with the data
        let updateReview = await reviewModel.findOneAndUpdate({ _id: reviewId, bookId: Id }, { $set: { review: data.review, rating: data.rating, reviewedBy: data.reviewedBy, reviewedAt: Date.now() } }, { new: true })
        return res.status(200).send({ status: true, message: "review update succesfully", data: updateReview })

    } catch (err) {
        return res.send({ error: err.message })
    }
}

const deleteReviewById = async function (req, res) {
    try {
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId

        // check bookId is a valid ObjectId
        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, msg: 'is not a valid book Id' })
        }

        // check reviewId is a valid ObjectId
        if (!isValidObjectId(reviewId)) {
            return res.status(400).send({ status: false, msg: 'is not a valid review Id' })
        }

        // find the book with book and check that is not deleted
        const book = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!book) {
            return res.status(400).send({ status: false, msg: 'book does not found' })
        }

        // find the book with book and check that is not deleted
        const review = await reviewModel.findOne({ _id: reviewId, isDeleted: false })
        if (!review) {
            return res.status(400).send({ status: false, msg: 'review does not exist for given bookId' })
        }
        
        // set the isDeleted property of review to true 
        const deletedReview = await reviewModel.findOneAndUpdate({ _id: reviewId, bookId: bookId }, { isDeleted: true }, { new: true })
        // decrease the review count in the book
        const decreaseCount = await bookModel.findOneAndUpdate({ _id: bookId, reviews: { $gt: 0 } }, { $inc: { reviews: -1 } })
        return res.status(200).send({ status: true, msg: 'review deleted successfully' })

    } catch (err) {
        return res.send({ error: err.message })
    }

}

module.exports = { reviewCreate, updateReview, deleteReviewById }