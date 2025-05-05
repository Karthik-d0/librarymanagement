import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * BookEffect component to handle the book opening/closing animations
 * and page transitions between login and signup
 */
function BookEffect() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const isBookOpen = sessionStorage.getItem("bookIsOpen") === "true";
    
    const book = document.getElementById("book");
    const openBookBtn = document.getElementById("open-book");
    
    if (!book) return;
    
    if (isBookOpen) {
      book.classList.add("book-opened");
    } else {
      book.classList.remove("book-opened");
    }
    
    if (location.pathname === "/register") {
      book.classList.add("show-signup");
    } else {
      book.classList.remove("show-signup");
    }
    
    const handleOpenBook = () => {
      book.classList.add("book-opened");
      sessionStorage.setItem("bookIsOpen", "true");
    };
    
    const handleSwitchClick = (e) => {
      e.preventDefault();
      const href = e.currentTarget.getAttribute("href");
      
      if (!book.classList.contains("book-opened")) {
        book.classList.add("book-opened");
        sessionStorage.setItem("bookIsOpen", "true");
      }
      
      if (href === "/register") {
        book.classList.add("show-signup");
      } else if (href === "/login") {
        book.classList.remove("show-signup");
      }
      
      // Navigate after a slight delay to allow animation
      setTimeout(() => {
        navigate(href);
      }, 500);
    };
    
    // Attach event listeners
    if (openBookBtn) {
      openBookBtn.addEventListener("click", handleOpenBook);
    }
    
    const switchLinks = document.querySelectorAll(".switch-btn");
    switchLinks.forEach(link => {
      link.addEventListener("click", handleSwitchClick);
    });
    
    // Cleanup
    return () => {
      if (openBookBtn) {
        openBookBtn.removeEventListener("click", handleOpenBook);
      }
      
      switchLinks.forEach(link => {
        link.removeEventListener("click", handleSwitchClick);
      });
    };
  }, [location.pathname, navigate]);
  
  return null;
}

export default BookEffect;