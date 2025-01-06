import AppSidebar from "@/components/AppSidebar";
import Hero from "@/components/Hero";

import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { auth } from "@/server/auth";

export default async function DashBoardLayout({
    children
}: { children: React.ReactNode }) {
    const session = await auth();

    const navigation = [
        { title: "Partners", path: "javascript:void(0)" },
        { title: "Customers", path: "javascript:void(0)" },
        { title: "Team", path: "javascript:void(0)" },
      ];
    if (session?.user){
        return(
            <SidebarProvider>
                <AppSidebar/>
                <SidebarInset>
                    <header className="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbPage>October 2024</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </header>
                    <div className="flex flex-1 flex-col gap-4 p-4">
                        {children}
                    </div>
                    
                </SidebarInset>
            </SidebarProvider>
        )
    }
    return (
        <Hero/>
    )
}