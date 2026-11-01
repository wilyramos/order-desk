import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  getOrderTicket,
  getOrderInvoicePdf,
  updateOrderStatus,
  updateOrderDetails,
} from "../controllers/order.controller.js";

const router = Router();

router.get("/", getOrders);
router.post("/", createOrder);
router.get("/:id", getOrderById);
router.get("/:id/ticket", getOrderTicket);
router.get("/:id/invoice", getOrderInvoicePdf); // Endpoint para generar/abrir la factura A4 oficial
router.patch("/:id/status", updateOrderStatus);
router.patch("/:id", updateOrderDetails);

export default router;