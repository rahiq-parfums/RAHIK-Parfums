export type OrderData = {
  offerId: string;
  offerName: string;
  fullName: string;
  phone: string;
  wilaya: string;
  commune: string;
  deliveryType: string;
  quantity: number;
  unitPrice: number;
  deliveryPrice: number;
  total: number;
  orderDateTime: string;
};

export type EmailResult = { success: boolean; message: string };
