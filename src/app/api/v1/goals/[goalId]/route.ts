import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth/jwt';
import { db } from '@/lib/db';
import { jsonSuccess, jsonError } from '@/lib/api-response';
import { calculateTargetMonthlyContribution, generateScenarios } from '@/lib/finance/calculator';
import { logAuditEvent } from '@/lib/audit';

const GoalUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  targetAmount: z.number().positive().optional(),
  targetDate: z.string().optional(),
  currentAmount: z.number().min(0).optional(),
  plannedContribution: z.number().min(0).optional(),
  contributionFrequency: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUALLY', 'ONE_TIME']).optional(),
  inflationAssumption: z.number().min(0).max(25).optional(),
  expectedReturnRate: z.number().min(0).max(40).optional(),
  status: z.enum(['ACTIVE', 'ACHIEVED', 'ARCHIVED']).optional(),
});

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ goalId: string }> }
) {
  const session = await getSessionUser(req);
  if (!session) {
    return jsonError('Authentication required', 'UNAUTHORIZED', 401);
  }

  const { goalId } = await context.params;

  const goal = await db.financialGoal.findFirst({
    where: { id: goalId, userId: session.userId },
    include: {
      scenarios: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!goal) {
    return jsonError('Goal not found or unauthorized', 'NOT_FOUND', 404);
  }

  const target = parseFloat(goal.targetAmount.toString());
  const current = parseFloat(goal.currentAmount.toString());
  const targetDate = new Date(goal.targetDate);
  const now = new Date();
  const monthsRemaining = Math.max(1, Math.round((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30.4375)));
  const yearsRemaining = Math.max(0.5, monthsRemaining / 12);

  // Generate current multi-scenario comparison
  const scenariosComparison = generateScenarios({
    targetAmount: target,
    currentSavings: current,
    monthlyContribution: parseFloat(goal.plannedContribution.toString()),
    horizonYears: yearsRemaining,
    expectedAnnualReturn: parseFloat(goal.expectedReturnRate.toString()),
    inflationRate: parseFloat(goal.inflationAssumption.toString()),
  });

  const requiredMonthly = calculateTargetMonthlyContribution({
    targetAmount: target,
    currentSavings: current,
    horizonYears: yearsRemaining,
    expectedAnnualReturn: parseFloat(goal.expectedReturnRate.toString()),
  });

  return jsonSuccess({
    goal: {
      ...goal,
      targetAmount: target,
      currentAmount: current,
      plannedContribution: parseFloat(goal.plannedContribution.toString()),
      inflationAssumption: parseFloat(goal.inflationAssumption.toString()),
      expectedReturnRate: parseFloat(goal.expectedReturnRate.toString()),
      monthsRemaining,
      yearsRemaining,
      requiredMonthlyContribution: parseFloat(requiredMonthly),
    },
    scenariosComparison,
    savedScenarios: goal.scenarios,
  });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ goalId: string }> }
) {
  const session = await getSessionUser(req);
  if (!session) {
    return jsonError('Authentication required', 'UNAUTHORIZED', 401);
  }

  const { goalId } = await context.params;

  const goal = await db.financialGoal.findFirst({
    where: { id: goalId, userId: session.userId },
  });

  if (!goal) {
    return jsonError('Goal not found or unauthorized', 'NOT_FOUND', 404);
  }

  const body = await req.json();
  const parsed = GoalUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError('Invalid goal update data', 'VALIDATION_FAILED', 422, parsed.error.format());
  }

  const updateData: any = { ...parsed.data };
  if (updateData.targetDate) {
    updateData.targetDate = new Date(updateData.targetDate);
  }

  const updatedGoal = await db.financialGoal.update({
    where: { id: goalId },
    data: updateData,
  });

  await logAuditEvent({
    userId: session.userId,
    action: 'GOAL_UPDATED',
    resourceType: 'FinancialGoal',
    resourceId: goalId,
    details: parsed.data,
  });

  return jsonSuccess(updatedGoal);
}
