import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Post must have title"],
  },
  body: {
    type: String,
    required: [true, "Post must have body"],
  },
});

const PostModel = mongoose.model("Post", postSchema);
export default PostModel;
