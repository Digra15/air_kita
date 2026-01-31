'use client'

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"
 

export function Navbar() {
  const isMounted = typeof window !== "undefined"
  if (!isMounted) return null

  return (
    <div className="flex items-center p-4">
      <Sheet>
        <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
                <Menu />
            </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 bg-[#111827]">
            <Sidebar />
        </SheetContent>
      </Sheet>
      
      <div className="flex w-full justify-end">
        {/* User Button Placeholder */}
        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            A
        </div>
      </div>
    </div>
  )
}
