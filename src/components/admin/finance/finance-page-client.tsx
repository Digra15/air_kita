'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
    Wallet, 
    Landmark, 
    TrendingUp, 
    TrendingDown, 
    DollarSign,
    Plus,
    Search,
    Pencil,
    Trash2,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    Briefcase,
    Filter,
    Download
} from "lucide-react"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { toast } from "sonner"
import { createTransaction, deleteTransaction, updateTransaction } from "@/lib/actions/finance"
import { cn } from "@/lib/utils"

// Types matching Prisma
type TransactionType = 'CAPITAL' | 'REVENUE' | 'OTHER_INCOME' | 'EXPENSE'

interface Transaction {
    id: string
    type: TransactionType
    amount: number
    category: string
    description: string
    date: string
    createdAt: string
}

interface FinancePageClientProps {
    initialSummary: {
        capital: number
        income: number
        expense: number
        revenue: number
        totalIncome: number
        currentCash: number
    }
    initialTransactions: Transaction[]
}

import { useRouter } from "next/navigation"

// ... imports

export function FinancePageClient({ initialSummary, initialTransactions }: FinancePageClientProps) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("summary")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    // Edit & Delete State
    const [editingId, setEditingId] = useState<string | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        type: "EXPENSE" as TransactionType,
        amount: "",
        category: "",
        description: "",
        date: new Date().toISOString().split('T')[0]
    })

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value)
    }

    // Filter transactions based on active tab and search
    const getFilteredTransactions = () => {
        let filtered = initialTransactions
        
        if (activeTab === "capital") {
            filtered = filtered.filter(t => t.type === "CAPITAL")
        } else if (activeTab === "other_income") {
            filtered = filtered.filter(t => t.type === "OTHER_INCOME")
        } else if (activeTab === "expense") {
            filtered = filtered.filter(t => t.type === "EXPENSE")
        }

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase()
            filtered = filtered.filter(t => 
                t.description.toLowerCase().includes(lowerSearch) || 
                t.category.toLowerCase().includes(lowerSearch)
            )
        }

        return filtered
    }

    const filteredTransactions = getFilteredTransactions()

    // Calculate Expense Allocation
    const expenseAllocation = initialTransactions
        .filter(t => t.type === "EXPENSE")
        .reduce((acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + curr.amount
            return acc
        }, {} as Record<string, number>)
    
    const totalExpenses = initialSummary.expense || 1 // Avoid division by zero

    // Calculate Capital Stats
    const capitalTransactions = initialTransactions.filter(t => t.type === "CAPITAL")
    const totalCapital = capitalTransactions.reduce((sum, t) => sum + t.amount, 0)
    
    const capitalByCategory = capitalTransactions.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
    }, {} as Record<string, number>)
    
    const topCapitalCategories = Object.entries(capitalByCategory)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 2)
    
    // Calculate Other Income Stats
    const otherIncomeTransactions = initialTransactions.filter(t => t.type === "OTHER_INCOME")
    const totalOtherIncome = otherIncomeTransactions.reduce((sum, t) => sum + t.amount, 0)
    
    const otherIncomeByCategory = otherIncomeTransactions.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
    }, {} as Record<string, number>)
    
    const topOtherIncomeCategories = Object.entries(otherIncomeByCategory)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 2)

    // Calculate Expense Stats
    const expenseTransactions = initialTransactions.filter(t => t.type === "EXPENSE")
    const totalExpenseValue = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)
    
    const expenseByCategory = expenseTransactions.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
    }, {} as Record<string, number>)
    
    // Ensure we have at least 4 items for the UI (fill with placeholders if needed)
    const topExpenseCategoriesRaw = Object.entries(expenseByCategory)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
    
    const topExpenseCategories = [...topExpenseCategoriesRaw]
    
    const handleExportExpensePDF = () => {
        const doc = new jsPDF()
        
        // Add Header
        doc.setFontSize(18)
        doc.text("Laporan Pengeluaran Operasional", 14, 20)
        
        doc.setFontSize(10)
        doc.text(`Total Pengeluaran: ${formatCurrency(totalExpenseValue)}`, 14, 30)
        doc.text(`Tanggal Cetak: ${format(new Date(), "dd MMMM yyyy", { locale: localeId })}`, 14, 36)
        
        // Prepare table data
        const tableData = expenseTransactions.map(t => [
            t.description,
            t.category,
            "Admin", // Static PIC
            "APPROVED", // Static Status
            format(new Date(t.date), "dd MMM yyyy", { locale: localeId }),
            `- ${formatCurrency(t.amount)}`
        ])

        // Add Table
        autoTable(doc, {
            startY: 45,
            head: [['Deskripsi', 'Kategori', 'PIC', 'Status', 'Tanggal', 'Jumlah']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [220, 38, 38] }, // Red header
            styles: { fontSize: 9 },
            columnStyles: {
                0: { cellWidth: 60 },
                5: { halign: 'right', textColor: [220, 38, 38] }
            }
        })

        doc.save(`laporan-pengeluaran-${format(new Date(), "yyyy-MM-dd")}.pdf`)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            let result;
            
            if (editingId) {
                result = await updateTransaction(editingId, {
                    type: formData.type,
                    amount: Number(formData.amount),
                    category: formData.category,
                    description: formData.description,
                    date: new Date(formData.date)
                })
            } else {
                result = await createTransaction({
                    type: formData.type,
                    amount: Number(formData.amount),
                    category: formData.category,
                    description: formData.description,
                    date: new Date(formData.date)
                })
            }

            if (result.success) {
                toast.success(result.message)
                setIsDialogOpen(false)
                setEditingId(null)
                setFormData({
                    type: "EXPENSE",
                    amount: "",
                    category: "",
                    description: "",
                    date: new Date().toISOString().split('T')[0]
                })
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            toast.error("Terjadi kesalahan")
        } finally {
            setIsLoading(false)
        }
    }

    const openDeleteDialog = (id: string) => {
        setDeleteId(id)
        setIsDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!deleteId) return

        const result = await deleteTransaction(deleteId)
        if (result.success) {
            toast.success(result.message)
        } else {
            toast.error(result.message)
        }
        setIsDeleteDialogOpen(false)
        setDeleteId(null)
    }

    const openAddDialog = (type: TransactionType) => {
        setEditingId(null)
        setFormData({
            type: type,
            amount: "",
            category: "",
            description: "",
            date: new Date().toISOString().split('T')[0]
        })
        setIsDialogOpen(true)
    }

    const openEditDialog = (transaction: Transaction) => {
        setEditingId(transaction.id)
        setFormData({
            type: transaction.type,
            amount: transaction.amount.toString(),
            category: transaction.category,
            description: transaction.description,
            date: new Date(transaction.date).toISOString().split('T')[0]
        })
        setIsDialogOpen(true)
    }

    const handleExportPDF = () => {
        const doc = new jsPDF()
        
        // Add Header
        doc.setFontSize(18)
        doc.text("Laporan Pemasukan Lain", 14, 20)
        
        doc.setFontSize(10)
        doc.text(`Total Pemasukan: ${formatCurrency(totalOtherIncome)}`, 14, 30)
        doc.text(`Tanggal Cetak: ${format(new Date(), "dd MMMM yyyy", { locale: localeId })}`, 14, 36)
        
        // Prepare table data
        const tableData = otherIncomeTransactions.map(t => [
            t.description,
            t.category,
            format(new Date(t.date), "dd MMM yyyy", { locale: localeId }),
            formatCurrency(t.amount)
        ])

        // Add Table
        autoTable(doc, {
            startY: 45,
            head: [['Uraian Pemasukan', 'Kategori', 'Tanggal', 'Jumlah']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [22, 163, 74] }, // Green header
            styles: { fontSize: 9 },
            columnStyles: {
                0: { cellWidth: 80 },
                3: { halign: 'right' }
            }
        })

        doc.save(`laporan-pemasukan-lain-${format(new Date(), "yyyy-MM-dd")}.pdf`)
    }

    const handleHeaderAddClick = () => {
        let type: TransactionType = "EXPENSE"
        if (activeTab === "capital") type = "CAPITAL"
        else if (activeTab === "other_income") type = "OTHER_INCOME"
        
        openAddDialog(type)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Manajemen Keuangan</h2>
                    <p className="text-muted-foreground">Kelola kas, modal awal, dan laporan pengeluaran operasional.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push('/admin/reports?tab=accounting')}>
                        <Search className="mr-2 h-4 w-4" />
                        Laporan Keuangan
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleHeaderAddClick}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Transaksi
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="summary" className="gap-2 data-[state=active]:text-blue-600">
                        <PieChart className="h-4 w-4" />
                        Ringkasan
                    </TabsTrigger>
                    <TabsTrigger value="capital" className="gap-2 data-[state=active]:text-blue-600">
                        <Landmark className="h-4 w-4" />
                        Modal Awal
                    </TabsTrigger>
                    <TabsTrigger value="other_income" className="gap-2 data-[state=active]:text-blue-600">
                        <TrendingUp className="h-4 w-4" />
                        Pemasukan Lain
                    </TabsTrigger>
                    <TabsTrigger value="expense" className="gap-2 data-[state=active]:text-blue-600">
                        <TrendingDown className="h-4 w-4" />
                        Pengeluaran
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 animate-in zoom-in duration-500 delay-200">
                                        <Wallet className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase">Kas Perusahaan</p>
                                        <h3 className="text-xl font-bold">{formatCurrency(initialSummary.currentCash)}</h3>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 animate-in zoom-in duration-500 delay-300">
                                        <ArrowUpRight className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase">Total Pemasukan</p>
                                        <h3 className="text-xl font-bold">{formatCurrency(initialSummary.totalIncome)}</h3>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 animate-in zoom-in duration-500 delay-400">
                                        <ArrowDownRight className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase">Total Pengeluaran</p>
                                        <h3 className="text-xl font-bold">{formatCurrency(initialSummary.expense)}</h3>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 animate-in zoom-in duration-500 delay-500">
                                        <Briefcase className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase">Total Modal</p>
                                        <h3 className="text-xl font-bold">{formatCurrency(initialSummary.capital)}</h3>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Recent Transactions */}
                        <Card className="md:col-span-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg">Aliran Kas Terakhir</CardTitle>
                                    <Button variant="ghost" size="sm" className="text-blue-600">Lihat Semua</Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>TRANSAKSI</TableHead>
                                            <TableHead>KATEGORI</TableHead>
                                            <TableHead>TANGGAL</TableHead>
                                            <TableHead className="text-right">JUMLAH</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {initialTransactions.slice(0, 5).map((t) => (
                                            <TableRow key={t.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex flex-col">
                                                        <span>{t.description}</span>
                                                        <span className="text-xs text-muted-foreground md:hidden">{t.category}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <Badge variant="secondary" className="font-normal text-xs uppercase">
                                                        {t.category}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {format(new Date(t.date), "d MMM yyyy", { locale: localeId })}
                                                </TableCell>
                                                <TableCell className={cn(
                                                    "text-right font-bold",
                                                    (t.type === "EXPENSE") ? "text-red-600" : "text-emerald-600"
                                                )}>
                                                    {(t.type === "EXPENSE") ? "-" : "+"} {formatCurrency(t.amount)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {initialTransactions.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                                                    Belum ada transaksi tercatat
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Allocation */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <PieChart className="h-5 w-5 text-blue-500" />
                                    Alokasi Pengeluaran
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {Object.entries(expenseAllocation).length > 0 ? (
                                    Object.entries(expenseAllocation).map(([category, amount]) => {
                                        const percentage = Math.round((amount / totalExpenses) * 100)
                                        return (
                                            <div key={category} className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-medium uppercase text-muted-foreground">{category}</span>
                                                    <span className="font-bold">{percentage}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-right text-muted-foreground">{formatCurrency(amount)}</p>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground text-sm">
                                        Belum ada data pengeluaran
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Capital Tab - Custom Design */}
                <TabsContent value="capital" className="space-y-6">
                    {/* Blue Card */}
                    <div className="rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 p-8 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 opacity-10">
                            <Landmark className="h-64 w-64 -mr-16 -mt-16" />
                        </div>
                        
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
                            <div>
                                <h3 className="text-sm font-medium uppercase tracking-wider opacity-90 mb-2">Total Modal</h3>
                                <h2 className="text-5xl font-bold mb-4">{formatCurrency(totalCapital)}</h2>
                                <p className="text-blue-100 max-w-md">
                                    Terakumulasi dari penyertaan modal awal.
                                </p>
                            </div>
                            
                            <div className="flex gap-4">
                                {topCapitalCategories.length > 0 ? (
                                    topCapitalCategories.map(([category, amount]) => (
                                        <div key={category} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 min-w-[160px] border border-white/20">
                                            <p className="text-xs font-bold uppercase opacity-80 mb-1">{category}</p>
                                            <p className="text-2xl font-bold">{Math.round((amount/(totalCapital || 1))*100)}%</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 min-w-[160px] border border-white/20">
                                        <p className="text-xs font-bold uppercase opacity-80 mb-1">Data</p>
                                        <p className="text-2xl font-bold">-</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Table Card */}
                    <Card className="border-none shadow-sm bg-white">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg">Rincian Sumber Modal</CardTitle>
                            <div className="flex gap-2">
                                <div className="relative w-64 mr-2">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="Cari..." 
                                        className="pl-9 h-9"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Button variant="outline" size="icon" className="h-9 w-9">
                                    <Filter className="h-4 w-4 text-muted-foreground" />
                                </Button>
                                <Button size="sm" onClick={() => openAddDialog("CAPITAL")} className="h-9 bg-blue-600 hover:bg-blue-700">
                                    <Plus className="h-4 w-4 mr-2" /> Tambah
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="uppercase text-xs text-muted-foreground hover:bg-transparent border-b">
                                        <TableHead>Sumber Modal</TableHead>
                                        <TableHead>Tanggal Masuk</TableHead>
                                        <TableHead>Jenis</TableHead>
                                        <TableHead className="text-right">Jumlah</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTransactions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                Belum ada data modal tercatat
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredTransactions.map((t) => (
                                            <TableRow key={t.id} className="hover:bg-gray-50">
                                                <TableCell className="font-semibold text-base py-4">{t.description}</TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {format(new Date(t.date), "dd MMM yyyy", { locale: localeId })}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 uppercase text-[10px] tracking-wide">
                                                        {t.category}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-base">
                                                    {formatCurrency(t.amount)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                            onClick={() => openEditDialog(t)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-8 w-8 text-muted-foreground hover:text-red-600"
                                                            onClick={() => openDeleteDialog(t.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Other Income Tab - Custom Design */}
                <TabsContent value="other_income" className="space-y-8">
                    {/* Summary Cards */}
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="border-none shadow-md bg-white overflow-hidden relative">
                            <CardContent className="p-6 flex items-center gap-6">
                                <div className="h-16 w-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-sm">
                                    <TrendingUp className="h-8 w-8" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Pemasukan Lain (Total)</p>
                                    <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(totalOtherIncome)}</h3>
                                </div>
                            </CardContent>
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500"></div>
                        </Card>

                        {topOtherIncomeCategories[0] ? (
                            <Card className="border-none shadow-md bg-white overflow-hidden relative">
                                <CardContent className="p-6 flex items-center gap-6">
                                    <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm">
                                        <Landmark className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{topOtherIncomeCategories[0][0]}</p>
                                        <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(topOtherIncomeCategories[0][1])}</h3>
                                    </div>
                                </CardContent>
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500"></div>
                            </Card>
                        ) : (
                             <Card className="border-none shadow-md bg-white overflow-hidden relative opacity-50">
                                <CardContent className="p-6 flex items-center gap-6">
                                    <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                                        <Landmark className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Kategori 1</p>
                                        <h3 className="text-2xl font-bold text-gray-900">-</h3>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {topOtherIncomeCategories[1] ? (
                            <Card className="border-none shadow-md bg-white overflow-hidden relative">
                                <CardContent className="p-6 flex items-center gap-6">
                                    <div className="h-16 w-16 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500 shadow-sm">
                                        <DollarSign className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{topOtherIncomeCategories[1][0]}</p>
                                        <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(topOtherIncomeCategories[1][1])}</h3>
                                    </div>
                                </CardContent>
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-500"></div>
                            </Card>
                        ) : (
                            <Card className="border-none shadow-md bg-white overflow-hidden relative opacity-50">
                                <CardContent className="p-6 flex items-center gap-6">
                                    <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                                        <DollarSign className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Kategori 2</p>
                                        <h3 className="text-2xl font-bold text-gray-900">-</h3>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Table Section */}
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <h3 className="text-lg font-bold text-gray-800">Log Pemasukan Non-Tagihan</h3>
                            <Button variant="outline" size="sm" onClick={handleExportPDF} className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200 shadow-sm">
                                <Download className="mr-2 h-4 w-4" />
                                Export PDF
                            </Button>
                        </div>

                        <Card className="border-none shadow-sm bg-white">
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b border-gray-100 hover:bg-transparent">
                                            <TableHead className="py-4 px-6 text-xs font-bold uppercase text-gray-400 tracking-wider">Uraian Pemasukan</TableHead>
                                            <TableHead className="py-4 text-xs font-bold uppercase text-gray-400 tracking-wider">Kategori</TableHead>
                                            <TableHead className="py-4 text-xs font-bold uppercase text-gray-400 tracking-wider">Tanggal</TableHead>
                                            <TableHead className="py-4 text-right text-xs font-bold uppercase text-gray-400 tracking-wider">Jumlah</TableHead>
                                            <TableHead className="py-4 text-right text-xs font-bold uppercase text-gray-400 tracking-wider pr-6">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTransactions.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                                    Belum ada data pemasukan tercatat
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredTransactions.map((t) => (
                                                <TableRow key={t.id} className="hover:bg-gray-50 border-b border-gray-50 last:border-0 group transition-colors">
                                                    <TableCell className="py-4 px-6 font-semibold text-gray-800 text-base">{t.description}</TableCell>
                                                    <TableCell className="py-4 font-medium text-gray-500">{t.category}</TableCell>
                                                    <TableCell className="py-4 font-bold text-gray-400 text-sm">
                                                        {format(new Date(t.date), "dd MMM yyyy", { locale: localeId })}
                                                    </TableCell>
                                                    <TableCell className="py-4 text-right font-bold text-emerald-600 text-base">
                                                        + {formatCurrency(t.amount)}
                                                    </TableCell>
                                                    <TableCell className="py-4 text-right pr-6">
                                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                                                onClick={() => openEditDialog(t)}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                                                onClick={() => openDeleteDialog(t.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Expense Tab - Custom Design */}
                <TabsContent value="expense" className="space-y-8">
                    {/* Summary Cards */}
                    <div className="grid gap-6 md:grid-cols-4">
                        {topExpenseCategories.length > 0 ? (
                            topExpenseCategories.map(([category, amount], index) => {
                                // Design colors based on index
                                const colors = [
                                    { bg: "bg-red-50", text: "text-red-600", bar: "bg-red-500", label: "text-red-900" },
                                    { bg: "bg-amber-50", text: "text-amber-600", bar: "bg-amber-500", label: "text-amber-900" },
                                    { bg: "bg-blue-50", text: "text-blue-600", bar: "bg-blue-500", label: "text-blue-900" },
                                    { bg: "bg-indigo-50", text: "text-indigo-600", bar: "bg-indigo-500", label: "text-indigo-900" }
                                ][index % 4];
                                
                                const percentage = totalExpenseValue > 0 ? Math.round((amount / totalExpenseValue) * 100) : 0;

                                return (
                                    <Card key={category} className="border-none shadow-sm overflow-hidden">
                                        <CardContent className={`p-6 ${colors.bg} h-full flex flex-col justify-between`}>
                                            <div>
                                                <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${colors.label} opacity-60`}>{category}</p>
                                                <h3 className={`text-2xl font-bold ${colors.label} mb-4`}>{formatCurrency(amount)}</h3>
                                            </div>
                                            <div>
                                                <div className="w-full bg-white/60 h-1.5 rounded-full mb-2 overflow-hidden">
                                                    <div className={`h-1.5 rounded-full ${colors.bar}`} style={{ width: `${percentage}%` }}></div>
                                                </div>
                                                <p className={`text-[10px] font-bold ${colors.label} opacity-60`}>{percentage}% OF TOTAL</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })
                        ) : (
                            // Placeholders if no data
                            Array(4).fill(0).map((_, i) => (
                                <Card key={i} className="border-none shadow-sm opacity-50">
                                    <CardContent className="p-6 bg-gray-50 h-full">
                                        <p className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-400">Kategori</p>
                                        <h3 className="text-2xl font-bold text-gray-400">-</h3>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                        {/* Fill remaining slots if < 4 */}
                        {topExpenseCategories.length > 0 && topExpenseCategories.length < 4 && Array(4 - topExpenseCategories.length).fill(0).map((_, i) => (
                             <Card key={`empty-${i}`} className="border-none shadow-sm opacity-50">
                                <CardContent className="p-6 bg-gray-50 h-full">
                                    <p className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-400">Kategori</p>
                                    <h3 className="text-2xl font-bold text-gray-400">-</h3>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Table Section */}
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <h3 className="text-lg font-bold text-gray-800">Daftar Pengeluaran Detail</h3>
                            <div className="flex gap-2 w-full md:w-auto">
                                <div className="relative flex-1 md:w-64">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="Cari item pengeluaran..." 
                                        className="pl-9 h-9 bg-white"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Button variant="outline" size="sm" onClick={handleExportExpensePDF} className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200 shadow-sm h-9">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export PDF
                                </Button>
                            </div>
                        </div>

                        <Card className="border-none shadow-sm bg-white">
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b border-gray-100 hover:bg-transparent">
                                            <TableHead className="py-4 px-6 text-xs font-bold uppercase text-gray-400 tracking-wider">Deskripsi</TableHead>
                                            <TableHead className="py-4 text-xs font-bold uppercase text-gray-400 tracking-wider">Kategori</TableHead>
                                            <TableHead className="py-4 text-xs font-bold uppercase text-gray-400 tracking-wider">Petugas/PIC</TableHead>
                                            <TableHead className="py-4 text-xs font-bold uppercase text-gray-400 tracking-wider">Status</TableHead>
                                            <TableHead className="py-4 text-right text-xs font-bold uppercase text-gray-400 tracking-wider">Jumlah</TableHead>
                                            <TableHead className="py-4 text-right text-xs font-bold uppercase text-gray-400 tracking-wider pr-6">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTransactions.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                                    Belum ada data pengeluaran tercatat
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredTransactions.map((t) => (
                                                <TableRow key={t.id} className="hover:bg-gray-50 border-b border-gray-50 last:border-0 group transition-colors">
                                                    <TableCell className="py-4 px-6 font-bold text-gray-800 text-base">{t.description}</TableCell>
                                                    <TableCell className="py-4 font-bold text-xs text-gray-500 uppercase tracking-wider">{t.category}</TableCell>
                                                    <TableCell className="py-4 font-medium text-gray-500 text-sm">Admin</TableCell>
                                                    <TableCell className="py-4">
                                                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 uppercase text-[10px] tracking-wide font-bold">
                                                            APPROVED
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="py-4 text-right font-bold text-red-500 text-base">
                                                        - {formatCurrency(t.amount)}
                                                    </TableCell>
                                                    <TableCell className="py-4 text-right pr-6">
                                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                                                onClick={() => openEditDialog(t)}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                                                onClick={() => openDeleteDialog(t.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Add/Edit Transaction Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Transaksi" : "Tambah Transaksi Baru"}</DialogTitle>
                        <DialogDescription>
                            {editingId ? "Perbarui detail transaksi keuangan." : "Masukkan detail transaksi keuangan di bawah ini."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="type" className="text-right">
                                    Tipe
                                </Label>
                                <Select 
                                    value={formData.type} 
                                    onValueChange={(val: TransactionType) => setFormData({...formData, type: val})}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Pilih tipe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CAPITAL">Modal Awal</SelectItem>
                                        <SelectItem value="OTHER_INCOME">Pemasukan Lain</SelectItem>
                                        <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="amount" className="text-right">
                                    Jumlah
                                </Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    className="col-span-3"
                                    placeholder="Rp 0"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="category" className="text-right">
                                    Kategori
                                </Label>
                                <Input
                                    id="category"
                                    className="col-span-3"
                                    placeholder="Contoh: Operasional, Gaji, Hibah"
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="date" className="text-right">
                                    Tanggal
                                </Label>
                                <Input
                                    id="date"
                                    type="date"
                                    className="col-span-3"
                                    value={formData.date}
                                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="description" className="text-right">
                                    Deskripsi
                                </Label>
                                <Input
                                    id="description"
                                    className="col-span-3"
                                    placeholder="Keterangan transaksi..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                                {isLoading ? "Menyimpan..." : (editingId ? "Simpan Perubahan" : "Simpan Transaksi")}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Alert */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Transaksi ini akan dihapus secara permanen dari database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                            Hapus Transaksi
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
