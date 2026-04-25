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
    <div className="flex min-h-screen bg-background relative">
      <div className="noise-bg opacity-[0.02]" />
      
      <Sidebar
        collapsible="icon"
        className="border-r border-border/50 bg-sidebar/50 backdrop-blur-xl"
      >
        <SidebarHeader className="h-24 justify-center px-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center p-2 pera-glow">
              <img src="/logo.png" alt="Pêra" className="w-full h-full object-contain animate-float" />
            </div>
            {!isCollapsed && (
              <span className="font-black text-2xl tracking-tighter text-foreground">
                Pêra
              </span>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className="px-3 pt-4">
          <SidebarMenu className="gap-2">
            {menuItems.map(item => {
              const isActive = location === item.path;
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={isActive}
                    onClick={() => setLocation(item.path)}
                    tooltip={item.label}
                    className={`h-12 rounded-2xl transition-all duration-300 font-bold px-4 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                        : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? "animate-pulse" : ""}`} />
                    <span className="ml-3 text-sm tracking-tight">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 rounded-2xl p-2 hover:bg-muted/50 transition-all w-full group">
                <Avatar className="h-10 w-10 border-2 border-primary/20 group-hover:border-primary transition-all">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-black truncate text-foreground leading-none">
                      {user?.name}
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                      Painel Profissional
                    </p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-border/50 shadow-2xl">
              <DropdownMenuItem onClick={logout} className="rounded-xl text-destructive font-bold focus:bg-destructive/10 focus:text-destructive cursor-pointer h-12 px-4">
                <LogOut className="mr-3 h-4 w-4" />
                <span>Encerrar Sessão</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-transparent overflow-hidden">
        {/* Modern Top Bar */}
        <header className="h-20 flex items-center justify-between px-8 bg-background/50 backdrop-blur-md border-b border-border/50 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black tracking-tight text-foreground">
              {activeMenuItem?.label ?? "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-2xl bg-muted/50 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all group"
            >
              {theme === "dark" ? <Sun className="w-5 h-5 group-hover:rotate-45 transition-transform" /> : <Moon className="w-5 h-5 group-hover:-rotate-12 transition-transform" />}
            </button>
            
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-primary/5 rounded-2xl border border-primary/10">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-bold text-primary uppercase tracking-tighter">Sistema Online</span>
            </div>
          </div>
        </header>

        <main className="p-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
}
