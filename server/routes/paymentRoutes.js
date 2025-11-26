import express from 'express';
import { sepayIPN, sepayCreateCheckout, getOrderStatus, verifyOrderStatus } from '../controllers/paymentController.js';

// We need raw body for signature verification
const jsonWithRaw = express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
});

const paymentRouter = express.Router();

paymentRouter.post('/sepay/ipn', jsonWithRaw, sepayIPN);
paymentRouter.post('/sepay/checkout', express.json(), sepayCreateCheckout);
paymentRouter.get('/order/:orderInvoiceNumber', getOrderStatus);
paymentRouter.post('/order/:orderInvoiceNumber/verify', express.json(), verifyOrderStatus);

export default paymentRouter;
