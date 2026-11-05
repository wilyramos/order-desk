// components/OrderBarcode.tsx
"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

const MARGIN = 6;
const NS = "http://www.w3.org/2000/svg";

export default function OrderBarcode({
value,
height = 26,
moduleWidth = 1.2,
}: {
value: string;
height?: number;
moduleWidth?: number;
}) {
const ref = useRef<SVGSVGElement>(null);

useEffect(() => {
const svg = ref.current;
if (!svg) return;

// Limpia el render anterior para no duplicar el texto
svg.replaceChildren();

JsBarcode(svg, value, {
format: "CODE128",
width: moduleWidth,
height,
margin: 0,
marginLeft: MARGIN,
marginRight: MARGIN,
displayValue: false,
background: "#fff",
lineColor: "#000",
});

// JsBarcode fija el ancho total del SVG: las barras van desde
// MARGIN hasta (ancho - MARGIN). No leemos los rect del DOM.
const svgWidth = parseFloat(svg.getAttribute("width") ?? "0");
const left = MARGIN;
const right = svgWidth - MARGIN;
const textY = height + 9;
const totalHeight = textY + 3;

svg.setAttribute("viewBox", `0 0 ${svgWidth} ${totalHeight}`);
svg.setAttribute("height", String(totalHeight));

const text = document.createElementNS(NS, "text");
text.setAttribute("x", String(left));
text.setAttribute("y", String(textY));
text.setAttribute("font-family", "Helvetica, Arial, sans-serif");
text.setAttribute("font-size", "8");
text.setAttribute("font-weight", "600");
// Estira el texto (con asteriscos) hasta el ancho exacto de las barras
text.setAttribute("textLength", String(right - left));
text.setAttribute("lengthAdjust", "spacing");
text.textContent = `*${value}*`;
svg.appendChild(text);
}, [value, height, moduleWidth]);

return (
<svg
ref={ref}
role="img"
aria-label={`Código de barras ${value}`}
style={{ display: "block", margin: "0 auto" }}
/>
);
}