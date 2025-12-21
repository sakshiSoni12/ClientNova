"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { IndianRupee } from "lucide-react"

interface Client {
  subscription_plan: string
  status: string
}

const PLAN_PRICING = {
  basic: 8000,
  pro: 15000,
  premium: 25000,
}

export function MonthlyRevenueChart() {
  const [clients, setClients] = useState<Client[]>([])
  const [revenue, setRevenue] = useState({ total: 0, basic: 0, pro: 0, premium: 0 })

  useEffect(() => {
    const fetchClients = async () => {
      const supabase = createClient()
      const { data } = await supabase.from("clients").select("subscription_plan, status").eq("status", "active")

      if (data) {
        setClients(data)

        // Calculate revenue by plan
        const basicCount = data.filter((c) => c.subscription_plan === "basic").length
        const proCount = data.filter((c) => c.subscription_plan === "pro").length
        const premiumCount = data.filter((c) => c.subscription_plan === "premium").length

        const basicRevenue = basicCount * PLAN_PRICING.basic
        const proRevenue = proCount * PLAN_PRICING.pro
        const premiumRevenue = premiumCount * PLAN_PRICING.premium

        setRevenue({
          total: basicRevenue + proRevenue + premiumRevenue,
          basic: basicRevenue,
          pro: proRevenue,
          premium: premiumRevenue,
        })
      }
    }

    fetchClients()

    // Subscribe to real-time updates
    const supabase = createClient()
    const channel = supabase
      .channel("clients-revenue")
      .on("postgres_changes", { event: "*", schema: "public", table: "clients" }, () => {
        fetchClients()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const chartData = [
    {
      name: "Basic",
      revenue: revenue.basic,
      count: clients.filter((c) => c.subscription_plan === "basic").length,
    },
    {
      name: "Pro",
      revenue: revenue.pro,
      count: clients.filter((c) => c.subscription_plan === "pro").length,
    },
    {
      name: "Premium",
      revenue: revenue.premium,
      count: clients.filter((c) => c.subscription_plan === "premium").length,
    },
  ]

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IndianRupee className="w-5 h-5" />
          Monthly Recurring Revenue
        </CardTitle>
        <CardDescription>Revenue breakdown by subscription plan</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="text-3xl font-bold">₹{revenue.total.toLocaleString("en-IN")}</div>
          <p className="text-sm text-muted-foreground">Total monthly revenue from active clients</p>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="glass rounded-lg border p-3 shadow-lg">
                      <p className="font-semibold">{payload[0].payload.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {payload[0].payload.count} client{payload[0].payload.count !== 1 ? "s" : ""}
                      </p>
                      <p className="text-sm font-medium">₹{payload[0].value?.toLocaleString("en-IN")}/month</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-xs text-muted-foreground">Basic</p>
            <p className="text-lg font-bold">₹{revenue.basic.toLocaleString("en-IN")}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <p className="text-xs text-muted-foreground">Pro</p>
            <p className="text-lg font-bold">₹{revenue.pro.toLocaleString("en-IN")}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs text-muted-foreground">Premium</p>
            <p className="text-lg font-bold">₹{revenue.premium.toLocaleString("en-IN")}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
