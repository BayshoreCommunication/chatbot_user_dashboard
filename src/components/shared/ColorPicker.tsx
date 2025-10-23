'use strict'

import React from 'react'
import { ChromePicker } from 'react-color'

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  onClose: () => void
  displayColorPicker: boolean
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onChange,
  onClose,
  displayColorPicker,
}) => {
  const popover = {
    position: 'absolute' as const,
    zIndex: '2',
    top: '100%',
    left: '0',
    marginTop: '8px',
  }

  const cover = {
    position: 'fixed' as const,
    top: '0px',
    right: '0px',
    bottom: '0px',
    left: '0px',
  }

  const handleColorChange = (colorResult: any) => {
    onChange(colorResult.hex)
  }

  return (
    <div className='relative'>
      {displayColorPicker && (
        <div style={popover}>
          <div style={cover} onClick={onClose} />
          <ChromePicker
            color={color}
            onChange={handleColorChange}
            disableAlpha={true}
          />
        </div>
      )}
    </div>
  )
}

export default ColorPicker
