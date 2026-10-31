import { db } from '../db';
import Decimal from 'decimal.js';

export interface QuoteData {
  instrumentId: string;
  symbol: string;
  name: string;
  instrumentType: string;
  priceOrValue: string;
  currency: string;
  observationType: string;
  sourceTimestamp: string;
  isDelayed: boolean;
  isSimulated: boolean;
  validityStatus: string;
  metadata: any;
}

export interface IMarketDataProvider {
  getQuote(instrumentIdOrSymbol: string): Promise<QuoteData | null>;
  getAllQuotes(): Promise<QuoteData[]>;
}

export class SimulatedMarketDataProvider implements IMarketDataProvider {
  async getQuote(instrumentIdOrSymbol: string): Promise<QuoteData | null> {
    const instrument = await db.instrument.findFirst({
      where: {
        OR: [
          { id: instrumentIdOrSymbol },
          { symbol: instrumentIdOrSymbol },
        ],
      },
      include: {
        marketObservations: {
          orderBy: { sourceTimestamp: 'desc' },
          take: 1,
        },
      },
    });

    if (!instrument || instrument.marketObservations.length === 0) {
      return null;
    }

    const obs = instrument.marketObservations[0];
    return {
      instrumentId: instrument.id,
      symbol: instrument.symbol,
      name: instrument.name,
      instrumentType: instrument.instrumentType,
      priceOrValue: new Decimal(obs.priceOrValue.toString()).toFixed(instrument.pricePrecision),
      currency: obs.currency,
      observationType: obs.observationType,
      sourceTimestamp: obs.sourceTimestamp.toISOString(),
      isDelayed: obs.isDelayed,
      isSimulated: obs.isSimulated,
      validityStatus: obs.validityStatus,
      metadata: obs.metadata,
    };
  }

  async getAllQuotes(): Promise<QuoteData[]> {
    const instruments = await db.instrument.findMany({
      include: {
        marketObservations: {
          orderBy: { sourceTimestamp: 'desc' },
          take: 1,
        },
      },
    });

    return instruments
      .filter((i) => i.marketObservations.length > 0)
      .map((i) => {
        const obs = i.marketObservations[0];
        return {
          instrumentId: i.id,
          symbol: i.symbol,
          name: i.name,
          instrumentType: i.instrumentType,
          priceOrValue: new Decimal(obs.priceOrValue.toString()).toFixed(i.pricePrecision),
          currency: obs.currency,
          observationType: obs.observationType,
          sourceTimestamp: obs.sourceTimestamp.toISOString(),
          isDelayed: obs.isDelayed,
          isSimulated: obs.isSimulated,
          validityStatus: obs.validityStatus,
          metadata: obs.metadata,
        };
      });
  }
}

export const marketDataProvider: IMarketDataProvider = new SimulatedMarketDataProvider();
