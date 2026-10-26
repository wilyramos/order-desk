import Image from "next/image";

export default function Logo({ size = 22 }: { size?: number }) {
  return (
    <Image
      src="/Apple_logo_black.svg"
      alt="Apple"
      width={size}
      height={size}
      unoptimized
      className="shrink-0"
    />
  );
}