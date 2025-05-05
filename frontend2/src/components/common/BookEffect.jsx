import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * BookEffect component to handle the book opening/closing animations
 * and page transitions between login and signup
 */
function BookEffect() {
  const location = useLocation();

  useEffect(() => {
    // Setup book opening animation
    const book = document.getElementById("book");
    const bookCover = document.getElementById("book-cover");
    const openBookBtn = document.getElementById("open-book");
    
    if (openBookBtn) {
      openBookBtn.addEventListener("click", function() {
        book.classList.add("book-opened");
        
        // If on register page, show signup page after opening
        if (location.pathname === "/register") {
          book.classList.add("show-signup");
        } else {
          book.classList.remove("show-signup");
        }
      });
    }
    
    // Handle initial state based on route
    if (book) {
      if (location.pathname === "/register") {
        // For register page
        if (book.classList.contains("book-opened")) {
          book.classList.add("show-signup");
        }
      } else {
        // For login page
        book.classList.remove("show-signup");
      }
    }
    
    // Cleanup event listener
    return () => {
      if (openBookBtn) {
        openBookBtn.removeEventListener("click", function() {});
      }
    };
  }, [location]);

  return null; // This component doesn't render anything
}

export default BookEffect;