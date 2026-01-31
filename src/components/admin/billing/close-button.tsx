'use client'

import { Button } from "@/components/ui/button"

export default function CloseButton() {
    return (
        <Button 
            variant="ghost" 
            className="flex-1 font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-200"
            onClick={() => window.close()}
        >
            Tutup
        </Button>
    )
}
