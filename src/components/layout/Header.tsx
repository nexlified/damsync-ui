import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (q.trim()) {
      void navigate(`/assets?q=${encodeURIComponent(q.trim())}`)
    }
  }

  return (
    <header className="flex h-14 items-center gap-4 border-b border-gray-200 bg-white px-6">
      <h1 className="text-sm font-semibold text-gray-900">{title}</h1>
      <div className="ml-auto w-64">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search assets..."
            className="pl-8"
          />
        </form>
      </div>
    </header>
  )
}
