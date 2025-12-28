import { PremiumHeader, StatCard, GlassCard, fadeIn } from "@/components/dashboard/premium/premium-components"
import { Rocket, Users, CreditCard, Activity, ArrowUpRight, ArrowDownRight, MoreHorizontal, Wallet, Zap, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function PremiumPage() {
    return (
        // Changed bg-[#09090b] to bg-transparent to show the celestial bloom (moving flower).
        // Added 'dark' class to force dark mode styles for children, and a semi-transparent dark overlay
        // so the text remains readable against the flower, but the flower is visible.
        <div className="dark min-h-screen bg-black/40 backdrop-blur-[2px] text-white p-8 font-sans selection:bg-indigo-500/30">
            {/* Ambient Background Effects - Reduced opacity to blend with global background */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <PremiumHeader title="Overview" subtitle="Welcome back to your premium dashboard." />
                    <div className="flex gap-4">
                        <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md">
                            Looking for files?
                        </Button>
                        <Button className="bg-gradient-to-r from-indigo-500 to-fuchsia-600 hover:from-indigo-600 hover:to-fuchsia-700 text-white shadow-lg shadow-indigo-500/25 border-0">
                            <Rocket className="mr-2 h-4 w-4" /> New Project
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Revenue"
                        value="$48,295.00"
                        trend="+12.5%"
                        trendUp={true}
                        icon={DollarSignIcon}
                        color="from-indigo-500 to-blue-600"
                        index={0}
                    />
                    <StatCard
                        title="Active Users"
                        value="2,420"
                        trend="+8.2%"
                        trendUp={true}
                        icon={Users}
                        color="from-fuchsia-500 to-pink-600"
                        index={1}
                    />
                    <StatCard
                        title="Bounce Rate"
                        value="24.5%"
                        trend="-2.4%"
                        trendUp={true} // Lower is better
                        icon={Activity}
                        color="from-emerald-500 to-teal-600"
                        index={2}
                    />
                    <StatCard
                        title="Active Subs"
                        value="573"
                        trend="+201"
                        trendUp={true}
                        icon={CreditCard}
                        color="from-amber-500 to-orange-600"
                        index={3}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Chart Section (Placeholder for visual fidelity) */}
                    <GlassCard className="lg:col-span-2 min-h-[400px] flex flex-col" delay={0.4}>
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-bold">Revenue Analytics</h3>
                                <p className="text-muted-foreground text-sm">Monthly recurring revenue over time</p>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs font-medium">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Pro
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs font-medium">
                                    <span className="w-2 h-2 rounded-full bg-fuchsia-500"></span> Enterprise
                                </div>
                            </div>
                        </div>

                        {/* Simulation of a fancy chart using CSS/Divs for the "UI Look" without heavy chart libraries */}
                        <div className="flex-1 flex items-end gap-2 px-4 pb-4">
                            {[40, 65, 45, 80, 55, 75, 40, 60, 85, 95, 70, 80].map((h, i) => (
                                <div key={i} className="flex-1 group relative">
                                    <div
                                        className="w-full bg-indigo-500/20 rounded-t-lg transition-all duration-300 group-hover:bg-indigo-500/40 relative overflow-hidden"
                                        style={{ height: `${h}%` }}
                                    >
                                        <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-t from-indigo-500 to-transparent opacity-30" />
                                    </div>
                                    {/* Hover Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white text-black text-xs font-bold rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                                        ${h * 1240}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                    {/* Recent Activity / Transactions */}
                    <GlassCard delay={0.5} className="flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Recent Transactions</h3>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white/10">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </div>
                        <ScrollArea className="flex-1 -mx-2 px-2">
                            <div className="space-y-4">
                                {[
                                    { name: "Spotify Sub", icon: Music, amt: "-$12.99", date: "Just now", color: "bg-green-500" },
                                    { name: "Freelance Pay", icon: Wallet, amt: "+$2,450.00", date: "2 mins ago", color: "bg-indigo-500", positive: true },
                                    { name: "Server Cost", icon: Zap, amt: "-$85.00", date: "1 hour ago", color: "bg-amber-500" },
                                    { name: "Domain Renewal", icon: Globe, amt: "-$120.00", date: "4 hours ago", color: "bg-blue-500" },
                                    { name: "Design Assets", icon: Layers, amt: "-$49.00", date: "Yesterday", color: "bg-pink-500" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                                        <div className={`p-2.5 rounded-full ${item.color} bg-opacity-20 text-${item.color.replace('bg-', '')}`}>
                                            <item.icon className={`h-4 w-4 text-white`} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">{item.date}</p>
                                        </div>
                                        <div className={`font-medium text-sm ${item.positive ? 'text-emerald-400' : 'text-white'}`}>
                                            {item.amt}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </GlassCard>
                </div>
            </div>
        </div>
    )
}

// Simple Icon Wrappers to match standard import expectation if needed, though Lucide exports direct components
function DollarSignIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="12" x2="12" y1="2" y2="22" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    )
}

// Missing icons mock
import { Music, Layers } from "lucide-react"
