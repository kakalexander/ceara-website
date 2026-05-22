type BrandLogoProps = {
  size?: number;
  showText?: boolean;
};

/**
 * Logo da Ceará Auto Elétrica em SVG inline.
 *
 * Para usar o PNG oficial, copie LogoMarcaMelhorQualidade.png para public/logo.png
 * e troque este componente por <Image src="/logo.png" ... />.
 */
export function BrandLogo({ size = 52, showText = true }: BrandLogoProps): JSX.Element {
  return (
    <span className="brand">
      <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <defs>
          <linearGradient id="grad-red" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d8232a" />
            <stop offset="100%" stopColor="#a01418" />
          </linearGradient>
          <linearGradient id="grad-metal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a3a44" />
            <stop offset="100%" stopColor="#14141a" />
          </linearGradient>
        </defs>
        {/* outer ring (engrenagem) */}
        <circle cx="50" cy="50" r="46" fill="url(#grad-metal)" stroke="#2a2a35" strokeWidth="2" />
        {/* dentes da engrenagem */}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          const x = 50 + Math.cos(a) * 46;
          const y = 50 + Math.sin(a) * 46;
          return <rect key={i} x={x - 3} y={y - 3} width="6" height="6" fill="#2a2a35" transform={`rotate(${i * 30} ${x} ${y})`} />;
        })}
        {/* círculo interno vermelho */}
        <circle cx="50" cy="50" r="32" fill="url(#grad-red)" />
        {/* raio elétrico */}
        <path d="M52 26 L36 54 L48 54 L44 74 L62 46 L50 46 L56 26 Z" fill="#fff" stroke="#fff" strokeWidth="1" strokeLinejoin="round" />
      </svg>
      {showText && (
        <span className="brand-text">
          <strong>Ceará</strong>
          Auto Elétrica &amp; Bateria
        </span>
      )}
    </span>
  );
}
