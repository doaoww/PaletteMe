import Image from "next/image";
import { IMAGES } from "@/lib/shared/demo-images";
import { PRODUCTS, SEASONS } from "@/lib/shared/landing-data";

const PALETTE = SEASONS[1].palette;
const PICKS = PRODUCTS.slice(0, 3);

export function HeroPreview() {
  return (
    <div className="hero__preview">
      {/* TODO(asset-replace): hero selfie preview is women-only stock. */}
      <div className="hero__preview-card polaroid">
        <div className="hero__preview-photo">
          <Image
            src={IMAGES.selfieAlt}
            alt="Example selfie analyzed by PaletteMe"
            fill
            sizes="(max-width: 768px) 80vw, 360px"
            priority
          />
          <span className="hero__preview-badge">
            <span className="hero__preview-dot" />
            analyzed
          </span>
        </div>
        <div className="hero__preview-pal">
          {PALETTE.map((c) => (
            <i key={c} style={{ background: c }} />
          ))}
        </div>
        <div className="hero__preview-foot">
          <span className="hero__preview-season">Soft Summer</span>
          <span className="hero__preview-meta">8 core colors</span>
        </div>
      </div>

      <div className="hero__preview-picks">
        {PICKS.map((p) => (
          <div key={p.name} className="hero__preview-pick">
            <div className="hero__preview-pick-img">
              <Image src={p.image} alt={p.name} fill sizes="64px" style={{ objectFit: "cover" }} />
            </div>
            <span>{p.match}%</span>
          </div>
        ))}
      </div>

      <p className="hero__preview-caption">
        your palette + matched picks from the shop
      </p>
    </div>
  );
}
