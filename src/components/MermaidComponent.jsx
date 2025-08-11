import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

export const MermaidComponent = ({ chart }) => {
  const ref = useRef(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!isInitialized) {
      mermaid.initialize({ 
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose'
      })
      setIsInitialized(true)
    }
  }, [isInitialized])

  useEffect(() => {
    if (ref.current && isInitialized && chart) {
      // Generate unique id for this diagram
      const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Clear previous content and set new chart
      ref.current.innerHTML = chart
      ref.current.setAttribute('id', id)
      
      // Render the mermaid diagram
      mermaid.init(undefined, ref.current)
    }
  }, [chart, isInitialized])

  return (
    <div 
      ref={ref} 
      className="mermaid-diagram"
      style={{ 
        textAlign: 'center', 
        margin: '20px 0',
        padding: '10px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        backgroundColor: '#fafafa'
      }}
    />
  )
}