import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: number
  icon: LucideIcon
  color: "blue" | "green" | "purple" | "orange"
  loading?: boolean
}

const colorClasses = {
  blue: "bg-blue-500 text-blue-600 bg-blue-50",
  green: "bg-green-500 text-green-600 bg-green-50",
  purple: "bg-purple-500 text-purple-600 bg-purple-50",
  orange: "bg-orange-500 text-orange-600 bg-orange-50",
}

export function StatsCard({ title, value, icon: Icon, color, loading }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {loading ? <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" /> : value.toLocaleString()}
          </p>
        </div>
        <div
          className={cn(
            "p-3 rounded-full",
            color === "blue" && "bg-blue-50",
            color === "green" && "bg-green-50",
            color === "purple" && "bg-purple-50",
            color === "orange" && "bg-orange-50",
          )}
        >
          <Icon
            className={cn(
              "h-6 w-6",
              color === "blue" && "text-blue-600",
              color === "green" && "text-green-600",
              color === "purple" && "text-purple-600",
              color === "orange" && "text-orange-600",
            )}
          />
        </div>
      </div>
    </div>
  )
}
