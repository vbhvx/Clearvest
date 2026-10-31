import { db } from '../db';

export class RegulatoryBlockError extends Error {
  public code: string;
  public details: {
    featureKey: string;
    status: string;
    applicableRegulation: string;
    officialSource: string;
    enforcementReason: string;
  };

  constructor(featureKey: string, approval: any, reason: string) {
    super(`Feature '${featureKey}' is currently ${approval.status}. Access blocked on server pursuant to ${approval.applicableRegulation}.`);
    this.name = 'RegulatoryBlockError';
    this.code = 'FEATURE_REGULATION_BLOCKED';
    this.details = {
      featureKey,
      status: approval.status,
      applicableRegulation: approval.applicableRegulation,
      officialSource: approval.officialSource,
      enforcementReason: reason,
    };
  }
}

/**
 * Enforces regulatory and operational gates at the server level.
 * Fails closed if feature is not explicitly approved.
 */
export async function assertRegulatoryApproval(featureKey: string): Promise<void> {
  const approval = await db.regulatoryApproval.findUnique({
    where: { featureKey },
  });

  if (!approval) {
    throw new RegulatoryBlockError(featureKey, {
      status: 'not_reviewed',
      applicableRegulation: 'Unreviewed financial capability',
      officialSource: 'SEBI/RBI regulatory framework',
    }, 'Feature has no compliance review record. Fails closed.');
  }

  if (approval.status !== 'approved') {
    throw new RegulatoryBlockError(
      featureKey,
      approval,
      approval.notes || `Capability requires verified status 'approved'. Current status is '${approval.status}'.`
    );
  }
}

export async function isFeatureApproved(featureKey: string): Promise<boolean> {
  try {
    await assertRegulatoryApproval(featureKey);
    return true;
  } catch {
    return false;
  }
}
