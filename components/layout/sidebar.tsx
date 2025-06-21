"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  Users,
  UserCheck,
  FileText,
  Brain,
  Video,
  BarChart3,
  Stethoscope,
  MessageSquare,
  Shield,
  Sparkles,
  Activity,
  X
} from "lucide-react"
import { useState, useEffect } from "react"
import { useIsMobile } from "@/hooks/use-mobile"

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navigation = [
  {
    name: "AI Dashboard",
    href: "/AI-dashboard",
    icon: Brain,
    color: "text-purple-600",
    badge: "AI",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    name: "Smart Chat",
    href: "/chat",
    icon: MessageSquare,
    color: "text-cyan-600",
    badge: "AI",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    name: "Doctors",
    href: "/doctors",
    icon: UserCheck,
    color: "text-indigo-600",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    name: "Patients",
    href: "/patients",
    icon: Users,
    color: "text-emerald-600",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    name: "Prescriptions",
    href: "/prescriptions",
    icon: FileText,
    color: "text-orange-600",
    gradient: "from-orange-500 to-red-500",
  },
  {
    name: "Health Monitor",
    href: "/health-monitor",
    icon: Stethoscope,
    color: "text-red-600",
    badge: "IoT",
    gradient: "from-red-500 to-pink-500",
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    color: "text-violet-600",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    name: "Emergency",
    href: "/emergency",
    icon: Shield,
    color: "text-red-600",
    badge: "SOS",
    gradient: "from-red-600 to-red-700",
  },
]

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const isMobile = useIsMobile()
  
  // Close sidebar when pressing Escape key on mobile
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobile && onClose) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isMobile, onClose]);

  // Handle click outside to close on mobile
  useEffect(() => {
    if (!isMobile) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.getElementById('sidebar-container');
      if (sidebar && !sidebar.contains(e.target as Node) && onClose) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isMobile, onClose]);

  if (!isOpen && isMobile) return null;

  return (
    <>
      {/* Responsive Sidebar */}
      <div 
        id="sidebar-container"
        className={cn(
          "fixed top-0 left-0 h-full flex flex-col glass-morphism shadow-2xl border-r border-white/30 overflow-hidden z-40 transition-all duration-300",
          isMobile ? (isOpen ? "translate-x-0 w-[280px]" : "-translate-x-full w-[280px]") : "w-64"
        )}
      >
        {/* Close button - mobile only */}
        {isMobile && onClose && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition-all z-50"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        )}
      {/* Header */}
      <div className="relative h-24 px-6 flex items-center bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-xl border border-white/30 transition-all duration-300 hover:scale-110 hover:rotate-6 cursor-pointer group">
              <img 
                src="/favicon.ico" 
                alt="MediOca Logo" 
                className="h-8 w-8 text-white transition-all duration-300 group-hover:scale-110"
                onError={(e) => {
                  // Fallback to emoji if logo doesn't load
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) {
                    fallback.style.display = 'block';
                  }
                }}
              />
              <span className="text-2xl hidden">🏥</span>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-ping"></div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <div className="transition-all duration-300 hover:scale-105">
            <h1 className="text-2xl font-bold text-white font-poppins tracking-tight">MediOca</h1>
            <p className="text-blue-100 text-sm font-medium opacity-90">Healthcare Platform</p>
          </div>
        </div>

        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 animate-bounce"></div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const isHovered = hoveredItem === item.name

          return (
            <Link
              key={item.name}
              href={item.href}
              onMouseEnter={() => setHoveredItem(item.name)}
              onMouseLeave={() => setHoveredItem(null)}
              className={cn(
                "group relative flex items-center justify-between px-4 py-4 text-sm font-semibold rounded-2xl transition-all duration-300 transform",
                isActive
                  ? "bg-gradient-to-r text-white shadow-xl scale-105 border border-white/20"
                  : "text-gray-700 hover:bg-white/60 hover:shadow-lg hover:scale-102 hover:text-gray-900",
                isActive && `bg-gradient-to-r ${item.gradient}`,
              )}
            >
              <div className="flex items-center space-x-4">
                <div
                  className={cn(
                    "relative p-2 rounded-xl transition-all duration-300",
                    isActive ? "bg-white/20 shadow-lg" : isHovered ? "bg-white/80 shadow-md scale-110" : "bg-white/40",
                  )}
                >
                  <item.icon
                    className={cn("h-5 w-5 transition-all duration-300", isActive ? "text-white" : item.color)}
                  />
                  {isActive && <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse"></div>}
                </div>
                <span className="font-poppins font-medium">{item.name}</span>
              </div>

              {item.badge && (
                <div
                  className={cn(
                    "px-3 py-1 text-xs font-bold rounded-full transition-all duration-300",
                    isActive
                      ? "bg-white/30 text-white shadow-lg"
                      : "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md",
                    isHovered && !isActive && "scale-110 shadow-lg",
                  )}
                >
                  {item.badge}
                </div>
              )}

              {/* Hover effect */}
              {isHovered && !isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-2xl"></div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Status Panel */}
      <div className="p-4 border-t border-white/20">
        <div className="glass-morphism rounded-2xl p-4 border border-white/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
              <span className="text-sm font-semibold text-gray-800">Generic AI</span>
            </div>
            <Activity className="h-4 w-4 text-green-500 animate-pulse" />
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-semibold text-green-600">Online</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Response Time:</span>
              <span className="font-semibold text-blue-600">0.8s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Accuracy:</span>
              <span className="font-semibold text-purple-600">98.5%</span>
            </div>
          </div>

          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full w-full animate-pulse"></div>
          </div>        </div>
      </div>
    </div>
    </>
  )
}
