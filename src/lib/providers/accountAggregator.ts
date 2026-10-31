import { db } from '../db';

export interface ConsentRequestParams {
  userId: string;
  providerId: string;
  purpose: string;
  dataCategories: string[];
  durationMonths: number;
}

export class AccountAggregatorAdapter {
  /**
   * Creates an RBI-compliant consent request
   */
  async createConsentRequest(params: ConsentRequestParams) {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + params.durationMonths);

    const consent = await db.consent.create({
      data: {
        userId: params.userId,
        providerId: params.providerId,
        purpose: params.purpose,
        dataCategories: params.dataCategories,
        consentVersion: '1.0',
        expiresAt,
        status: 'ACTIVE',
        providerReference: `AA-CONSENT-${Date.now()}`,
      },
    });

    // Create AccountConnection linked to this consent
    const connection = await db.accountConnection.create({
      data: {
        userId: params.userId,
        providerId: params.providerId,
        status: 'ACTIVE',
        authorizedScopes: params.dataCategories,
        consentId: consent.id,
        tokenReference: `ENC-AA-TOKEN-${Date.now()}`,
        lastSuccessAt: new Date(),
      },
    });

    return { consent, connection };
  }

  /**
   * Revokes an existing consent and cascades status to connections
   */
  async revokeConsent(userId: string, consentId: string) {
    const consent = await db.consent.findFirst({
      where: { id: consentId, userId },
    });

    if (!consent) {
      throw new Error('Consent record not found or unauthorized');
    }

    const updatedConsent = await db.consent.update({
      where: { id: consentId },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
      },
    });

    await db.accountConnection.updateMany({
      where: { consentId, userId },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
      },
    });

    return updatedConsent;
  }
}

export const accountAggregatorAdapter = new AccountAggregatorAdapter();
