'use client'

import { useState, useRef, useEffect } from 'react'

interface TooltipIconProps {
  text: string
}

export default function TooltipIcon({ text }: TooltipIconProps) {
  const [visible, setVisible] = useState(false)
  const wrapRef = useRef<HTMLSpanElement>(null)

  // Close if focus leaves
  useEffect(() => {
    if (!visible) return
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setVisible(false)
      }
    }
    document.addEventListener('mouseover', handler)
    return () => document.removeEventListener('mouseover', handler)
  }, [visible])

  return (
    <span
      ref={wrapRef}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'default' }}
    >
      <i
        className="fa-solid fa-circle-info"
        style={{ fontSize: '12px', color: 'var(--text-3)' }}
      />
      {visible && (
        <span style={{
          position:    'absolute',
          bottom:      'calc(100% + 8px)',
          left:        '50%',
          transform:   'translateX(-50%)',
          width:       '220px',
          padding:     '8px 12px',
          background:  '#1E2138',
          border:      '1px solid rgba(255,255,255,0.13)',
          borderRadius: '10px',
          color:       'var(--text-1)',
          fontSize:    '12px',
          lineHeight:  1.5,
          whiteSpace:  'normal',
          zIndex:      200,
          pointerEvents: 'none',
          textAlign:   'left',
          boxShadow:   '0 8px 24px rgba(0,0,0,0.5)',
        }}>
          {text}
        </span>
      )}
    </span>
  )
}
