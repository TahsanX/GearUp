import { randomUUID } from 'crypto';
import { PaymentStatus, Role } from '@prisma/client';
import { AppError } from '../../../errors/AppError.js';
import { config } from '../../../config/index.js';
import prisma from '../../utils/prisma.js';
import { initiateSslPayment, validateSslPayment } from '../../utils/sslcommerz.js';

const createPayment = async (customerId: string, rentalOrderId: string) => {
  const rentalOrder = await prisma.rentalOrder.findUnique({
    where: { id: rentalOrderId },
    include: { customer: true },
  });

  if (!rentalOrder) {
    throw new AppError(404, 'Rental order not found');
  }

  if (rentalOrder.customerId !== customerId) {
    throw new AppError(403, 'You are not allowed to pay for this rental order');
  }

  if (rentalOrder.status === 'CANCELLED') {
    throw new AppError(400, 'Cannot pay for a cancelled rental order');
  }

  const existingCompletedPayment = await prisma.payment.findFirst({
    where: { rentalOrderId, status: PaymentStatus.COMPLETED },
  });

  if (existingCompletedPayment) {
    throw new AppError(409, 'This rental order has already been paid for');
  }

  const transactionId = `GEARUP-${randomUUID()}`;

  const payment = await prisma.payment.create({
    data: {
      transactionId,
      amount: rentalOrder.totalAmount,
      method: 'SSLCOMMERZ',
      status: PaymentStatus.PENDING,
      rentalOrderId,
    },
  });

  const sslResponse = await initiateSslPayment({
    total_amount: Number(rentalOrder.totalAmount),
    currency: 'BDT',
    tran_id: transactionId,
    success_url: `${config.backendUrl}/api/payments/confirm?transactionId=${transactionId}`,
    fail_url: `${config.backendUrl}/api/payments/confirm?transactionId=${transactionId}&status=failed`,
    cancel_url: `${config.backendUrl}/api/payments/confirm?transactionId=${transactionId}&status=cancelled`,
    ipn_url: `${config.backendUrl}/api/payments/confirm`,
    cus_name: rentalOrder.customer.name,
    cus_email: rentalOrder.customer.email,
    cus_phone: rentalOrder.customer.phone || '01700000000',
    cus_add1: 'N/A',
    cus_city: 'Dhaka',
    cus_country: 'Bangladesh',
    shipping_method: 'NO',
    product_name: 'Gear Rental',
    product_category: 'Sports Equipment Rental',
    product_profile: 'general',
  });

  if (!sslResponse?.GatewayPageURL) {
    throw new AppError(502, 'Failed to initiate payment with SSLCommerz');
  }

  return {
    paymentUrl: sslResponse.GatewayPageURL,
    transactionId,
    payment,
  };
};

const confirmPayment = async (
  transactionId: string,
  status: 'success' | 'failed' | 'cancelled',
  valId?: string,
) => {
  const payment = await prisma.payment.findUnique({ where: { transactionId } });

  if (!payment) {
    throw new AppError(404, 'Payment record not found');
  }

  if (status !== 'success') {
    await prisma.payment.update({
      where: { transactionId },
      data: { status: PaymentStatus.FAILED },
    });
    return { status: 'failed' };
  }

  if (valId) {
    const validationResponse = await validateSslPayment(valId);
    if (validationResponse?.status !== 'VALID' && validationResponse?.status !== 'VALIDATED') {
      await prisma.payment.update({
        where: { transactionId },
        data: { status: PaymentStatus.FAILED, gatewayData: validationResponse },
      });
      throw new AppError(400, 'Payment validation failed');
    }
  }

  const updatedPayment = await prisma.payment.update({
    where: { transactionId },
    data: {
      status: PaymentStatus.COMPLETED,
      paidAt: new Date(),
    },
  });

  await prisma.rentalOrder.update({
    where: { id: payment.rentalOrderId },
    data: { status: 'PAID' },
  });

  return { status: 'success', payment: updatedPayment };
};

const getUserPayments = async (userId: string, role: Role) => {
  if (role === Role.ADMIN) {
    return prisma.payment.findMany({
      include: { rentalOrder: { include: { customer: { select: { id: true, name: true, email: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  return prisma.payment.findMany({
    where: { rentalOrder: { customerId: userId } },
    include: { rentalOrder: true },
    orderBy: { createdAt: 'desc' },
  });
};

const getPaymentById = async (userId: string, role: Role, paymentId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { rentalOrder: true },
  });

  if (!payment) {
    throw new AppError(404, 'Payment not found');
  }

  if (role === Role.CUSTOMER && payment.rentalOrder.customerId !== userId) {
    throw new AppError(403, 'You are not allowed to view this payment');
  }

  return payment;
};

export const PaymentService = {
  createPayment,
  confirmPayment,
  getUserPayments,
  getPaymentById,
};
