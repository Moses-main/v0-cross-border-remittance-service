"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, File } from "lucide-react"

interface BatchUploadFormProps {
  onFileUpload: (file: File) => void
  isLoading?: boolean
}

export function BatchUploadForm({ onFileUpload, isLoading }: BatchUploadFormProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        setSelectedFile(file)
        onFileUpload(file)
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      setSelectedFile(file)
      onFileUpload(file)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
        isDragging ? "border-primary bg-primary/5 scale-105" : "border-border hover:border-primary/50"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isLoading}
      />

      <div className="space-y-4 animate-fade-in">
        <div className="flex justify-center">
          {selectedFile ? (
            <File className="h-12 w-12 text-primary animate-scale-in" />
          ) : (
            <Upload className="h-12 w-12 text-muted-foreground transition-all duration-300 hover:scale-110" />
          )}
        </div>

        <div>
          <p className="font-medium text-foreground">
            {selectedFile ? selectedFile.name : "Drag and drop your CSV file here"}
          </p>
          <p className="text-sm text-muted-foreground">or click to select a file</p>
        </div>

        <Button
          onClick={handleClick}
          disabled={isLoading}
          variant="outline"
          className="transition-all duration-300 hover:scale-105 active:scale-95 bg-transparent"
        >
          {isLoading ? "Processing..." : "Choose File"}
        </Button>
      </div>
    </div>
  )
}
