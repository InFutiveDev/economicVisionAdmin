import { useState } from 'react'
import { ImagePlus, LoaderCircle, X } from 'lucide-react'
import { uploadImageApi } from '../../api/upload.api'

type ImageUploadFieldProps = {
  id: string
  value: string
  onChange: (url: string) => void
}

export function ImageUploadField({ id, value, onChange }: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)

  const handleFile = async (file?: File) => {
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const url = await uploadImageApi(file)
      onChange(url)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not upload image.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="image-upload">
      <label
        className={`image-dropzone ${dragging ? 'is-dragging' : ''} ${value ? 'has-image' : ''}`}
        htmlFor={id}
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          void handleFile(event.dataTransfer.files[0])
        }}
      >
        {value ? (
          <img src={value} alt="" />
        ) : (
          <span className="image-dropzone-copy">
            <ImagePlus size={22} />
            <strong>Upload image</strong>
            <em>PNG, JPG, GIF, or WebP · up to 5MB</em>
          </span>
        )}
        {uploading ? (
          <span className="image-upload-status">
            <LoaderCircle size={16} className="spin" />
            Uploading…
          </span>
        ) : null}
        <input
          id={id}
          className="image-file-input"
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={(event) => {
            void handleFile(event.target.files?.[0])
            event.currentTarget.value = ''
          }}
        />
      </label>
      {value ? (
        <button
          type="button"
          className="btn"
          onClick={() => onChange('')}
        >
          <X size={14} />
          Remove image
        </button>
      ) : null}
      {error ? (
        <p className="image-upload-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
