import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  getOrderTicket,
  updateOrderStatus,
  updateOrderDetails,
} from "../controllers/order.controller.js";

const router = Router();

router.get("/", getOrders);
router.post("/", createOrder);
router.get("/:id", getOrderById);
router.get("/:id/ticket", getOrderTicket);
router.patch("/:id/status", updateOrderStatus);
router.patch("/:id", updateOrderDetails); // Este endpoint ahora permite editar la orden completa

export default router;