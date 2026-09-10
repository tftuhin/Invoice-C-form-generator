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

    const { error } = await supabase.from("invoices").insert([
      {
        client_id: data.client_id,
        invoice_number: data.invoice_number,
        invoice_date: data.invoice_date,
        amount: typeof data.amount === "string" ? parseFloat(data.amount) : data.amount,
        description: data.description,
        received_amount: data.received_amount
          ? typeof data.received_amount === "string"
            ? parseFloat(data.received_amount)
            : data.received_amount
          : 0,
        payment_methods: paymentMethodsArray,
      },
    ])
    if (!error) {
      alert("Invoice created successfully!")
      reset()
      const dateStr = new Date().toISOString().split("T")[0]
      setValue("invoice_number", `TF-${dateStr}-01`)
      setValue("invoice_date", dateStr)
    } else {
      alert("Error creating invoice: " + error.message)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Create Invoice</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Client</label>
              <select
                {...register("client_id", { required: true })}
                className="mt-1 block w-full p-2 border rounded-md border-gray-300"
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
                className="mt-1 block w-full p-2 border rounded-md border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Invoice Date</label>
              <input
                type="date"
                {...register("invoice_date", { required: true })}
                className="mt-1 block w-full p-2 border rounded-md border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Invoice Amount (USD)</label>
              <input
                type="number"
                step="0.01"
                {...register("amount", { required: true })}
                className="mt-1 block w-full p-2 border rounded-md border-gray-300"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description (Service Details)</label>
              <input
                {...register("description", { required: true })}
                className="mt-1 block w-full p-2 border rounded-md border-gray-300"
                placeholder="e.g. Website Maintenance Service"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Received Amount (USD)</label>
              <input
                type="number"
                step="0.01"
                {...register("received_amount")}
                className="mt-1 block w-full p-2 border rounded-md border-gray-300"
                placeholder="Optional received amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Methods</label>
              <select
                multiple
                {...register("payment_methods")}
                className="mt-1 block w-full p-2 border rounded-md border-gray-300 h-24"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.bank_name || a.account_name}
                    {a.account_number ? ` - ${a.account_number}` : ""}
                    {a.name_on_account ? ` (${a.name_on_account})` : ""}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Cmd/Ctrl to select multiple accounts</p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 font-medium text-lg"
          >
            Generate Invoice
          </button>
        </form>
      </div>
    </div>
  )
}
