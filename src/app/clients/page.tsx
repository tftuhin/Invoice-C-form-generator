'use client'
import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useForm } from "react-hook-form"
import type { Client, ClientFormData } from "@/types"

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const { register, handleSubmit, reset } = useForm<ClientFormData>()
  const [loading, setLoading] = useState(true)

  const fetchClients = useCallback(async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false })
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
        .order("created_at", { ascending: false })
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
    const { error } = await supabase.from("clients").insert([
      {
        name: data.name,
        address: data.address,
        bank_name: data.bank_name,
        bank_address: data.bank_address,
      },
    ])
    if (!error) {
      reset()
      await fetchClients()
    } else {
      alert("Error creating client: " + error.message)
    }
  }

  const deleteClient = async (id: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return
    const { error } = await supabase.from("clients").delete().eq("id", id)
    if (!error) {
      await fetchClients()
    } else {
      alert("Error deleting client: " + error.message)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Clients</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Add Client</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Client Name</label>
              <input
                {...register("name", { required: true })}
                className="mt-1 block w-full p-2 border rounded-md border-gray-300"
                placeholder="Client or company name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Client Address</label>
              <input
                {...register("address")}
                className="mt-1 block w-full p-2 border rounded-md border-gray-300"
                placeholder="Full billing address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bank Name</label>
              <input
                {...register("bank_name")}
                className="mt-1 block w-full p-2 border rounded-md border-gray-300"
                placeholder="Remitting bank name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bank Address</label>
              <input
                {...register("bank_address")}
                className="mt-1 block w-full p-2 border rounded-md border-gray-300"
                placeholder="Remitting bank branch & country"
              />
            </div>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium">
            Add Client
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Existing Clients</h2>
        {loading ? (
          <p className="text-gray-500">Loading clients...</p>
        ) : (
          <div className="space-y-4">
            {clients.map((client) => (
              <div key={client.id} className="flex justify-between items-center border-b pb-4 last:border-0">
                <div>
                  <div className="font-semibold text-lg">{client.name}</div>
                  <div className="text-sm text-gray-600">{client.address}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Bank: {client.bank_name || "N/A"} ({client.bank_address || "N/A"})
                  </div>
                </div>
                <button
                  onClick={() => void deleteClient(client.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            ))}
            {clients.length === 0 && <p className="text-gray-500">No clients found.</p>}
          </div>
        )}
      </div>
    </div>
  )
}
