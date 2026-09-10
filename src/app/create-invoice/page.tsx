'use client'
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useForm } from "react-hook-form"
import type { Client, PaymentAccount, InvoiceFormData } from "@/types"

export default function CreateInvoicePage() {
  const [clients, setClients] = useState<Client[]>([])
  const [accounts, setAccounts] = useState<PaymentAccount[]>([])
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([])
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
        if (accountsRes.data) {
          const accs = accountsRes.data as PaymentAccount[]
          setAccounts(accs)
          if (accs.length > 0) {
            setSelectedPaymentMethods([accs[0].id])
            setValue("payment_methods", [accs[0].id])
          }
        }

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

  const toggleAccount = (id: string) => {
    const next = selectedPaymentMethods.includes(id)
      ? selectedPaymentMethods.filter((item) => item !== id)
      : [...selectedPaymentMethods, id]
    setSelectedPaymentMethods(next)
    setValue("payment_methods", next)
  }

  const onSubmit = async (data: InvoiceFormData) => {
    const paymentMethodsArray =
      selectedPaymentMethods.length > 0
        ? selectedPaymentMethods
        : Array.isArray(data.payment_methods)
          ? data.payment_methods
          : data.payment_methods
            ? [data.payment_methods]
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
      if (accounts.length > 0) {
        setSelectedPaymentMethods([accounts[0].id])
        setValue("payment_methods", [accounts[0].id])
      } else {
        setSelectedPaymentMethods([])
      }
    } else {
      alert("Error creating invoice: " + error.message)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
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

            {/* Payment Bank Account Selector as Checkboxes */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Bank Account(s)
              </label>
              <div className="space-y-3">
                {accounts.map((a) => {
                  const isChecked = selectedPaymentMethods.includes(a.id)
                  return (
                    <div
                      key={a.id}
                      onClick={() => toggleAccount(a.id)}
                      className={`flex items-start gap-3.5 p-3.5 border rounded-xl cursor-pointer transition-all select-none ${
                        isChecked
                          ? "border-blue-600 bg-blue-50/60 shadow-xs"
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
                              SWIFT: {a.bic_swift}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                          {a.account_number && (
                            <span>
                              <strong className="text-gray-700">Account:</strong>{" "}
                              <span className="font-mono">{a.account_number}</span>
                            </span>
                          )}
                          {a.name_on_account && (
                            <span>
                              <strong className="text-gray-700">Name:</strong> {a.name_on_account}
                            </span>
                          )}
                        </div>
                        {a.bank_address && (
                          <div className="text-[11px] text-gray-500 mt-1 truncate">
                            {a.bank_address}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {accounts.length === 0 && (
                  <div className="p-4 border border-dashed border-gray-300 rounded-xl text-center text-sm text-gray-500">
                    No payment accounts configured. Add one in Configuration.
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Check the payment bank account(s) to include in the invoice transfer instructions.
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
