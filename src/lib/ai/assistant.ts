import { db } from '../db';
import { calculateFutureValue, generateScenarios, calculateTaxEstimate } from '../finance/calculator';
import { marketDataProvider } from '../providers/marketData';

export interface AssistantResponse {
  conversationId: string;
  mode: string;
  reply: string;
  citations: Array<{
    sourceTitle: string;
    publisher: string;
    canonicalUrl: string;
    section: string;
  }>;
  assumptionsUsed?: string[];
  uncertaintyDisclosures?: string[];
  toolResults?: any[];
}

export class ConversationalFinanceAssistant {
  /**
   * Processes a user question within an authenticated session and operating mode.
   */
  async processMessage(params: {
    userId: string;
    conversationId?: string;
    mode?: string;
    userQuery: string;
  }): Promise<AssistantResponse> {
    const mode = params.mode || 'educational';

    // 1. Regulatory Gate: Personalized Advice is Strictly Disabled
    if (mode === 'personalized_advice') {
      return {
        conversationId: params.conversationId || 'new_conv',
        mode: 'personalized_advice',
        reply: 'Under SEBI (Investment Advisers) Regulations, 2013, personalized securities advice and specific buy/sell recommendations require formal registration as an Investment Adviser (RIA). Clearvest operates strictly as an educational and self-directed planning platform and does not provide regulated individual stock advice.',
        citations: [
          {
            sourceTitle: 'SEBI (Investment Advisers) Regulations, 2013',
            publisher: 'Securities and Exchange Board of India (SEBI)',
            canonicalUrl: 'https://www.sebi.gov.in/legal/regulations/jan-2013/sebi-investment-advisers-regulations-2013_24419.html',
            section: 'Regulation 3(1) - Requirement of Registration',
          },
        ],
        uncertaintyDisclosures: [
          'Personalized advice mode is disabled on server to maintain compliance.',
        ],
      };
    }

    // 2. Fetch or create conversation
    let conv = params.conversationId
      ? await db.assistantConversation.findFirst({
          where: { id: params.conversationId, userId: params.userId },
        })
      : null;

    if (!conv) {
      conv = await db.assistantConversation.create({
        data: {
          userId: params.userId,
          mode,
        },
      });
    }

    // Save user message
    await db.assistantMessage.create({
      data: {
        conversationId: conv.id,
        role: 'user',
        content: params.userQuery,
      },
    });

    // 3. Grounded RAG Query Retrieval over official regulatory sources
    const queryLower = params.userQuery.toLowerCase();
    const citations: AssistantResponse['citations'] = [];
    const assumptionsUsed: string[] = [];
    const uncertaintyDisclosures: string[] = [];
    let toolResults: any[] = [];
    let reply = '';

    // Search Knowledge Chunks
    const chunks = await db.knowledgeChunk.findMany({
      include: { knowledgeSource: true },
    });

    const matchingChunks = chunks.filter((c) => {
      const text = `${c.topic} ${c.content}`.toLowerCase();
      const keywords = queryLower.split(/\s+/).filter((w) => w.length > 3);
      return keywords.some((kw) => text.includes(kw));
    });

    // Tool: Planning check if query asks about user goals or SIP planning
    if (
      queryLower.includes('goal') ||
      queryLower.includes('save') ||
      queryLower.includes('sip') ||
      queryLower.includes('future') ||
      queryLower.includes('retire')
    ) {
      const userGoals = await db.financialGoal.findMany({
        where: { userId: params.userId, status: 'ACTIVE' },
      });

      if (userGoals.length > 0) {
        toolResults.push({
          tool: 'get_user_goals',
          activeGoalsCount: userGoals.length,
          goals: userGoals.map((g) => ({
            name: g.name,
            targetAmount: g.targetAmount.toString(),
            currentAmount: g.currentAmount.toString(),
            plannedMonthlySIP: g.plannedContribution.toString(),
            expectedReturn: `${g.expectedReturnRate}%`,
          })),
        });

        // Run deterministic scenario for primary goal
        const primaryGoal = userGoals[0];
        const scenario = calculateFutureValue({
          currentSavings: primaryGoal.currentAmount.toString(),
          monthlyContribution: primaryGoal.plannedContribution.toString(),
          horizonYears: 10,
          expectedAnnualReturn: primaryGoal.expectedReturnRate.toString(),
          inflationRate: primaryGoal.inflationAssumption.toString(),
        });

        toolResults.push({
          tool: 'run_planning_scenario',
          result: scenario.summary,
        });

        reply = `Looking at your active plan for **${primaryGoal.name}**, your current monthly contribution is **₹ ${parseFloat(primaryGoal.plannedContribution.toString()).toLocaleString('en-IN')}**.\n\n` +
          `• **Estimated Nominal Future Value**: ₹ ${parseFloat(scenario.summary.nominalFutureValue).toLocaleString('en-IN')}\n` +
          `• **Inflation-Adjusted Purchasing Power**: ₹ ${parseFloat(scenario.summary.inflationAdjustedFutureValue).toLocaleString('en-IN')}\n` +
          `• **Total Principal You Will Contribute**: ₹ ${parseFloat(scenario.summary.totalPrincipalContributed).toLocaleString('en-IN')}\n` +
          `• **Estimated Compound Growth Earned**: ₹ ${parseFloat(scenario.summary.estimatedGrowthEarned).toLocaleString('en-IN')}\n\n` +
          `*Note: This deterministic projection assumes a net return of ${primaryGoal.expectedReturnRate}% p.a. and ${primaryGoal.inflationAssumption}% inflation. Actual returns fluctuate with market conditions.*`;

        assumptionsUsed.push(
          `Expected Annual Return: ${primaryGoal.expectedReturnRate}% p.a.`,
          `Inflation Assumption: ${primaryGoal.inflationAssumption}% p.a.`,
          `Compounding: Monthly nominal compounding`
        );
        uncertaintyDisclosures.push('Market investments do not carry guaranteed returns.');
      }
    }

    // Tax Query Handler
    if (queryLower.includes('tax') || queryLower.includes('ltcg') || queryLower.includes('stcg')) {
      const taxEquity = calculateTaxEstimate({
        assetCategory: 'EQUITY',
        gainAmount: 200000,
        holdingPeriodYears: 2,
      });

      reply += `\n\n### Indian Union Budget 2024 Capital Gains Tax Rules:\n` +
        `• **Listed Equities & Equity Funds (LTCG > 12 Months)**: Taxed at **12.5%** on gains exceeding **₹1.25 Lakh** per financial year (Section 112A).\n` +
        `• **Listed Equities & Equity Funds (STCG <= 12 Months)**: Taxed at flat **20%** (Section 111A).\n` +
        `• **Debt Funds & FDs**: Taxed at your individual income tax slab rate (Section 50AA).\n` +
        `• **Sovereign Gold Bonds (SGB)**: 100% Capital Gains Tax exempt on redemption after 8-year maturity (Section 47(viic)).`;

      citations.push({
        sourceTitle: 'Indian Finance Act (No. 2) 2024 — Capital Gains Tax Framework',
        publisher: 'Ministry of Finance, Government of India',
        canonicalUrl: 'https://incometaxindia.gov.in',
        section: 'Sections 111A, 112A, 50AA, 47(viic)',
      });
    }

    // General Educational fallback with Knowledge Chunks
    if (!reply) {
      if (matchingChunks.length > 0) {
        const topChunk = matchingChunks[0];
        reply = `**${topChunk.topic}**\n\n${topChunk.content}\n\n` +
          `In personal finance, your asset allocation should match your time horizon: short-term goals (<3 years) belong in fixed-income or liquid assets to avoid capital drawdown, while long-term goals (>7 years) benefit from equities to beat inflation.`;

        citations.push({
          sourceTitle: topChunk.knowledgeSource.title,
          publisher: topChunk.knowledgeSource.publisher,
          canonicalUrl: topChunk.knowledgeSource.canonicalUrl,
          section: topChunk.topic,
        });
      } else {
        reply = `Clearvest helps you structure your investments by personal goals rather than speculative trading. You can define targets for Emergency Savings, Home Down Payment, or Retirement, and simulate monthly contributions with transparent inflation adjustments.\n\n` +
          `Feel free to ask about compounding, SIP mechanics, asset allocation, or Indian tax rules (Budget 2024).`;

        citations.push({
          sourceTitle: 'Investor Charter in Securities Market',
          publisher: 'Securities and Exchange Board of India (SEBI)',
          canonicalUrl: 'https://investor.sebi.gov.in/investor-charter.html',
          section: 'Basic Principles of Informed Investing',
        });
      }
    }

    // Save assistant reply
    await db.assistantMessage.create({
      data: {
        conversationId: conv.id,
        role: 'assistant',
        content: reply,
        metadata: {
          assumptionsUsed,
          uncertaintyDisclosures,
          toolResults,
        },
      },
    });

    return {
      conversationId: conv.id,
      mode,
      reply,
      citations,
      assumptionsUsed,
      uncertaintyDisclosures,
      toolResults,
    };
  }
}

export const conversationalAssistant = new ConversationalFinanceAssistant();
