'use client'
import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { useReactToPrint } from "react-to-print"
import { CForm } from "@/components/CForm"
import { BankInvoice } from "@/components/BankInvoice"
import type { Client, Invoice, PaymentAccount } from "@/types"
import { Printer, FileText, CheckCircle2 } from "lucide-react"

type ViewTab = "all" | "invoice" | "cform"

export default function GenerateDocsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([])

  const [selectedClientId, setSelectedClientId] = useState("")
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("")
  const [activeTab, setActiveTab] = useState<ViewTab>("all")

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

  const filteredInvoices = invoices.filter((i) => i.client_id === selectedClientId)

  useEffect(() => {
    if (filteredInvoices.length > 0 && (!selectedInvoiceId || !filteredInvoices.some(inv => inv.id === selectedInvoiceId))) {
      setSelectedInvoiceId(filteredInvoices[0].id)
    }
  }, [selectedClientId, filteredInvoices, selectedInvoiceId])

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

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Generate Documents</h1>
        <p className="text-sm text-gray-500 mt-1">
          Generate pixel-perfect Bank Invoices and Form-C (ICT) declarations ready to print or save as PDF.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Select Client</label>
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
          <label className="block text-sm font-semibold text-gray-700 mb-2">Select Invoice</label>
          <select
            value={selectedInvoiceId}
            onChange={(e) => setSelectedInvoiceId(e.target.value)}
            disabled={!selectedClientId}
            className="block w-full p-2.5 border rounded-lg border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100"
          >
            <option value="">-- Choose an Invoice --</option>
            {filteredInvoices.map((i) => (
              <option key={i.id} value={i.id}>
                {i.invoice_number} ({i.invoice_date}) — {i.currency || "USD"} {i.amount}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedClient && selectedInvoice && (
        <div className="space-y-6">
          {/* Document switcher tabs */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "all"
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Documents
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("invoice")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "invoice"
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Bank Invoice
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("cform")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "cform"
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Form-C (ICT)
              </button>
            </div>

            <div className="flex items-center gap-3">
              {(activeTab === "all" || activeTab === "invoice") && (
                <button
                  type="button"
                  onClick={() => handlePrintBankInvoice()}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all"
                >
                  <Printer className="w-4 h-4" />
                  Print Invoice
                </button>
              )}
              {(activeTab === "all" || activeTab === "cform") && (
                <button
                  type="button"
                  onClick={() => handlePrintCForm()}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all"
                >
                  <FileText className="w-4 h-4" />
                  Print Form-C
                </button>
              )}
            </div>
          </div>

          {/* Bank Invoice Preview */}
          {(activeTab === "all" || activeTab === "invoice") && (
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-gray-100/90 p-6 sm:p-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  Bank Invoice Preview
                </h2>
                <button
                  type="button"
                  onClick={() => handlePrintBankInvoice()}
                  className="bg-blue-600 text-white px-3.5 py-1.5 rounded-lg shadow-sm hover:bg-blue-700 text-xs font-semibold flex items-center gap-1.5"
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
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-gray-100/90 p-6 sm:p-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Form–C (ICT) Preview
                </h2>
                <button
                  type="button"
                  onClick={() => handlePrintCForm()}
                  className="bg-emerald-600 text-white px-3.5 py-1.5 rounded-lg shadow-sm hover:bg-emerald-700 text-xs font-semibold flex items-center gap-1.5"
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
  )
}
