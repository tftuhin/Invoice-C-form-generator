import React from "react"
import type { Invoice, Client, PaymentAccount } from "@/types"

interface CFormProps {
  invoice: Invoice
  client: Client
  paymentAccounts?: PaymentAccount[]
}

export const CForm = React.forwardRef<HTMLDivElement, CFormProps>(({ invoice, client }, ref) => {
  if (!invoice || !client) return <div ref={ref}></div>

  const remitterName = client.name
  const remitterAddress = client.address

  const remittingBank = client.bank_name || ""
  const remittingBankAddress = client.bank_address || ""

  // The amount is in USD
  const amount = Number(invoice.received_amount) > 0 ? invoice.received_amount : invoice.amount

  return (
    <div
      ref={ref}
      className="bg-white text-black p-12 text-sm max-w-4xl mx-auto"
      style={{ fontFamily: "serif", width: "210mm", minHeight: "297mm" }}
    >
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-bold underline">Form–C (ICT)</h2>
        <div className="border border-black p-2 w-48 h-32 flex items-center justify-center text-xs text-center">
          (for AD’s use only)
        </div>
      </div>

      <p className="text-center font-bold mb-6 text-lg">
        Declaration for inward remittance on account of ICT
        <br />
        related services of amount exceeding USD 10,000 or equivalent
      </p>

      <p className="mb-4">
        I/We do hereby declare that I/we have received remittance of <strong>{invoice.currency || "USD"} {amount}</strong> (amount) which is a
        fair value against ICT related services described below in respect of which this declaration is made out and
        that the particulars given below are true:
      </p>

      <div className="space-y-4 mb-8">
        <div>
          <span className="font-semibold">a) Remitter’s name and address:</span>
          <div className="ml-6">
            {remitterName}
            <br />
            {remitterAddress}
          </div>
        </div>

        <div>
          <span className="font-semibold">b) Remitting bank and address:</span>
          <div className="ml-6">
            {remittingBank}
            <br />
            {remittingBankAddress}
          </div>
        </div>

        <div>
          <span className="font-semibold">c) Reference No (contract/invoice/electronic communication etc.):</span>
          <span className="ml-2">{invoice.invoice_number}</span>
        </div>

        <div>
          <span className="font-semibold">d) Purpose (please tick):</span>
          <div className="ml-6 space-y-2 mt-2">
            <div className="flex items-start">
              <div className="w-4 h-4 border border-black flex items-center justify-center mr-2 mt-1">✓</div>
              <div>
                Information Technology Enabled Services (IT Enabled Services) and Business Process Outsourcing (BPO)
                services – code 2410
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-4 h-4 border border-black mr-2 mt-1"></div>
              <div>Computer and Information Technology consultancy and management services – code 2411</div>
            </div>
            <div className="flex items-start">
              <div className="w-4 h-4 border border-black mr-2 mt-1"></div>
              <div>Export of computer software including turn-key basis (customized)– code 2412</div>
            </div>
            <div className="flex items-start">
              <div className="w-4 h-4 border border-black mr-2 mt-1"></div>
              <div>Export of computer software including turn-key basis (non-customized) – code 2413</div>
            </div>
            <div className="flex items-start">
              <div className="w-4 h-4 border border-black mr-2 mt-1"></div>
              <div>
                Installation services concerning hardware and software maintenance and repairs of computers and
                peripheral equipment services – code 2414
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-4 h-4 border border-black mr-2 mt-1"></div>
              <div>………………………. (please specify)</div>
            </div>
          </div>
          <p className="ml-6 text-xs mt-2 italic text-gray-700">
            Note: Please see the “Code lists for Reporting of External Sector transactions by the Authorized dealers” for
            explanatory notes of above purposes.
          </p>
        </div>
      </div>

      <div className="mt-16">
        <div className="w-64 border-b border-black mb-1"></div>
        <div className="grid grid-cols-[200px_1fr] gap-2">
          <div className="font-semibold">Signature with name of applicant:</div>
          <div>Themefisher</div>

          <div className="font-semibold">Address:</div>
          <div>Apartment A2, House-2G, Shaymoly, Road-1, Dhaka, Bangladesh</div>

          <div className="font-semibold">Date:</div>
          <div>{new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</div>
        </div>
      </div>

      <div className="mt-16 border-t border-black pt-4">
        <h3 className="font-bold mb-4 text-center">(for AD’s use only)</h3>
        <table className="w-full border-collapse border border-black text-center mb-8">
          <thead>
            <tr>
              <th className="border border-black p-2">Month</th>
              <th className="border border-black p-2">Country of ordering customer</th>
              <th className="border border-black p-2">Purpose</th>
              <th className="border border-black p-2">Amount in (state currency)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2 h-8"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>
          </tbody>
        </table>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="flex mb-2">
              <span className="w-48">Coded by:</span> <span className="border-b border-black flex-1"></span>
            </div>
            <div className="flex mb-2">
              <span className="w-48">Checked by:</span> <span className="border-b border-black flex-1"></span>
            </div>
            <div className="flex">
              <span className="w-48">Purpose of remittance:</span>{" "}
              <span className="border-b border-black flex-1"></span>
            </div>
          </div>
          <div className="flex flex-col items-end justify-end">
            <div className="w-64 border-b border-black mb-1"></div>
            <div>Signature and stamp of Authorized Dealer</div>
            <div className="w-64 flex mt-2">
              <span className="mr-2">Date:</span> <span className="border-b border-black flex-1"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

CForm.displayName = "CForm"
