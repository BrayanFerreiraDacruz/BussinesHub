import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { LayoutDashboard, LogOut, PanelLeft, Users, Calendar, ShoppingBag, BarChart3, MessageCircle, Moon, Sun, Search, Bell, Settings, CreditCard } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const menuItems = [
  { icon: LayoutDashboard, label: "Visão Geral", path: "/dashboard" },
  { icon: Calendar, label: "Minha Agenda", path: "/appointments" },
  { icon: Users, label: "Minhas Clientes", path: "/clients" },
  { icon: ShoppingBag, label: "Serviços", path: "/services" },
  { icon: BarChart3, label: "Relatórios", path: "/reports" },
  { icon: CreditCard, label: "Financeiro", path: "/payments" },
  { icon: MessageCircle, label: "WhatsApp", path: "/notifications" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, user } = useAuth();

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  return (
    <SidebarProvider>
      <DashboardLayoutContent>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [location, setLocation] = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const activeMenuItem = menuItems.find(item => item.path === location);
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen bg-[#F5F4D7] relative text-black">
      <div className="noise-bg opacity-20" />
      
      <Sidebar
        collapsible="icon"
        className="border-r-[6px] border-black bg-white"
      >
        <SidebarHeader className="h-32 justify-center px-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-[1.25rem] bg-primary flex items-center justify-center p-3 border-4 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
              <img src="/logo.png" alt="Pêra" className="w-full h-full object-contain animate-float" />
            </div>
            {!isCollapsed && (
              <span className="font-black text-3xl tracking-tighter text-black uppercase">
                Pêra
              </span>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className="px-4 pt-8">
          <SidebarMenu className="gap-4">
            {menuItems.map(item => {
              const isActive = location === item.path;
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={isActive}
                    onClick={() => setLocation(item.path)}
                    tooltip={item.label}
                    className={`h-16 rounded-2xl transition-all duration-300 font-black px-6 border-4 border-transparent ${
                      isActive
                        ? "bg-primary text-black border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] scale-[1.02]"
                        : "text-black/60 hover:bg-black/5 hover:text-black"
                    }`}
                  >
                    <item.icon className={`w-6 h-6 ${isActive ? "animate-pulse" : ""}`} />
                    <span className="ml-4 text-base tracking-tight uppercase">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-4 rounded-2xl p-3 hover:bg-black/5 transition-all w-full group border-4 border-transparent hover:border-black">
                <Avatar className="h-12 w-12 border-4 border-black shadow-lg">
                  <AvatarFallback className="bg-primary text-black font-black text-lg">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-base font-black truncate text-black leading-none">
                      {user?.name}
                    </p>
                    <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mt-2">
                      PRO PLAN
                    </p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-[2rem] p-3 border-4 border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] bg-white">
              <DropdownMenuItem onClick={logout} className="rounded-xl text-destructive font-black uppercase tracking-widest focus:bg-destructive/10 focus:text-destructive cursor-pointer h-14 px-6">
                <LogOut className="mr-4 h-5 w-5" />
                <span>Sair do App</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-transparent overflow-hidden">
        {/* Modern Top Bar */}
        <header className="h-24 flex items-center justify-between px-10 bg-white/80 backdrop-blur-md border-b-[6px] border-black sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <h2 className="text-3xl font-black tracking-tighter text-black uppercase">
              {activeMenuItem?.label ?? "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={toggleTheme}
              className="w-14 h-14 rounded-2xl bg-black/5 flex items-center justify-center hover:bg-primary/20 transition-all group border-4 border-transparent hover:border-black"
            >
              {theme === "dark" ? <Sun className="w-6 h-6 group-hover:rotate-90 transition-transform" /> : <Moon className="w-6 h-6 group-hover:-rotate-12 transition-transform" />}
            </button>
            
            <div className="hidden sm:flex items-center gap-4 px-6 py-3 bg-primary/10 rounded-full border-4 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse border-2 border-black" />
              <span className="text-xs font-black text-black uppercase tracking-[0.2em]">SISTEMA ONLINE</span>
            </div>
          </div>
        </header>

        <main className="p-12 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
}
