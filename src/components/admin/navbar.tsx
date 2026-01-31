'use client'

import { Menu, Search, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Navbar({ 
  companyName, 
  companyLogo, 
  userRole 
}: { 
  companyName?: string, 
  companyLogo?: string | null, 
  userRole?: string 
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border-b px-8 py-5">
      <div className="flex items-center gap-4">
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-white">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <Sidebar companyName={companyName} companyLogo={companyLogo} userRole={userRole} />
            </SheetContent>
        </Sheet>
        
        {/* Search Bar */}
        <div className="hidden md:flex relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
                placeholder="Deep search data..." 
                className="pl-10 bg-slate-50 border-none rounded-full focus-visible:ring-blue-500 focus-visible:bg-white transition-all"
            />
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
        </Button>

        <div className="flex items-center gap-3 pl-6 border-l">
            <div className="text-right hidden md:block">
                <div className="text-sm font-bold text-slate-900">Administrator</div>
                <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{userRole || "ADMIN"}</div>
            </div>
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm cursor-pointer">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">A</AvatarFallback>
            </Avatar>
        </div>
      </div>
    </div>
  )
}
