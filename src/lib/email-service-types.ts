export type DeliveryMode = "normal" | "campus";

/**
 * What the customer bought. An Offer package is the default so existing callers
 * keep working; a single perfume is its own product with its own price.
 */
export type ProductType = "offer" | "perfume";

export type OrderData = {
  offerId: string;
  offerName: string;
  /**
   * Distinguishes an individual perfume from an Offer package. The order email
   * keeps working without it, so it is optional.
   */
  productType?: ProductType;
  fullName: string;
  phone: string;
  wilaya: string;
  commune: string;
  deliveryType: string;
  /** Standard wilaya delivery, or delivery inside a university residence. */
  deliveryMode?: DeliveryMode;
  /** University residence, set only when deliveryMode is "campus". */
  residence?: string;
  quantity: number;
  unitPrice: number;
  deliveryPrice: number;
  total: number;
  orderDateTime: string;
  orderRef?: string;
};

export type EmailResult = { success: boolean; message: string };
