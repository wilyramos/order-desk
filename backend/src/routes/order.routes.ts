import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  getOrderTicket,
  getOrderInvoicePdf,
  updateOrderStatus,
  updateOrderDetails,
  sendReceiptEmail,
  sendInvoiceEmail
} from "../controllers/order.controller.js";

const router = Router();

router.get("/", getOrders);
router.post("/", createOrder);
router.get("/:id", getOrderById);
router.get("/:id/ticket", getOrderTicket);
router.get("/:id/invoice", getOrderInvoicePdf); 
router.patch("/:id/status", updateOrderStatus);
router.patch("/:id", updateOrderDetails);

// Nuevas rutas para envío de emails
router.post("/:id/email/receipt", sendReceiptEmail);
router.post("/:id/email/invoice", sendInvoiceEmail);

export default router;