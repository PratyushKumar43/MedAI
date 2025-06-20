"use client"

import { useState, useEffect } from "react"
import { Search, Bell, User, Mic, MicOff, Sparkles, Zap, Shield, LogOut, Settings } from "lucide-react"
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
  const [isListening, setIsListening] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [notifications] = useState(5)
  const { user, signOut } = useAuth()

  useEffect(() => {
    // Initialize time on client side to avoid hydration mismatch
    setCurrentTime(new Date())
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const toggleVoiceSearch = () => {
    setIsListening(!isListening)
    // Voice search implementation would go here
  }

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
      <div className="absolute -inset-40 bg-gradient-to-tr from-purple-500/5 to-cyan-500/5 -rotate-45 transform -translate-x-full blur-3xl"></div>

      <div className="relative z-10 flex flex-wrap md:flex-nowrap items-center gap-4 px-4 md:px-6 py-4"> {/* Removed left margin */}
        {/* Left section - Search and AI */}
        <div className="w-full md:w-[30%] mb-2 md:mb-0"> {/* Made responsive */}
          {/* AI-Powered Search */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative flex items-center bg-white/80 backdrop-blur-xl rounded-xl border border-white/30 shadow-lg">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Ask AI: symptoms, patients, diagnoses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-12 py-2.5 bg-transparent border-none focus:outline-none focus:ring-0 w-full text-gray-800 placeholder-gray-500 text-sm"
              />
              <button
                onClick={toggleVoiceSearch}
                className={cn(
                  "absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-lg transition-all duration-300",
                  isListening
                    ? "bg-red-500 text-white animate-pulse shadow-md"
                    : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-md hover:scale-105",
                )}
              >
                {isListening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* Center section - Stats + Time */}
        <div className="w-full md:w-[40%] flex flex-wrap md:flex-nowrap items-center justify-center gap-2 md:gap-4 mb-2 md:mb-0"> {/* Made responsive */}
          {/* Real-time Stats */}
          <div className="flex items-center space-x-2">
            <div className="glass-morphism px-2 md:px-3 py-1.5 rounded-lg border border-green-200/50">
              <div className="flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-800 text-xs font-semibold">8 Online</span>
              </div>
            </div>
            <div className="glass-morphism px-2 md:px-3 py-1.5 rounded-lg border border-purple-200/50">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="h-3 w-3 text-purple-600 animate-pulse" />
                <span className="text-purple-800 text-xs font-semibold">AI Active</span>
              </div>
            </div>
          </div>
            {/* Time Display */}
          <div className="glass-morphism px-4 py-2 rounded-xl border border-white/30 shadow-md">
            {currentTime ? (
              <>
                <div className="text-sm font-semibold text-gray-800 text-center">{currentTime.toLocaleTimeString()}</div>
                <div className="text-xs text-center text-gray-500">{currentTime.toLocaleDateString()}</div>
              </>
            ) : (
              <>
                <div className="text-sm font-semibold text-gray-800 text-center">--:--:--</div>
                <div className="text-xs text-center text-gray-500">--/--/----</div>
              </>
            )}
          </div>
        </div>

        {/* Right section - Action buttons */}
        <div className="w-full md:w-[30%] flex items-center justify-center md:justify-end gap-2 md:gap-3"> {/* Made responsive */}
          {/* Emergency Button */}
          <Button className="relative bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm font-semibold">
            <Shield className="h-3 w-3 mr-1.5" />
            SOS
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
          </Button>

          {/* Notifications */}
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="relative glass-morphism hover:bg-white/60 p-2 rounded-lg border border-white/30 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <Bell className="h-4 w-4 text-gray-700" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold shadow-md animate-bounce">
                  {notifications}
                </span>
              )}
            </Button>
          </div>          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center glass-morphism px-3 py-1.5 rounded-lg border border-white/30 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group">
                <div className="relative mr-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border border-white"></div>
                </div>                <div>
                  <div className="text-xs font-semibold text-gray-900">{getUserDisplayName()}</div>
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
