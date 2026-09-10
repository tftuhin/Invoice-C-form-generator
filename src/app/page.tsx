'use client'
import { useState, useEffect, useRef, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { useReactToPrint } from "react-to-print"
import { CForm } from "@/components/CForm"
import { BankInvoice } from "@/components/BankInvoice"
import { EditInvoiceModal } from "@/components/EditInvoiceModal"
import type { Client, Invoice, PaymentAccount } from "@/types"
import {
  Printer,
  FileText,
  CheckCircle2,
  Edit2,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
} from "lucide-react"
import Link from "next/link"

type ViewTab = "all" | "invoice" | "cform"

export default function GenerateDocsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([])

  const [selectedClientId, setSelectedClientId] = useState("")
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("")
  const [activeTab, setActiveTab] = useState<ViewTab>("all")

  // Invoices list filters and pagination
  const [searchTerm, setSearchTerm] = useState("")
  const [tableClientFilter, setTableClientFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Edit modal state
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const previewSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let ignore = false
    async function fetchData() {
      const [cRes, iRes, pRes] = await Promise.all([
        supabase.from("clients").select("*").order("name"),
        supabase.from("invoices").select("*").order("created_at", { ascending: false }),
        supabase.from("payment_accounts").select("*"),
      ])
      if (!ignore) {
        if (cRes.data) {
          setClients(cRes.data as Client[])
          if (cRes.data.length > 0 && !selectedClientId) {
            setSelectedClientId(cRes.data[0].id)
          }
        }
        if (iRes.data) {
          setInvoices(iRes.data as Invoice[])
        }
        if (pRes.data) setPaymentAccounts(pRes.data as PaymentAccount[])
      }
    }
    void fetchData()
    return () => {
      ignore = true
    }
  }, [])

  const filteredInvoicesForClient = invoices.filter((i) => i.client_id === selectedClientId)

  useEffect(() => {
    if (
      filteredInvoicesForClient.length > 0 &&
      (!selectedInvoiceId || !filteredInvoicesForClient.some((inv) => inv.id === selectedInvoiceId))
    ) {
      setSelectedInvoiceId(filteredInvoicesForClient[0].id)
    }
  }, [selectedClientId, filteredInvoicesForClient, selectedInvoiceId])

  const selectedClient = clients.find((c) => c.id === selectedClientId)
  const selectedInvoice = invoices.find((i) => i.id === selectedInvoiceId)

  const cFormRef = useRef<HTMLDivElement>(null)
  const bankInvoiceRef = useRef<HTMLDivElement>(null)

  const handlePrintCForm = useReactToPrint({
    contentRef: cFormRef,
    documentTitle: `C-Form-${selectedInvoice?.invoice_number || "doc"}`,
  })

  const handlePrintBankInvoice = useReactToPrint({
    contentRef: bankInvoiceRef,
    documentTitle: `Bank-Invoice-${selectedInvoice?.invoice_number || "doc"}`,
  })

  // Select an invoice to preview
  const selectInvoiceForPreview = (inv: Invoice) => {
    setSelectedClientId(inv.client_id)
    setSelectedInvoiceId(inv.id)
    previewSectionRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Open Edit Modal
  const handleEditInvoice = (inv: Invoice) => {
    setEditingInvoice(inv)
    setIsEditModalOpen(true)
  }

  // Handle saved invoice from modal
  const handleInvoiceSaved = (updated: Invoice) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === updated.id ? updated : inv)))
    if (selectedInvoiceId === updated.id) {
      setSelectedInvoiceId(updated.id)
      setSelectedClientId(updated.client_id)
    }
  }

  // Delete invoice
  const handleDeleteInvoice = async (inv: Invoice) => {
    if (!confirm(`Are you sure you want to delete invoice ${inv.invoice_number}?`)) {
      return
    }

    const { error } = await supabase.from("invoices").delete().eq("id", inv.id)
    if (error) {
      alert("Error deleting invoice: " + error.message)
      return
    }

    setInvoices((prev) => prev.filter((i) => i.id !== inv.id))
    if (selectedInvoiceId === inv.id) {
      const remaining = invoices.filter((i) => i.id !== inv.id)
      if (remaining.length > 0) {
        setSelectedInvoiceId(remaining[0].id)
        setSelectedClientId(remaining[0].client_id)
      } else {
        setSelectedInvoiceId("")
      }
    }
  }

  // Filtered invoices for table
  const tableInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (tableClientFilter && inv.client_id !== tableClientFilter) {
        return false
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase()
        const client = clients.find((c) => c.id === inv.client_id)
        const matchNum = inv.invoice_number?.toLowerCase().includes(term)
        const matchDesc = inv.description?.toLowerCase().includes(term)
        const matchClient = client?.name?.toLowerCase().includes(term)
        const matchDate = inv.invoice_date?.toLowerCase().includes(term)
        return matchNum || matchDesc || matchClient || matchDate
      }
      return true
    })
  }, [invoices, tableClientFilter, searchTerm, clients])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, tableClientFilter])

  const totalPages = Math.ceil(tableInvoices.length / pageSize) || 1
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return tableInvoices.slice(start, start + pageSize)
  }, [tableInvoices, currentPage, pageSize])

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Invoice & C Form Generator</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage invoices and generate pixel-perfect Bank Invoices and Form-C (ICT) declarations.
          </p>
        </div>
        <Link
          href="/create-invoice"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Invoice
        </Link>
      </div>

      {/* Invoices List Table with Search, Edit & Delete */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/40">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-gray-900">Invoices Directory</h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {tableInvoices.length} {tableInvoices.length === 1 ? "invoice" : "invoices"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search invoice, client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>

            {/* Client Filter */}
            <select
              value={tableClientFilter}
              onChange={(e) => setTableClientFilter(e.target.value)}
              className="py-1.5 px-3 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">All Clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 text-gray-600 text-xs uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Service Details</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Remitted</th>
                <th className="py-3 px-4 text-center w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedInvoices.map((inv) => {
                const client = clients.find((c) => c.id === inv.client_id)
                const isSelected = selectedInvoiceId === inv.id

                return (
                  <tr
                    key={inv.id}
                    className={`transition-colors ${
                      isSelected
                        ? "bg-blue-50/80 hover:bg-blue-50"
                        : "hover:bg-gray-50/70"
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gray-900 text-xs sm:text-sm">
                          {inv.invoice_number}
                        </span>
                        {isSelected && (
                          <span className="bg-blue-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                            Previewing
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap text-xs">
                      {inv.invoice_date}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900 max-w-[180px] truncate text-xs sm:text-sm">
                      {client?.name || "—"}
                    </td>
                    <td className="py-3 px-4 text-gray-600 max-w-[200px] truncate text-xs">
                      {inv.description}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900 whitespace-nowrap text-xs sm:text-sm">
                      {inv.currency || "USD"} {Number(inv.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600 whitespace-nowrap text-xs sm:text-sm">
                      {inv.received_amount
                        ? `${inv.currency || "USD"} ${Number(inv.received_amount).toFixed(2)}`
                        : "—"}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Select / Preview Button */}
                        <button
                          type="button"
                          onClick={() => selectInvoiceForPreview(inv)}
                          title="View & Generate Docs"
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                          }`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleEditInvoice(inv)}
                          title="Edit Invoice"
                          className="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteInvoice(inv)}
                          title="Delete Invoice"
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {paginatedInvoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No invoices match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs sm:text-sm text-gray-600 bg-gray-50/40">
            <div>
              Showing <span className="font-semibold">{(currentPage - 1) * pageSize + 1}</span> to{" "}
              <span className="font-semibold">
                {Math.min(currentPage * pageSize, tableInvoices.length)}
              </span>{" "}
              of <span className="font-semibold">{tableInvoices.length}</span> invoices
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-medium text-gray-700 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Document Generator / Preview Section */}
      <div ref={previewSectionRef} className="space-y-6 pt-4">
        <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Document Preview</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Live Bank Invoice and Form-C (ICT) previews for the active invoice.
            </p>
          </div>
          {selectedInvoice && (
            <div className="flex items-center gap-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-lg">
              <span className="text-gray-500">Selected:</span>
              <span className="font-mono font-bold text-blue-600">{selectedInvoice.invoice_number}</span>
              <span>—</span>
              <span>{selectedClient?.name}</span>
            </div>
          )}
        </div>

        {/* Quick Selectors */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Filter by Client
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => {
                setSelectedClientId(e.target.value)
              }}
              className="block w-full p-2.5 border rounded-lg border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">-- Choose a Client --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Select Invoice to Generate
            </label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => setSelectedInvoiceId(e.target.value)}
              disabled={!selectedClientId}
              className="block w-full p-2.5 border rounded-lg border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100"
            >
              <option value="">-- Choose an Invoice --</option>
              {filteredInvoicesForClient.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.invoice_number} ({i.invoice_date}) — {i.currency || "USD"} {i.amount}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedClient && selectedInvoice && (
          <div className="space-y-6">
            {/* Document switcher tabs & print actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    activeTab === "all"
                      ? "bg-gray-900 text-white shadow-xs"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All Documents
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("invoice")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    activeTab === "invoice"
                      ? "bg-gray-900 text-white shadow-xs"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Bank Invoice
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("cform")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    activeTab === "cform"
                      ? "bg-gray-900 text-white shadow-xs"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Form-C (ICT)
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleEditInvoice(selectedInvoice)}
                  className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Invoice
                </button>

                {(activeTab === "all" || activeTab === "invoice") && (
                  <button
                    type="button"
                    onClick={() => handlePrintBankInvoice()}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-xs transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    Print Invoice
                  </button>
                )}
                {(activeTab === "all" || activeTab === "cform") && (
                  <button
                    type="button"
                    onClick={() => handlePrintCForm()}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-xs transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    Print Form-C
                  </button>
                )}
              </div>
            </div>

            {/* Bank Invoice Preview */}
            {(activeTab === "all" || activeTab === "invoice") && (
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs bg-gray-100/90 p-6 sm:p-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    Bank Invoice Preview
                  </h2>
                  <button
                    type="button"
                    onClick={() => handlePrintBankInvoice()}
                    className="bg-blue-600 text-white px-3.5 py-1.5 rounded-lg shadow-xs hover:bg-blue-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print / Save PDF
                  </button>
                </div>
                <div className="overflow-x-auto bg-gray-100/90 flex justify-center py-4">
                  <div className="shadow-xl rounded-sm">
                    <BankInvoice
                      ref={bankInvoiceRef}
                      invoice={selectedInvoice}
                      client={selectedClient}
                      paymentAccounts={paymentAccounts}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Form-C (ICT) Preview */}
            {(activeTab === "all" || activeTab === "cform") && (
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs bg-gray-100/90 p-6 sm:p-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Form–C (ICT) Preview
                  </h2>
                  <button
                    type="button"
                    onClick={() => handlePrintCForm()}
                    className="bg-emerald-600 text-white px-3.5 py-1.5 rounded-lg shadow-xs hover:bg-emerald-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print / Save PDF
                  </button>
                </div>
                <div className="overflow-x-auto bg-gray-100/90 flex justify-center py-4">
                  <div className="shadow-xl rounded-sm">
                    <CForm
                      ref={cFormRef}
                      invoice={selectedInvoice}
                      client={selectedClient}
                      paymentAccounts={paymentAccounts}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Invoice Modal */}
      <EditInvoiceModal
        invoice={editingInvoice}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaved={handleInvoiceSaved}
        clients={clients}
        accounts={paymentAccounts}
      />
    </div>
  )
}
