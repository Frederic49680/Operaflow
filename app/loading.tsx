export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-white text-2xl font-bold">OF</span>
        </div>
        <p className="text-slate-600 font-medium">Chargement...</p>
      </div>
    </div>
  )
}

