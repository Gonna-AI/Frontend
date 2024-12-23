import React from 'react';
import { 
  CreditCard, 
  DollarSign, 
  Clock, 
  Shield, 
  Package, 
  ChevronRight, 
  Activity,
  Settings,
  Edit3,
  Plus,
  AlertCircle
} from 'lucide-react';

// Utility function for combining class names
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

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

export default function BillingDashboard({ isDark = true }) {
  const renderUsageBar = (used, total) => {
    const percentage = Math.min((used / total) * 100, 100);
    return (
      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 max-w-full mx-auto space-y-4 md:space-y-6">
      {/* Current Plan Card */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/20 backdrop-blur-xl p-4 md:p-8">
        <div className="absolute top-0 right-0 w-48 md:w-[35rem] h-48 md:h-[35rem] bg-gradient-to-bl from-blue-500/20 via-purple-500/5 to-transparent blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="w-10 md:w-12 h-10 md:h-12 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                <Package className="w-5 md:w-6 h-5 md:h-6 text-blue-400" />
              </div>
              <div>
                <h3 className={cn(
                  "text-lg md:text-xl font-bold",
                  isDark ? "text-white" : "text-black"
                )}>Pro Plan</h3>
                <p className="text-sm md:text-base text-white/60">Apr 15, 2024</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="hidden md:flex px-6 py-2 rounded-xl transition-all bg-gradient-to-r from-blue-400/30 to-purple-400/30 backdrop-blur-sm border border-white/20 text-white">
                Change Plan
              </button>
              <button className="md:hidden w-10 h-10 rounded-xl bg-gradient-to-r from-blue-400/30 to-purple-400/30 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* API Usage */}
          <div className="space-y-4 md:space-y-6">
            <div>
              <div className="flex justify-between text-xs md:text-sm mb-2">
                <span className="text-white/60">API Calls (This Month)</span>
                <span className="text-white/60">25,420 / 50,000</span>
              </div>
              {renderUsageBar(25420, 50000)}
            </div>

            <div>
              <div className="flex justify-between text-xs md:text-sm mb-2">
                <span className="text-white/60">Active Tokens</span>
                <span className="text-white/60">3 / 5</span>
              </div>
              {renderUsageBar(3, 5)}
            </div>

            <div className="p-3 md:p-4 rounded-xl bg-gradient-to-r from-blue-400/10 to-purple-400/10 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <Activity className="w-4 md:w-5 h-4 md:h-5 text-blue-400" />
                  <span className="text-sm md:text-base text-white/80">API Health</span>
                </div>
                <span className="px-2 md:px-3 py-1 rounded-full text-xs md:text-sm bg-emerald-400/20 text-emerald-400">
                  Optimal
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Card */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/20 backdrop-blur-xl p-4 md:p-8">
        <div className="absolute top-0 right-0 w-48 md:w-[35rem] h-48 md:h-[35rem] bg-gradient-to-bl from-purple-500/20 via-blue-500/5 to-transparent blur-3xl" />
        
        <div className="relative z-10">
          <h2 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">Payment Method</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="w-10 md:w-12 h-10 md:h-12 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                <CreditCard className="w-5 md:w-6 h-5 md:h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white text-lg md:text-xl font-medium">•••• •••• •••• 4242</h3>
                <p className="text-sm md:text-base text-white/60">Expires 12/25</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="hidden md:flex px-6 py-2 rounded-xl transition-all bg-gradient-to-r from-blue-400/30 to-purple-400/30 backdrop-blur-sm border border-white/20 text-white">
                Update
              </button>
              <button className="md:hidden w-10 h-10 rounded-xl bg-gradient-to-r from-blue-400/30 to-purple-400/30 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <Edit3 className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="overflow-x-auto md:overflow-visible pb-4 md:pb-0">
        <div className="flex md:grid md:grid-cols-3 space-x-4 md:space-x-0 md:gap-6 min-w-max md:min-w-0">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative w-64 md:w-auto rounded-2xl md:rounded-3xl border backdrop-blur-xl p-4 md:p-8",
                "bg-gradient-to-br from-white/5 via-white/10 to-transparent",
                "border-white/20",
                "transition-all duration-300 hover:scale-105",
                plan.recommended && "ring-2 ring-blue-500"
              )}
            >
              {plan.recommended && (
                <div className="absolute top-2 md:top-3 right-2 md:right-3 px-2 md:px-3 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
                  Current
                </div>
              )}
              
              <h3 className="text-lg md:text-xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline mb-4 md:mb-6">
                <span className="text-2xl md:text-3xl font-bold text-white">${plan.price}</span>
                <span className="text-white/60">/mo</span>
              </div>
              
              <ul className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2 md:space-x-3">
                    <Shield className="w-4 md:w-5 h-4 md:h-5 text-blue-400 flex-shrink-0" />
                    <span className="text-sm md:text-base text-white/80">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button className={cn(
                "w-full py-2 rounded-xl text-sm md:text-base transition-all",
                plan.recommended
                  ? "bg-gradient-to-r from-blue-400/30 to-purple-400/30 backdrop-blur-sm border border-white/20"
                  : "bg-white/10 backdrop-blur-sm border border-white/10",
                "text-white hover:bg-white/20"
              )}>
                {plan.recommended ? 'Current Plan' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/20 backdrop-blur-xl p-4 md:p-8">
        <div className="absolute top-0 right-0 w-48 md:w-[35rem] h-48 md:h-[35rem] bg-gradient-to-bl from-blue-500/20 via-purple-500/5 to-transparent blur-3xl" />
        
        <div className="relative z-10">
          <h2 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">Recent Transactions</h2>
          
          <div className="space-y-3 md:space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 md:p-4 rounded-xl bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/20"
              >
                <div className="flex items-center space-x-3 md:space-x-4">
                  <div className="w-8 md:w-10 h-8 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                    <DollarSign className="w-4 md:w-5 h-4 md:h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm md:text-base font-medium text-white">{transaction.description}</h4>
                    <div className="flex items-center space-x-1 md:space-x-2">
                      <Clock className="w-3 md:w-4 h-3 md:h-4 text-purple-400" />
                      <span className="text-xs md:text-sm text-white/60">
                        {transaction.date}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 md:space-x-4">
                  <span className="text-sm md:text-base font-medium text-white">${transaction.amount}</span>
                  <ChevronRight className="hidden md:block text-white/40" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}