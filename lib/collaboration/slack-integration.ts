// Slack Integration for Financial Alerts and Notifications
export interface SlackConfig {
  botToken: string
  signingSecret: string
  webhookUrl?: string
  defaultChannel: string
}

export interface SlackMessage {
  channel: string
  text: string
  blocks?: any[]
  attachments?: any[]
}

export interface FinancialAlert {
  id: string
  type: 'cash_flow' | 'revenue' | 'expense' | 'kpi' | 'risk' | 'forecast'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  value: number
  threshold: number
  trend: 'up' | 'down' | 'stable'
  timestamp: Date
  data: any
}

export interface DailyDigest {
  date: Date
  cashIn: number
  cashOut: number
  netCashFlow: number
  runway: number
  topInsights: string[]
  alerts: FinancialAlert[]
  recommendations: string[]
}

export class SlackIntegration {
  private config: SlackConfig

  constructor(config: SlackConfig) {
    this.config = config
  }

  async sendAlert(alert: FinancialAlert): Promise<boolean> {
    try {
      const message = this.formatAlertMessage(alert)
      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.botToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      })

      const result = await response.json()
      return result.ok
    } catch (error) {
      console.error('Slack alert error:', error)
      return false
    }
  }

  async sendDailyDigest(digest: DailyDigest): Promise<boolean> {
    try {
      const message = this.formatDailyDigestMessage(digest)
      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.botToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      })

      const result = await response.json()
      return result.ok
    } catch (error) {
      console.error('Slack digest error:', error)
      return false
    }
  }

  async sendCustomMessage(message: SlackMessage): Promise<boolean> {
    try {
      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.botToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      })

      const result = await response.json()
      return result.ok
    } catch (error) {
      console.error('Slack message error:', error)
      return false
    }
  }

  private formatAlertMessage(alert: FinancialAlert): SlackMessage {
    const severityEmoji = this.getSeverityEmoji(alert.severity)
    const trendEmoji = this.getTrendEmoji(alert.trend)
    
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${severityEmoji} ${alert.title}`
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Type:* ${alert.type.replace('_', ' ').toUpperCase()}`
          },
          {
            type: 'mrkdwn',
            text: `*Severity:* ${alert.severity.toUpperCase()}`
          },
          {
            type: 'mrkdwn',
            text: `*Value:* ${this.formatCurrency(alert.value)} ${trendEmoji}`
          },
          {
            type: 'mrkdwn',
            text: `*Threshold:* ${this.formatCurrency(alert.threshold)}`
          }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Description:* ${alert.description}`
        }
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Alert triggered at ${alert.timestamp.toLocaleString()}`
          }
        ]
      }
    ]

    return {
      channel: this.config.defaultChannel,
      text: `${severityEmoji} ${alert.title}: ${alert.description}`,
      blocks
    }
  }

  private formatDailyDigestMessage(digest: DailyDigest): SlackMessage {
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `📊 Daily Financial Digest - ${digest.date.toLocaleDateString()}`
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Cash In:* ${this.formatCurrency(digest.cashIn)}`
          },
          {
            type: 'mrkdwn',
            text: `*Cash Out:* ${this.formatCurrency(digest.cashOut)}`
          },
          {
            type: 'mrkdwn',
            text: `*Net Cash Flow:* ${this.formatCurrency(digest.netCashFlow)}`
          },
          {
            type: 'mrkdwn',
            text: `*Runway:* ${digest.runway.toFixed(1)} months`
          }
        ]
      }
    ]

    if (digest.topInsights.length > 0) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Key Insights:*\n${digest.topInsights.map(insight => `• ${insight}`).join('\n')}`
        }
      })
    }

    if (digest.alerts.length > 0) {
      const alertText = digest.alerts.map(alert => 
        `• ${this.getSeverityEmoji(alert.severity)} ${alert.title}`
      ).join('\n')
      
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Active Alerts:*\n${alertText}`
        }
      })
    }

    if (digest.recommendations.length > 0) {
      const recText = digest.recommendations.map(rec => `• ${rec}`).join('\n')
      
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Recommendations:*\n${recText}`
        }
      })
    }

    return {
      channel: this.config.defaultChannel,
      text: `Daily Financial Digest - ${digest.date.toLocaleDateString()}`,
      blocks
    }
  }

  private getSeverityEmoji(severity: string): string {
    const emojis = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      critical: '🔴'
    }
    return emojis[severity as keyof typeof emojis] || '⚪'
  }

  private getTrendEmoji(trend: string): string {
    const emojis = {
      up: '📈',
      down: '📉',
      stable: '➡️'
    }
    return emojis[trend as keyof typeof emojis] || '➡️'
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }
}

// Export singleton instance
export const slackIntegration = new SlackIntegration({
  botToken: process.env.SLACK_BOT_TOKEN || 'demo-token',
  signingSecret: process.env.SLACK_SIGNING_SECRET || 'demo-secret',
  defaultChannel: process.env.SLACK_DEFAULT_CHANNEL || '#finance-alerts'
})
































