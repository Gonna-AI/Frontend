import { useState, useMemo } from 'react';
import { cn } from '../../utils/cn';
import { Check, Building2, Rocket, Coins, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useRazorpay } from 'react-razorpay';
import { useDemoCall } from '../../contexts/DemoCallContext';
import { supabase } from '../../config/supabase';

// ClerkTree Credits System - synced with UsageView
const TOTAL_CREDITS = 50;
const VOICE_CREDITS_PER_MINUTE = 1;
const TEXT_CREDITS_PER_10_REQUESTS = 1;

interface PlanFeature {
    text: string;
    included: boolean;
    highlight?: boolean;
}

interface Plan {
    name: string;
    price: string;
    period: string;
    description: string;
    credits: number;
    features: PlanFeature[];
    popular?: boolean;
    current?: boolean;
    cta: string;
}

export default function BillingView({ isDark = true }: { isDark?: boolean }) {
    const { callHistory } = useDemoCall();
    const { error, isLoading, Razorpay } = useRazorpay();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCheckout = async (planName: string) => {
        if (planName !== 'Pro') return;
        setIsProcessing(true);

        try {
            const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
            if (!razorpayKey) {
                alert('Razorpay Key ID is missing! Please fetch it from Razorpay Dashboard > API Keys and add VITE_RAZORPAY_KEY_ID to your .env.local file.');
                setIsProcessing(false);
                return;
            }

            if (isLoading) {
                alert('Razorpay SDK is still loading. Please try again in a few seconds.');
                setIsProcessing(false);
                return;
            }

            if (error || !Razorpay) {
                alert(`Razorpay SDK failed to load. error: ${error}`);
                setIsProcessing(false);
                return;
            }

            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                alert('Please sign in to upgrade.');
                return;
            }

            // 1. Create order
            const res = await fetch(`https://xlzwfkgurrrspcdyqele.supabase.co/functions/v1/api-billing/create-order`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ plan: billingCycle })
            });
            const order = await res.json();

            if (!res.ok) throw new Error(order.error || 'Failed to create order');

            // 2. Open Razorpay
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "ClerkTree",
                description: `Pro Plan - ${billingCycle}`,
                order_id: order.id,
                handler: async function (response: any) {
                    try {
                        const verifyRes = await fetch(`https://xlzwfkgurrrspcdyqele.supabase.co/functions/v1/api-billing/verify-payment`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${session.access_token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                plan: billingCycle
                            })
                        });

                        const verifyData = await verifyRes.json();
                        if (verifyRes.ok && verifyData.success) {
                            alert('Payment successful! Your credits have been updated.');
                            window.location.reload();
                        } else {
                            alert('Payment verification failed. Please contact support.');
                        }
                    } catch (e) {
                        console.error(e);
                        alert('An error occurred during verification.');
                    } finally {
                        setIsProcessing(false);
                    }
                },
                modal: {
                    ondismiss: function () {
                        setIsProcessing(false);
                    }
                },
                theme: {
                    color: "#10b981"
                }
            };

            const rzp = new Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                alert('Payment Failed: ' + response.error.description);
                setIsProcessing(false);
            });
            rzp.open();

        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Failed to initiate checkout.');
            setIsProcessing(false);
        }
    };

    // Calculate actual usage from call history
    const usageStats = useMemo(() => {
        const voiceCalls = callHistory.filter(c => c.type === 'voice');
        const textChats = callHistory.filter(c => c.type === 'text');

        const totalVoiceSeconds = voiceCalls.reduce((acc, call) => acc + (call.duration || 0), 0);
        const totalVoiceMinutes = Math.ceil(totalVoiceSeconds / 60);
        const totalTextRequests = textChats.reduce((acc, call) => acc + call.messages.filter(m => m.speaker === 'user').length, 0);

        const voiceCreditsUsed = totalVoiceMinutes * VOICE_CREDITS_PER_MINUTE;
        const textCreditsUsed = Math.ceil(totalTextRequests / 10) * TEXT_CREDITS_PER_10_REQUESTS;
        const totalCreditsUsed = voiceCreditsUsed + textCreditsUsed;
        const creditsRemaining = Math.max(0, TOTAL_CREDITS - totalCreditsUsed);

        return {
            totalCreditsUsed,
            creditsRemaining,
            creditsUsedPercent: (totalCreditsUsed / TOTAL_CREDITS) * 100
        };
    }, [callHistory]);

    const plans: Plan[] = [
        {
            name: 'Free',
            price: '$0',
            period: 'forever',
            description: 'Perfect to explore and build prototypes.',
            credits: 50,
            current: true,
            cta: 'Current Plan',
            features: [
                { text: '50 ClerkTree Credits / month', included: true, highlight: true },
                { text: 'Standard voice quality', included: true },
                { text: '500 text requests included', included: true },
                { text: 'Basic community support', included: true },
                { text: '1 active project', included: true },
                { text: 'Custom voice cloning', included: false },
                { text: 'API Access', included: false },
            ]
        },
        {
            name: 'Pro',
            price: billingCycle === 'monthly' ? '$49' : '$39',
            period: billingCycle === 'monthly' ? '/ month' : '/ month, billed yearly',
            description: 'For startups and growing teams needing power.',
            credits: 500,
            popular: true,
            cta: 'Upgrade to Pro',
            features: [
                { text: '500 ClerkTree Credits / month', included: true, highlight: true },
                { text: 'Premium ultra-low latency voice', included: true, highlight: true },
                { text: '5,000 text requests included', included: true },
                { text: 'Priority email support', included: true },
                { text: 'Unlimited projects', included: true },
                { text: 'Custom voice cloning (3 voices)', included: true },
                { text: 'Full API Access', included: true },
            ]
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            period: 'contact sales',
            description: 'For large organizations with custom needs.',
            credits: -1, // Unlimited
            cta: 'Contact Sales',
            features: [
                { text: 'Unlimited ClerkTree Credits', included: true, highlight: true },
                { text: 'Dedicated GPU infrastructure', included: true },
                { text: 'Unlimited custom voices', included: true },
                { text: '24/7 dedicated support channel', included: true },
                { text: 'SSO & Advanced Security', included: true },
                { text: 'SLA Guarantees', included: true },
                { text: 'On-premise deployment option', included: true },
            ]
        }
    ];

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-black")}>Billing & Plans</h1>
                    <p className={cn("text-sm mt-1", isDark ? "text-white/60" : "text-black/60")}>
                        Manage your subscription, credits, and payment methods
                    </p>
                </div>
            </div>

            {/* Current Plan & Credits Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Current Plan Card */}
                <div className={cn(
                    "lg:col-span-2 p-8 rounded-2xl border flex flex-col justify-center h-full relative overflow-hidden",
                    isDark ? "bg-[#09090B] border-white/10" : "bg-white border-black/10"
                )}>
                    {/* Background decoration */}
                    <div className={cn(
                        "absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[120px] opacity-10 pointer-events-none -translate-y-1/2 translate-x-1/2",
                        isDark ? "bg-white" : "bg-black"
                    )} />

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-start gap-6">
                            <div className={cn(
                                "w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg",
                                isDark ? "bg-white/5 border border-white/10" : "bg-black/5 border border-black/5"
                            )}>
                                <Rocket className={cn("w-8 h-8", isDark ? "text-white" : "text-black")} />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <h3 className={cn("text-xl font-bold", isDark ? "text-white" : "text-black")}>Free Research Preview</h3>
                                    <span className={cn(
                                        "px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider",
                                        isDark ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                    )}>
                                        Active
                                    </span>
                                </div>
                                <p className={cn("text-sm max-w-lg leading-relaxed", isDark ? "text-white/60" : "text-black/60")}>
                                    You are currently on the Free plan. Great for prototypes and testing.
                                    Upgrade to <span className="font-semibold text-emerald-500">Pro</span> for production-ready latency and higher limits.
                                </p>
                            </div>
                        </div>
                        <button className={cn(
                            "hidden md:flex px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95",
                            isDark
                                ? "bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                : "bg-black text-white hover:bg-gray-800 shadow-[0_0_20px_rgba(0,0,0,0.1)]"
                        )}>
                            Upgrade Plan
                        </button>
                    </div>
                </div>

                {/* Credit Balance Card */}
                <div className={cn(
                    "p-8 rounded-2xl border h-full flex flex-col justify-center relative overflow-hidden",
                    usageStats.creditsRemaining === 0
                        ? (isDark ? "bg-rose-950/20 border-rose-500/20" : "bg-rose-50 border-rose-200")
                        : (isDark ? "bg-[#09090B] border-white/10" : "bg-white border-black/10")
                )}>
                    {/* Glow Effect */}
                    <div className={cn(
                        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full blur-[80px] opacity-20 pointer-events-none",
                        usageStats.creditsRemaining === 0 ? "bg-rose-500" : "bg-emerald-500"
                    )} />

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Coins className={cn(
                                    "w-5 h-5",
                                    usageStats.creditsRemaining === 0 ? "text-rose-500" : "text-emerald-500"
                                )} />
                                <span className={cn(
                                    "text-sm font-medium",
                                    usageStats.creditsRemaining === 0 ? "text-rose-500" : (isDark ? "text-emerald-400" : "text-emerald-600")
                                )}>Available Credits</span>
                            </div>
                            <span className={cn("text-xs font-mono opacity-50", isDark ? "text-white" : "text-black")}>Monthly Reset: Nov 1</span>
                        </div>

                        <div className="flex items-baseline gap-1 mt-2 mb-4">
                            <span className={cn(
                                "text-5xl font-bold tracking-tight",
                                isDark ? "text-white" : "text-black"
                            )}>
                                {usageStats.creditsRemaining}
                            </span>
                            <span className={cn("text-lg", isDark ? "text-white/40" : "text-black/40")}> / {TOTAL_CREDITS}</span>
                        </div>

                        <div className={cn("w-full h-2 rounded-full overflow-hidden mb-2", isDark ? "bg-white/10" : "bg-black/5")}>
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-500",
                                    usageStats.creditsUsedPercent >= 100 ? "bg-rose-500" : "bg-emerald-500"
                                )}
                                style={{ width: `${Math.min(usageStats.creditsUsedPercent, 100)}%` }}
                            />
                        </div>

                        <p className={cn(
                            "text-xs",
                            usageStats.creditsRemaining === 0
                                ? "text-rose-400"
                                : (isDark ? "text-white/40" : "text-black/40")
                        )}>
                            Refills automatically on billing cycle reset.
                        </p>
                    </div>
                </div>
            </div>

            {/* Billing Cycle Toggle */}
            <div className="py-8 flex flex-col items-center justify-center space-y-4">
                <h2 className={cn("text-2xl font-bold text-center", isDark ? "text-white" : "text-black")}>
                    Simple, transparent pricing
                </h2>
                <div className={cn(
                    "p-1 rounded-full flex items-center gap-1 border",
                    isDark ? "bg-white/5 border-white/10" : "bg-gray-100 border-gray-200"
                )}>
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={cn(
                            "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                            billingCycle === 'monthly'
                                ? (isDark ? "bg-white text-black shadow-lg" : "bg-white text-black shadow-sm")
                                : (isDark ? "text-white/60 hover:text-white" : "text-black/60 hover:text-black")
                        )}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingCycle('yearly')}
                        className={cn(
                            "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
                            billingCycle === 'yearly'
                                ? (isDark ? "bg-white text-black shadow-lg" : "bg-white text-black shadow-sm")
                                : (isDark ? "text-white/60 hover:text-white" : "text-black/60 hover:text-black")
                        )}
                    >
                        Yearly
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-white">
                            -20%
                        </span>
                    </button>
                </div>
            </div>

            {/* Pricing Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className={cn(
                            "relative p-8 rounded-2xl border flex flex-col transition-all duration-300 hover:-translate-y-1",
                            plan.popular
                                ? (isDark ? "bg-gradient-to-b from-[#09090B] to-emerald-950/20 border-emerald-500/50 shadow-[0_0_40px_-10px_rgba(16,185,129,0.2)]" : "bg-white border-emerald-200 shadow-xl shadow-emerald-500/10")
                                : (isDark ? "bg-[#09090B] border-white/10 hover:border-white/20" : "bg-white border-black/10 hover:border-black/20"),
                            plan.current && "ring-1 ring-emerald-500/50"
                        )}
                    >
                        {plan.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                <span className={cn(
                                    "px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg uppercase tracking-wider",
                                    isDark ? "bg-emerald-500 text-white" : "bg-black text-white"
                                )}>
                                    <Sparkles className="w-3 h-3 fill-current" /> Most Popular
                                </span>
                            </div>
                        )}

                        <div className="mb-8">
                            <h3 className={cn("text-xl font-bold mb-2", isDark ? "text-white" : "text-black")}>{plan.name}</h3>
                            <div className="flex items-baseline gap-1 mb-3">
                                <span className={cn("text-4xl font-bold tracking-tight", isDark ? "text-white" : "text-black")}>{plan.price}</span>
                                <span className={cn("text-sm font-medium", isDark ? "text-white/40" : "text-black/40")}>{plan.period}</span>
                            </div>
                            <p className={cn("text-sm leading-relaxed", isDark ? "text-white/60" : "text-black/60")}>{plan.description}</p>
                        </div>

                        {/* Divider */}
                        <div className={cn("w-full h-px mb-8", isDark ? "bg-white/10" : "bg-black/5")} />

                        <div className="flex-1 space-y-4 mb-8">
                            {plan.features.map((feature, index) => (
                                <div key={index} className="flex items-start gap-3 group">
                                    <div className={cn(
                                        "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                                        feature.included
                                            ? (feature.highlight ? "bg-emerald-500 text-white" : (isDark ? "bg-white/10 text-white" : "bg-black/5 text-black"))
                                            : (isDark ? "bg-white/5 text-white/20" : "bg-black/5 text-black/20")
                                    )}>
                                        <Check className="w-3 h-3" />
                                    </div>
                                    <span className={cn(
                                        "text-sm transition-colors",
                                        feature.included
                                            ? (feature.highlight
                                                ? (isDark ? "text-white font-medium" : "text-black font-medium")
                                                : (isDark ? "text-white/70" : "text-black/70"))
                                            : (isDark ? "text-white/30" : "text-black/30")
                                    )}>
                                        {feature.text}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <button
                            disabled={plan.current || isProcessing}
                            onClick={() => plan.name === 'Pro' ? handleCheckout(plan.name) : undefined}
                            className={cn(
                                "w-full py-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                                plan.current
                                    ? (isDark ? "bg-white/5 text-white/40 cursor-not-allowed border border-white/5" : "bg-black/5 text-black/40 cursor-not-allowed border border-black/5")
                                    : plan.popular
                                        ? "bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/25 transform hover:-translate-y-0.5"
                                        : (isDark ? "bg-white text-black hover:bg-gray-200 transform hover:-translate-y-0.5" : "bg-black text-white hover:bg-gray-800 transform hover:-translate-y-0.5")
                            )}
                        >
                            {plan.name === 'Pro' && isProcessing ? 'Processing...' : plan.cta}
                            {!plan.current && <ArrowRight className="w-4 h-4" />}
                        </button>
                    </div>
                ))}
            </div>

            {/* Enterprise / Security Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                <div className={cn(
                    "p-8 rounded-2xl border flex flex-col justify-center",
                    isDark ? "bg-[#09090B] border-white/10" : "bg-white border-black/10"
                )}>
                    <div className="flex items-center gap-4 mb-4">
                        <div className={cn("p-3 rounded-xl", isDark ? "bg-purple-500/10 text-purple-400" : "bg-purple-50 text-purple-600")}>
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className={cn("font-bold text-lg", isDark ? "text-white" : "text-black")}>Enterprise Needs?</h3>
                            <p className={cn("text-sm", isDark ? "text-white/60" : "text-black/60")}>Custom deployment & SLAs</p>
                        </div>
                    </div>
                    <p className={cn("text-sm mb-6 leading-relaxed", isDark ? "text-white/60" : "text-black/60")}>
                        We offer dedicated GPU instances, VPC peering, and custom fine-tuning for large scale deployments. Let's talk about your specific requirements.
                    </p>
                    <button className={cn(
                        "w-full py-3 rounded-xl text-sm font-medium border transition-colors",
                        isDark ? "border-white/10 hover:bg-white/5 text-white" : "border-black/10 hover:bg-gray-50 text-black"
                    )}>
                        Contact Enterprise Sales
                    </button>
                </div>

                <div className={cn(
                    "p-8 rounded-2xl border flex flex-col justify-center",
                    isDark ? "bg-[#09090B] border-white/10" : "bg-white border-black/10"
                )}>
                    <div className="flex items-center gap-4 mb-4">
                        <div className={cn("p-3 rounded-xl", isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600")}>
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className={cn("font-bold text-lg", isDark ? "text-white" : "text-black")}>Secure & Compliant</h3>
                            <p className={cn("text-sm", isDark ? "text-white/60" : "text-black/60")}>Enterprise-grade security</p>
                        </div>
                    </div>
                    <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-emerald-500" />
                            <span className={isDark ? "text-white/60" : "text-black/60"}>SOC2 Type II Compliant</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-emerald-500" />
                            <span className={isDark ? "text-white/60" : "text-black/60"}>Data Encryption at Rest & Transit</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-emerald-500" />
                            <span className={isDark ? "text-white/60" : "text-black/60"}>GDPR & CCPA Ready</span>
                        </div>
                    </div>
                    <button className={cn(
                        "w-full py-3 rounded-xl text-sm font-medium border transition-colors",
                        isDark ? "border-white/10 hover:bg-white/5 text-white" : "border-black/10 hover:bg-gray-50 text-black"
                    )}>
                        View Security Documentation
                    </button>
                </div>
            </div>
        </div>
    );
}
