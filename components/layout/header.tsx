"use client"

import { useState, useEffect } from "react"
import { Bell, User, Sparkles, Zap, LogOut, Settings } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
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
  const isMobile = useIsMobile()

  return (    <header className={cn("glass-morphism shadow-xl border border-white/40 relative overflow-hidden backdrop-blur-lg rounded-2xl mx-2 mt-2", className)}>
      {/* Enhanced background gradient with animated effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 via-purple-500/15 to-cyan-500/15 animate-gradient rounded-2xl"></div>
      <div className="absolute inset-0 bg-white/40 rounded-2xl"></div>
      
      {/* Light beams effect */}
      <div className="absolute -inset-40 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 rotate-45 transform translate-x-full blur-3xl"></div>
      <div className="absolute -inset-40 bg-gradient-to-tr from-purple-500/5 to-cyan-500/5 -rotate-45 transform -translate-x-full blur-3xl"></div>      
      
      <div className="relative z-10 flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4 md:px-6 py-3">        
        {/* Left section - Platform Info */}
        <div className="flex items-center">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="relative">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-3">
                <Sparkles className="h-4 w-4 text-white animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-ping"></div>
            </div>
            <div className="hidden sm:block">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">MediOca AI</h2>
              <p className="text-xs text-gray-600">Healthcare Platform</p>
            </div>
          </div>
        </div>
        
        {/* Center section - Status Indicators - hide on mobile */}
        <div className="hidden md:flex items-center justify-center gap-4">
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
        </div>
        
        {/* Right section - Action buttons and User */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile time display - compact and better formatted */}
          <div className="md:hidden flex items-center">
            {currentTime && (
              <div className="text-sm font-bold text-gray-900 bg-white/50 px-3 py-1 rounded-lg shadow-sm">
                {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            )}
          </div>
          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative glass-morphism hover:bg-white/70 p-2 sm:p-3 rounded-xl border border-white/30 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-md animate-bounce">
                {notifications}
              </span>
            )}
          </Button>
          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center glass-morphism px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-white/30 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group">
                <div className="relative mr-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                {/* Hide name on small mobile screens */}
                <div className="hidden xs:block">
                  <div className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-1">{getUserDisplayName()}</div>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass-morphism-dropdown">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="font-bold text-gray-800">{getUserDisplayName()}</p>
                  <p className="text-xs text-gray-600 break-all">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center py-2 hover:bg-gray-100 rounded-lg">
                <User className="mr-2 h-4 w-4 text-blue-600" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center py-2 hover:bg-gray-100 rounded-lg">
                <Settings className="mr-2 h-4 w-4 text-purple-600" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="flex items-center py-2 hover:bg-red-50 rounded-lg text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
