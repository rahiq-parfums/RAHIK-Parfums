export type DeliveryMode = "normal" | "campus";

export type OrderData = {
  offerId: string;
  offerName: string;
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
