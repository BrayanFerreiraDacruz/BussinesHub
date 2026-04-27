import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import Clients from "./pages/Clients";
import Services from "./pages/Services";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import Payments from "./pages/Payments";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PublicBooking from "./pages/PublicBooking";
import MarketingKit from "./pages/MarketingKit";
import { useAuth } from "./_core/hooks/useAuth";
import { Spinner } from "./components/ui/spinner";

function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType<any>, path: string }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/register"} component={Register} />
      <Route path={"/book/:userId"} component={PublicBooking} />
      <Route path={"/marketing-kit"} component={MarketingKit} />
      
      <Route path="/dashboard">
        {(params) => <ProtectedRoute component={Dashboard} path="/dashboard" {...params} />}
      </Route>
      <Route path="/appointments">
        {(params) => <ProtectedRoute component={Appointments} path="/appointments" {...params} />}
      </Route>
      <Route path="/clients">
        {(params) => <ProtectedRoute component={Clients} path="/clients" {...params} />}
      </Route>
      <Route path="/services">
        {(params) => <ProtectedRoute component={Services} path="/services" {...params} />}
      </Route>
      <Route path="/reports">
        {(params) => <ProtectedRoute component={Reports} path="/reports" {...params} />}
      </Route>
      <Route path="/payments">
        {(params) => <ProtectedRoute component={Payments} path="/payments" {...params} />}
      </Route>
      <Route path="/notifications">
        {(params) => <ProtectedRoute component={Notifications} path="/notifications" {...params} />}
      </Route>

      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
