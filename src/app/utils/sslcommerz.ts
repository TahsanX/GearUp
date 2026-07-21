import SSLCommerzPayment from 'sslcommerz-lts';
import { config } from '../../config/index.js';

const store_id = config.sslcommerz.storeId;
const store_passwd = config.sslcommerz.storePassword;
const is_live = config.sslcommerz.isLive;

export type TInitPaymentData = {
  total_amount: number;
  currency: string;
  tran_id: string;
  success_url: string;
  fail_url: string;
  cancel_url: string;
  ipn_url: string;
  cus_name: string;
  cus_email: string;
  cus_phone: string;
  cus_add1: string;
  cus_city: string;
  cus_country: string;
  shipping_method: string;
  product_name: string;
  product_category: string;
  product_profile: string;
};

export const initiateSslPayment = async (data: TInitPaymentData) => {
  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
  return sslcz.init(data);
};

export const validateSslPayment = async (val_id: string) => {
  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
  return sslcz.validate({ val_id });
};
