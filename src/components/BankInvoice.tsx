import React from "react"
import { format } from "date-fns"
import type { Invoice, Client, PaymentAccount } from "@/types"

interface BankInvoiceProps {
  invoice: Invoice
  client: Client
  paymentAccounts: PaymentAccount[]
}

function parseInvoiceDate(dateStr?: string): Date {
  if (!dateStr) return new Date()
  const d = new Date(dateStr)
  if (!isNaN(d.getTime())) return d
  const parts = dateStr.split(/[-/ ]/)
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10)
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
    const month = months.indexOf(parts[1].toLowerCase())
    let year = parseInt(parts[2], 10)
    if (year < 100) year += 2000
    if (!isNaN(day) && month !== -1 && !isNaN(year)) {
      return new Date(year, month, day)
    }
  }
  return new Date()
}

export const BankInvoice = React.forwardRef<HTMLDivElement, BankInvoiceProps>(
  ({ invoice, client, paymentAccounts }, ref) => {
    if (!invoice || !client) return <div ref={ref}></div>

    const parsedDate = parseInvoiceDate(invoice.invoice_date)
    const invoiceDate = format(parsedDate, "d-MMM-yy")

    // Sales period is start of month to end of month for that invoice
    const startOfMonth = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1)
    const endOfMonth = new Date(parsedDate.getFullYear(), parsedDate.getMonth() + 1, 0)
    const salesPeriodStart = format(startOfMonth, "d-MMM-yyyy")
    const salesPeriodEnd = format(endOfMonth, "d-MMM-yyyy")

    const formattedAmount = Number(invoice.amount).toFixed(2)

    const selectedAccounts = paymentAccounts.filter((acc) =>
      invoice.payment_methods?.includes(acc.id)
    )
    const primaryAccount = selectedAccounts[0] || paymentAccounts[0]

    const bankName = primaryAccount?.bank_name || "Standard Chartered bank"
    const bankAddress =
      primaryAccount?.bank_address || "67 Gulshan Avenue, Gulshan, Dhaka\n1212, Bangladesh"
    const nameOnAccount = primaryAccount?.name_on_account || "Themefisher"
    const specialInstructions = invoice.description || "Website development Services"
    const bicSwift = primaryAccount?.bic_swift || "SCBLBDDXXXX"
    const accountNumber = primaryAccount?.account_number || "01914137101"

    return (
      <div
        ref={ref}
        className="bg-white text-black text-[13px] max-w-4xl mx-auto print:m-0 print:p-0 print:shadow-none shadow-sm"
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          width: "210mm",
          minHeight: "297mm",
          padding: "16mm 20mm 16mm 20mm",
          color: "#000",
          boxSizing: "border-box",
        }}
      >
        {/* Header: Logo and Invoice Meta */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <img
              src="/themefisher_logo.png"
              alt="THEMEFISHER"
              className="h-10 w-auto object-contain"
            />
          </div>
          <div className="text-right">
            <h1 className="text-[32px] font-normal tracking-tight text-black mb-4 leading-none">
              Invoice
            </h1>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-end gap-6">
                <span className="font-bold">Invoice Date:</span>
                <span className="w-24 text-right">{invoiceDate}</span>
              </div>
              <div className="flex justify-end gap-6">
                <span className="font-bold">Invoice Number:</span>
                <span className="w-24 text-right">{invoice.invoice_number}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice To / Invoice From */}
        <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
          <div>
            <div className="font-bold mb-2">Invoice to:</div>
            <div className="font-bold text-base mb-1">{client.name}</div>
            <div className="text-gray-900 whitespace-pre-line leading-relaxed text-[13px]">
              {client.address}
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold mb-2">Invoice from:</div>
            <div className="font-bold text-base mb-1">Themefisher</div>
            <div className="text-gray-900 leading-relaxed text-[13px]">
              Appartement A2, House-2G,
              <br />
              Shaymoly, Road-1, Dhaka
              <br />
              Bangladesh
            </div>
            <div className="mt-3 font-medium text-[13px]">BIN: 003271347</div>
          </div>
        </div>

        {/* Currency Section */}
        <div className="border-t border-b border-black py-2 px-1 mb-4 flex items-center gap-6 text-sm font-bold">
          <span className="tracking-wide">CURRENCY-</span>
          <span>{invoice.currency || "USD"}</span>
        </div>

        {/* Order Details Section */}
        <div className="border-b border-black pb-4 mb-4 text-sm">
          <div className="font-bold mb-2">Order details:</div>
          <div className="flex items-center gap-8">
            <span className="w-24 font-bold">Product:</span>
            <span className="font-normal">{invoice.description}</span>
          </div>
        </div>

        {/* Billing Summary Section */}
        <div className="border-b border-black pb-4 mb-4 text-sm">
          <div className="font-bold mb-2">Billing summary:</div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span>Sales Period</span>
              <span>
                {salesPeriodStart} &nbsp;-&nbsp; {salesPeriodEnd}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Amount Due</span>
              <span>{formattedAmount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Sales Tax</span>
              <span>0</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Sales Tax: %</span>
              <span>0.00%</span>
            </div>
            <div className="border-t border-b border-black py-1.5 flex justify-between items-center font-bold">
              <span>Total Amount Due</span>
              <span>{formattedAmount}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span>Payment terms</span>
              <span>15 Days</span>
            </div>
          </div>
        </div>

        {/* Transfer Information Section */}
        <div className="text-sm">
          <div className="font-bold mb-2">Transfer Information:</div>
          <div className="border border-gray-300 p-4">
            <div className="border border-black p-4 w-[330px] space-y-3 text-[12.5px] leading-tight">
              <div>
                <div className="font-bold">Bank Name:</div>
                <div className="mt-0.5">{bankName}</div>
              </div>
              <div>
                <div className="font-bold">Bank Address:</div>
                <div className="mt-0.5 whitespace-pre-line leading-snug">{bankAddress}</div>
              </div>
              <div>
                <div className="font-bold">Name on Account:</div>
                <div className="mt-0.5">{nameOnAccount}</div>
              </div>
              <div>
                <div className="font-bold">Special Instructions/ Notes:</div>
                <div className="mt-0.5">{specialInstructions}</div>
              </div>
              <div>
                <div className="font-bold">BIC/SWIFT:</div>
                <div className="mt-0.5 font-mono">{bicSwift}</div>
              </div>
              <div>
                <div className="font-bold">IBAN/Account Number:</div>
                <div className="mt-0.5 font-mono">{accountNumber}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

BankInvoice.displayName = "BankInvoice"
