'use client'
import { useState, useEffect, useCallback, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { useForm } from "react-hook-form"
import type { Client, ClientFormData } from "@/types"
import { EditClientModal } from "@/components/EditClientModal"
import {
  Building2,
  MapPin,
  Landmark,
  Edit2,
  Trash2,
  Search,
  PlusCircle,
  Users,
  CheckCircle2,
} from "lucide-react"

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const { register, handleSubmit, reset } = useForm<ClientFormData>()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Edit modal state
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const fetchClients = useCallback(async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("name", { ascending: true })
    if (error) {
      console.error("Error fetching clients:", error.message)
    } else if (data) {
      setClients(data as Client[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    let ignore = false
    async function load() {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("name", { ascending: true })
      if (!ignore) {
        if (error) {
          console.error("Error fetching clients:", error.message)
        } else if (data) {
          setClients(data as Client[])
        }
        setLoading(false)
      }
    }
    void load()
    return () => {
      ignore = true
    }
  }, [])

  const onSubmit = async (data: ClientFormData) => {
    setSubmitting(true)
    const { error } = await supabase.from("clients").insert([
      {
        name: data.name.trim(),
        address: data.address?.trim() || null,
        bank_name: data.bank_name?.trim() || null,
        bank_address: data.bank_address?.trim() || null,
      },
    ])
    setSubmitting(false)

    if (!error) {
      reset()
      await fetchClients()
    } else {
      alert("Error creating client: " + error.message)
    }
  }

  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    setIsEditModalOpen(true)
  }

  const handleClientSaved = (updated: Client) => {
    setClients((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c)).sort((a, b) => a.name.localeCompare(b.name))
    )
  }

  const deleteClient = async (client: Client) => {
    if (!confirm(`Are you sure you want to delete client "${client.name}"?`)) return
    const { error } = await supabase.from("clients").delete().eq("id", client.id)
    if (!error) {
      setClients((prev) => prev.filter((c) => c.id !== client.id))
    } else {
      alert("Error deleting client: " + error.message)
    }
  }

  // Filter clients by search
  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clients
    const q = searchTerm.toLowerCase()
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.address && c.address.toLowerCase().includes(q)) ||
        (c.bank_name && c.bank_name.toLowerCase().includes(q))
    )
  }, [clients, searchTerm])

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Clients</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage clients, remitting banks, and addresses for your invoices and Form-C declarations.
        </p>
      </div>

      {/* Add Client Card */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-blue-600" />
          Add New Client
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                Client Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("name", { required: true })}
                className="block w-full p-2.5 border rounded-lg border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                placeholder="Client or company name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                Client Address
              </label>
              <input
                {...register("address")}
                className="block w-full p-2.5 border rounded-lg border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                placeholder="Full billing address"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-gray-400" />
                Remitting Bank Name
              </label>
              <input
                {...register("bank_name")}
                className="block w-full p-2.5 border rounded-lg border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                placeholder="e.g. Barclays Bank PLC"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                Remitting Bank Address
              </label>
              <input
                {...register("bank_address")}
                className="block w-full p-2.5 border rounded-lg border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                placeholder="Branch, City & Country"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{submitting ? "Adding..." : "Add Client"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Existing Clients List */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Client Directory</h2>
              <p className="text-xs text-gray-500">
                {clients.length} registered {clients.length === 1 ? "client" : "clients"}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search clients..."
              className="w-full pl-9 pr-4 py-2 border rounded-xl border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-gray-50/50"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading clients...</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="p-6 hover:bg-gray-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-gray-900 truncate">{client.name}</h3>
                  </div>

                  {client.address && (
                    <div className="text-xs text-gray-600 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                      <span className="whitespace-pre-line leading-relaxed">{client.address}</span>
                    </div>
                  )}

                  {(client.bank_name || client.bank_address) && (
                    <div className="text-xs text-gray-500 flex items-center gap-1.5 pt-0.5">
                      <Landmark className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>
                        {client.bank_name && <strong className="text-gray-700">{client.bank_name}</strong>}
                        {client.bank_name && client.bank_address && " — "}
                        {client.bank_address}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions: Edit and Delete */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleEditClient(client)}
                    title="Edit Client"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 border border-gray-200 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => void deleteClient(client)}
                    title="Delete Client"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-gray-200 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}

            {filteredClients.length === 0 && (
              <div className="p-8 text-center text-gray-500 text-sm">
                {searchTerm ? "No clients match your search query." : "No clients found."}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Client Modal */}
      <EditClientModal
        client={editingClient}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaved={handleClientSaved}
      />
    </div>
  )
}
