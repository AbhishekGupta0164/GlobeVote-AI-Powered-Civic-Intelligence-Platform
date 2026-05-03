import { AppLayout } from "./components/layout";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import NotFound from "@/pages/not-found";

import Home from "./pages/home";
import Chat from "./pages/chat";
import Guide from "./pages/guide";
import Countries from "./pages/countries";
import CountryDetail from "./pages/country-detail";
import Elections from "./pages/elections";
import ElectionDetail from "./pages/election-detail";
import Systems from "./pages/systems";
import Quiz from "./pages/quiz";
import Verify from "./pages/verify";
import News from "./pages/news";
import Profile from "./pages/profile";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/chat" component={Chat} />
        <Route path="/guide" component={Guide} />
        <Route path="/countries" component={Countries} />
        <Route path="/countries/:id" component={CountryDetail} />
        <Route path="/elections" component={Elections} />
        <Route path="/elections/:id" component={ElectionDetail} />
        <Route path="/systems" component={Systems} />
        <Route path="/quiz" component={Quiz} />
        <Route path="/verify" component={Verify} />
        <Route path="/news" component={News} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
