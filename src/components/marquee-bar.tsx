const BRANDS = ["Volvo", "Scania", "Mercedes-Benz", "Iveco", "DAF", "MAN", "Ford Cargo", "VW Constellation"];

export function MarqueeBar(): JSX.Element {
  // Duplicado para loop infinito
  const items = [...BRANDS, ...BRANDS];
  return (
    <div className="hero-marquee">
      <div className="marquee-track">
        {items.map((b, i) => (
          <span key={`${b}-${i}`}>
            {b} <i className="dot" />
          </span>
        ))}
      </div>
    </div>
  );
}
