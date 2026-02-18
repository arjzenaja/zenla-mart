'use client'
import { useEffect } from 'react'

/**
 * ScrollObserver Component
 * 
 * Automatically detects elements with animation classes and triggers 
 * their animation when they enter the viewport.
 */
const ScrollObserver = () => {
  useEffect(() => {
    // Options for the observer
    const observerOptions = {
      root: null, // use the viewport
      rootMargin: '0px',
      threshold: 0.1 // trigger when 10% of the element is visible
    }

    // Callback function when intersection changes
    const handleIntersect = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          // Optional: Stop observing once visible if you only want it to animate once
          observer.unobserve(entry.target)
        }
      })
    }

    // Create the observer
    const observer = new IntersectionObserver(handleIntersect, observerOptions)

    // Find all elements to observe
    const observeElements = () => {
      const animatedElements = document.querySelectorAll('.fade-in-up, .animate-fade-in, .animate-slide-in-up, .animate-scale-in, .fade-in-up-delay-1, .fade-in-up-delay-2')
      animatedElements.forEach(el => {
        // Only observe if not already visible to avoid re-triggering (though unobserve handles this mostly)
        if (!el.classList.contains('visible')) {
          observer.observe(el)
        }
      })
    }

    // Initial observation
    observeElements()

    // Handle dynamic content (like loaded via client-side routing or API calls)
    // Using a MutationObserver to watch for DOM changes
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length > 0) {
          observeElements()
        }
      })
    })

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    })

    // Also re-check on route changes (next.js often swaps content)
    // The mutation observer usually catches this, but a timeout can be a safe backup
    const timeoutInitial = setTimeout(observeElements, 100)
    const timeoutSecondary = setTimeout(observeElements, 500)
    const timeoutTertiary = setTimeout(observeElements, 1500)

    // Cleanup
    return () => {
      observer.disconnect()
      mutationObserver.disconnect()
      clearTimeout(timeoutInitial)
      clearTimeout(timeoutSecondary)
      clearTimeout(timeoutTertiary)
    }
  }, [])

  return null // This component doesn't render anything visually
}

export default ScrollObserver
