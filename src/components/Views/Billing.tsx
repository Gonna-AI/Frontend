import React, { useState } from 'react';
import { CreditCard, DollarSign, Clock, Shield, Package, ChevronRight, Activity, Phone, MessageCircle, Bot } from 'lucide-react';

const plans = [
  {
    name: 'Basic',
    price: 0,
    features: [
      'Unlimited text chat with Google Gemini',
      'Basic website chat widget',
      'Standard response time',
      'Basic analytics',
      'Community support'
    ],
    voiceSupport: 'Google Text-to-Speech',
    apiLimits: {
      chatCalls: 'Unlimited',
      voiceCalls: '100/month',
      webhookCalls: '1000/month'
    },
    recommended: false
  },
  {
    name: 'Pro',
    price: 49,
    features: [
      'Everything in Basic',
      'ElevenLabs voice integration',
      'Priority support',
      'Advanced analytics',
      'Custom voice settings',
      'Twilio integration',
      'Voice call history'
    ],
    voiceSupport: 'ElevenLabs Premium',
    apiLimits: {
      chatCalls: 'Unlimited',
      voiceCalls: '1000/month',
      webhookCalls: '10000/month',
      twilioMinutes: '100/month'
    },
    recommended: true
  },
  {
    name: 'Enterprise',
    price: 199,
    features: [
      'Everything in Pro',
      'Dedicated ElevenLabs voices',
      'Unlimited Twilio minutes',
      'Custom integrations',
      '24/7 priority support',
      'SLA guarantee',
      'Custom analytics'
    ],
    voiceSupport: 'Custom ElevenLabs Voices',
    apiLimits: {
      chatCalls: 'Unlimited',
      voiceCalls: 'Unlimited',
      webhookCalls: 'Unlimited',
      twilioMinutes: 'Unlimited'
    },
    recommended: false
  }
];

const transactions = [
  {
    id: 1,
    date: '2024-03-15',
    amount: 49,
    status: 'Completed',
    description: 'Pro Plan - Monthly',
    type: 'subscription'
  },
  {
    id: 2,
    date: '2024-03-15',
    amount: 10,
    status: 'Completed',
    description: 'Additional Voice Credits',
    type: 'voice'
  }
];

export default function Billing() {
  const [selectedPlan, setSelectedPlan] = useState('Pro');
  const [isDark, setIsDark] = useState(false);

  const renderUsageBar = (used, total) => {
    const percentage = typeof total === 'number' ? Math.min((used / total) * 100, 100) : 50;
    return (
      <div className="h-1.5 w-full bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full transition-all duration-500 rounded-full bg-purple-600 dark:bg-purple-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  const GlassContainer = ({ children, className }) => (
    <div className={`relative overflow-hidden rounded-xl p-6 bg-white/10 dark:bg-black/20 border border-black/10 dark:border-white/10 transition-all duration-200 ${className}`}>
      {children}
    </div>
  );

  const IconContainer = ({ children }) => (
    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/10 dark:bg-black/20 border border-black/10 dark:border-white/10">
      {children}
    </div>
  );

  const UsageSection = ({ icon: Icon, title, used, total, unit }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        <span className="text-black/60 dark:text-white/60">{title}</span>
      </div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-black/60 dark:text-white/60">
          {used} / {total} {unit}
        </span>
      </div>
      {renderUsageBar(used, total)}
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
    {/* Current Plan Usage */}
    <GlassContainer>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <IconContainer>
            <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </IconContainer>
          <div>
            <h3 className="text-xl font-semibold text-black dark:text-white">Pro Plan</h3>
            <p className="text-black/60 dark:text-white/60">
              Next billing date: April 15, 2024
            </p>
          </div>
        </div>
        <button className="px-6 py-2 rounded-xl transition-colors bg-white/10 hover:bg-white/20 dark:bg-black/20 dark:hover:bg-black/30 text-black dark:text-white border border-black/10 dark:border-white/10">
          Change Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <UsageSection 
            icon={MessageCircle}
            title="Chat API Calls"
            used="25,420"
            total="Unlimited"
            unit="calls"
          />
          
          <UsageSection 
            icon={Phone}
            title="Voice API Calls"
            used="750"
            total={1000}
            unit="calls"
          />
        </div>

        <div className="space-y-6">
          <UsageSection 
            icon={Bot}
            title="Webhook Calls"
            used="5,230"
            total={10000}
            unit="calls"
          />
          
          <UsageSection 
            icon={Clock}
            title="Twilio Minutes"
            used="45"
            total={100}
            unit="minutes"
          />
        </div>
      </div>

      <div className="mt-6 p-4 rounded-xl bg-white/10 dark:bg-black/20 border border-black/10 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="text-purple-600 dark:text-purple-400" />
            <span className="text-black/80 dark:text-white/80">
              Voice Service Status
            </span>
          </div>
          <div className="flex gap-4">
            <span className="px-3 py-1 rounded-full text-sm bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              ElevenLabs: Active
            </span>
            <span className="px-3 py-1 rounded-full text-sm bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              Twilio: Active
            </span>
          </div>
        </div>
      </div>
    </GlassContainer>

    {/* Plans */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <GlassContainer
          key={plan.name}
          className={`transition-transform duration-200 hover:scale-[1.02] ${
            plan.recommended && "ring-2 ring-purple-600/50 dark:ring-purple-400/50"
          }`}
        >
          {plan.recommended && (
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium bg-purple-600/20 dark:bg-purple-400/20 text-purple-800 dark:text-purple-200 border border-purple-600/30 dark:border-purple-400/30">
              Recommended
            </div>
          )}
          
          <h3 className="text-xl font-semibold mb-2 text-black dark:text-white">
            {plan.name}
          </h3>
          
          <div className="flex items-baseline mb-6">
            <span className="text-3xl font-bold text-black dark:text-white">
              ${plan.price}
            </span>
            <span className="text-black/60 dark:text-white/60">/month</span>
          </div>
          
          <div className="mb-4 p-3 rounded-lg bg-white/5 dark:bg-black/20 border border-black/5 dark:border-white/10">
            <h4 className="font-medium mb-2 text-black dark:text-white">
              Voice Integration:
            </h4>
            <p className="text-black/80 dark:text-white/80">
              {plan.voiceSupport}
            </p>
          </div>

          <div className="mb-6">
            <h4 className="font-medium mb-2 text-black dark:text-white">
              API Limits:
            </h4>
            <ul className="space-y-2">
              {Object.entries(plan.apiLimits).map(([key, value]) => (
                <li key={key} className="flex justify-between text-sm">
                  <span className="text-black/60 dark:text-white/60">
                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                  </span>
                  <span className="text-black/80 dark:text-white/80">{value}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <ul className="space-y-3 mb-6">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-black/80 dark:text-white/80">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
          
          <button className="w-full py-2 rounded-xl transition-colors bg-white/10 hover:bg-white/20 dark:bg-black/20 dark:hover:bg-black/30 text-black dark:text-white border border-black/10 dark:border-white/10">
            {selectedPlan === plan.name ? 'Current Plan' : 'Select Plan'}
          </button>
        </GlassContainer>
      ))}
    </div>

    {/* Transaction History */}
    <GlassContainer>
      <h2 className="text-xl font-semibold mb-6 text-black dark:text-white">
        Transaction History
      </h2>
      
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 rounded-xl bg-white/10 dark:bg-black/20 border border-black/10 dark:border-white/10 transition-all duration-200 hover:bg-white/20 dark:hover:bg-black/30"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 dark:bg-black/20 border border-black/10 dark:border-white/10">
                {transaction.type === 'voice' ? (
                  <Phone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                ) : (
                  <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                )}
              </div>
              <div>
                <h4 className="font-medium text-black dark:text-white">
                  {transaction.description}
                </h4>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-black/60 dark:text-white/60">
                    {transaction.date}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="font-medium text-black dark:text-white">
                ${transaction.amount}
              </span>
              <ChevronRight className="text-black/40 dark:text-white/40" />
            </div>
          </div>
        ))}
      </div>
    </GlassContainer>
  </div>
  );
}

