import { useState } from 'react'
import { ChevronRight, ChevronDown, Folder, FolderOpen, Plus, Trash2 } from 'lucide-react'
import type { Folder as FolderType } from '@/types'
import { cn } from '@/lib/utils'
import { useCreateFolder, useDeleteFolder } from '@/hooks/useFolders'

interface FolderNodeProps {
  folder: FolderType
  selectedId?: string
  onSelect: (folderId: string | undefined) => void
  depth?: number
}

function FolderNode({ folder, selectedId, onSelect, depth = 0 }: FolderNodeProps) {
  const [expanded, setExpanded] = useState(false)
  const [addingChild, setAddingChild] = useState(false)
  const [newName, setNewName] = useState('')
  const createFolder = useCreateFolder()
  const deleteFolder = useDeleteFolder()
  const hasChildren = folder.children && folder.children.length > 0

  const handleCreate = () => {
    if (!newName.trim()) return
    createFolder.mutate({ name: newName.trim(), parent_id: folder.id }, {
      onSuccess: () => { setAddingChild(false); setNewName('') },
    })
  }

  return (
    <li>
      <div
        className={cn(
          'group flex items-center gap-1 rounded-md px-1.5 py-1 cursor-pointer hover:bg-gray-100',
          selectedId === folder.id && 'bg-gray-100 font-medium'
        )}
        style={{ paddingLeft: `${(depth * 12) + 6}px` }}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-shrink-0 p-0.5 text-gray-400 hover:text-gray-600"
        >
          {hasChildren
            ? (expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />)
            : <span className="w-4" />
          }
        </button>
        <button
          className="flex flex-1 items-center gap-1.5 text-sm text-gray-700"
          onClick={() => onSelect(folder.id)}
        >
          {expanded ? <FolderOpen className="h-3.5 w-3.5 text-yellow-500" /> : <Folder className="h-3.5 w-3.5 text-yellow-500" />}
          <span className="truncate">{folder.name}</span>
        </button>
        <div className="hidden group-hover:flex items-center gap-0.5">
          <button
            onClick={(e) => { e.stopPropagation(); setAddingChild(true); setExpanded(true) }}
            className="rounded p-0.5 text-gray-400 hover:text-gray-700"
          >
            <Plus className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (confirm(`Delete folder "${folder.name}"?`)) {
                deleteFolder.mutate(folder.id)
              }
            }}
            className="rounded p-0.5 text-gray-400 hover:text-red-500"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {expanded && (
        <ul>
          {folder.children?.map((child) => (
            <FolderNode
              key={child.id}
              folder={child}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
          {addingChild && (
            <li style={{ paddingLeft: `${((depth + 1) * 12) + 6}px` }} className="pr-2 py-1">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate()
                  if (e.key === 'Escape') { setAddingChild(false); setNewName('') }
                }}
                onBlur={() => { if (!newName.trim()) setAddingChild(false) }}
                placeholder="New folder name..."
                className="w-full rounded border border-gray-200 px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </li>
          )}
        </ul>
      )}
    </li>
  )
}

interface FolderTreeProps {
  folders: FolderType[]
  selectedId?: string
  onSelect: (folderId: string | undefined) => void
}

export function FolderTree({ folders, selectedId, onSelect }: FolderTreeProps) {
  const [addingRoot, setAddingRoot] = useState(false)
  const [newName, setNewName] = useState('')
  const createFolder = useCreateFolder()

  const handleCreate = () => {
    if (!newName.trim()) return
    createFolder.mutate({ name: newName.trim() }, {
      onSuccess: () => { setAddingRoot(false); setNewName('') },
    })
  }

  return (
    <div className="w-48 shrink-0 border-r border-gray-200 bg-white">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Folders</span>
        <button
          onClick={() => setAddingRoot(true)}
          className="rounded p-0.5 text-gray-400 hover:text-gray-700"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      <ul className="p-1">
        <li>
          <button
            onClick={() => onSelect(undefined)}
            className={cn(
              'flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-sm transition-colors',
              !selectedId ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-600 hover:bg-gray-50'
            )}
          >
            <Folder className="h-3.5 w-3.5 text-gray-400" />
            All Assets
          </button>
        </li>
        {folders.map((folder) => (
          <FolderNode key={folder.id} folder={folder} selectedId={selectedId} onSelect={onSelect} />
        ))}
        {addingRoot && (
          <li className="px-2 py-1">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate()
                if (e.key === 'Escape') { setAddingRoot(false); setNewName('') }
              }}
              onBlur={() => { if (!newName.trim()) setAddingRoot(false) }}
              placeholder="New folder name..."
              className="w-full rounded border border-gray-200 px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </li>
        )}
      </ul>
    </div>
  )
}
