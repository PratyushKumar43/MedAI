"use client"

import { useState, useEffect } from "react"
import { Bell, User, Sparkles, Zap, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/providers/auth-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [notifications] = useState(5)
  const { user, signOut } = useAuth()
  useEffect(() => {
    // Initialize time on client side to avoid hydration mismatch
    setCurrentTime(new Date())
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getUserDisplayName = () => {
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
    }
    return user?.email?.split('@')[0] || 'User'
  }

  const getUserRole = () => {
    return user?.user_metadata?.role || 'Patient'
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className={cn("glass-morphism shadow-xl border border-white/40 relative overflow-hidden backdrop-blur-md rounded-2xl mx-2 mt-2", className)}>
      {/* Enhanced background gradient with animated effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 animate-gradient rounded-2xl"></div>
      <div className="absolute inset-0 bg-white/20 rounded-2xl"></div>
      
      {/* Light beams effect */}
      <div className="absolute -inset-40 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 rotate-45 transform translate-x-full blur-3xl"></div>
      <div className="absolute -inset-40 bg-gradient-to-tr from-purple-500/5 to-cyan-500/5 -rotate-45 transform -translate-x-full blur-3xl"></div>      <div className="relative z-10 flex items-center justify-between gap-4 px-4 md:px-6 py-2">        {/* Left section - Platform Info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-3">
                <Sparkles className="h-4 w-4 text-white animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-ping"></div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">MediOca AI</h2>
              <p className="text-xs text-gray-600">Healthcare Platform</p>
            </div>
          </div>
        </div>{/* Center section - Status Indicators */}
        <div className="flex items-center justify-center gap-4">
          {/* AI Status */}
          <div className="glass-morphism px-4 py-2 rounded-xl border border-purple-200/50 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-purple-600 animate-pulse" />
              <span className="text-purple-800 text-sm font-semibold">AI Active</span>
            </div>
          </div>
            {/* Time Display */}
          <div className="glass-morphism px-4 py-2 rounded-xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
            {currentTime ? (
              <>
                <div className="text-base font-bold text-gray-900 text-center">{currentTime.toLocaleTimeString()}</div>
                <div className="text-xs text-center text-gray-600 font-medium">{currentTime.toLocaleDateString()}</div>
              </>
            ) : (
              <>
                <div className="text-base font-bold text-gray-900 text-center">--:--:--</div>
                <div className="text-xs text-center text-gray-600 font-medium">--/--/----</div>
              </>
            )}
          </div>
        </div>        {/* Right section - Action buttons and User */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative glass-morphism hover:bg-white/70 p-3 rounded-xl border border-white/30 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <Bell className="h-5 w-5 text-gray-700" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-md animate-bounce">
                {notifications}
              </span>
            )}
          </Button>          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center glass-morphism px-3 py-2 rounded-xl border border-white/30 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group">
                <div className="relative mr-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{getUserDisplayName()}</div>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
