import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth/jwt';
import { db } from '@/lib/db';
import { jsonSuccess, jsonError } from '@/lib/api-response';
import { calculateFutureValue } from '@/lib/finance/calculator';
import { logAuditEvent } from '@/lib/audit';

const ScenarioCreateSchema = z.object({
  scenarioName: z.string().min(2),
  monthlyContribution: z.number().min(0),
  horizonYears: z.number().min(0.5).max(50),
  expectedAnnualReturn: z.number().min(0).max(40),
  inflationRate: z.number().min(0).max(25).default(6.0),
  currentSavings: z.number().min(0).optional(),
});

export async function POST(
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
  const parsed = ScenarioCreateSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError('Invalid scenario inputs', 'VALIDATION_FAILED', 422, parsed.error.format());
  }

  const { scenarioName, monthlyContribution, horizonYears, expectedAnnualReturn, inflationRate, currentSavings } = parsed.data;

  const savings = currentSavings !== undefined ? currentSavings : parseFloat(goal.currentAmount.toString());

  const result = calculateFutureValue({
    targetAmount: parseFloat(goal.targetAmount.toString()),
    currentSavings: savings,
    monthlyContribution,
    horizonYears,
    expectedAnnualReturn,
    inflationRate,
  });

  const scenario = await db.planningScenario.create({
    data: {
      userId: session.userId,
      goalId: goal.id,
      scenarioName,
      inputSnapshot: result.inputs as any,
      assumptionSnapshot: result.assumptions as any,
      formulaVersion: result.formulaVersion,
      outputSnapshot: {
        ...result.summary,
        yearByYear: result.yearByYear,
      } as any,
      currency: goal.targetCurrency,
    },
  });

  await logAuditEvent({
    userId: session.userId,
    action: 'SCENARIO_CALCULATED',
    resourceType: 'PlanningScenario',
    resourceId: scenario.id,
    details: { goalId, scenarioName },
  });

  return jsonSuccess({
    scenario,
    calculation: result,
  }, 201);
}
