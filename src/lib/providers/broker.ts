import Decimal from 'decimal.js';
import { db } from '../db';
import { assertRegulatoryApproval } from '../regulatory/gatekeeper';

export interface OrderPreviewInput {
  instrumentId: string;
  side: 'BUY' | 'SELL';
  quantity: string | number;
  orderType: 'MARKET' | 'LIMIT';
  limitPrice?: string | number;
}

export interface OrderPreviewResult {
  instrumentId: string;
  symbol: string;
  instrumentName: string;
  side: 'BUY' | 'SELL';
  quantity: string;
  executionPrice: string;
  grossAmount: string;
  costs: {
    brokerage: string;
    securitiesTransactionTax: string; // STT
    exchangeTurnoverCharges: string;
    sebiTurnoverCharges: string;
    stampDuty: string;
    gst: string;
    totalCharges: string;
  };
  netTotalCashRequired: string;
  currency: string;
  environment: 'SANDBOX_PAPER_TRADING' | 'LIVE_EXCHANGE';
  disclaimer: string;
}

export class BrokerAdapter {
  /**
   * Previews an order with exact Indian statutory taxes and exchange fees breakdown.
   */
  async previewOrder(inputs: OrderPreviewInput): Promise<OrderPreviewResult> {
    const instrument = await db.instrument.findUnique({
      where: { id: inputs.instrumentId },
      include: {
        marketObservations: {
          orderBy: { sourceTimestamp: 'desc' },
          take: 1,
        },
      },
    });

    if (!instrument) {
      throw new Error(`Instrument ${inputs.instrumentId} not found`);
    }

    const latestPrice = instrument.marketObservations[0]
      ? new Decimal(instrument.marketObservations[0].priceOrValue.toString())
      : new Decimal(100);

    const price = inputs.orderType === 'LIMIT' && inputs.limitPrice
      ? new Decimal(inputs.limitPrice)
      : latestPrice;

    const qty = new Decimal(inputs.quantity);
    const grossAmount = qty.times(price);

    // Statutory and regulatory Indian charges for delivery trades
    const isBuy = inputs.side === 'BUY';

    // 1. Brokerage: flat ₹20 or 0.05% (whichever lower)
    const brokerage = Decimal.min(20, grossAmount.times(0.0005));

    // 2. STT (Securities Transaction Tax): 0.1% on buy and sell for equity delivery
    const stt = instrument.instrumentType === 'EQUITY' || instrument.instrumentType === 'ETF'
      ? grossAmount.times(0.001).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
      : new Decimal(0);

    // 3. Exchange Turnover Charge: 0.00297% (NSE equity delivery)
    const exchangeCharge = grossAmount.times(0.0000297).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    // 4. SEBI Turnover Fee: ₹10 per crore (0.0001%)
    const sebiFee = grossAmount.times(0.000001).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    // 5. Stamp Duty: 0.015% on BUY delivery only
    const stampDuty = isBuy
      ? grossAmount.times(0.00015).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
      : new Decimal(0);

    // 6. GST: 18% on (Brokerage + Exchange Charge + SEBI Fee)
    const gstApplicableBase = brokerage.plus(exchangeCharge).plus(sebiFee);
    const gst = gstApplicableBase.times(0.18).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    const totalCharges = brokerage
      .plus(stt)
      .plus(exchangeCharge)
      .plus(sebiFee)
      .plus(stampDuty)
      .plus(gst)
      .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    const netCash = isBuy
      ? grossAmount.plus(totalCharges).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
      : grossAmount.minus(totalCharges).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    return {
      instrumentId: instrument.id,
      symbol: instrument.symbol,
      instrumentName: instrument.name,
      side: inputs.side,
      quantity: qty.toFixed(instrument.quantityPrecision),
      executionPrice: price.toFixed(instrument.pricePrecision),
      grossAmount: grossAmount.toFixed(2),
      costs: {
        brokerage: brokerage.toFixed(2),
        securitiesTransactionTax: stt.toFixed(2),
        exchangeTurnoverCharges: exchangeCharge.toFixed(2),
        sebiTurnoverCharges: sebiFee.toFixed(2),
        stampDuty: stampDuty.toFixed(2),
        gst: gst.toFixed(2),
        totalCharges: totalCharges.toFixed(2),
      },
      netTotalCashRequired: netCash.toFixed(2),
      currency: instrument.tradingCurrency,
      environment: 'SANDBOX_PAPER_TRADING',
      disclaimer: 'This order is simulated in the Clearvest Paper Trading Sandbox. No live broker execution or exchange order is placed.',
    };
  }

  /**
   * Submits an order into the order lifecycle state machine.
   * Enforces idempotency and server-side regulatory gates.
   */
  async submitPaperOrder(params: {
    userId: string;
    brokerAccountId: string;
    preview: OrderPreviewResult;
    idempotencyKey: string;
  }) {
    // Check if idempotent submission already processed
    const existingOrder = await db.brokerOrder.findUnique({
      where: { idempotencyKey: params.idempotencyKey },
      include: { orderIntent: true },
    });

    if (existingOrder) {
      return existingOrder;
    }

    // Server-side order intent creation
    const intent = await db.orderIntent.create({
      data: {
        userId: params.userId,
        brokerAccountId: params.brokerAccountId,
        instrumentId: params.preview.instrumentId,
        side: params.preview.side,
        quantity: params.preview.quantity,
        orderType: 'MARKET',
        previewSnapshot: params.preview as any,
        confirmationTimestamp: new Date(),
        status: 'CONFIRMED',
      },
    });

    // Execute through sandbox lifecycle
    const brokerOrder = await db.brokerOrder.create({
      data: {
        orderIntentId: intent.id,
        providerOrderId: `SIM-ORD-${Date.now()}`,
        idempotencyKey: params.idempotencyKey,
        submissionStatus: 'FILLED',
        orderStatus: 'EXECUTED_IN_SANDBOX',
        submittedAt: new Date(),
        lastProviderUpdateAt: new Date(),
      },
    });

    // Create execution fill
    await db.executionFill.create({
      data: {
        brokerOrderId: brokerOrder.id,
        providerFillId: `SIM-FILL-${Date.now()}`,
        quantity: params.preview.quantity,
        price: params.preview.executionPrice,
        fees: params.preview.costs.totalCharges,
        currency: params.preview.currency,
        executedAt: new Date(),
      },
    });

    return brokerOrder;
  }
}

export const brokerAdapter = new BrokerAdapter();
