import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  //pending will be done at last
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const user = await User.findById(req.user?._id);
  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All Fields are Required");
  }
  const videoFileLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
  if (!videoFileLocalPath) {
    throw new ApiError(400, "Video File is Required");
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail File is Required");
  }
  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!videoFile) {
    throw new ApiError(400, "Video File is Required");
  }
  if (!thumbnail) {
    throw new ApiError(400, "Thumbnail is Required");
  }
  const video = await Video.create({
    videoFile: videoFile?.secure_url,
    thumbnail: thumbnail?.secure_url,
    title,
    description,
    duration: videoFile.duration,
    views: 0,
    isPublished: true,
    videoFileCloudinaryId: videoFile.public_id,
    thumbnailCloudinaryId: thumbnail.public_id,
    owner: user,
  });
  const createdVideo = await Video.findById(video?._id);
  if (!createdVideo) {
    throw new ApiError(500, "Video Did't Published");
  }
  return res
    .status(201)
    .json(
      new ApiResponse(200, createdVideo, "Video File is Uploaded on Cloudinary")
    );
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video Not Found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Fetched Successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  if (!title && !description) {
    throw new ApiError(400, "All Fields are Required");
  }
  const thumbnailLocalPath = req.file?.path;
  if (!thumbnailLocalPath) {
    throw new ApiError(404, "Thumbnail File is Requried");
  }
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnail) {
    throw new ApiError(404, "Thumbnail File Not Uploaded!");
  }
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { $set: { title, description, thumbnail: thumbnail?.secure_url } },
    { new: true }
  );
  if (!updatedVideo) {
    throw new ApiError(404, "Video Not Found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedVideo, "Video Details Updated Successfully")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video Not Found");
  }
  const deleteThumbnail = await deleteFromCloudinary(
    video.thumbnailCloudinaryId
  );
  const deletevideoFile = await deleteFromCloudinary(
    video.videoFileCloudinaryId
  );
  if (!deletevideoFile || !deleteThumbnail) {
    throw new ApiError(500, "Video Couldn't be Deleted due to Internal Error");
  }
  const deletedVideo = await Video.findByIdAndDelete(videoId);
  if (!deleteVideo) {
    throw new ApiError(500, "Video File Couldn't be Deleted");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, deletedVideo, "Video has been deleted Successfully")
    );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const publishStatus = await Video.findByIdAndUpdate(videoId, [
    { $set: { isPublished: { $not: "$isPublished" } } },
  ]);
  if (!publishStatus) {
    throw new ApiError(400, "Status Couldn't be Changed");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        publishStatus,
        "Publish Status was Updated Successfully"
      )
    );
});

export {
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
