import Image from "next/image";

type BrandLogoProps = {
  size?: number;
  showText?: boolean;
};

export function BrandLogo({ size = 52, showText = false }: BrandLogoProps): JSX.Element {
  return (
    <span className="brand" style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
      <Image
        src="/logo-ceara.png"
        alt="Ceará Auto Elétrica e Baterias"
        width={180}
        height={size}
        style={{ height: `${size}px`, width: "auto", objectFit: "contain" }}
        priority
      />
    </span>
  );
}

