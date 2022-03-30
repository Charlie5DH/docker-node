import mongoose from "mongoose";
import PostModel from "../models/postModels.js";

export const getPosts = async (req, res) => {
  try {
    const posts = await PostModel.find();
    console.log(posts);
    res
      .status(200)
      .json({ status: "success", data: posts, results: posts.length });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getPost = async (req, res) => {
  const id = req.params.id;

  try {
    const post = await PostModel.findById(id);
    console.log(post);
    res.status(200).json({ status: "success", data: post });
  } catch (error) {
    res.status(404).json({ message: error.message });
    console.log(error);
  }
};

export const createPost = async (req, res) => {
  const post = req.body;

  const newPost = new PostModel({ ...post });

  try {
    await newPost.save();

    res.status(201).json(newPost);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const updatePost = async (req, res) => {
  const { id: _id } = req.params;
  const post = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send("No post with the id");

  const updatedPost = await PostModel.findByIdAndUpdate(
    _id,
    { ...post, _id },
    { new: true }
  );

  res.json(updatedPost);
};

export const deletePost = async (req, res) => {
  const { id: _id } = req.params;

  // check if the id is valid
  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send("No post with the id");

  await PostModel.findByIdAndRemove(_id);
  res.json({ message: "Post deleted successfully" });
};
