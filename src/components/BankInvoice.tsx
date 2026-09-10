import React from "react"
import { format } from "date-fns"
import type { Invoice, Client, PaymentAccount } from "@/types"

interface BankInvoiceProps {
  invoice: Invoice
  client: Client
  paymentAccounts: PaymentAccount[]
}

export const BankInvoice = React.forwardRef<HTMLDivElement, BankInvoiceProps>(
  ({ invoice, client, paymentAccounts }, ref) => {
    if (!invoice || !client) return <div ref={ref}></div>

    // Format dates safely
    let invoiceDate = ""
    try {
      if (invoice.invoice_date) {
        invoiceDate = format(new Date(invoice.invoice_date), "yyyy-MM-dd")
      }
    } catch {
      invoiceDate = invoice.invoice_date || ""
    }

    const periodStart = invoiceDate
    const periodEnd = invoiceDate // Simplified for now

    const selectedAccounts = paymentAccounts.filter((acc) =>
      invoice.payment_methods?.includes(acc.id)
    )

    return (
      <div
        ref={ref}
        className="bg-white text-black p-12 text-sm max-w-4xl mx-auto"
        style={{ fontFamily: "sans-serif", width: "210mm", minHeight: "297mm" }}
      >
        <div className="flex justify-between mb-12">
          <h1 className="text-4xl font-bold text-gray-800 tracking-wider">INVOICE</h1>
          <div className="text-right">
            <div className="flex justify-end gap-4">
              <span className="font-semibold text-gray-600">Invoice Date:</span>
              <span>{invoiceDate}</span>
            </div>
            <div className="flex justify-end gap-4 mt-1">
              <span className="font-semibold text-gray-600">Invoice Number:</span>
              <span>{invoice.invoice_number}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12">
          <div>
            <h3 className="font-bold text-gray-600 mb-2 border-b pb-1">Invoice to:</h3>
            <div className="font-bold text-lg mb-1">{client.name}</div>
            <div className="whitespace-pre-wrap text-gray-700">{client.address}</div>
          </div>
          <div>
            <h3 className="font-bold text-gray-600 mb-2 border-b pb-1">Invoice from:</h3>
            <div className="font-bold text-lg mb-1">Themefisher</div>
            <div className="text-gray-700 leading-relaxed">
              Appartement A2, House-2G,
              <br />
              Shaymoly, Road-1, Dhaka
              <br />
              Bangladesh
              <br />
              <br />
              BIN: 003271347
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-bold text-gray-600">CURRENCY -</span> <span>USD</span>
          </div>

          <h3 className="font-bold text-gray-600 mb-2">Order details:</h3>
          <table className="w-full mb-8">
            <tbody>
              <tr className="border-b border-t">
                <td className="py-3 font-semibold text-gray-700 w-1/4">Product:</td>
                <td className="py-3">{invoice.description}</td>
              </tr>
            </tbody>
          </table>

          <h3 className="font-bold text-gray-600 mb-2">Billing summary:</h3>
          <table className="w-full mb-8">
            <tbody>
              <tr className="border-t border-b">
                <td className="py-2 text-gray-700 w-1/3">Sales Period</td>
                <td className="py-2 text-right">
                  {periodStart} - {periodEnd}
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2 text-gray-700">Amount Due</td>
                <td className="py-2 text-right">{invoice.amount}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 text-gray-700">Sales Tax</td>
                <td className="py-2 text-right">0</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-bold text-gray-800">Total Amount Due</td>
                <td className="py-2 text-right font-bold">{invoice.amount}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex items-center gap-4 mb-12">
            <span className="font-bold text-gray-600">Payment terms</span>
            <span>15 Days</span>
          </div>

          <h3 className="font-bold text-gray-600 mb-4 border-b pb-1">Transfer Information:</h3>
          {selectedAccounts.length > 0 ? (
            <div className="space-y-6">
              {selectedAccounts.map((acc) => {
                const bankName = acc.bank_name || acc.account_name || "N/A"
                const hasStructured = acc.name_on_account || acc.account_number
                return (
                  <div key={acc.id} className="grid grid-cols-2 gap-4 border-b pb-4 last:border-0">
                    <div>
                      <div className="font-semibold text-gray-700">Bank Name:</div>
                      <div className="font-bold">{bankName}</div>
                      {acc.bank_address && (
                        <div className="text-gray-600 text-xs mt-0.5 whitespace-pre-wrap">{acc.bank_address}</div>
                      )}
                    </div>
                    <div>
                      {hasStructured ? (
                        <div className="space-y-1 text-xs sm:text-sm">
                          {acc.name_on_account && (
                            <div>
                              <span className="font-semibold text-gray-700">Name on Account: </span>
                              <span>{acc.name_on_account}</span>
                            </div>
                          )}
                          {acc.account_number && (
                            <div>
                              <span className="font-semibold text-gray-700">Account / IBAN: </span>
                              <span className="font-mono">{acc.account_number}</span>
                            </div>
                          )}
                          {acc.bic_swift && (
                            <div>
                              <span className="font-semibold text-gray-700">BIC / SWIFT: </span>
                              <span className="font-mono">{acc.bic_swift}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div className="font-semibold text-gray-700">Business Name:</div>
                          <div className="whitespace-pre-wrap">{acc.account_details}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="font-semibold text-gray-700">Bank Name:</div>
                <div className="font-bold">{client.bank_name || "N/A"}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-700">Business Name:</div>
                <div className="whitespace-pre-wrap">{client.bank_address || "N/A"}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
)

BankInvoice.displayName = "BankInvoice"
