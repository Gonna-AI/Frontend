import React from 'react';
import { CreditCard, DollarSign, Clock, Shield, Package, ChevronRight, Activity } from 'lucide-react';
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

  const renderUsageBar = (used: number, total: number) => {
    const percentage = Math.min((used / total) * 100, 100);
    return (
      <div className="h-1.5 w-full bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full transition-all duration-500 rounded-full",
            isDark ? "bg-purple-500" : "bg-purple-600"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  const GlassContainer = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn(
      "relative overflow-hidden",
      "rounded-xl p-6",
      "border",
      isDark 
        ? "bg-black/25 border-white/10 backdrop-blur-md" 
        : "bg-white/10 border-black/10 backdrop-blur-md",
      "transition-all duration-200",
      "hover:shadow-lg",
      isDark 
        ? "hover:bg-black/30" 
        : "hover:bg-white/20",
      className
    )}>
      {children}
    </div>
  );

  const InnerGlassContainer = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn(
      "rounded-xl backdrop-blur-sm",
      isDark 
        ? "bg-white/[0.06] border-white/[0.08]" 
        : "bg-black/[0.06] border-black/[0.08]",
      className
    )}>
      {children}
    </div>
  );

  const GlassButton = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <button className={cn(
      "px-6 py-2 rounded-xl",
      "backdrop-blur-sm transition-all duration-200",
      isDark 
        ? "bg-white/10 hover:bg-white/20 text-white border border-white/[0.08]" 
        : "bg-black/10 hover:bg-black/20 text-black border border-black/[0.08]",
      className
    )}>
      {children}
    </button>
  );

  const IconContainer = ({ children }: { children: React.ReactNode }) => (
    <div className={cn(
      "w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-sm",
      isDark 
        ? "bg-white/[0.06] border border-white/[0.08]" 
        : "bg-black/[0.06] border border-black/[0.08]"
    )}>
      {children}
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Current Plan */}
      <GlassContainer>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              isDark ? "bg-white/[0.06]" : "bg-black/[0.06]"
            )}>
              <Package className={cn(
                "w-6 h-6",
                isDark ? "text-purple-400" : "text-purple-600"
              )} />
            </div>
            <div>
              <h3 className={cn(
                "text-xl font-semibold",
                isDark ? "text-white" : "text-black"
              )}>Pro Plan</h3>
              <p className={isDark ? "text-white/60" : "text-black/60"}>
                Next billing date: April 15, 2024
              </p>
            </div>
          </div>
          <button className={cn(
            "px-6 py-2 rounded-xl transition-colors",
            isDark 
              ? "bg-white/[0.06] hover:bg-white/20 text-white" 
              : "bg-black/[0.06] hover:bg-black/20 text-black"
          )}>
            Change Plan
          </button>
        </div>

        {/* API Usage */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className={isDark ? "text-white/60" : "text-black/60"}>
                API Calls (This Month)
              </span>
              <span className={isDark ? "text-white/60" : "text-black/60"}>
                25,420 / 50,000
              </span>
            </div>
            {renderUsageBar(25420, 50000)}
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className={isDark ? "text-white/60" : "text-black/60"}>
                Active Tokens
              </span>
              <span className={isDark ? "text-white/60" : "text-black/60"}>
                3 / 5
              </span>
            </div>
            {renderUsageBar(3, 5)}
          </div>

          <div className={cn(
            "p-4 rounded-xl",
            isDark ? "bg-white/[0.06]" : "bg-black/[0.06]"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className={cn(
                  isDark ? "text-purple-400" : "text-purple-600"
                )} />
                <span className={isDark ? "text-white/80" : "text-black/80"}>
                  API Health
                </span>
              </div>
              <span className={cn(
                "px-3 py-1 rounded-full text-sm",
                isDark 
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-emerald-500/10 text-emerald-600"
              )}>
                Optimal
              </span>
            </div>
          </div>
        </div>
      </GlassContainer>

      {/* Payment Method */}
      <GlassContainer>
        <h2 className={cn(
          "text-xl font-semibold mb-6",
          isDark ? "text-white" : "text-black"
        )}>Payment Method</h2>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              isDark ? "bg-white/[0.06]" : "bg-black/[0.06]"
            )}>
              <CreditCard className={cn(
                "w-6 h-6",
                isDark ? "text-purple-400" : "text-purple-600"
              )} />
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
            "px-6 py-2 rounded-xl transition-colors",
            isDark 
              ? "bg-white/[0.06] hover:bg-white/20 text-white" 
              : "bg-black/[0.06] hover:bg-black/20 text-black"
          )}>
            Update
          </button>
        </div>
      </GlassContainer>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <GlassContainer
            key={plan.name}
            className={cn(
              "transition-transform duration-200 hover:scale-[1.02]",
              plan.recommended && (
                isDark 
                  ? "ring-2 ring-purple-400/50" 
                  : "ring-2 ring-purple-600/50"
              )
            )}
          >
            {plan.recommended && (
              <div className={cn(
                "absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-xl",
                isDark 
                  ? "bg-purple-400/20 text-purple-200 border border-purple-400/30" 
                  : "bg-purple-600/20 text-purple-800 border border-purple-600/30"
              )}>
                Recommended
              </div>
            )}
            
            <h3 className={cn(
              "text-xl font-semibold mb-2",
              isDark ? "text-white" : "text-black"
            )}>{plan.name}</h3>
            
            <div className="flex items-baseline mb-6">
              <span className={cn(
                "text-3xl font-bold",
                isDark ? "text-white" : "text-black"
              )}>${plan.price}</span>
              <span className={isDark ? "text-white/60" : "text-black/60"}>/month</span>
            </div>
            
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <Shield className={cn(
                    "w-5 h-5",
                    isDark ? "text-purple-400" : "text-purple-600"
                  )} />
                  <span className={isDark ? "text-white/80" : "text-black/80"}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
            
            <button className={cn(
              "w-full py-2 rounded-xl transition-colors",
              plan.recommended
                ? isDark 
                  ? "bg-white/[0.06] hover:bg-white/20 text-white" 
                  : "bg-black/[0.06] hover:bg-black/20 text-black"
                : isDark 
                  ? "bg-white/[0.06] hover:bg-white/20 text-white" 
                  : "bg-black/[0.06] hover:bg-black/20 text-black"
            )}>
              {plan.recommended ? 'Current Plan' : 'Select Plan'}
            </button>
          </GlassContainer>
        ))}
      </div>

      {/* Transaction History */}
      <GlassContainer>
        <h2 className={cn(
          "text-xl font-semibold mb-6",
          isDark ? "text-white" : "text-black"
        )}>Transaction History</h2>
        
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <InnerGlassContainer
              key={transaction.id}
              className={cn(
                "flex items-center justify-between p-4 transition-all duration-200",
                isDark 
                  ? "hover:bg-white/10" 
                  : "hover:bg-black/10"
              )}
            >
              <div className="flex items-center space-x-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  isDark ? "bg-white/[0.06]" : "bg-black/[0.06]"
                )}>
                  <DollarSign className={cn(
                    "w-5 h-5",
                    isDark ? "text-purple-400" : "text-purple-600"
                  )} />
                </div>
                <div>
                  <h4 className={cn(
                    "font-medium",
                    isDark ? "text-white" : "text-black"
                  )}>{transaction.description}</h4>
                  <div className="flex items-center space-x-2">
                    <Clock className={cn(
                      "w-4 h-4",
                      isDark ? "text-purple-400" : "text-purple-600"
                    )} />
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
            </InnerGlassContainer>
          ))}
        </div>
      </GlassContainer>
    </div>
  );
}