import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth/jwt';
import { db } from '@/lib/db';
import { jsonSuccess, jsonError } from '@/lib/api-response';
import { calculateTargetMonthlyContribution, calculateFutureValue } from '@/lib/finance/calculator';
import { logAuditEvent } from '@/lib/audit';

const GoalCreateSchema = z.object({
  name: z.string().min(2, 'Goal name must be at least 2 characters'),
  goalType: z.enum([
    'EMERGENCY_SAVINGS',
    'RETIREMENT',
    'HOME_PURCHASE',
    'HIGHER_EDUCATION',
    'MAJOR_EXPENSE',
    'WEALTH_BUILDING',
    'CUSTOM',
  ]),
  targetAmount: z.number().positive('Target amount must be positive'),
  targetCurrency: z.string().default('INR'),
  targetDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid target date'),
  currentAmount: z.number().min(0).default(0),
  plannedContribution: z.number().min(0).default(0),
  contributionFrequency: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUALLY', 'ONE_TIME']).default('MONTHLY'),
  inflationAssumption: z.number().min(0).max(25).default(6.0),
  expectedReturnRate: z.number().min(0).max(40).default(10.0),
});

export async function GET(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) {
    return jsonError('Authentication required', 'UNAUTHORIZED', 401);
  }

  const goals = await db.financialGoal.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    include: {
      scenarios: {
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  // Augment goals with dynamic calculated progress & target monthly contribution
  const augmentedGoals = goals.map((goal) => {
    const target = parseFloat(goal.targetAmount.toString());
    const current = parseFloat(goal.currentAmount.toString());
    const plannedMonthly = parseFloat(goal.plannedContribution.toString());
    const progressPct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

    const targetDate = new Date(goal.targetDate);
    const now = new Date();
    const monthsRemaining = Math.max(1, Math.round((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30.4375)));
    const yearsRemaining = Math.max(0.1, monthsRemaining / 12);

    const requiredMonthly = calculateTargetMonthlyContribution({
      targetAmount: target,
      currentSavings: current,
      horizonYears: yearsRemaining,
      expectedAnnualReturn: parseFloat(goal.expectedReturnRate.toString()),
      timing: 'BEGINNING_OF_PERIOD',
    });

    return {
      ...goal,
      targetAmount: target,
      currentAmount: current,
      plannedContribution: plannedMonthly,
      inflationAssumption: parseFloat(goal.inflationAssumption.toString()),
      expectedReturnRate: parseFloat(goal.expectedReturnRate.toString()),
      progressPct,
      monthsRemaining,
      requiredMonthlyContribution: parseFloat(requiredMonthly),
    };
  });

  return jsonSuccess(augmentedGoals);
}

export async function POST(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) {
    return jsonError('Authentication required', 'UNAUTHORIZED', 401);
  }

  const body = await req.json();
  const parsed = GoalCreateSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError('Invalid goal data', 'VALIDATION_FAILED', 422, parsed.error.format());
  }

  const data = parsed.data;

  const goal = await db.financialGoal.create({
    data: {
      userId: session.userId,
      name: data.name,
      goalType: data.goalType,
      targetAmount: data.targetAmount,
      targetCurrency: data.targetCurrency,
      targetDate: new Date(data.targetDate),
      currentAmount: data.currentAmount,
      plannedContribution: data.plannedContribution,
      contributionFrequency: data.contributionFrequency,
      inflationAssumption: data.inflationAssumption,
      expectedReturnRate: data.expectedReturnRate,
    },
  });

  // Calculate and store baseline scenario
  const targetDate = new Date(data.targetDate);
  const now = new Date();
  const monthsRemaining = Math.max(1, Math.round((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30.4375)));
  const yearsRemaining = Math.max(0.5, monthsRemaining / 12);

  const baselineCalc = calculateFutureValue({
    targetAmount: data.targetAmount,
    currentSavings: data.currentAmount,
    monthlyContribution: data.plannedContribution,
    horizonYears: yearsRemaining,
    expectedAnnualReturn: data.expectedReturnRate,
    inflationRate: data.inflationAssumption,
  });

  await db.planningScenario.create({
    data: {
      userId: session.userId,
      goalId: goal.id,
      scenarioName: 'BASELINE',
      inputSnapshot: baselineCalc.inputs as any,
      assumptionSnapshot: baselineCalc.assumptions as any,
      formulaVersion: baselineCalc.formulaVersion,
      outputSnapshot: baselineCalc.summary as any,
      currency: goal.targetCurrency,
    },
  });

  await logAuditEvent({
    userId: session.userId,
    action: 'GOAL_CREATED',
    resourceType: 'FinancialGoal',
    resourceId: goal.id,
    details: { name: goal.name, targetAmount: data.targetAmount },
  });

  return jsonSuccess(goal, 201);
}
