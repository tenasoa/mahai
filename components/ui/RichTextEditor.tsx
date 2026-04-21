'use client'

import React, { useRef, useState, useEffect } from 'react'
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Type,
  X,
  Upload,
  ExternalLink,
  Plus
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder = 'Saisissez votre contenu...' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  // Initialisation du contenu uniquement au montage ou si la valeur externe change de manière drastique (ex: reset)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value && !isFocused) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value, isFocused])

  const [linkModal, setLinkModal] = useState({ open: false, url: '', text: '' })
  const [imageModal, setImageModal] = useState({ open: false, url: '', file: null as File | null })
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const [activeStates, setActiveStates] = useState({
    bold: false,
    italic: false,
    underline: false,
    h2: false,
    h3: false,
    list: false,
    orderedList: false,
    blockquote: false,
    code: false
  })

  const checkActiveStates = () => {
    setActiveStates({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      h2: document.queryCommandValue('formatBlock') === 'h2',
      h3: document.queryCommandValue('formatBlock') === 'h3',
      list: document.queryCommandState('insertUnorderedList'),
      orderedList: document.queryCommandState('insertOrderedList'),
      blockquote: document.queryCommandValue('formatBlock') === 'blockquote',
      code: document.queryCommandValue('formatBlock') === 'pre'
    })
  }

  const execCommand = (command: string, arg?: string) => {
    document.execCommand(command, false, arg)
    editorRef.current?.focus()
    handleInput()
    checkActiveStates()
  }

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const insertLink = () => {
    if (linkModal.url) {
      // Si du texte est sélectionné, on l'utilise, sinon on utilise le texte saisi
      const selection = window.getSelection()
      if (selection && selection.toString()) {
        execCommand('createLink', linkModal.url)
      } else {
        const linkHtml = `<a href="${linkModal.url}" target="_blank" class="text-gold underline">${linkModal.text || linkModal.url}</a>`
        execCommand('insertHTML', linkHtml)
      }
      setLinkModal({ open: false, url: '', text: '' })
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `blog-content/${fileName}`

      const { error: uploadError, data } = await supabase.storage
        .from('images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      const imgHtml = `<img src="${publicUrl}" alt="Blog Image" class="rounded-xl my-4 max-w-full" />`
      execCommand('insertHTML', imgHtml)
      setImageModal({ open: false, url: '', file: null })
    } catch (error) {
      console.error('Error uploading image:', error)
      alert("Erreur lors de l'upload de l'image")
    } finally {
      setIsUploading(false)
    }
  }

  const insertImageUrl = () => {
    if (imageModal.url) {
      const imgHtml = `<img src="${imageModal.url}" alt="Blog Image" class="rounded-xl my-4 max-w-full" />`
      execCommand('insertHTML', imgHtml)
      setImageModal({ open: false, url: '', file: null })
    }
  }

  const formatBlock = (tag: string) => {
    execCommand('formatBlock', tag)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const node = range.startContainer.parentElement
        
        // Si on est dans un blockquote ou pre et qu'on appuie sur Entrée deux fois (ou Shift+Entrée)
        // on force la sortie vers un paragraphe
        if (node?.tagName === 'BLOCKQUOTE' || node?.tagName === 'PRE') {
          const isEmpty = range.startContainer.textContent?.trim() === ''
          
          if (e.shiftKey || (isEmpty && e.key === 'Enter')) {
            // Sortie forcée
            e.preventDefault()
            
            // On insère un nouveau paragraphe après le bloc actuel
            const p = document.createElement('p')
            p.innerHTML = '<br>'
            node.parentNode?.insertBefore(p, node.nextSibling)
            
            // On place le curseur dans le nouveau paragraphe
            const newRange = document.createRange()
            const sel = window.getSelection()
            newRange.setStart(p, 0)
            newRange.collapse(true)
            sel?.removeAllRanges()
            sel?.addRange(newRange)
            
            checkActiveStates()
            handleInput()
          }
        }
      }
    }
  }

  const ToolbarButton = ({ onClick, icon: Icon, title, active = false }: { onClick: () => void, icon: any, title: string, active?: boolean }) => (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        onClick()
      }}
      title={title}
      className={`p-2 rounded-lg transition-all ${
        active 
          ? 'text-gold bg-gold-dim border border-gold-line shadow-glow-sm' 
          : 'text-text-3 hover:text-gold hover:bg-gold-dim border border-transparent'
      }`}
    >
      <Icon size={18} />
    </button>
  )

  return (
    <div className={`border rounded-xl bg-card transition-colors ${isFocused ? 'border-gold shadow-glow-sm' : 'border-border-1'}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border-1 bg-surface sticky top-[-24px] z-20 shadow-md transition-shadow rounded-t-xl">
        <ToolbarButton onClick={() => formatBlock('<P>')} icon={Type} title="Texte normal" active={document.queryCommandValue('formatBlock') === 'p'} />
        <div className="w-[1px] h-6 bg-border-1 mx-1" />
        <ToolbarButton onClick={() => formatBlock('H2')} icon={Heading2} title="Titre 2" active={activeStates.h2} />
        <ToolbarButton onClick={() => formatBlock('H3')} icon={Heading3} title="Titre 3" active={activeStates.h3} />
        <div className="w-[1px] h-6 bg-border-1 mx-1" />
        <ToolbarButton onClick={() => execCommand('bold')} icon={Bold} title="Gras" active={activeStates.bold} />
        <ToolbarButton onClick={() => execCommand('italic')} icon={Italic} title="Italique" active={activeStates.italic} />
        <ToolbarButton onClick={() => execCommand('underline')} icon={Underline} title="Souligné" active={activeStates.underline} />
        <div className="w-[1px] h-6 bg-border-1 mx-1" />
        <ToolbarButton onClick={() => execCommand('insertUnorderedList')} icon={List} title="Liste à puces" active={activeStates.list} />
        <ToolbarButton onClick={() => execCommand('insertOrderedList')} icon={ListOrdered} title="Liste numérotée" active={activeStates.orderedList} />
        <div className="w-[1px] h-6 bg-border-1 mx-1" />
        <ToolbarButton onClick={() => formatBlock('BLOCKQUOTE')} icon={Quote} title="Citation" active={activeStates.blockquote} />
        <ToolbarButton onClick={() => formatBlock('PRE')} icon={Code} title="Bloc de code" active={activeStates.code} />
        <div className="w-[1px] h-6 bg-border-1 mx-1" />
        <ToolbarButton onClick={() => setLinkModal({ ...linkModal, open: true })} icon={LinkIcon} title="Insérer un lien" />
        <ToolbarButton onClick={() => setImageModal({ ...imageModal, open: true })} icon={ImageIcon} title="Insérer une image" />
      </div>

      {/* MODALS INTERNES */}
      {linkModal.open && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-void/60 backdrop-blur-sm">
          <div className="bg-card border border-gold-line rounded-xl shadow-lg w-full max-w-sm p-5 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-display text-lg text-gold flex items-center gap-2">
                <LinkIcon size={18} /> Insérer un lien
              </h4>
              <button onClick={() => setLinkModal({ ...linkModal, open: false })} className="text-text-4 hover:text-ruby">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono text-text-4 uppercase mb-1 block">URL du lien</label>
                <input 
                  type="text" 
                  className="admin-input w-full" 
                  placeholder="https://example.com"
                  value={linkModal.url}
                  onChange={e => setLinkModal({ ...linkModal, url: e.target.value })}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-mono text-text-4 uppercase mb-1 block">Texte à afficher (optionnel)</label>
                <input 
                  type="text" 
                  className="admin-input w-full" 
                  placeholder="Cliquez ici"
                  value={linkModal.text}
                  onChange={e => setLinkModal({ ...linkModal, text: e.target.value })}
                />
              </div>
              <button 
                onClick={insertLink}
                disabled={!linkModal.url}
                className="admin-btn w-full justify-center"
              >
                Appliquer le lien
              </button>
            </div>
          </div>
        </div>
      )}

      {imageModal.open && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-void/60 backdrop-blur-sm">
          <div className="bg-card border border-gold-line rounded-xl shadow-lg w-full max-w-sm p-5 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-display text-lg text-gold flex items-center gap-2">
                <ImageIcon size={18} /> Insérer une image
              </h4>
              <button onClick={() => setImageModal({ ...imageModal, open: false })} className="text-text-4 hover:text-ruby">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border-1 rounded-xl p-8 text-center hover:border-gold hover:bg-gold-dim transition-all cursor-pointer group"
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-gold border-t-transparent animate-spin rounded-full" />
                    <span className="text-sm text-text-3">Upload en cours...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto mb-2 text-text-4 group-hover:text-gold" size={24} />
                    <p className="text-sm text-text-3">Cliquez pour uploader depuis votre ordinateur</p>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </div>

              <div className="relative text-center py-2">
                <span className="bg-card px-2 text-[10px] font-mono text-text-4 uppercase relative z-10">Ou via URL</span>
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-border-1" />
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="admin-input flex-grow" 
                  placeholder="https://..."
                  value={imageModal.url}
                  onChange={e => setImageModal({ ...imageModal, url: e.target.value })}
                />
                <button 
                  onClick={insertImageUrl}
                  disabled={!imageModal.url}
                  className="admin-btn p-3"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onSelect={checkActiveStates}
        onClick={checkActiveStates}
        onKeyUp={checkActiveStates}
        onBlur={() => {
          setIsFocused(false)
          handleInput()
        }}
        onFocus={() => setIsFocused(true)}
        className="p-4 min-h-[300px] text-text focus:outline-none prose prose-slate dark:prose-invert prose-gold max-w-none prose-headings:font-display prose-a:text-gold prose-blockquote:border-l-gold prose-blockquote:bg-gold-dim prose-blockquote:not-italic prose-img:rounded-xl"
        style={{ color: 'var(--text)' }}
        data-placeholder={placeholder}
      />
      <style jsx>{`
        div[contentEditable]:empty:before {
          content: attr(data-placeholder);
          color: var(--text-4);
          cursor: text;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}
