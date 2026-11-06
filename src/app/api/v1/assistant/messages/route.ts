import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth/jwt';
import { jsonSuccess, jsonError } from '@/lib/api-response';
import { conversationalAssistant } from '@/lib/ai/assistant';

const AssistantMessageSchema = z.object({
  conversationId: z.string().optional(),
  mode: z.enum(['educational', 'planning', 'market_information', 'personalized_advice']).default('educational'),
  message: z.string().min(1, 'Message cannot be empty').max(2000),
});

export async function POST(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) {
    return jsonError('Authentication required to converse with assistant', 'UNAUTHORIZED', 401);
  }

  const body = await req.json();
  const parsed = AssistantMessageSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError('Invalid assistant message payload', 'VALIDATION_FAILED', 422, parsed.error.format());
  }

  const { conversationId, mode, message } = parsed.data;

  try {
    const result = await conversationalAssistant.processMessage({
      userId: session.userId,
      conversationId,
      mode,
      userQuery: message,
    });

    return jsonSuccess(result);
  } catch (err: any) {
    console.error('Assistant error:', err);
    return jsonError('Failed to generate grounded assistant response', 'ASSISTANT_ERROR', 500);
  }
}
