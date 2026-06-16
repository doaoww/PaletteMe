import { NextResponse } from "next/server";

export const runtime = "nodejs";

// TODO: implement when ready
// ASOS affiliate product sync via AWIN (ASOS runs their affiliate program through AWIN)
// Merchant ID: 3485 (ASOS UK) on AWIN platform
// Requires AWIN approval — see /api/sync/awin for the base integration

export type AsosProduct = {
  productId: number;
  name: string;
  brand: string;
  price: { current: { value: number; text: string } };
  imageUrl: string;
  url: string;
  colour: string;
  productType: { name: string };
};

// Transform ASOS product → products table row
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function transformAsosProduct(_asosProduct: AsosProduct) {
  // TODO: implement when ready
  // return {
  //   name: asosProduct.name,
  //   image_url: asosProduct.imageUrl,
  //   price: asosProduct.price.current.value,
  //   affiliate_url: asosProduct.url,   // add AWIN tracking params
  //   colortypes: mapColorToSeason(asosProduct.colour),
  //   category: mapAsosCategory(asosProduct.productType.name),
  //   colors: [asosProduct.colour],
  //   styles: [],
  //   body_types: [],
  //   source: "asos",
  //   source_id: String(asosProduct.productId),
  //   is_active: true,
  // };
}

export async function POST() {
  // TODO: implement when ready
  return NextResponse.json(
    { error: "ASOS sync not yet implemented. Awaiting AWIN approval." },
    { status: 501 }
  );
}
