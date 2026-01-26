import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Bell, User, LayoutDashboard, FileText, ShieldCheck, Mail, LineChart, Truck, Target, Gavel, Landmark, Calculator, Store } from "lucide-react";

const sidebarNav = [
  {
    title: "Mission Control",
    items: [
      { href: "/dashboard", title: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/report", title: "My Live Report", icon: FileText },
      { href: "/dashboard/dispute-manager", title: "Dispute Manager", icon: ShieldCheck },
      { href: "/dashboard/letters", title: "Letters", icon: Mail },
    ],
  },
  {
    title: "Tracking & Results",
    items: [
      { href: "/dashboard/score-tracker", title: "Score Tracker", icon: LineChart },
      { href: "/dashboard/mailing-tracker", title: "Mailing Tracker", icon: Truck },
    ],
  },
  {
    title: "Advanced Tactics",
    items: [
      { href: "/dashboard/inquiries", title: "Inquiry Removal", icon: Target },
      { href: "/dashboard/debt-validation", title: "Debt Validation", icon: Gavel },
      { href: "/dashboard/cfpb", title: "CFPB Complaints", icon: Landmark },
    ],
  },
  {
    title: "Credit Building",
    items: [
      { href: "/dashboard/simulator", title: "Score Simulator", icon: Calculator },
      { href: "/dashboard/marketplace", title: "Marketplace", icon: Store },
    ],
  },
];

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <Sidebar />
        <div className="flex flex-col">
          <Header />
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="">DisputeStrike</span>
          </Link>
        </div>
        <div className="flex-1">
          <ScrollArea className="h-full">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {sidebarNav.map((section) => (
                <div key={section.title} className="py-2">
                  <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                    {section.title}
                  </h2>
                  {section.items.map((item) => (
                    <NavItem key={item.href} href={item.href} title={item.title} icon={item.icon} />
                  ))}
                </div>
              ))}
            </nav>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <MobileSidebar />
      <div className="w-full flex-1"></div>
      <Button variant="ghost" size="icon" className="rounded-full">
        <Bell className="h-4 w-4" />
        <span className="sr-only">Toggle notifications</span>
      </Button>
      <Button variant="ghost" size="icon" className="rounded-full">
        <User className="h-4 w-4" />
        <span className="sr-only">Toggle user menu</span>
      </Button>
    </header>
  );
}

function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <nav className="grid gap-2 text-lg font-medium">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold mb-4"
          >
            <span className="">DisputeStrike</span>
          </Link>
          {sidebarNav.map((section) => (
            <div key={section.title} className="py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                {section.title}
              </h2>
              {section.items.map((item) => (
                <NavItem key={item.href} href={item.href} title={item.title} icon={item.icon} />
              ))}
            </div>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function NavItem({ href, title, icon: Icon }) {
  const [isActive] = useLocation(href);
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
        isActive && "bg-muted text-primary"
      )}
    >
      <Icon className="h-4 w-4" />
      {title}
    </Link>
  );
}
