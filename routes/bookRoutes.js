import express from "express";
import { Book } from "../model/bookModel.js";

import authMiddleware from "../middleware/authorize.js";
const router = express.Router();
// .................Post......................
router.post("/", authMiddleware, async (req, res) => {
  try {
    console.log(req.body.hell);

    if (!req.body.title || !req.body.author || !req.body.publishYear) {
      return res.status(400).send({
        message: "send all required fields: title, author,publishYear",
      });
    }

    const newBook = {
      title: req.body.title,
      author: req.body.author,
      publishYear: req.body.publishYear,
      image: req.body.image,
      createdBy: req.user.userId,
    };
    console.log(newBook);

    const book = await Book.create(newBook);
    res.status(200).send(book);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: error.message,
    });
  }
});
// .................get.....................
router.get("/", authMiddleware, async (req, res) => {
  try {
    const books = await Book.find({ createdBy: req.user.userId });
    return res.status(200).json({
      count: books.count,
      data: books,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: error.message,
    });
  }
});
// .................get by id.....................
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    return res.status(200).json(book);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: error.message,
    });
  }
});

// .................put....................
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    console.log("done");
    const { id } = req.params;
    if (!req.body.title || !req.body.author || !req.body.publishYear) {
      return res.status(400).send({
        message: "send all required fields: title, author,publishYear",
      });
    }
    const result = await Book.findByIdAndUpdate(id, req.body);
    if (!result) {
      return res.status(404).send({
        message: "book not found",
      });
    }

    return res.status(200).send({ message: "book updated succesfully" });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: error.message,
    });
  }
});

// .................delete.....................
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    console.log("done");
    const { id } = req.params;

    const result = await Book.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).send({
        message: "book not found",
      });
    }

    return res.status(200).send({ message: "book deleted succesfully" });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: error.message,
    });
  }
});

export default router;
