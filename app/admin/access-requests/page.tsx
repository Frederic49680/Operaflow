import AccessRequestsManager from "@/components/admin/AccessRequestsManager"

export default function AccessRequestsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AccessRequestsManager />
      </main>
    </div>
  )
}
