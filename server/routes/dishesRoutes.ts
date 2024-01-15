import express from "express";
import {
  getAllDishes,
  createDish,
  getSingleDish,
  updateDish,
  deleteDish,
} from "../controllers/dishesController";
import {
  authenticateUser,
  authorisePermissions,
} from "../middleware/authentication";

const router = express.Router();

router.route("/").get(getAllDishes);
router
  .route("/create")
  .post(authenticateUser, authorisePermissions("admin"), createDish);
router
  .route("/:id")
  .get(getSingleDish)
  .patch(authenticateUser, authorisePermissions("admin"), updateDish)
  .delete(authenticateUser, authorisePermissions("admin"), deleteDish);

export default router;
