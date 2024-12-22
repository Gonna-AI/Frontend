import React from 'react';
import { CreditCard, DollarSign, Clock, Shield, Package, ChevronRight } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';

const plans = [
  {
    name: 'Basic',
    price: 29,
    features: ['5,000 API calls/month', 'Basic support', 'Standard response time'],
    recommended: false
  },
  {
    name: 'Pro',
    price: 99,
    features: ['50,000 API calls/month', 'Priority support', 'Advanced analytics'],
    recommended: true
  },
  {
    name: 'Enterprise',
    price: 299,
    features: ['Unlimited API calls', '24/7 support', 'Custom solutions'],
    recommended: false
  }
];

const transactions = [
  {
    id: 1,
    date: '2024-03-15',
    amount: 99,
    status: 'Completed',
    description: 'Pro Plan - Monthly'
  },
  {
    id: 2,
    date: '2024-02-15',
    amount: 99,
    status: 'Completed',
    description: 'Pro Plan - Monthly'
  }
];

export default function Billing() {
  const { isDark } = useTheme();

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Current Plan Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-white/10 backdrop-blur-xl p-6">
        <div className="absolute top-0 right-0 w-[25rem] h-[25rem] bg-gradient-to-bl from-emerald-500/20 via-blue-500/5 to-transparent blur-2xl pointer-events-none" />
        
        <div className="relative z-10">
          <h2 className={cn(
            "text-xl font-semibold mb-4",
            isDark ? "text-white" : "text-black"
          )}>Current Plan</h2>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Package className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className={cn(
                  "text-lg font-medium",
                  isDark ? "text-white" : "text-black"
                )}>Pro Plan</h3>
                <p className={isDark ? "text-white/60" : "text-black/60"}>
                  Next billing date: April 15, 2024
                </p>
              </div>
            </div>
            <button className={cn(
              "px-4 py-2 rounded-lg transition-all",
              isDark
                ? "bg-white/10 hover:bg-white/20 text-white"
                : "bg-black/10 hover:bg-black/20 text-black"
            )}>
              Change Plan
            </button>
          </div>
        </div>
      </div>

      {/* Payment Method Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-white/10 backdrop-blur-xl p-6">
        <div className="absolute top-0 right-0 w-[25rem] h-[25rem] bg-gradient-to-bl from-purple-500/20 via-blue-500/5 to-transparent blur-2xl pointer-events-none" />
        
        <div className="relative z-10">
          <h2 className={cn(
            "text-xl font-semibold mb-4",
            isDark ? "text-white" : "text-black"
          )}>Payment Method</h2>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className={cn(
                  "text-lg font-medium",
                  isDark ? "text-white" : "text-black"
                )}>•••• •••• •••• 4242</h3>
                <p className={isDark ? "text-white/60" : "text-black/60"}>
                  Expires 12/25
                </p>
              </div>
            </div>
            <button className={cn(
              "px-4 py-2 rounded-lg transition-all",
              isDark
                ? "bg-white/10 hover:bg-white/20 text-white"
                : "bg-black/10 hover:bg-black/20 text-black"
            )}>
              Update
            </button>
          </div>
        </div>
      </div>

      {/* Plans Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "relative overflow-hidden rounded-2xl border backdrop-blur-xl p-6",
              "transition-all duration-300 hover:scale-105",
              isDark
                ? "bg-white/5 border-white/10"
                : "bg-black/5 border-black/10",
              plan.recommended && "ring-2 ring-blue-500"
            )}
          >
            {plan.recommended && (
              <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
                Recommended
              </div>
            )}
            
            <h3 className={cn(
              "text-xl font-semibold mb-2",
              isDark ? "text-white" : "text-black"
            )}>{plan.name}</h3>
            
            <div className="flex items-baseline mb-4">
              <span className={cn(
                "text-3xl font-bold",
                isDark ? "text-white" : "text-black"
              )}>${plan.price}</span>
              <span className={isDark ? "text-white/60" : "text-black/60"}>/month</span>
            </div>
            
            <ul className="space-y-2 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span className={isDark ? "text-white/80" : "text-black/80"}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
            
            <button className={cn(
              "w-full py-2 rounded-lg transition-all",
              plan.recommended
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : isDark
                  ? "bg-white/10 hover:bg-white/20 text-white"
                  : "bg-black/10 hover:bg-black/20 text-black"
            )}>
              {plan.recommended ? 'Current Plan' : 'Select Plan'}
            </button>
          </div>
        ))}
      </div>

      {/* Transaction History */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-white/10 backdrop-blur-xl p-6">
        <div className="absolute top-0 right-0 w-[25rem] h-[25rem] bg-gradient-to-bl from-blue-500/20 via-purple-500/5 to-transparent blur-2xl pointer-events-none" />
        
        <div className="relative z-10">
          <h2 className={cn(
            "text-xl font-semibold mb-4",
            isDark ? "text-white" : "text-black"
          )}>Transaction History</h2>
          
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl transition-all",
                  isDark
                    ? "bg-white/5 hover:bg-white/10"
                    : "bg-black/5 hover:bg-black/10"
                )}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-black"
                    )}>{transaction.description}</h4>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span className={isDark ? "text-white/60" : "text-black/60"}>
                        {transaction.date}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={cn(
                    "font-medium",
                    isDark ? "text-white" : "text-black"
                  )}>${transaction.amount}</span>
                  <ChevronRight className={isDark ? "text-white/40" : "text-black/40"} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}