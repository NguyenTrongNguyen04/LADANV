import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderInvoiceNumber: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  planId: { type: String, enum: ['pro', 'premier'], required: true },
  billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'VND' },
  paymentMethod: { type: String, default: 'BANK_TRANSFER' },
  status: { type: String, enum: ['created', 'pending', 'paid', 'failed', 'cancelled'], default: 'created' },
  sepayOrderId: { type: String, default: null },
  sepayTransactionId: { type: String, default: null },
  gatewayOrderId: { type: String, default: null },
  paymentReference: { type: String, default: null },
  rawIPN: { type: Object, default: null },
  lastVerification: { type: Object, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;
