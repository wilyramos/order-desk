import { encodeCode39 } from "@/lib/code39";

export default function Code39Barcode({
  value,
  height = 26,
  narrow = 0.9,
}: {
  value: string;
  height?: number;
  narrow?: number;
}) {
  const { bars, width } = encodeCode39(value, narrow);
  const quiet = 4;
  const totalWidth = width + quiet * 2;

  // Formato exacto: * 2 0 2 6 0 9 1 8 R 3 5 3 1 3 5 4 1 9 0 *
  const formattedText = `* ${value.toUpperCase().split("").join(" ")} *`;

  return (
    <div style={{ display: "inline-block", textAlign: "center" }}>
      <svg
        width={totalWidth}
        height={height}
        viewBox={`0 0 ${totalWidth} ${height}`}
        role="img"
        aria-label={`Código de barras ${value}`}
        style={{ display: "block", margin: "0 auto" }}
      >
        {bars.map((bar, i) => (
          <rect
            key={i}
            x={bar.x + quiet}
            y={0}
            width={bar.width}
            height={height}
            fill="#000"
          />
        ))}
      </svg>
      <div
        style={{
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: "6.5pt",
          fontWeight: 600,
          color: "#000",
          marginTop: "3px",
          letterSpacing: "0.8px",
          wordSpacing: "1px",
        }}
      >
        {formattedText}
      </div>
    </div>
  );
}