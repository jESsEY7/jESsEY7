import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Calculator, DollarSign, Calendar, Percent, TrendingDown, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Credit tiers with rates
const CREDIT_TIERS = [
    { id: 'excellent', label: 'Excellent (750+)', rate: 4.5 },
    { id: 'good', label: 'Good (700-749)', rate: 6.0 },
    { id: 'fair', label: 'Fair (650-699)', rate: 9.0 },
    { id: 'poor', label: 'Poor (600-649)', rate: 14.0 },
];

const LOAN_TERMS = [24, 36, 48, 60, 72, 84];

// Monthly payment calculation
function calculateMonthlyPayment(principal, annualRate, termMonths) {
    if (principal <= 0) return 0;
    if (annualRate === 0) return principal / termMonths;

    const monthlyRate = annualRate / 100 / 12;
    const compound = Math.pow(1 + monthlyRate, termMonths);
    return principal * (monthlyRate * compound) / (compound - 1);
}

export default function FinanceCalculator({ vehiclePrice = 50000, onClose }) {
    const [downPayment, setDownPayment] = useState(Math.round(vehiclePrice * 0.1));
    const [loanTerm, setLoanTerm] = useState(60);
    const [creditTier, setCreditTier] = useState('good');
    const [showSchedule, setShowSchedule] = useState(false);

    const selectedRate = CREDIT_TIERS.find(t => t.id === creditTier)?.rate || 6.0;
    const loanAmount = vehiclePrice - downPayment;

    const calculations = useMemo(() => {
        const monthlyPayment = calculateMonthlyPayment(loanAmount, selectedRate, loanTerm);
        const totalPayment = monthlyPayment * loanTerm + downPayment;
        const totalInterest = totalPayment - vehiclePrice;

        return {
            monthlyPayment,
            totalPayment,
            totalInterest,
            loanAmount,
        };
    }, [loanAmount, selectedRate, loanTerm, downPayment, vehiclePrice]);

    // Calculate all term options
    const termOptions = useMemo(() => {
        return LOAN_TERMS.map(term => {
            const monthly = calculateMonthlyPayment(loanAmount, selectedRate, term);
            const total = monthly * term + downPayment;
            const interest = total - vehiclePrice;
            return { term, monthly, total, interest };
        });
    }, [loanAmount, selectedRate, downPayment, vehiclePrice]);

    const formatCurrency = (amount) => {
        return 'KSH ' + new Intl.NumberFormat('en-KE', {
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="border-b bg-gradient-to-r from-amber-50 to-amber-100/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500 rounded-xl">
                        <Calculator className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <CardTitle>Finance Calculator</CardTitle>
                        <CardDescription>
                            Calculate your monthly payment for {formatCurrency(vehiclePrice)}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6 space-y-8">
                {/* Down Payment */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="font-medium text-gray-700 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Down Payment
                        </label>
                        <span className="text-lg font-bold text-amber-600">
                            {formatCurrency(downPayment)}
                        </span>
                    </div>
                    <Slider
                        value={[downPayment]}
                        onValueChange={([value]) => setDownPayment(value)}
                        min={0}
                        max={vehiclePrice * 0.5}
                        step={500}
                        className="py-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>$0</span>
                        <span>{((downPayment / vehiclePrice) * 100).toFixed(0)}% of price</span>
                        <span>{formatCurrency(vehiclePrice * 0.5)}</span>
                    </div>
                </div>

                {/* Loan Term */}
                <div className="space-y-4">
                    <label className="font-medium text-gray-700 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Loan Term
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {LOAN_TERMS.map(term => (
                            <button
                                key={term}
                                onClick={() => setLoanTerm(term)}
                                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${loanTerm === term
                                    ? 'bg-amber-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {term}mo
                            </button>
                        ))}
                    </div>
                </div>

                {/* Credit Score */}
                <div className="space-y-4">
                    <label className="font-medium text-gray-700 flex items-center gap-2">
                        <Percent className="w-4 h-4" />
                        Estimated Credit Score
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {CREDIT_TIERS.map(tier => (
                            <button
                                key={tier.id}
                                onClick={() => setCreditTier(tier.id)}
                                className={`py-3 px-3 rounded-lg text-sm transition-all ${creditTier === tier.id
                                    ? 'bg-amber-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <div className="font-medium">{tier.label.split(' ')[0]}</div>
                                <div className="text-xs opacity-80">{tier.rate}% APR</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results */}
                <motion.div
                    layout
                    className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white"
                >
                    <div className="text-center mb-6">
                        <p className="text-gray-400 text-sm mb-1">Estimated Monthly Payment</p>
                        <motion.p
                            key={calculations.monthlyPayment}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-5xl font-bold text-amber-400"
                        >
                            {formatCurrency(calculations.monthlyPayment)}
                        </motion.p>
                        <p className="text-gray-400 text-sm mt-2">
                            for {loanTerm} months at {selectedRate}% APR
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                        <div className="text-center">
                            <p className="text-gray-400 text-xs">Loan Amount</p>
                            <p className="font-semibold">{formatCurrency(calculations.loanAmount)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-400 text-xs">Total Interest</p>
                            <p className="font-semibold text-red-400">{formatCurrency(calculations.totalInterest)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-400 text-xs">Total Cost</p>
                            <p className="font-semibold">{formatCurrency(calculations.totalPayment)}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Compare Terms */}
                <div className="space-y-4">
                    <button
                        onClick={() => setShowSchedule(!showSchedule)}
                        className="flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium text-sm"
                    >
                        <TrendingDown className="w-4 h-4" />
                        {showSchedule ? 'Hide' : 'Compare'} all term options
                    </button>

                    <AnimatePresence>
                        {showSchedule && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-left text-gray-500">
                                                    <th className="pb-2">Term</th>
                                                    <th className="pb-2">Monthly</th>
                                                    <th className="pb-2">Interest</th>
                                                    <th className="pb-2">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {termOptions.map(option => (
                                                    <tr
                                                        key={option.term}
                                                        className={option.term === loanTerm ? 'bg-amber-50' : ''}
                                                    >
                                                        <td className="py-2 font-medium">{option.term} mo</td>
                                                        <td className="py-2">{formatCurrency(option.monthly)}</td>
                                                        <td className="py-2 text-red-600">{formatCurrency(option.interest)}</td>
                                                        <td className="py-2">{formatCurrency(option.total)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Disclaimer */}
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>
                        These estimates are for informational purposes only. Actual rates and terms
                        may vary based on credit approval and lender requirements.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button className="flex-1 bg-amber-500 hover:bg-amber-600 text-gray-900 h-12">
                        Get Pre-Approved
                    </Button>
                    {onClose && (
                        <Button variant="outline" onClick={onClose} className="h-12">
                            Close
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
