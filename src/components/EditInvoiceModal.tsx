'use client'
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Client, Invoice, PaymentAccount } from "@/types"
import { X, Save, Check } from "lucide-react"

interface EditInvoiceModalProps {
  invoice: Invoice | null
  isOpen: boolean
  onClose: () => void
  onSaved: (updated: Invoice) => void
  clients: Client[]
  accounts: PaymentAccount[]
}

function formatDateForInput(dateStr?: string): string {
  if (!dateStr) return ""
  // If already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
  // Try standard parse
  const d = new Date(dateStr)
  if (!isNaN(d.getTime())) {
    try {
      return d.toISOString().split("T")[0]
    } catch {}
  }
  // Try format like 2-Sep-26 or 21-Jan-24
  const parts = dateStr.split(/[-/ ]/)
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10)
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
    const month = months.indexOf(parts[1].toLowerCase())
    let year = parseInt(parts[2], 10)
    if (year < 100) year += 2000
    if (!isNaN(day) && month !== -1 && !isNaN(year)) {
      const pad = (n: number) => String(n).padStart(2, "0")
      return `${year}-${pad(month + 1)}-${pad(day)}`
    }
  }
  return dateStr
}

export function EditInvoiceModal({
  invoice,
  isOpen,
  onClose,
  onSaved,
  clients,
  accounts,
}: EditInvoiceModalProps) {
  const [clientId, setClientId] = useState("")
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [invoiceDate, setInvoiceDate] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [amount, setAmount] = useState("")
  const [receivedAmount, setReceivedAmount] = useState("")
  const [description, setDescription] = useState("")
  const [paymentMethods, setPaymentMethods] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    if (invoice) {
      setClientId(invoice.client_id || "")
      setInvoiceNumber(invoice.invoice_number || "")
      setInvoiceDate(formatDateForInput(invoice.invoice_date))
      setCurrency(invoice.currency || "USD")
      setAmount(invoice.amount !== undefined ? String(invoice.amount) : "")
      setReceivedAmount(invoice.received_amount !== undefined ? String(invoice.received_amount) : "")
      setDescription(invoice.description || "")
      setPaymentMethods(invoice.payment_methods || [])
      setErrorMsg("")
    }
  }, [invoice])

  if (!isOpen || !invoice) return null

  const toggleAccount = (accId: string) => {
    setPaymentMethods((prev) =>
      prev.includes(accId) ? prev.filter((id) => id !== accId) : [...prev, accId]
    )
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId) {
      setErrorMsg("Please select a client.")
      return
    }
    if (!invoiceNumber.trim()) {
      setErrorMsg("Invoice number is required.")
      return
    }

    setSaving(true)
    setErrorMsg("")

    const parsedAmount = parseFloat(amount) || 0
    const parsedReceived = receivedAmount ? parseFloat(receivedAmount) : 0

    const updatePayload: Record<string, any> = {
      client_id: clientId,
      invoice_number: invoiceNumber.trim(),
      invoice_date: invoiceDate,
      currency: currency || "USD",
      amount: parsedAmount,
      description: description.trim(),
      received_amount: parsedReceived,
      payment_methods: paymentMethods,
    }

    let { data, error } = await supabase
      .from("invoices")
      .update(updatePayload)
      .eq("id", invoice.id)
      .select()

    // Fallback if currency column issue
    if (error && (error.code === "42703" || error.message?.includes("currency"))) {
      delete updatePayload.currency
      const fallback = await supabase
        .from("invoices")
        .update(updatePayload)
        .eq("id", invoice.id)
        .select()
      data = fallback.data
      error = fallback.error
    }

    setSaving(false)

    if (error) {
      setErrorMsg("Failed to update invoice: " + error.message)
    } else {
      const updatedItem = (data && data[0]) ? (data[0] as Invoice) : { ...invoice, ...updatePayload }
      onSaved(updatedItem)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Edit Invoice</h2>
            <p className="text-xs text-gray-500 font-mono mt-0.5">{invoice.invoice_number}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Client
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
                className="w-full p-2.5 border rounded-lg border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">Select a client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Invoice Number
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                required
                className="w-full p-2.5 border rounded-lg border-gray-300 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Invoice Date
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                required
                className="w-full p-2.5 border rounded-lg border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-2.5 border rounded-lg border-gray-300 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="USD">USD ($ - US Dollar)</option>
                <option value="BDT">BDT (৳ - Bangladeshi Taka)</option>
                <option value="GBP">GBP (£ - British Pound)</option>
                <option value="EUR">EUR (€ - Euro)</option>
                <option value="CAD">CAD ($ - Canadian Dollar)</option>
                <option value="AUD">AUD ($ - Australian Dollar)</option>
                <option value="CHF">CHF (CHF - Swiss Franc)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Invoice Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full p-2.5 border rounded-lg border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Remitted / Received Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={receivedAmount}
                onChange={(e) => setReceivedAmount(e.target.value)}
                placeholder="Optional received amount"
                className="w-full p-2.5 border rounded-lg border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Description (Service Details)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full p-2.5 border rounded-lg border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Payment Bank Accounts Checkboxes */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Payment Bank Account(s)
              </label>
              <div className="space-y-2.5">
                {accounts.map((a) => {
                  const isChecked = paymentMethods.includes(a.id)
                  return (
                    <div
                      key={a.id}
                      onClick={() => toggleAccount(a.id)}
                      className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all select-none ${
                        isChecked
                          ? "border-blue-600 bg-blue-50/60"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleAccount(a.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 mt-0.5 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-900">
                            {a.bank_name || a.account_name}
                          </span>
                          {a.bic_swift && (
                            <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                              {a.bic_swift}
                            </span>
                          )}
                        </div>
                        {a.account_number && (
                          <div className="text-xs text-gray-600 mt-0.5">
                            Account: <span className="font-mono">{a.account_number}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
