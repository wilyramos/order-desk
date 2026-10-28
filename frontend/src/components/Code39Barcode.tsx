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

  return (
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
  );
}