"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Zap, Shield, Users, Globe } from "lucide-react"
import Link from "next/link"

const features = [
  {
    id: 'cash-flow',
    title: 'Cash Flow Management',
    icon: '💰',
    description: 'Advanced cash flow forecasting and optimization tools',
    features: [
      'Real-time cash flow monitoring',
      'Automated cash flow forecasting',
      'Working capital optimization',
      'Liquidity risk assessment',
      'Cash flow scenario modeling',
      'Payment timing optimization'
    ],
    pricing: {
      basic: '$99/month',
      premium: '$299/month',
      enterprise: 'Custom'
    },
    benefits: [
      'Improve cash visibility by 85%',
      'Reduce cash flow volatility',
      'Optimize working capital',
      'Better financial planning'
    ]
  },
  {
    id: 'finance',
    title: 'Finance & Accounting',
    icon: '📊',
    description: 'Comprehensive financial analysis and reporting suite',
    features: [
      'Financial statement analysis',
      'KPI tracking and benchmarking',
      'Budget planning and variance analysis',
      'Financial reporting automation',
      'Compliance monitoring',
      'Audit trail management'
    ],
    pricing: {
      basic: '$149/month',
      premium: '$399/month',
      enterprise: 'Custom'
    },
    benefits: [
      'Streamline financial processes',
      'Improve financial accuracy',
      'Reduce reporting time by 70%',
      'Enhanced compliance'
    ]
  },
  {
    id: 'human-resource',
    title: 'Human Resources',
    icon: '👥',
    description: 'Workforce analytics and HR optimization tools',
    features: [
      'Employee performance analytics',
      'Talent retention insights',
      'Workforce cost optimization',
      'HR compliance tracking',
      'Employee engagement metrics',
      'Recruitment analytics'
    ],
    pricing: {
      basic: '$79/month',
      premium: '$199/month',
      enterprise: 'Custom'
    },
    benefits: [
      'Reduce turnover by 25%',
      'Optimize workforce costs',
      'Improve employee satisfaction',
      'Better talent management'
    ]
  },
  {
    id: 'tax-optimization',
    title: 'Tax Optimization',
    icon: '📋',
    description: 'Advanced tax planning and optimization strategies',
    features: [
      'Tax planning and optimization',
      'Deduction maximization',
      'Tax compliance monitoring',
      'Multi-entity tax management',
      'Tax scenario modeling',
      'Audit support and documentation'
    ],
    pricing: {
      basic: '$199/month',
      premium: '$499/month',
      enterprise: 'Custom'
    },
    benefits: [
      'Maximize tax savings',
      'Ensure compliance',
      'Reduce audit risk',
      'Streamline tax processes'
    ]
  },
  {
    id: 'supply-chain',
    title: 'Supply Chain Optimization',
    icon: '🚚',
    description: 'Supply chain analytics and optimization tools',
    features: [
      'Supply chain visibility',
      'Inventory optimization',
      'Vendor performance analytics',
      'Cost reduction opportunities',
      'Risk assessment and mitigation',
      'Demand forecasting'
    ],
    pricing: {
      basic: '$129/month',
      premium: '$349/month',
      enterprise: 'Custom'
    },
    benefits: [
      'Reduce supply chain costs by 15%',
      'Improve inventory turnover',
      'Minimize supply chain risks',
      'Enhance vendor relationships'
    ]
  },
  {
    id: 'analytics',
    title: 'Advanced Analytics',
    icon: '📈',
    description: 'Business intelligence and data analytics platform',
    features: [
      'Custom dashboard creation',
      'Predictive analytics',
      'Data visualization',
      'Automated reporting',
      'Trend analysis',
      'Performance benchmarking'
    ],
    pricing: {
      basic: '$99/month',
      premium: '$249/month',
      enterprise: 'Custom'
    },
    benefits: [
      'Data-driven decision making',
      'Identify growth opportunities',
      'Improve operational efficiency',
      'Competitive advantage'
    ]
  },
  {
    id: 'industry-specific',
    title: 'Industry Specific Solutions',
    icon: '🏭',
    description: 'Tailored solutions for specific industries',
    features: [
      'Industry-specific KPIs',
      'Regulatory compliance tools',
      'Industry benchmarking',
      'Specialized reporting',
      'Custom workflows',
      'Industry best practices'
    ],
    pricing: {
      basic: '$149/month',
      premium: '$399/month',
      enterprise: 'Custom'
    },
    benefits: [
      'Industry-specific insights',
      'Compliance automation',
      'Competitive benchmarking',
      'Specialized expertise'
    ]
  }
]

const pricingPlans = [
  {
    name: 'Basic',
    price: '$99',
    period: '/month',
    description: 'Essential features for small businesses',
    features: [
      'Up to 5 users',
      'Basic reporting',
      'Email support',
      'Standard integrations',
      'Monthly backups'
    ],
    limitations: [
      'Limited custom dashboards',
      'Basic analytics only',
      'Standard support hours'
    ],
    popular: false
  },
  {
    name: 'Premium',
    price: '$299',
    period: '/month',
    description: 'Advanced features for growing businesses',
    features: [
      'Up to 25 users',
      'Advanced analytics',
      'Priority support',
      'All integrations',
      'Daily backups',
      'Custom dashboards',
      'API access'
    ],
    limitations: [
      'Limited to 2 industry modules',
      'Standard SLA'
    ],
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Full-scale solution for large organizations',
    features: [
      'Unlimited users',
      'All features included',
      'Dedicated support',
      'Custom integrations',
      'Real-time backups',
      'White-label options',
      'SLA guarantee',
      'On-premise deployment'
    ],
    limitations: [],
    popular: false
  }
]

export default function FeaturesPricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Features & Pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the perfect plan for your business needs. All plans include our core AI-powered analytics and can be customized with additional modules.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Powerful Modules for Every Business
          </h2>
          <p className="text-lg text-gray-600">
            Mix and match modules to create the perfect solution for your organization
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card key={feature.id} className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{feature.icon}</span>
                  <div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Key Features:</h4>
                  <ul className="space-y-1">
                    {feature.features.slice(0, 4).map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Benefits:</h4>
                  <ul className="space-y-1">
                    {feature.benefits.map((benefit, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        • {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Starting from:</span>
                    <span className="font-bold text-lg">{feature.pricing.basic}</span>
                  </div>
                </div>

                <Button className="w-full" variant="outline">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-lg text-gray-600">
              Start with any plan and upgrade as you grow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={plan.name} className={`relative ${plan.popular ? 'border-blue-500 shadow-xl scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-4 py-1">
                      <Star className="h-4 w-4 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">What's included:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {plan.limitations.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 text-gray-600">Limitations:</h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, limitIndex) => (
                          <li key={limitIndex} className="text-sm text-gray-500">
                            • {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button 
                    className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using our AI-powered platform to optimize their operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              <Zap className="h-5 w-5 mr-2" />
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              <Users className="h-5 w-5 mr-2" />
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="/features-pricing" className="hover:text-white">Features</Link></li>
                <li><Link href="/features-pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/dashboard/integrations" className="hover:text-white">Integrations</Link></li>
                <li><Link href="/dashboard/support" className="hover:text-white">Support</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="#" className="hover:text-white">About</Link></li>
                <li><Link href="#" className="hover:text-white">Careers</Link></li>
                <li><Link href="#" className="hover:text-white">Blog</Link></li>
                <li><Link href="#" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="#" className="hover:text-white">Documentation</Link></li>
                <li><Link href="#" className="hover:text-white">API Reference</Link></li>
                <li><Link href="#" className="hover:text-white">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white">Community</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Security</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  SOC 2 Compliant
                </li>
                <li className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  GDPR Ready
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2024 ReturnSight AI. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  )
}





























