import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAllComments = asyncHandler(async (req, res) => {});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "No comments are made");
  }
  const user = req.user;
  const comment = await Comment.create({
    content,
    owner: user._id,
    video: videoId,
  });
  if (!comment) {
    throw new ApiError(400, "Comments couldnt be Created");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment was added Successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "No Comments are made!");
  }
  const comment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: { content },
    },
    {
      new: true,
    }
  );
  if (!comment) {
    throw new ApiError("500", "Comments couldnt be Updated");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comments were updated Successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError("402", "Unauthroized Request");
  }
  const deleteComment = await Comment.findByIdAndDelete(commentId);
  if (!deleteComment) {
    throw new ApiError("500", "Comments couldnt be Deleted");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, deleteComment, "Comments were Deleted Successfully")
    );
});
export { addComment, updateComment, deleteComment };
