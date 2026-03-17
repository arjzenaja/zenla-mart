'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/utils/formatCurrency'
import { FiArrowLeft, FiDownload } from 'react-icons/fi'
import Button from '@/component/ui/Button'

const InvoicePage = () => {
  const router = useRouter()
  const params = useParams()
  const orderId = params?.orderId
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const invoiceRef = useRef(null)

  useEffect(() => {
    if (orderId) {
      fetchInvoice()
    }
  }, [orderId])

  const fetchInvoice = async () => {
    try {
      const token = localStorage.getItem('token') // Assuming token is needed as it was used in headers below
      const response = await fetch(`/api/invoice/${orderId}`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load invoice')
      }
      
      if (data.success && data.invoice) {
        setInvoice(data.invoice)
      } else {
        setError('Invoice not found')
      }
    } catch (error) {
      console.error('Error fetching invoice:', error)
      setError(error.message || 'Failed to load invoice. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current || !orderId) {
      console.error('Missing invoiceRef or orderId')
      alert('Gagal mengunduh invoice. Elemen tidak ditemukan.')
      return
    }

    try {
      setIsGeneratingPDF(true)

      const [
        { default: html2canvas }, 
        { default: jsPDF }, 
        domToImageModule
      ] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
        import('dom-to-image')
      ])
      
      // Handle dom-to-image import (it can be default or named export)
      const domToImage = domToImageModule.default || domToImageModule

      // Wait a bit to ensure DOM is fully rendered
      await new Promise(resolve => setTimeout(resolve, 300))

      // Get the invoice container element
      const element = invoiceRef.current
      
      if (!element) {
        throw new Error('Invoice element not found')
      }

      // Check if element is visible
      const rect = element.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) {
        throw new Error('Invoice element tidak terlihat di halaman')
      }

      // Suppress console errors BEFORE any html2canvas operations
      const originalError = console.error
      const originalWarn = console.warn
      const errorMessages = []
      
      console.error = (...args) => {
        const msg = args.join(' ')
        if (msg.includes('lab') || msg.includes('unsupported color') || msg.includes('Attempting to parse')) {
          errorMessages.push(msg)
          return
        }
        originalError.apply(console, args)
      }
      console.warn = (...args) => {
        const msg = args.join(' ')
        if (msg.includes('lab') || msg.includes('unsupported color') || msg.includes('Attempting to parse')) {
          return
        }
        originalWarn.apply(console, args)
      }

      // Try dom-to-image first (more reliable with modern CSS)
      let canvas
      let captureSuccess = false
      let imgDataUrl = null
      
      try {
        console.log('Attempting dom-to-image capture...')
        // dom-to-image is more tolerant of modern CSS
        imgDataUrl = await domToImage.toPng(element, {
          quality: 0.95,
          bgcolor: '#ffffff',
          width: element.scrollWidth * 2, // Higher resolution
          height: element.scrollHeight * 2,
          style: {
            transform: 'scale(2)',
            transformOrigin: 'top left'
          },
          filter: (node) => {
            // Filter out elements that might cause issues
            return true
          }
        })
        
        // Convert data URL to canvas
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = imgDataUrl
        
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Image load timeout')), 10000)
          img.onload = () => {
            clearTimeout(timeout)
            canvas = document.createElement('canvas')
            // Use original dimensions for PDF (scale down from 2x)
            canvas.width = element.scrollWidth
            canvas.height = element.scrollHeight
            const ctx = canvas.getContext('2d')
            // Draw scaled down
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            resolve()
          }
          img.onerror = (err) => {
            clearTimeout(timeout)
            reject(err)
          }
        })
        
        captureSuccess = true
        console.log('dom-to-image capture succeeded, canvas size:', canvas.width, 'x', canvas.height)
      } catch (domError) {
        console.warn('dom-to-image failed, trying html2canvas:', domError.message)
        
        // Fallback to html2canvas
        try {
          console.log('Attempting html2canvas capture...')
          canvas = await html2canvas(element, {
            scale: 1.5,
            useCORS: false,
            logging: false,
            backgroundColor: '#ffffff',
            allowTaint: true,
            foreignObjectRendering: false,
            ignoreElements: (el) => {
              // Custom filtering if needed
              return false
            }
          })
          captureSuccess = true
          console.log('html2canvas capture succeeded, canvas size:', canvas.width, 'x', canvas.height)
        } catch (html2canvasError) {
          console.warn('html2canvas also failed, trying iframe approach:', html2canvasError.message)
          
          // Fallback to iframe approach
          try {
            // Use iframe to completely isolate from parent document stylesheets
            console.log('Creating isolated iframe for PDF generation...')
            const iframe = document.createElement('iframe')
            iframe.style.position = 'absolute'
            iframe.style.left = '-9999px'
            iframe.style.top = '0'
            iframe.style.width = `${element.scrollWidth + 100}px`
            iframe.style.height = `${element.scrollHeight + 100}px`
            iframe.style.border = 'none'
            document.body.appendChild(iframe)

            // Wait for iframe to load
            await new Promise(resolve => {
              iframe.onload = resolve
              iframe.src = 'about:blank'
            })

            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
            const iframeBody = iframeDoc.body

            // Copy element to iframe with all inline styles
            const clone = element.cloneNode(true)
            
            // Convert all styles to inline (avoiding CSS parsing)
            const convertToInline = (el, orig) => {
              try {
                const computed = window.getComputedStyle(orig)
              
              // Get safe colors (avoiding lab() colors)
              const safeColor = (c) => {
                if (!c || c === 'transparent' || c === 'rgba(0, 0, 0, 0)') return null
                if (typeof c === 'string') {
                  if (c.includes('lab(') || c.includes('color(')) {
                    return null
                  }
                  if (c.startsWith('rgb') || c.startsWith('#') || c.startsWith('hsl')) {
                    return c
                  }
                }
                return c
              }

              // Colors
              const bg = safeColor(computed.backgroundColor)
              const color = safeColor(computed.color)
              const borderColor = safeColor(computed.borderColor)
              
              if (bg) el.style.backgroundColor = bg
              else if (computed.backgroundColor && computed.backgroundColor !== 'transparent' && !computed.backgroundColor.includes('lab(')) {
                el.style.backgroundColor = computed.backgroundColor
              }

              if (color) el.style.color = color
              else if (computed.color && computed.color !== 'transparent' && !computed.color.includes('lab(')) {
                el.style.color = computed.color
              }

              if (borderColor) el.style.borderColor = borderColor
              else if (computed.borderColor && !computed.borderColor.includes('lab(')) {
                el.style.borderColor = computed.borderColor
              }

              // Typography
              el.style.fontSize = computed.fontSize
              el.style.fontFamily = computed.fontFamily
              el.style.fontWeight = computed.fontWeight
              el.style.fontStyle = computed.fontStyle
              el.style.lineHeight = computed.lineHeight
              el.style.letterSpacing = computed.letterSpacing
              el.style.textTransform = computed.textTransform
              el.style.textAlign = computed.textAlign
              el.style.textDecoration = computed.textDecoration
              el.style.textDecorationLine = computed.textDecorationLine

              // Spacing
              el.style.padding = computed.padding
              el.style.paddingTop = computed.paddingTop
              el.style.paddingRight = computed.paddingRight
              el.style.paddingBottom = computed.paddingBottom
              el.style.paddingLeft = computed.paddingLeft
              el.style.margin = computed.margin
              el.style.marginTop = computed.marginTop
              el.style.marginRight = computed.marginRight
              el.style.marginBottom = computed.marginBottom
              el.style.marginLeft = computed.marginLeft

              // Border
              if (computed.border && !computed.border.includes('lab(')) {
                el.style.border = computed.border
              }
              el.style.borderTop = computed.borderTop
              el.style.borderRight = computed.borderRight
              el.style.borderBottom = computed.borderBottom
              el.style.borderLeft = computed.borderLeft
              el.style.borderWidth = computed.borderWidth
              el.style.borderStyle = computed.borderStyle
              el.style.borderRadius = computed.borderRadius

              // Layout
              el.style.display = computed.display
              el.style.position = computed.position
              el.style.top = computed.top
              el.style.right = computed.right
              el.style.bottom = computed.bottom
              el.style.left = computed.left
              el.style.zIndex = computed.zIndex

              // Flexbox
              if (computed.display === 'flex' || computed.display === 'inline-flex') {
                el.style.flexDirection = computed.flexDirection
                el.style.flexWrap = computed.flexWrap
                el.style.alignItems = computed.alignItems
                el.style.alignContent = computed.alignContent
                el.style.justifyContent = computed.justifyContent
                el.style.gap = computed.gap
                el.style.rowGap = computed.rowGap
                el.style.columnGap = computed.columnGap
                el.style.flex = computed.flex
                el.style.flexGrow = computed.flexGrow
                el.style.flexShrink = computed.flexShrink
                el.style.flexBasis = computed.flexBasis
                el.style.alignSelf = computed.alignSelf
              }

              // Grid
              if (computed.display === 'grid' || computed.display === 'inline-grid') {
                el.style.gridTemplateColumns = computed.gridTemplateColumns
                el.style.gridTemplateRows = computed.gridTemplateRows
                el.style.gridColumn = computed.gridColumn
                el.style.gridRow = computed.gridRow
                el.style.gap = computed.gap
                el.style.rowGap = computed.rowGap
                el.style.columnGap = computed.columnGap
              }

              // Sizing
              el.style.width = computed.width
              el.style.height = computed.height
              el.style.minWidth = computed.minWidth
              el.style.minHeight = computed.minHeight
              el.style.maxWidth = computed.maxWidth
              el.style.maxHeight = computed.maxHeight
              el.style.boxSizing = computed.boxSizing

              // Overflow
              el.style.overflow = computed.overflow
              el.style.overflowX = computed.overflowX
              el.style.overflowY = computed.overflowY

              // Box Shadow (convert to safe format)
              if (computed.boxShadow && computed.boxShadow !== 'none') {
                // Remove any lab() colors from box-shadow
                if (!computed.boxShadow.includes('lab(')) {
                  el.style.boxShadow = computed.boxShadow
                }
              }

              // Table specific
              if (el.tagName === 'TABLE') {
                el.style.borderCollapse = computed.borderCollapse
                el.style.borderSpacing = computed.borderSpacing
                el.style.width = computed.width || '100%'
              }
              if (el.tagName === 'TD' || el.tagName === 'TH') {
                el.style.verticalAlign = computed.verticalAlign
                el.style.textAlign = computed.textAlign
              }

              // Process children recursively
              for (let i = 0; i < el.children.length && i < orig.children.length; i++) {
                convertToInline(el.children[i], orig.children[i])
              }
            } catch (e) {
              // Ignore errors for individual elements
            }
          }

            convertToInline(clone, element)
            
            // Add base styles to iframe document
            const iframeHead = iframeDoc.head
            const style = iframeDoc.createElement('style')
            style.textContent = `
              * {
                box-sizing: border-box;
              }
              body {
                margin: 0;
                padding: 20px;
                background-color: #ffffff;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              }
              table {
                border-collapse: collapse;
                width: 100%;
              }
              img {
                max-width: 100%;
                height: auto;
              }
              .font-signature {
                font-family: 'Brush Script MT', cursive;
              }
            `
            iframeHead.appendChild(style)
            
            // Add to iframe
            iframeBody.appendChild(clone)

            // Wait for rendering - give more time for styles to apply
            await new Promise(resolve => setTimeout(resolve, 800))
            
            // Force reflow
            clone.offsetHeight

            // Set iframe size to match content
            const contentWidth = Math.max(clone.scrollWidth, element.scrollWidth)
            const contentHeight = Math.max(clone.scrollHeight, element.scrollHeight)
            iframe.style.width = `${contentWidth + 100}px`
            iframe.style.height = `${contentHeight + 100}px`
            
            // Update iframe document size
            iframeDoc.documentElement.style.width = `${contentWidth}px`
            iframeDoc.documentElement.style.height = `${contentHeight}px`
            
            // Wait a bit more for iframe to resize
            await new Promise(resolve => setTimeout(resolve, 300))

            console.log('Starting html2canvas with iframe...')
            // Use iframe body which is isolated from parent stylesheets
            canvas = await html2canvas(iframeBody, {
              scale: 1.5,
              useCORS: false,
              logging: false,
              backgroundColor: '#ffffff',
              allowTaint: true,
              foreignObjectRendering: false,
              width: contentWidth,
              height: contentHeight
            })
            captureSuccess = true
            console.log('Iframe capture succeeded, canvas size:', canvas.width, 'x', canvas.height)
            
            // Clean up iframe
            if (iframe.parentNode) {
              iframe.parentNode.removeChild(iframe)
            }
          } catch (iframeError) {
            console.error('Iframe approach also failed:', iframeError)
            // Clean up iframe if it exists
            const iframes = document.querySelectorAll('iframe')
            iframes.forEach(iframe => {
              if (iframe.style.position === 'absolute' && iframe.style.left === '-9999px') {
                iframe.parentNode?.removeChild(iframe)
              }
            })
            throw new Error('Semua metode capture gagal. Silakan coba refresh halaman atau gunakan fitur Print browser.')
          }
        }
      } finally {
        // Restore console
        console.error = originalError
        console.warn = originalWarn
      }

      if (!captureSuccess || !canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas tidak valid. Silakan coba refresh halaman dan coba lagi.')
      }

      // Calculate PDF dimensions (A4 size in mm)
      const pdfWidth = 210 // A4 width in mm
      const pdfHeight = 297 // A4 height in mm
      const imgWidth = pdfWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      console.log('Creating PDF, dimensions:', imgWidth, 'x', imgHeight, 'mm')
      
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      try {
        const imgData = canvas.toDataURL('image/png', 0.95)
        
        if (!imgData || imgData === 'data:,') {
          throw new Error('Gagal mengkonversi canvas ke gambar')
        }
        
        // If content fits in one page
        if (imgHeight <= pdfHeight) {
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST')
        } else {
          // Split content across multiple pages
          const pageCount = Math.ceil(imgHeight / pdfHeight)
          console.log('Splitting into', pageCount, 'pages')
          
          // Add first page
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST')
          
          // Add additional pages if needed
          for (let i = 1; i < pageCount; i++) {
            const position = -i * pdfHeight
            pdf.addPage()
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST')
          }
        }

        // Download the PDF
        const fileName = `invoice-${orderId}.pdf`
        pdf.save(fileName)
        console.log('PDF saved:', fileName)
      } catch (pdfError) {
        console.error('Error creating PDF:', pdfError)
        throw new Error(`Gagal membuat PDF: ${pdfError.message}`)
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert(`Gagal mengunduh invoice: ${error.message || 'Terjadi kesalahan tidak diketahui'}`)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  if (loading) {
    return (
      <section className="bg-gray-100 py-8 min-h-screen">
        <div className="container">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-500">Loading invoice...</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error || !invoice) {
    return (
      <section className="bg-gray-100 py-8 min-h-screen">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
              <div className="mb-6">
                <div className="h-24 w-24 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                  <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Invoice Not Found</h2>
              <p className="text-gray-600 mb-8">{error || 'The invoice you are looking for does not exist.'}</p>
              <Link href={`/orders/${orderId}`}>
                <Button className="btn-g min-w-[200px]">Back to Order Details</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-gray-50 py-12 min-h-screen font-sans">
      <div className="container px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button - Hidden on print */}
          <div className="mb-6 print:hidden">
            <Link href={`/orders/${orderId}`} className="inline-flex items-center text-gray-500 hover:text-[#5C4033] transition-colors font-medium">
              <FiArrowLeft size={18} className="mr-2" />
              Back to Order Details
            </Link>
          </div>

          {/* Invoice Container - Only this section will be in PDF */}
          <div id="invoice-content" ref={invoiceRef} className="bg-white rounded-xl shadow-xl overflow-hidden print:shadow-none print:rounded-none relative">
            
            {/* Decorative top border */}
            <div className="h-2 w-full bg-[#5C4033]"></div>

            <div className="p-10 md:p-12 print:p-8">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-12 border-b border-gray-100 pb-8">
                {/* Logo & Store Info */}
                <div className="mb-8 md:mb-0">
                  <div className="flex items-center gap-5">
                    {/* Logo Box */}
                    <div className="w-20 h-20 bg-[#F5EBE0] rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden border border-[#E8D5C4]">
                      <img 
                        src={typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : '/logo.png'} 
                        alt="ZenlaMart Logo" 
                        className="w-full h-full object-contain p-3"
                        crossOrigin="anonymous"
                        style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
                      />
                    </div>
                    <div>
                      <h1 className="text-3xl font-extrabold text-[#5C4033] tracking-tight">{invoice.storeInfo.name.split(' ')[0]}</h1>
                      <p className="text-xs font-bold text-[#8D7B68] uppercase tracking-[0.2em] mt-1 pl-0.5">Premium Grocery</p>
                    </div>
                  </div>
                </div>

                {/* Invoice Title & Number */}
                <div className="text-right">
                  <h2 className="text-6xl font-black text-[#E8D5C4] opacity-40 mb-2 leading-[0.8]">INVOICE</h2>
                  <div className="space-y-1 text-gray-600">
                    <p className="text-lg"><span className="font-semibold text-[#5C4033] mr-2">No:</span> {invoice.invoiceNumber}</p>
                    <p className="text-sm"><span className="font-semibold text-[#5C4033] mr-2">Date:</span> {invoice.invoiceDate}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                {/* Store Contact - Left Column */}
                <div>
                  <h3 className="text-xs font-bold text-[#8D7B68] uppercase tracking-wider mb-4 border-b border-[#E8D5C4] pb-2 inline-block">From</h3>
                  <div className="text-gray-700 leading-relaxed">
                    <p className="font-bold text-xl text-[#5C4033] mb-2">{invoice.storeInfo.name}</p>
                    <div className="text-sm space-y-1 text-gray-500">
                      <p className="flex items-start gap-2">
                         <span>{invoice.storeInfo.phone}</span>
                      </p>
                      <p>{invoice.storeInfo.email}</p>
                      <p className="text-[#8D7B68]">{invoice.storeInfo.website}</p>
                    </div>
                  </div>
                </div>

                {/* Customer Info - Right Column */}
                <div>
                  <h3 className="text-xs font-bold text-[#8D7B68] uppercase tracking-wider mb-4 border-b border-[#E8D5C4] pb-2 inline-block">Bill To</h3>
                  <div className="text-gray-700 leading-relaxed">
                    <p className="font-bold text-xl text-[#5C4033] mb-2">{invoice.customer.name}</p>
                    <div className="text-sm space-y-1 text-gray-500">
                      <p>{invoice.customer.phone}</p>
                      <p>{invoice.customer.email}</p>
                      {invoice.customer.address && (
                        <p className="mt-3 text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 italic text-xs">
                          {invoice.customer.address}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoice Items Table */}
              <div className="mb-12 overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#F5EBE0]">
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#5C4033] uppercase tracking-wider">Description</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#5C4033] uppercase tracking-wider">Variant</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-[#5C4033] uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-[#5C4033] uppercase tracking-wider">Qty</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-[#5C4033] uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {invoice.items.map((item, index) => (
                      <tr key={index} className="bg-white hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-800 font-medium">{item.description}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 italic font-medium">{item.variantName || '-'}</td>
                        <td className="px-6 py-4 text-right text-sm text-gray-600">{formatCurrency(item.price)}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">{item.quantity}</td>
                        <td className="px-6 py-4 text-right text-sm text-gray-800 font-semibold">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="4" className="px-6 py-3 text-right text-sm font-medium text-gray-500 pt-6">Sub total</td>
                      <td className="px-6 py-3 text-right text-sm font-bold text-gray-800 pt-6">{formatCurrency(invoice.subtotal)}</td>
                    </tr>
                    {invoice.shipping === 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-2 text-right text-sm font-medium text-gray-500">Shipping Cost</td>
                        <td className="px-6 py-2 text-right text-sm font-bold text-emerald-600">Gratis</td>
                      </tr>
                    )}
                    {invoice.shipping > 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-2 text-right text-sm font-medium text-gray-500">Shipping Cost</td>
                        <td className="px-6 py-2 text-right text-sm font-bold text-gray-800">{formatCurrency(invoice.shipping)}</td>
                      </tr>
                    )}
                    {invoice.discount > 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-2 text-right text-sm font-medium text-gray-500">Discount</td>
                        <td className="px-6 py-2 text-right text-sm font-bold text-green-600">-{formatCurrency(invoice.discount)}</td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan="5" className="px-6 py-2">
                        <div className="border-b border-gray-200 w-full"></div>
                      </td>
                    </tr>
                    <tr className="bg-[#E8D5C4]/20">
                      <td colSpan="4" className="px-6 py-4 text-right text-xl font-bold text-[#5C4033]">Total Amount</td>
                      <td className="px-6 py-4 text-right text-2xl font-black text-[#5C4033]">{formatCurrency(invoice.total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Payment Method & Terms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Payment Method - Left Column */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <h3 className="text-sm font-bold text-[#5C4033] uppercase tracking-wide mb-4 flex items-center">
                    <span className="w-1 h-4 bg-[#5C4033] mr-2 rounded-full"></span>
                    Payment Details
                  </h3>
                  <div className="space-y-3 text-sm text-gray-700">
                    {invoice.paymentInfo?.type === 'BANK_TRANSFER' && (
                      <>
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                          <span className="text-gray-500">Bank</span>
                          <span className="font-semibold">{invoice.paymentInfo.bankName}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                          <span className="text-gray-500">Number</span>
                          <span className="font-semibold font-mono text-base">{invoice.paymentInfo.accountNumber}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                          <span className="text-gray-500">Account Name</span>
                          <span className="font-semibold uppercase text-xs">{invoice.paymentInfo.accountHolder}</span>
                        </div>
                        
                        {invoice.paymentStatus && (
                          <div className="mt-4 pt-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${
                              invoice.paymentStatus === 'paid' 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                            }`}>
                              <span className={`w-2 h-2 rounded-full ${invoice.paymentStatus === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                              {invoice.paymentStatus === 'paid' ? 'PAID' : 'AWAITING PAYMENT'}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    {invoice.paymentInfo?.type === 'EWALLET' && (
                      <>
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                           <span className="text-gray-500">E-Wallet</span>
                           <span className="font-semibold">{invoice.paymentInfo.ewalletName}</span>
                        </div>
                        <div className="mt-4 pt-2">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${
                            invoice.paymentInfo.status === 'Sudah Dibayar'
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${invoice.paymentInfo.status === 'Sudah Dibayar' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                            {invoice.paymentInfo.status === 'Sudah Dibayar' ? 'PAID' : 'PENDING'}
                          </span>
                        </div>
                      </>
                    )}
                    {invoice.paymentInfo?.type === 'COD' && (
                      <div className="text-center py-4 bg-blue-50/50 rounded-lg border border-blue-100/50">
                        <span className="font-bold text-[#5C4033] block mb-1">{invoice.paymentInfo.label}</span>
                        <p className="text-gray-500 text-xs mb-3">{invoice.paymentInfo.description}</p>
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                          Pay upon delivery
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Terms & Conditions - Right Column */}
                <div>
                  <h3 className="text-sm font-bold text-[#5C4033] uppercase tracking-wide mb-4 flex items-center">
                    <span className="w-1 h-4 bg-[#8D7B68] mr-2 rounded-full"></span>
                    Terms & Conditions
                  </h3>
                  <div className="bg-[#FAF9F6] p-5 rounded-xl border border-[#E8D5C4]/30">
                    <ul className="space-y-3 text-xs text-gray-600 list-disc list-outside ml-4 marker:text-[#8D7B68]">
                      <li className="pl-1">Payment is expected within 30 days.</li>
                      <li className="pl-1">Please include invoice number on your check or bank transfer.</li>
                      <li className="pl-1">Thank you for your business! We appreciate your trust in us.</li>
                    </ul>
                    <div className="mt-6 pt-4 border-t border-[#E8D5C4]/30 text-center">
                      <p className="font-signature text-2xl text-[#5C4033] opacity-80 rotate-[-2deg]">Thank You!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative bottom border */}
            <div className="h-2 w-full bg-[#E8D5C4]"></div>
          </div>

          {/* Action Buttons - Hidden on print */}
          <div className="mt-8 flex gap-4 print:hidden justify-end">
            <Link href={`/orders/${orderId}`}>
              <Button variant="outlined" className="!normal-case !border-gray-300 !text-gray-600 hover:!bg-gray-50 hover:!border-gray-400 !px-6 !py-2.5 !rounded-lg !font-medium">
                Back to Order
              </Button>
            </Link>
            <Button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="btn-g !normal-case !px-8 !py-2.5 !rounded-lg !text-white !font-medium !shadow-md hover:!shadow-lg transform transition-all active:scale-95"
              startIcon={isGeneratingPDF ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <FiDownload size={18} />}
            >
              {isGeneratingPDF ? 'Generating PDF...' : 'Download Invoice PDF'}
            </Button>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-8 {
            padding: 2rem !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
        }
      `}</style>
    </section>
  )
}

export default InvoicePage
