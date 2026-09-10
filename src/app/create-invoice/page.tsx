'use client'
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useForm } from "react-hook-form"
import type { Client, PaymentAccount, InvoiceFormData } from "@/types"

export default function CreateInvoicePage() {
  const [clients, setClients] = useState<Client[]>([])
  const [accounts, setAccounts] = useState<PaymentAccount[]>([])
  const { register, handleSubmit, reset, setValue } = useForm<InvoiceFormData>()

  useEffect(() => {
    let ignore = false
    async function fetchData() {
      const [clientsRes, accountsRes] = await Promise.all([
        supabase.from("clients").select("*").order("name"),
        supabase.from("payment_accounts").select("*"),
      ])
      if (!ignore) {
        if (clientsRes.data) setClients(clientsRes.data as Client[])
        if (accountsRes.data) setAccounts(accountsRes.data as PaymentAccount[])

        // Auto-generate invoice number format TF-YYYY-MM-DD-01
        const dateStr = new Date().toISOString().split("T")[0]
        setValue("invoice_number", `TF-${dateStr}-01`)
        setValue("invoice_date", dateStr)
        setValue("currency", "USD")
      }
    }
    void fetchData()
    return () => {
      ignore = true
    }
  }, [setValue])

  const onSubmit = async (data: InvoiceFormData) => {
    const rawPaymentMethods = data.payment_methods
    const paymentMethodsArray = Array.isArray(rawPaymentMethods)
      ? rawPaymentMethods
      : rawPaymentMethods
        ? [rawPaymentMethods]
        : []

    const payload: Record<string, any> = {
      client_id: data.client_id,
      invoice_number: data.invoice_number,
      invoice_date: data.invoice_date,
      currency: data.currency || "USD",
      amount: typeof data.amount === "string" ? parseFloat(data.amount) : data.amount,
      description: data.description,
      received_amount: data.received_amount
        ? typeof data.received_amount === "string"
          ? parseFloat(data.received_amount)
          : data.received_amount
        : 0,
      payment_methods: paymentMethodsArray,
    }

    let { error } = await supabase.from("invoices").insert([payload])

    // Fallback if column 'currency' doesn't exist yet
    if (error && (error.code === "42703" || error.message?.includes("currency"))) {
      delete payload.currency
      const fallbackRes = await supabase.from("invoices").insert([payload])
      error = fallbackRes.error
    }

    if (!error) {
      alert("Invoice created successfully!")
      reset()
      const dateStr = new Date().toISOString().split("T")[0]
      setValue("invoice_number", `TF-${dateStr}-01`)
      setValue("invoice_date", dateStr)
      setValue("currency", "USD")
    } else {
      alert("Error creating invoice: " + error.message)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create Invoice</h1>
        <p className="text-sm text-gray-500 mt-1">Generate a new client billing record and assign payment accounts.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-200">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Client</label>
              <select
                {...register("client_id", { required: true })}
                className="mt-1 block w-full p-2.5 border rounded-lg border-gray-300 bg-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:outline-none"
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
              <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
              <input
                {...register("invoice_number", { required: true })}
                className="mt-1 block w-full p-2.5 border rounded-lg border-gray-300 text-sm font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Invoice Date</label>
              <input
                type="date"
                {...register("invoice_date", { required: true })}
                className="mt-1 block w-full p-2.5 border rounded-lg border-gray-300 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Currency</label>
              <select
                {...register("currency")}
                defaultValue="USD"
                className="mt-1 block w-full p-2.5 border rounded-lg border-gray-300 bg-white text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:outline-none"
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
              <label className="block text-sm font-medium text-gray-700">Invoice Amount</label>
              <input
                type="number"
                step="0.01"
                {...register("amount", { required: true })}
                className="mt-1 block w-full p-2.5 border rounded-lg border-gray-300 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:outline-none"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Remitted / Received Amount</label>
              <input
                type="number"
                step="0.01"
                {...register("received_amount")}
                className="mt-1 block w-full p-2.5 border rounded-lg border-gray-300 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:outline-none"
                placeholder="Optional received amount"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description (Service Details)</label>
              <input
                {...register("description", { required: true })}
                className="mt-1 block w-full p-2.5 border rounded-lg border-gray-300 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:outline-none"
                placeholder="e.g. Website Maintenance Service"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Payment Bank Account(s)</label>
              <select
                multiple
                {...register("payment_methods")}
                className="mt-1 block w-full p-2.5 border rounded-lg border-gray-300 h-28 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:outline-none"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.bank_name || a.account_name}
                    {a.account_number ? ` - ${a.account_number}` : ""}
                    {a.name_on_account ? ` (${a.name_on_account})` : ""}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1.5">
                Select your payment bank for transfer instructions (Hold Cmd/Ctrl to select multiple)
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-medium text-base transition-colors shadow-xs cursor-pointer"
          >
            Generate Invoice
          </button>
        </form>
      </div>
    </div>
  )
}
