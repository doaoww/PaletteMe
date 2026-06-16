import { NextResponse } from "next/server";

export const runtime = "nodejs";

// TODO: implement when AWIN approved
// AWIN product feed sync — fetches product CSV/JSON feed and upserts to products table
// Docs: https://wiki.awin.com/index.php/Publisher_API

export type AwinProduct = {
  aw_product_id: string;
  product_name: string;
  description: string;
  merchant_product_id: string;
  merchant_image_url: string;
  search_price: number;
  merchant_deep_link: string;
  colour: string;
  category_name: string;
  // ... additional AWIN fields
};

// Transform AWIN product → products table row
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function transformAwinProduct(_awinProduct: AwinProduct) {
  // TODO: implement when AWIN approved
  // return {
  //   name: awinProduct.product_name,
  //   image_url: awinProduct.merchant_image_url,
  //   price: awinProduct.search_price,
  //   affiliate_url: awinProduct.merchant_deep_link,
  //   colortypes: mapColorToSeason(awinProduct.colour),
  //   category: mapAwinCategory(awinProduct.category_name),
  //   colors: [awinProduct.colour],
  //   styles: [],
  //   body_types: [],
  //   source: "awin",
  //   source_id: awinProduct.aw_product_id,
  //   is_active: true,
  // };
}

export async function POST() {
  // TODO: implement when AWIN approved
  return NextResponse.json(
    { error: "AWIN sync not yet implemented. Awaiting AWIN approval." },
    { status: 501 }
  );
}
