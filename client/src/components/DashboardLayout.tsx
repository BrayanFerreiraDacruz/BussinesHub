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
import { LayoutDashboard, LogOut, Users, Calendar, ShoppingBag, BarChart3, MessageCircle, CreditCard, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";

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
  const { loading, user } = useAuth();

  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  if (loading) return <DashboardLayoutSkeleton />;
  if (!user) {
    window.location.href = "/login";
    return null;
  }

  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { toggleSidebar, state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const activeMenuItem = menuItems.find(item => item.path === location);
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen bg-[#F8F7E5] relative text-black overflow-x-hidden w-full">
      {/* CHUVA MASSIVA DE PÊRAS NO FUNDO */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.05] overflow-hidden -z-0">
        {[...Array(35)].map((_, i) => (
          <img 
            key={i} 
            src="/logo.png" 
            className="absolute animate-float drop-shadow-xl" 
            style={{
              top: `${Math.random() * 110 - 5}%`,
              left: `${Math.random() * 110 - 5}%`,
              width: `${i % 5 === 0 ? 200 : i % 3 === 0 ? 120 : 60}px`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 20}s`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
            alt="" 
          />
        ))}
      </div>

      <div className="noise-bg opacity-20" />
      
      <Sidebar
        collapsible="icon"
        className="border-r-[6px] border-black bg-white shadow-2xl z-50"
      >
        <SidebarHeader className="h-32 justify-center px-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-[1.5rem] bg-primary flex items-center justify-center p-3 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <img src="/logo.png" alt="Pêra" className="w-full h-full object-contain animate-pulse" />
            </div>
            {!isCollapsed && (
              <span className="font-black text-3xl tracking-tighter text-black uppercase italic">Pêra</span>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className="px-4 pt-8">
          <SidebarMenu className="gap-3">
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
                    <item.icon size={28} />
                    <span className="ml-4 text-base tracking-tighter uppercase">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-6 border-t-4 border-black/5">
          <Button 
            onClick={logout} 
            variant="ghost" 
            className="w-full h-16 rounded-2xl text-destructive font-black uppercase tracking-[0.2em] hover:bg-destructive/10 gap-3 border-2 border-transparent hover:border-destructive/20"
          >
            <LogOut size={24} />
            {!isCollapsed && <span>Sair</span>}
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-transparent relative z-10 flex flex-col w-full min-w-0">
        {/* HEADER RESPONSIVO MASTER - FULL WIDTH */}
        <header className="h-24 md:h-32 flex items-center justify-between px-6 md:px-12 bg-white/80 backdrop-blur-xl border-b-[6px] border-black sticky top-0 z-40 w-full">
          <div className="flex items-center gap-6">
            <button 
              onClick={toggleSidebar}
              className="group flex items-center gap-4 active:scale-90 transition-transform"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.75rem] bg-primary flex items-center justify-center p-3 border-[5px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-[3px] group-hover:translate-y-[3px] transition-all">
                <img src="/logo.png" alt="Menu" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-3xl md:text-4xl font-black tracking-[calc(-0.05em)] uppercase leading-none">Pêra</span>
                <span className="text-[10px] md:text-xs font-black text-primary uppercase tracking-[0.3em] mt-1 bg-black text-white px-2 py-0.5 rounded-md">Abrir Menu</span>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-6">
            <h2 className="hidden lg:block text-lg font-black tracking-[0.4em] text-black uppercase opacity-20">
              {activeMenuItem?.label ?? "Painel"}
            </h2>
            
            <div className="flex items-center gap-4 px-6 py-3 bg-black text-white rounded-full border-4 border-primary shadow-[6px_6px_0px_0px_rgba(120,190,32,1)]">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse border-2 border-black" />
              <span className="text-xs font-black uppercase tracking-[0.2em] hidden sm:inline">Online</span>
            </div>
            
            <Avatar className="h-14 w-14 border-4 border-black shadow-lg hidden sm:flex ring-4 ring-primary/20">
              <AvatarFallback className="bg-primary text-black font-black text-xl uppercase italic">
                {user?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="p-4 md:p-8 w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 flex-1 min-w-0">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
}
