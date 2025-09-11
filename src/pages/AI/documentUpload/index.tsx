import { Button } from '@/components/custom/button'
import { LoadingSpinner } from '@/components/custom/loading-spinner'
import { useApiKey } from '@/hooks/useApiKey'
import useAxiosPublic from '@/hooks/useAxiosPublic'
import ContentSection from '@/pages/settings/components/content-section'
import { AxiosError, AxiosInstance } from 'axios'
import {
  Brain,
  Check,
  Eye,
  FileSpreadsheet,
  FileText,
  Play,
  RotateCcw,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

interface UploadedDocument {
  id: string
  name: string
  type: 'pdf' | 'csv'
  size: number
  status: 'uploading' | 'completed' | 'failed'
  trainingStatus: 'not_trained' | 'training' | 'trained' | 'training_failed'
  uploadedAt: string
  trainedAt?: string
  url?: string
}

export default function DocumentUploadPage() {
  const navigate = useNavigate()
  const { apiKey } = useApiKey() as { apiKey: string }
  const axiosPublic = useAxiosPublic() as AxiosInstance

  // State management
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedDocuments, setUploadedDocuments] = useState<
    UploadedDocument[]
  >([])
  // const [showPreview, setShowPreview] = useState<string | null>(null)

  // Load existing documents function
  const loadExistingDocuments = useCallback(async () => {
    if (!apiKey) return

    try {
      const response = await axiosPublic.get('/api/chatbot/upload_history', {
        headers: {
          'X-API-Key': apiKey,
        },
      })

      if (response.data && Array.isArray(response.data)) {
        // Filter only document uploads (PDF/CSV files), exclude URLs and social media
        const documentItems = response.data.filter(
          (item: { type?: string; file_name?: string; url?: string }) =>
            // Only show items that are actual document files
            (item.type === 'pdf' ||
              item.type === 'csv' ||
              item.type === 'document') &&
            item.file_name && // Must have a file name
            !item.url // Must not be a URL upload
        )

        const documents: UploadedDocument[] = documentItems.map(
          (item: {
            _id?: string
            id?: string
            file_name?: string
            url?: string
            type?: string
            status?: string
            training_status?: string
            created_at?: string
            training_completed_at?: string
          }) => {
            return {
              id: item._id || item.id || '',
              name: item.file_name || 'Unknown Document',
              type:
                item.type === 'pdf'
                  ? 'pdf'
                  : item.type === 'csv'
                    ? 'csv'
                    : 'pdf', // Default to pdf for 'document' type
              size: 0, // Size not available from backend
              status: item.status === 'Used' ? 'completed' : 'failed',
              // Infer training status from backend status; backend may not return training_status
              trainingStatus:
                item.status === 'Used' ? 'trained' : 'not_trained',
              uploadedAt: item.created_at || '',
              trainedAt: item.status === 'Used' ? item.created_at : undefined,
              url: item.url,
            }
          }
        )
        setUploadedDocuments(documents)
      }
    } catch (error) {
      console.error('Error loading existing documents:', error)
      // Don't show error toast as this is not critical
    }
  }, [apiKey, axiosPublic])

  // Load existing documents on component mount
  useEffect(() => {
    loadExistingDocuments()
  }, [loadExistingDocuments])

  // File validation
  const validateFile = (file: File): boolean => {
    const allowedTypes = ['application/pdf', 'text/csv']
    const allowedExtensions = ['.pdf', '.csv']
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf('.'))

    return (
      allowedTypes.includes(file.type) ||
      allowedExtensions.includes(fileExtension)
    )
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Get file type
  const getFileType = (fileName: string): 'pdf' | 'csv' => {
    return fileName.toLowerCase().endsWith('.pdf') ? 'pdf' : 'csv'
  }

  // Handle file upload
  const uploadFile = useCallback(
    async (file: File) => {
      if (!apiKey) {
        toast.error('API key not available')
        return
      }

      const tempDocumentId = Date.now().toString()
      const newDocument: UploadedDocument = {
        id: tempDocumentId,
        name: file.name,
        type: getFileType(file.name),
        size: file.size,
        status: 'uploading',
        trainingStatus: 'not_trained',
        uploadedAt: new Date().toISOString(),
      }

      setUploadedDocuments((prev) => [newDocument, ...prev])

      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await axiosPublic.post(
          '/api/chatbot/upload_document',
          formData,
          {
            headers: {
              'X-API-Key': apiKey,
            },
          }
        )

        if (response.data.status === 'success') {
          const backendDocumentId =
            response.data.document_id || response.data.id
          setUploadedDocuments((prev) =>
            prev.map((doc) =>
              doc.id === tempDocumentId
                ? {
                    ...doc,
                    id: backendDocumentId || tempDocumentId,
                    status: 'completed',
                    url: response.data.url,
                  }
                : doc
            )
          )
          toast.success(`${file.name} uploaded successfully`)
        }
      } catch (error: unknown) {
        console.error('Error uploading file:', error)
        setUploadedDocuments((prev) =>
          prev.map((doc) =>
            doc.id === tempDocumentId ? { ...doc, status: 'failed' } : doc
          )
        )

        if (error instanceof AxiosError) {
          if (error.response?.status === 401) {
            toast.error('Authentication failed. Please check your API key.')
          } else if (error.response?.status === 400) {
            toast.error(
              'Invalid file format. Please upload PDF or CSV files only.'
            )
          } else {
            toast.error('Failed to upload document. Please try again.')
          }
        } else {
          toast.error('Failed to upload document. Please try again.')
        }
      }
    },
    [apiKey, axiosPublic]
  )

  // Handle file selection
  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files) return

      const validFiles: File[] = []
      const invalidFiles: string[] = []

      Array.from(files).forEach((file) => {
        if (validateFile(file)) {
          validFiles.push(file)
        } else {
          invalidFiles.push(file.name)
        }
      })

      if (invalidFiles.length > 0) {
        toast.error(
          `Invalid files: ${invalidFiles.join(', ')}. Only PDF and CSV files are allowed.`
        )
      }

      if (validFiles.length > 0) {
        setIsUploading(true)
        const uploadPromises = validFiles.map((file) => uploadFile(file))

        Promise.all(uploadPromises).finally(() => {
          setIsUploading(false)
        })
      }
    },
    [uploadFile]
  )

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      handleFileSelect(e.dataTransfer.files)
    },
    [handleFileSelect]
  )

  // File input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
  }

  // Train document (no-op): backend trains on upload; we just reflect status
  const trainDocument = async (documentId: string) => {
    setUploadedDocuments((prev) =>
      prev.map((doc) =>
        doc.id === documentId
          ? {
              ...doc,
              trainingStatus:
                doc.status === 'completed' ? 'trained' : 'not_trained',
              trainedAt:
                doc.status === 'completed'
                  ? new Date().toISOString()
                  : doc.trainedAt,
            }
          : doc
      )
    )
    toast.info('Training runs automatically on upload. Refreshed status.')
    setTimeout(() => {
      loadExistingDocuments()
    }, 800)
  }

  // Remove document from knowledge base (hard delete from upload history)
  const removeFromKnowledgeBase = async (documentId: string) => {
    if (!apiKey) {
      toast.error('API key not available')
      return
    }

    try {
      const response = await axiosPublic.delete(
        `/api/chatbot/upload_history/${documentId}`,
        {
          headers: {
            'X-API-Key': apiKey,
          },
        }
      )

      if (response.data.status === 'success') {
        // Remove the document from the local state immediately
        setUploadedDocuments((prev) =>
          prev.filter((doc) => doc.id !== documentId)
        )
        toast.success('Document removed from knowledge base')

        // Refresh the document list to ensure status is synced with backend
        setTimeout(() => {
          loadExistingDocuments()
        }, 1000)
      }
    } catch (error: unknown) {
      console.error('Error removing document:', error)
      toast.error('Failed to remove document from knowledge base')
    }
  }

  // Remove document completely
  const removeDocument = (id: string) => {
    setUploadedDocuments((prev) => prev.filter((doc) => doc.id !== id))
    toast.success('Document removed')
  }

  // Get status icon
  const getStatusIcon = (status: UploadedDocument['status']) => {
    switch (status) {
      case 'uploading':
        return <LoadingSpinner size='sm' />
      case 'completed':
        return <Check className='h-4 w-4 text-green-500' />
      case 'failed':
        return <X className='h-4 w-4 text-red-500' />
    }
  }

  // Get status color (unused but kept for future use)
  // const getStatusColor = (status: UploadedDocument['status']) => {
  //   switch (status) {
  //     case 'uploading':
  //       return 'text-blue-600'
  //     case 'completed':
  //       return 'text-green-600'
  //     case 'failed':
  //       return 'text-red-600'
  //   }
  // }

  // Get training status icon
  const getTrainingStatusIcon = (
    status: UploadedDocument['trainingStatus']
  ) => {
    switch (status) {
      case 'not_trained':
        return <Brain className='h-4 w-4 text-gray-400' />
      case 'training':
        return <LoadingSpinner size='sm' />
      case 'trained':
        return <Check className='h-4 w-4 text-green-500' />
      case 'training_failed':
        return <X className='h-4 w-4 text-red-500' />
    }
  }

  // Get training status color
  const getTrainingStatusColor = (
    status: UploadedDocument['trainingStatus']
  ) => {
    switch (status) {
      case 'not_trained':
        return 'bg-gray-100 text-gray-800'
      case 'training':
        return 'bg-blue-100 text-blue-800'
      case 'trained':
        return 'bg-green-100 text-green-800'
      case 'training_failed':
        return 'bg-red-100 text-red-800'
    }
  }

  // Get training status text
  const getTrainingStatusText = (
    status: UploadedDocument['trainingStatus']
  ) => {
    switch (status) {
      case 'not_trained':
        return 'Not Trained'
      case 'training':
        return 'Training...'
      case 'trained':
        return 'Trained'
      case 'training_failed':
        return 'Training Failed'
    }
  }

  return (
    <div className='mx-6 mt-4'>
      <ContentSection title='Document Upload'>
        <div className='space-y-6'>
          <p className='text-muted-foreground'>
            Upload PDF and CSV documents to train your AI chatbot with specific
            knowledge and data. This page only shows document uploads, not
            website URLs or social media content.
          </p>

          {/* Upload Area */}
          <div className='relative'>
            <div
              className={`relative rounded-xl border-2 border-dashed p-12 text-center transition-all duration-200 ${
                isDragOver
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type='file'
                accept='.pdf,.csv'
                multiple
                onChange={handleFileInputChange}
                className='absolute inset-0 h-full w-full cursor-pointer opacity-0'
                disabled={isUploading}
              />

              <div className='space-y-4'>
                <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100'>
                  <Upload className='h-8 w-8 text-gray-400' />
                </div>

                <div>
                  <h3 className='text-lg font-medium text-gray-900'>
                    {isDragOver ? 'Drop files here' : 'Upload Documents'}
                  </h3>
                  <p className='mt-2 text-sm text-gray-500'>
                    Drag and drop your files here, or click to browse
                  </p>
                  <p className='mt-1 text-xs text-gray-400'>
                    Supports PDF and CSV files up to 10MB each
                  </p>
                </div>

                <div className='flex items-center justify-center gap-4 text-xs text-gray-400'>
                  <div className='flex items-center gap-1'>
                    <FileText className='h-4 w-4' />
                    <span>PDF</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <FileSpreadsheet className='h-4 w-4' />
                    <span>CSV</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Uploaded Documents */}
          {uploadedDocuments.length > 0 && (
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-medium'>Document Knowledge Base</h3>
                <div className='flex items-center gap-4'>
                  <div className='flex items-center gap-4 text-sm text-gray-500'>
                    <span>
                      {uploadedDocuments.length} document
                      {uploadedDocuments.length !== 1 ? 's' : ''}
                    </span>
                    <span>
                      {
                        uploadedDocuments.filter(
                          (doc) => doc.trainingStatus === 'trained'
                        ).length
                      }{' '}
                      trained
                    </span>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={loadExistingDocuments}
                    className='text-gray-600 hover:text-gray-800'
                  >
                    <RotateCcw className='mr-1 h-4 w-4' />
                    Refresh
                  </Button>
                </div>
              </div>

              <div className='space-y-3'>
                {uploadedDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className='flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100'>
                        {doc.type === 'pdf' ? (
                          <FileText className='h-5 w-5 text-red-500' />
                        ) : (
                          <FileSpreadsheet className='h-5 w-5 text-green-500' />
                        )}
                      </div>

                      <div className='flex-1'>
                        <div className='flex items-center gap-2'>
                          <h4 className='font-medium text-gray-900'>
                            {doc.name}
                          </h4>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                              doc.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : doc.status === 'failed'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {getStatusIcon(doc.status)}
                            {doc.status}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getTrainingStatusColor(doc.trainingStatus)}`}
                          >
                            {getTrainingStatusIcon(doc.trainingStatus)}
                            {getTrainingStatusText(doc.trainingStatus)}
                          </span>
                        </div>
                        <div className='flex items-center gap-4 text-sm text-gray-500'>
                          <span>{formatFileSize(doc.size)}</span>
                          <span>{doc.type.toUpperCase()}</span>
                          <span>
                            Uploaded:{' '}
                            {new Date(doc.uploadedAt).toLocaleString()}
                          </span>
                          {doc.trainedAt && (
                            <span>
                              Trained:{' '}
                              {new Date(doc.trainedAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center gap-2'>
                      {doc.status === 'completed' && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => {
                            // Preview functionality can be implemented here
                            toast.info('Preview functionality coming soon')
                          }}
                        >
                          <Eye className='h-4 w-4' />
                        </Button>
                      )}

                      {doc.status === 'completed' &&
                        doc.trainingStatus === 'not_trained' && (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => trainDocument(doc.id)}
                            className='text-blue-600 hover:text-blue-700'
                          >
                            <Play className='h-4 w-4' />
                          </Button>
                        )}

                      {doc.trainingStatus === 'training_failed' && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => trainDocument(doc.id)}
                          className='text-orange-600 hover:text-orange-700'
                        >
                          <RotateCcw className='h-4 w-4' />
                        </Button>
                      )}

                      {doc.trainingStatus === 'trained' && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => removeFromKnowledgeBase(doc.id)}
                          className='text-orange-600 hover:text-orange-700'
                        >
                          <Brain className='h-4 w-4' />
                        </Button>
                      )}

                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => removeDocument(doc.id)}
                        className='text-red-600 hover:text-red-700'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className='flex justify-between pt-6'>
            <Button
              variant='outline'
              onClick={() => navigate('/dashboard/train-ai')}
            >
              Back to AI Home
            </Button>

            <div className='flex gap-3'>
              {uploadedDocuments.filter(
                (doc) => doc.trainingStatus === 'trained'
              ).length > 0 && (
                <Button
                  onClick={() => navigate('/dashboard/ai-training')}
                  className='bg-green-600 text-white hover:bg-green-700'
                >
                  View Trained Documents
                </Button>
              )}

              {uploadedDocuments.filter(
                (doc) =>
                  doc.trainingStatus === 'not_trained' &&
                  doc.status === 'completed'
              ).length > 0 && (
                <Button
                  onClick={() => {
                    const untrainedDocs = uploadedDocuments.filter(
                      (doc) =>
                        doc.trainingStatus === 'not_trained' &&
                        doc.status === 'completed'
                    )
                    untrainedDocs.forEach((doc) => trainDocument(doc.id))
                  }}
                  className='bg-blue-600 text-white hover:bg-blue-700'
                >
                  Train All Documents
                </Button>
              )}
            </div>
          </div>
        </div>
      </ContentSection>
    </div>
  )
}
