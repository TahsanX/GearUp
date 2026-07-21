declare module 'sslcommerz-lts' {
  export default class SSLCommerzPayment {
    constructor(store_id: string, store_passwd: string, is_live: boolean);
    init(data: Record<string, unknown>): Promise<any>;
    validate(data: Record<string, unknown>): Promise<any>;
    initiatePayment(data: Record<string, unknown>): Promise<any>;
    validationTransactionId(data: Record<string, unknown>): Promise<any>;
  }
}
