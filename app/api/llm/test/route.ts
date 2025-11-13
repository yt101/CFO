import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Test endpoint to verify LLM configuration
 */
export async function GET(request: NextRequest) {
  const openaiKey = process.env.OPENAI_API_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  
  return NextResponse.json({
    hasOpenAIKey: !!openaiKey,
    openaiKeyLength: openaiKey?.length || 0,
    openaiKeyPrefix: openaiKey ? openaiKey.substring(0, 20) + '...' : null,
    hasAnthropicKey: !!anthropicKey,
    anthropicKeyLength: anthropicKey?.length || 0,
    openaiModel: process.env.OPENAI_MODEL || 'gpt-4',
    openaiMaxTokens: process.env.OPENAI_MAX_TOKENS || '4000',
    openaiTemperature: process.env.OPENAI_TEMPERATURE || '0.7',
    nodeEnv: process.env.NODE_ENV,
    message: openaiKey || anthropicKey 
      ? 'API key found in environment variables' 
      : 'No API key found in environment variables'
  })
}

