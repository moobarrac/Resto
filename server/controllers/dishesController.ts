import Dishes from "../models/Dishes";
import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "../errors";
import { Request, Response } from "express";

const getAllDishes = async (req: Request, res: Response) => {
  const { search, page, size } = req.query;
  const queryObject = {};
  if (search) {
    queryObject["name"] = { $regex: search, $options: "i" };
  }
  const pageNumber = parseInt(page as string) || 1;
  const itemsPerPage = parseInt(size as string) || 20;
  const skip = (pageNumber - 1) * itemsPerPage;

  const dishes = await Dishes.find(queryObject).limit(itemsPerPage).skip(skip);
  const count = await Dishes.countDocuments(queryObject);

  res.status(StatusCodes.OK).json({
    dishes,
    total: count,
    currentPage: pageNumber,
    totalPages: Math.ceil(count / itemsPerPage),
  });
};

const createDish = async (req: Request, res: Response) => {
  const { name, description, price, image, category } = req.body;
  if (!name || !description || !price || !image || !category) {
    throw new BadRequestError("Please provide all values");
  }
  const dish = await Dishes.create(req.body);
  res.status(StatusCodes.CREATED).json({ dish });
};

const getSingleDish = async (req: Request, res: Response) => {
  const { id } = req.params;
  const dish = await Dishes.findById(id);
  if (!dish) {
    throw new BadRequestError(`Dish with id ${id} not found`);
  }
  res.status(StatusCodes.OK).json({ dish });
};

const updateDish = async (req: Request, res: Response) => {
  const { id } = req.params;
  const dish = await Dishes.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!dish) {
    throw new BadRequestError(`Dish with id ${id} not found`);
  }
  res.status(StatusCodes.OK).json({ dish });
};

const deleteDish = async (req: Request, res: Response) => {
  const { id } = req.params;
  const dish = await Dishes.findByIdAndDelete(id);
  if (!dish) {
    throw new BadRequestError(`Dish with id ${id} not found`);
  }
  res.status(StatusCodes.OK).json({ message: "Dish deleted successfully" });
};

export { getAllDishes, createDish, getSingleDish, updateDish, deleteDish };
