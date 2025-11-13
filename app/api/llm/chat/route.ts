import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Secure server-side LLM chat API route
 * Keeps API keys secure by handling all LLM calls server-side
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, options } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // Get LLM configuration from environment variables (server-side only)
    const openaiKey = process.env.OPENAI_API_KEY
    const anthropicKey = process.env.ANTHROPIC_API_KEY

    if (!openaiKey && !anthropicKey) {
      return NextResponse.json(
        { 
          error: 'LLM API key not configured',
          message: 'Please configure OPENAI_API_KEY or ANTHROPIC_API_KEY in .env.local'
        },
        { status: 500 }
      )
    }

    // Create LLM service with server-side configuration
    const llmConfig = openaiKey ? {
      provider: 'openai' as const,
      apiKey: openaiKey,
      model: process.env.OPENAI_MODEL || 'gpt-4',
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4000'),
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
    } : {
      provider: 'anthropic' as const,
      apiKey: anthropicKey!,
      model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
      maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '4000'),
      temperature: parseFloat(process.env.ANTHROPIC_TEMPERATURE || '0.7'),
    }

    // Convert messages to LLM format and add system prompt for better financial responses
    const systemPrompt = {
      role: 'system' as const,
      content: `You are an expert AI CFO assistant specializing in financial analysis, tax optimization, cash flow management, and strategic financial planning. Provide detailed, actionable, and specific financial insights. Be conversational but professional. When users ask questions, give comprehensive answers with specific numbers, percentages, and actionable recommendations when possible.`
    }

    const llmMessages = [
      systemPrompt,
      ...messages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
    ]

    console.log('Calling LLM with', llmMessages.length, 'messages, provider:', llmConfig.provider, 'model:', llmConfig.model)

    // Call OpenAI API directly (server-side only)
    let responseContent: string
    let responseModel: string
    let usage: any

    if (llmConfig.provider === 'openai') {
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${llmConfig.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: llmConfig.model,
          messages: llmMessages,
          max_tokens: options?.maxTokens || llmConfig.maxTokens,
          temperature: options?.temperature || llmConfig.temperature,
        }),
      })

      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text()
        throw new Error(`OpenAI API error: ${openaiResponse.status} - ${errorText}`)
      }

      const openaiData = await openaiResponse.json()
      responseContent = openaiData.choices[0].message.content
      responseModel = openaiData.model
      usage = openaiData.usage
    } else {
      // Anthropic
      const systemMsg = llmMessages.find(m => m.role === 'system')
      const conversationMessages = llmMessages.filter(m => m.role !== 'system')
      
      const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': llmConfig.apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: llmConfig.model,
          max_tokens: options?.maxTokens || llmConfig.maxTokens,
          temperature: options?.temperature || llmConfig.temperature,
          system: systemMsg?.content || '',
          messages: conversationMessages.map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
          })),
        }),
      })

      if (!anthropicResponse.ok) {
        const errorText = await anthropicResponse.text()
        throw new Error(`Anthropic API error: ${anthropicResponse.status} - ${errorText}`)
      }

      const anthropicData = await anthropicResponse.json()
      responseContent = anthropicData.content[0].text
      responseModel = anthropicData.model
      usage = anthropicData.usage
    }

    console.log('LLM response received, length:', responseContent?.length || 0)

    return NextResponse.json({
      content: responseContent,
      model: responseModel,
      usage: usage,
      provider: llmConfig.provider
    })
  } catch (error: any) {
    console.error('❌ LLM API error:', error)
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      hasApiKey: !!(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY)
    })
    
    // Provide more detailed error information
    let errorMessage = error?.message || 'Unknown error occurred'
    let statusCode = 500
    
    // Check for specific error types
    if (error?.message?.includes('API key')) {
      errorMessage = 'OpenAI API key is invalid or missing. Please check your .env.local file.'
      statusCode = 401
    } else if (error?.message?.includes('rate limit')) {
      errorMessage = 'OpenAI API rate limit exceeded. Please try again later.'
      statusCode = 429
    } else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
      errorMessage = 'Network error connecting to OpenAI API. Please check your internet connection.'
      statusCode = 503
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to generate LLM response',
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: statusCode }
    )
  }
}

