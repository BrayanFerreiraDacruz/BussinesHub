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
import { useIsMobile } from "@/hooks/useMobile";
import { useAuth } from "@/_core/hooks/useAuth";
import { LayoutDashboard, LogOut, Users, Calendar, ShoppingBag, BarChart3, MessageCircle, CreditCard, Sparkles, Sun, Moon } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
import { useTheme } from "@/contexts/ThemeContext";

const menuItems = [
  { icon: LayoutDashboard, label: "Visão Geral", path: "/dashboard" },
  { icon: Calendar, label: "Agenda", path: "/appointments" },
  { icon: Users, label: "Clientes", path: "/clients" },
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
  const [location, setLocation] = useLocation();
  const { user, logout, loading } = useAuth();

  if (loading) return <DashboardLayoutSkeleton />;
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
  const [location, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const activeMenuItem = menuItems.find(item => item.path === location);
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen bg-background relative text-black">
      <div className="noise-bg opacity-10" />
      
      <Sidebar
        collapsible="icon"
        className="border-r-2 border-black/10 bg-white"
      >
        <SidebarHeader className="h-20 justify-center px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center p-2 border-2 border-black">
              <img src="/logo.png" alt="Pêra" className="w-full h-full object-contain animate-float" />
            </div>
            {!isCollapsed && (
              <span className="font-black text-xl tracking-tighter text-black uppercase">
                Pêra
              </span>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 pt-4">
          <SidebarMenu className="gap-1">
            {menuItems.map(item => {
              const isActive = location === item.path;
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={isActive}
                    onClick={() => setLocation(item.path)}
                    tooltip={item.label}
                    className={`h-12 rounded-xl transition-all duration-200 font-bold px-4 ${
                      isActive
                        ? "bg-primary text-black border-2 border-black shadow-sm"
                        : "text-black/60 hover:bg-black/5"
                    }`}
                  >
                    <item.icon size={18} />
                    <span className="ml-3 text-xs tracking-tight uppercase">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 rounded-xl p-2 hover:bg-black/5 transition-all w-full group">
                <Avatar className="h-8 w-8 border-2 border-black">
                  <AvatarFallback className="bg-primary text-black font-black text-xs">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-xs font-black truncate text-black leading-none">
                      {user?.name}
                    </p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl p-2 border-2 border-black bg-white shadow-xl">
              <DropdownMenuItem onClick={logout} className="rounded-lg text-destructive font-bold text-xs uppercase tracking-widest focus:bg-destructive/10 focus:text-destructive cursor-pointer h-10 px-4">
                <LogOut size={14} className="mr-2" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-transparent overflow-hidden">
        <header className="h-16 flex items-center justify-between px-8 bg-white/60 backdrop-blur-md border-b-2 border-black/10 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-black tracking-widest text-black uppercase">
              {activeMenuItem?.label ?? "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl bg-black/5 flex items-center justify-center hover:bg-primary/20 transition-all"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border-2 border-black/10">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[9px] font-black text-black uppercase tracking-widest">ONLINE</span>
            </div>
          </div>
        </header>

        <main className="p-8 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
}
