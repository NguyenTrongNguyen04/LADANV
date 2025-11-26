import crypto from 'crypto';
import axios from 'axios';
import Subscription from '../models/subscriptionModel.js';
import PricingPlan from '../models/pricingPlanModel.js';
import sepayClient from '../lib/sepayClient.js';
import Order from '../models/orderModel.js';

// Helper: constant-time compare
function safeEqual(a, b) {
  const bufA = Buffer.from(a || '');
  const bufB = Buffer.from(b || '');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// Compute HMAC SHA256 of raw body
function computeSignature(rawBody, secret) {
  return crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
}

const SUCCESS_STATUSES = new Set(['success', 'paid', 'completed', 'complete', 'done', 'finished']);

const normalizeStatus = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');

const safeLimit = (value) => (value === -1 ? 999999 : value);

const resolveSepayApiBaseUrl = () => {
  if (process.env.SEPAY_API_BASE_URL) {
    return process.env.SEPAY_API_BASE_URL.replace(/\/+$/, '');
  }
  const rawEnv = (process.env.SEPAY_ENV || 'sandbox').toLowerCase();
  const isProduction = rawEnv === 'production' || rawEnv === 'product';
  return isProduction ? 'https://my.sepay.vn' : 'https://sandbox.sepay.vn';
};

const parseAmount = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const normalized = value.replace(/,/g, '');
    const parsed = Number.parseFloat(normalized);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const findMatchingTransaction = async (order) => {
  const apiToken = process.env.SEPAY_API_TOKEN;
  if (!apiToken) {
    return null;
  }

  const apiBase = resolveSepayApiBaseUrl();
  const accountNumber = process.env.SEPAY_VIETQR_ACCOUNT;
  const limit = process.env.SEPAY_VERIFY_TRANSACTION_LIMIT || '100';
  const params = new URLSearchParams({ limit: String(limit) });

  if (accountNumber) params.append('account_number', accountNumber);
  // Mặc dù docs hỗ trợ filter amount_in, để tránh bỏ sót (ví dụ phí phát sinh), chúng ta lấy list và tự lọc

  const url = `${apiBase}/userapi/transactions/list?${params.toString()}`;

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${apiToken}`
    },
    timeout: 10000
  });

  const transactions = response.data?.transactions;
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return null;
  }

  const amount = Number(order.amount) || 0;
  const allowedDelta = Number(process.env.SEPAY_VERIFY_AMOUNT_DELTA || 1000); // VND
  const keywords = [order.gatewayOrderId, order.paymentReference, order.orderInvoiceNumber]
    .filter(Boolean)
    .map((item) => item.toString().trim().toUpperCase());

  const matchedTx = transactions.find((tx) => {
    const amountIn = parseAmount(tx.amount_in);
    const amountMatches = !amount || Math.abs(amountIn - amount) <= allowedDelta;

    const content = (tx.transaction_content || '').toString().toUpperCase();
    const reference = (tx.reference_number || '').toString().toUpperCase();

    const keywordMatches = keywords.length === 0
      ? true
      : keywords.some((keyword) => keyword && (content.includes(keyword) || reference.includes(keyword)));

    return amountMatches && keywordMatches;
  });

  if (!matchedTx) {
    return null;
  }

  return {
    transaction: matchedTx,
    raw: response.data
  };
};

async function activateSubscriptionForUser(userId, planId, billingCycle = 'monthly') {
  const plan = await PricingPlan.findOne({ planId, isActive: true });
  if (!plan) {
    return null;
  }

  const endDate = billingCycle === 'yearly'
    ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  let subscription = await Subscription.findOne({ user: userId });

  if (!subscription) {
    subscription = await Subscription.create({
      user: userId,
      plan: plan.planId,
      status: 'active',
      startDate: new Date(),
      endDate,
      usage: {
        aiScansLimit: safeLimit(plan.features.aiScansPerMonth),
        analysisReportsLimit: safeLimit(plan.features.analysisReportsPerMonth),
        journalEntriesLimit: safeLimit(plan.features.journalEntriesPerMonth),
        productComparisonsLimit: safeLimit(plan.features.productComparisonsPerMonth)
      }
    });
  } else {
    subscription.plan = plan.planId;
    subscription.status = 'active';
    subscription.startDate = new Date();
    subscription.endDate = endDate;
    subscription.usage.aiScansLimit = safeLimit(plan.features.aiScansPerMonth);
    subscription.usage.analysisReportsLimit = safeLimit(plan.features.analysisReportsPerMonth);
    subscription.usage.journalEntriesLimit = safeLimit(plan.features.journalEntriesPerMonth);
    subscription.usage.productComparisonsLimit = safeLimit(plan.features.productComparisonsPerMonth);
    await subscription.save();
  }

  return subscription;
}

// POST /api/payment/sepay/ipn
export const sepayIPN = async (req, res) => {
  try {
    const secret = process.env.SEPAY_SECRET_KEY || process.env.SEPAY_TEST_SECRET;
    if (!secret) {
      return res.status(500).json({ success: false, message: 'Missing SEPAY secret' });
    }

    const raw = req.rawBody || Buffer.from(JSON.stringify(req.body || {}));

    // Sepay signature header candidates (adaptable)
    const providedSig =
      req.headers['x-sepay-signature'] ||
      req.headers['sepay-signature'] ||
      req.headers['x-signature'] ||
      req.headers['signature'] || '';

    // Compute signature
    const expectedSig = computeSignature(raw, secret);

    if (!providedSig || !safeEqual(String(providedSig), expectedSig)) {
      // In test environments, you may want to allow bypass with explicit flag
      if (process.env.SEPAY_ALLOW_UNVERIFIED !== 'true') {
        return res.status(401).json({ success: false, message: 'Invalid IPN signature' });
      }
    }

    const payload = req.body || {};
    // Expected minimal fields (adapt according to Sepay docs / your order creation flow)
    // We assume you send metadata { userId, planId, billingCycle } when creating order
    const meta = payload.metadata || payload.meta || {};
    const userId = meta.userId || payload.userId;
    const planId = meta.planId || payload.planId; // 'pro' | 'premier'
    const billingCycle = meta.billingCycle || payload.billing || 'monthly';
    const status = payload.status || payload.payment_status || 'success';
    const orderInvoiceNumber = payload?.order?.order_invoice_number || payload?.order_invoice_number;
    const sepayOrderId = payload?.order?.id || payload?.order_id;
    const sepayTransactionId = payload?.transaction?.transaction_id || payload?.transaction_id;

    if (!userId || !planId) {
      // Log and ack to avoid retries; handle manually if needed
      console.warn('[SePay IPN] Missing userId/planId in metadata');
      return res.status(200).json({ success: true });
    }

    if (String(status).toLowerCase() !== 'success') {
      return res.status(200).json({ success: true });
    }

    // Update order if exists
    if (orderInvoiceNumber) {
      await Order.findOneAndUpdate(
        { orderInvoiceNumber },
        {
          status: 'paid',
          sepayOrderId,
          sepayTransactionId,
          rawIPN: payload
        },
        { new: true }
      );
    }

    await activateSubscriptionForUser(userId, planId, billingCycle);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[SePay IPN] Error:', error);
    return res.status(200).json({ success: true }); // Ack to avoid repeated retries; log for manual handling
  }
};

// POST /api/payment/sepay/checkout
// Body: { userId, planId: 'pro'|'premier', billingCycle: 'monthly'|'yearly', amount, currency='VND', description }
export const sepayCreateCheckout = async (req, res) => {
  try {
    const { userId, planId, billingCycle = 'monthly', amount, currency = 'VND', description } = req.body || {};

    if (!process.env.SEPAY_MERCHANT_ID || !process.env.SEPAY_SECRET_KEY) {
      return res.status(500).json({ success: false, message: 'Missing SePay credentials' });
    }

    if (!userId || !planId || !amount) {
      return res.status(400).json({ success: false, message: 'Missing userId/planId/amount' });
    }

    // Log để debug
    console.log('[SePay Checkout] Env:', process.env.SEPAY_ENV);
    console.log('[SePay Checkout] Merchant ID:', process.env.SEPAY_MERCHANT_ID?.substring(0, 10) + '...');
    console.log('[SePay Checkout] Amount:', amount, 'Type:', typeof amount);

    const checkoutURL = sepayClient.checkout.initCheckoutUrl();
    const orderInvoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random()*1e6)}`;

    // Đảm bảo order_amount là string (theo yêu cầu SePay)
    const orderAmount = String(amount);

    const fields = sepayClient.checkout.initOneTimePaymentFields({
      operation: 'PURCHASE',
      payment_method: 'BANK_TRANSFER',
      order_invoice_number: orderInvoiceNumber,
      order_amount: orderAmount,
      currency,
      order_description: description || `LADANV - ${planId.toUpperCase()} (${billingCycle})`,
      custom_data: JSON.stringify({ userId, planId, billingCycle })
    });

    // Save order
    const gatewayOrderId = fields?.order_id || fields?.orderId || null;
    const paymentReference = fields?.payment_reference || fields?.transaction_code || gatewayOrderId || null;

    await Order.create({
      orderInvoiceNumber,
      user: userId,
      planId,
      billingCycle,
      amount,
      currency,
      paymentMethod: 'BANK_TRANSFER',
      status: 'pending',
      gatewayOrderId,
      paymentReference
    });

    return res.json({ success: true, data: { checkoutURL, fields, orderInvoiceNumber } });
  } catch (error) {
    console.error('Create SePay checkout error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/payment/order/:orderInvoiceNumber
// Lấy thông tin order và QR code
export const getOrderStatus = async (req, res) => {
  try {
    const { orderInvoiceNumber } = req.params;
    
    if (!orderInvoiceNumber) {
      return res.status(400).json({ success: false, message: 'Missing orderInvoiceNumber' });
    }

    const order = await Order.findOne({ orderInvoiceNumber }).populate('user', 'email name');
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Tạo lại checkout fields để lấy QR code
    const checkoutURL = sepayClient.checkout.initCheckoutUrl();
    const fields = sepayClient.checkout.initOneTimePaymentFields({
      operation: 'PURCHASE',
      payment_method: 'BANK_TRANSFER',
      order_invoice_number: order.orderInvoiceNumber,
      order_amount: String(order.amount),
      currency: order.currency,
      order_description: `LADANV - ${order.planId.toUpperCase()} (${order.billingCycle})`,
      custom_data: JSON.stringify({ userId: order.user._id, planId: order.planId, billingCycle: order.billingCycle })
    });

    // VietQR info (dựa trên env cấu hình)
    let vietQrUrl = null;
    let vietQrInfo = null;
    const vietQrAccount = process.env.SEPAY_VIETQR_ACCOUNT;
    const vietQrBank = process.env.SEPAY_VIETQR_BANK; // có thể là mã BIN hoặc tên ngân hàng tuỳ cấu hình tài khoản SePay

    if (vietQrAccount && vietQrBank) {
      const amountNumber = Number(order.amount) || 0;
      const validAmount = amountNumber > 0 ? amountNumber : 0;
      const template = process.env.SEPAY_VIETQR_DESCRIPTION_TEMPLATE || '{invoice}';
      const description = template
        .replace('{invoice}', order.orderInvoiceNumber)
        .replace('{plan}', (order.planId || '').toUpperCase())
        .replace('{user}', order.user?.email || order.user?._id?.toString() || '');

      const params = new URLSearchParams({
        bank: vietQrBank,
        acc: vietQrAccount,
        amount: validAmount.toString(),
        des: description
      });

      vietQrUrl = `https://qr.sepay.vn/img?${params.toString()}`;
      vietQrInfo = {
        bank: vietQrBank,
        account: vietQrAccount,
        amount: validAmount,
        description
      };
    }

    return res.json({
      success: true,
      data: {
        order: {
          orderInvoiceNumber: order.orderInvoiceNumber,
          status: order.status,
          amount: order.amount,
          currency: order.currency,
          planId: order.planId,
          billingCycle: order.billingCycle,
          createdAt: order.createdAt
        },
        paymentData: {
          url: checkoutURL,
          fields
        },
        vietQrUrl,
        vietQrInfo,
        checkoutURL,
        fields
      }
    });
  } catch (error) {
    console.error('Get order status error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyOrderStatus = async (req, res) => {
  try {
    const { orderInvoiceNumber } = req.params;

    if (!orderInvoiceNumber) {
      return res.status(400).json({ success: false, message: 'Missing orderInvoiceNumber' });
    }

    let order = await Order.findOne({ orderInvoiceNumber }).populate('user', 'email name');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status === 'paid') {
      return res.json({
        success: true,
        data: {
          order: {
            orderInvoiceNumber: order.orderInvoiceNumber,
            status: order.status,
            amount: order.amount,
            currency: order.currency,
            planId: order.planId,
            billingCycle: order.billingCycle,
            createdAt: order.createdAt
          },
          verified: true,
          sepayStatus: 'paid',
          message: 'Order already verified'
        },
        message: 'Đơn hàng đã được xác nhận trước đó.'
      });
    }

    let sepayData = null;
    let orderPayload = null;
    let transactions = [];
    let matchedStatus = null;
    let successTransaction = null;
    let orderDetailError = null;

    try {
      const sepayResponse = await sepayClient.order.retrieve(orderInvoiceNumber);
      sepayData = sepayResponse?.data?.data || sepayResponse?.data || {};
      orderPayload = sepayData?.order || sepayData;
      transactions = orderPayload?.transactions || sepayData?.transactions || [];

      const statusCandidates = [
        orderPayload?.order_status,
        orderPayload?.status,
        sepayData?.order_status,
        sepayData?.status
      ];

      matchedStatus = statusCandidates
        .map((status) => normalizeStatus(status))
        .find((status) => status && SUCCESS_STATUSES.has(status)) || null;

      if (Array.isArray(transactions)) {
        successTransaction = transactions.find((tx) => {
          const txStatus = normalizeStatus(tx?.transaction_status || tx?.status);
          return SUCCESS_STATUSES.has(txStatus);
        }) || null;
      }
    } catch (err) {
      orderDetailError = err;
    }

    let isPaid = Boolean(matchedStatus) || Boolean(successTransaction);
    let matchedTransactionSnapshot = successTransaction
      ? {
          transaction_id: successTransaction?.transaction_id || successTransaction?.id,
          transaction_status: successTransaction?.transaction_status || successTransaction?.status,
          amount: successTransaction?.amount || successTransaction?.transaction_amount,
          transaction_content: successTransaction?.transaction_content || successTransaction?.content,
          reference_number: successTransaction?.reference_number
        }
      : null;

    if (!isPaid) {
      try {
        const transactionMatch = await findMatchingTransaction(order);
        if (transactionMatch?.transaction) {
          const tx = transactionMatch.transaction;
          const txStatus = normalizeStatus(tx.transaction_status || tx.status);
          const amount = parseAmount(tx.amount_in);

          matchedTransactionSnapshot = {
            transaction_id: tx.id || tx.transaction_id,
            transaction_status: txStatus || null,
            amount,
            transaction_content: tx.transaction_content,
            reference_number: tx.reference_number
          };

          if (SUCCESS_STATUSES.has(txStatus || '') || amount >= Number(order.amount || 0)) {
            isPaid = true;
            // Ghi lại snapshot cho lastVerification
            if (!sepayData) {
              sepayData = {};
            }
            sepayData.transactions = transactionMatch.raw?.transactions;
            sepayData.source = 'transactions.list';

            if (!orderPayload) {
              orderPayload = {};
            }
            if (!orderPayload.order_status) {
              orderPayload.order_status = txStatus || 'success';
            }
            matchedStatus = txStatus || 'success';

            if (!successTransaction) {
            successTransaction = {
                transaction_id: tx.id || tx.transaction_id,
                transaction_status: txStatus || 'success',
                transaction_amount: amount,
                transaction_content: tx.transaction_content,
                reference_number: tx.reference_number
              };
            }
          }
        }
      } catch (transactionError) {
        console.error('Verify order status via transactions list error:', transactionError?.response?.data || transactionError.message || transactionError);
        if (!orderDetailError) {
          orderDetailError = transactionError;
        }
      }
    }

    let updatedOrder = order;

    if (isPaid) {
      const fallbackReference = matchedTransactionSnapshot?.transaction_content
        || matchedTransactionSnapshot?.reference_number
        || null;
      const updatePayload = {
        status: 'paid',
        sepayOrderId: orderPayload?.id || sepayData?.id || order.sepayOrderId,
        sepayTransactionId: successTransaction?.transaction_id || successTransaction?.id || order.sepayTransactionId,
        paymentReference: fallbackReference || order.paymentReference || order.gatewayOrderId || order.orderInvoiceNumber,
        lastVerification: {
          ...(sepayData || {}),
          verifiedAt: new Date().toISOString()
        }
      };

      if (!order.gatewayOrderId && (orderPayload?.order_id || orderPayload?.orderId)) {
        updatePayload.gatewayOrderId = orderPayload?.order_id || orderPayload?.orderId;
      }

      updatedOrder = await Order.findOneAndUpdate(
        { orderInvoiceNumber },
        updatePayload,
        { new: true }
      ).populate('user', 'email name');

      await activateSubscriptionForUser(updatedOrder.user._id, updatedOrder.planId, updatedOrder.billingCycle);
    } else {
      const verificationMeta = sepayData
        ? { ...sepayData, verifiedAt: new Date().toISOString() }
        : orderDetailError
          ? {
              error: orderDetailError.message || 'Unable to verify order',
              verifiedAt: new Date().toISOString()
            }
          : null;

      if (verificationMeta) {
        await Order.findOneAndUpdate(
          { orderInvoiceNumber },
          { lastVerification: verificationMeta }
        );
      }
    }

    return res.json({
      success: true,
      data: {
        order: {
          orderInvoiceNumber: updatedOrder.orderInvoiceNumber,
          status: updatedOrder.status,
          amount: updatedOrder.amount,
          currency: updatedOrder.currency,
          planId: updatedOrder.planId,
          billingCycle: updatedOrder.billingCycle,
          createdAt: updatedOrder.createdAt
        },
        verified: isPaid && updatedOrder.status === 'paid',
        sepayStatus: matchedStatus,
        transactionStatus: successTransaction
          ? normalizeStatus(successTransaction.transaction_status || successTransaction.status)
          : matchedTransactionSnapshot?.transaction_status || null,
        sepaySnapshot: {
          order_status: orderPayload?.order_status || orderPayload?.status || null,
          transactions: Array.isArray(transactions) && transactions.length
            ? transactions.map((tx) => ({
                transaction_id: tx?.transaction_id || tx?.id,
                transaction_status: tx?.transaction_status || tx?.status,
                amount: tx?.amount || tx?.transaction_amount
              }))
            : matchedTransactionSnapshot
              ? [matchedTransactionSnapshot]
              : undefined
        }
      },
      message: isPaid
        ? 'Đã xác nhận thanh toán thành công từ SePay.'
        : orderDetailError
          ? 'Chưa thể xác nhận giao dịch với SePay. Vui lòng thử lại sau hoặc kiểm tra IPN.'
          : 'SePay chưa ghi nhận giao dịch thành công. Vui lòng thử lại sau vài phút.'
    });
  } catch (error) {
    console.error('Verify order status error:', error?.response?.data || error);
    const message = error?.response?.data?.message || error.message || 'Không thể xác minh thanh toán';
    return res.status(500).json({ success: false, message });
  }
};
