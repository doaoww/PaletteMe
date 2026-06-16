import { NextResponse } from "next/server";

export const runtime = "nodejs";

// TODO: implement when Amazon Associates approved
// Amazon Product Advertising API (PA API 5.0) sync
// Docs: https://webservices.amazon.com/paapi5/documentation/

export type AmazonProduct = {
  ASIN: string;
  ItemInfo: {
    Title: { DisplayValue: string };
    Features: { DisplayValues: string[] };
  };
  Images: {
    Primary: { Large: { URL: string } };
  };
  Offers: {
    Listings: Array<{
      Price: { Amount: number; Currency: string };
      DeliveryInfo: { IsPrimeEligible: boolean };
    }>;
  };
  DetailPageURL: string;
  // ... additional PA API fields
};

// Transform Amazon product → products table row
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function transformAmazonProduct(_amazonProduct: AmazonProduct) {
  // TODO: implement when Amazon Associates approved
  // return {
  //   name: amazonProduct.ItemInfo.Title.DisplayValue,
  //   image_url: amazonProduct.Images.Primary.Large.URL,
  //   price: amazonProduct.Offers.Listings[0]?.Price.Amount ?? null,
  //   affiliate_url: amazonProduct.DetailPageURL,
  //   colortypes: [],   // extract from ItemInfo.Features
  //   category: null,   // extract from browse node
  //   colors: [],       // extract from ItemInfo.Features or title
  //   styles: [],
  //   body_types: [],
  //   source: "amazon",
  //   source_id: amazonProduct.ASIN,
  //   is_active: true,
  // };
}

export async function POST() {
  // TODO: implement when Amazon Associates approved
  return NextResponse.json(
    { error: "Amazon sync not yet implemented. Awaiting Amazon Associates approval." },
    { status: 501 }
  );
}
