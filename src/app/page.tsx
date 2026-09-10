'use client'
import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { useReactToPrint } from "react-to-print"
import { CForm } from "@/components/CForm"
import { BankInvoice } from "@/components/BankInvoice"
import type { Client, Invoice, PaymentAccount } from "@/types"

export default function GenerateDocsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([])

  const [selectedClientId, setSelectedClientId] = useState("")
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("")

  useEffect(() => {
    let ignore = false
    async function fetchData() {
      const [cRes, iRes, pRes] = await Promise.all([
        supabase.from("clients").select("*").order("name"),
        supabase.from("invoices").select("*").order("created_at", { ascending: false }),
        supabase.from("payment_accounts").select("*"),
      ])
      if (!ignore) {
        if (cRes.data) setClients(cRes.data as Client[])
        if (iRes.data) setInvoices(iRes.data as Invoice[])
        if (pRes.data) setPaymentAccounts(pRes.data as PaymentAccount[])
      }
    }
    void fetchData()
    return () => {
      ignore = true
    }
  }, [])

  const filteredInvoices = invoices.filter((i) => i.client_id === selectedClientId)
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
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Generate Documents</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex gap-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Client</label>
          <select
            value={selectedClientId}
            onChange={(e) => {
              setSelectedClientId(e.target.value)
              setSelectedInvoiceId("")
            }}
            className="block w-full p-2 border rounded-md border-gray-300"
          >
            <option value="">-- Choose a Client --</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Invoice</label>
          <select
            value={selectedInvoiceId}
            onChange={(e) => setSelectedInvoiceId(e.target.value)}
            disabled={!selectedClientId}
            className="block w-full p-2 border rounded-md border-gray-300 disabled:bg-gray-100"
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
        <div className="space-y-8">
          <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-gray-200 p-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">C Form (ICT) Preview</h2>
              <button
                onClick={() => handlePrintCForm()}
                className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 font-medium"
              >
                Print / Save PDF
              </button>
            </div>
            <div className="overflow-x-auto bg-gray-200 flex justify-center py-4">
              <div className="shadow-2xl">
                <CForm
                  ref={cFormRef}
                  invoice={selectedInvoice}
                  client={selectedClient}
                  paymentAccounts={paymentAccounts}
                />
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-gray-200 p-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Bank Invoice Preview</h2>
              <button
                onClick={() => handlePrintBankInvoice()}
                className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 font-medium"
              >
                Print / Save PDF
              </button>
            </div>
            <div className="overflow-x-auto bg-gray-200 flex justify-center py-4">
              <div className="shadow-2xl">
                <BankInvoice
                  ref={bankInvoiceRef}
                  invoice={selectedInvoice}
                  client={selectedClient}
                  paymentAccounts={paymentAccounts}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
