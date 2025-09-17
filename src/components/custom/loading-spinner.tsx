interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  text?: string
  fullScreen?: boolean
  variant?: 'default' | 'training' | 'deleting' | 'removing'
}

export function LoadingSpinner({
  size = 'md',
  text,
  fullScreen = false,
  variant = 'default',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  const variantClasses = {
    default: {
      border:
        'border-t-blue-500 border-r-blue-500 border-b-gray-200 border-l-gray-200',
      dot: 'bg-blue-500',
    },
    training: {
      border:
        'border-t-green-500 border-r-green-500 border-b-gray-200 border-l-gray-200',
      dot: 'bg-green-500',
    },
    deleting: {
      border:
        'border-t-red-500 border-r-red-500 border-b-gray-200 border-l-gray-200',
      dot: 'bg-red-500',
    },
    removing: {
      border:
        'border-t-orange-500 border-r-orange-500 border-b-gray-200 border-l-gray-200',
      dot: 'bg-orange-500',
    },
  }

  const getDotSize = () => {
    switch (size) {
      case 'xs':
        return 'w-1 h-1'
      case 'sm':
        return 'w-2 h-2'
      case 'md':
        return 'w-3 h-3'
      case 'lg':
        return 'w-4 h-4'
      default:
        return 'w-3 h-3'
    }
  }

  const spinnerContent = (
    <div className='flex h-full w-full flex-col items-center justify-center'>
      <div className='relative'>
        {/* Outer spinning ring */}
        <div
          className={`${sizeClasses[size]} border-4 ${variantClasses[variant].border} animate-spin rounded-full`}
        />

        {/* Inner pulsing dot */}
        <div
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${getDotSize()} ${variantClasses[variant].dot} animate-pulse rounded-full`}
        />
      </div>
      {text && (
        <p
          className={`mt-4 text-sm text-gray-600 dark:text-gray-400 ${size === 'lg' ? 'text-base' : ''}`}
        >
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-gray-900/80'>
        {spinnerContent}
      </div>
    )
  }

  return spinnerContent
}
