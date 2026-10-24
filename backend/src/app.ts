import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import productRoutes from "./routes/product.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/products", productRoutes);

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, message: "API funcionando" });
});

// Aquí se montarán las rutas de la aplicación
// app.use("/api/products", productRoutes);

// Ruta no encontrada
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// Manejo de errores
app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(err.status ?? 500).json({
    message: err.message || "Error interno del servidor",
  });
});

export default app;