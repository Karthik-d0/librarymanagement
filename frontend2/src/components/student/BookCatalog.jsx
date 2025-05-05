import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  Zoom,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import {
  Search as SearchIcon,
  Book as BookIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  FilterList as FilterListIcon
} from "@mui/icons-material";

function BookCatalog() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [openReserve, setOpenReserve] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterCategory, setFilterCategory] = useState("all");
  const [hoveredCard, setHoveredCard] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  const { data: books, isLoading } = useQuery("books", async () => {
    const response = await axios.get("/api/books", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data.books;
  });

  const { data: categories } = useQuery("categories", async () => {
    const response = await axios.get("/api/categories", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data.categories || [];
  }, {
    onError: () => {
      return [];
    }
  });

  const borrowBook = useMutation(
    (bookId) =>
      axios.post(
        "/api/transactions/borrow",
        { bookId, userId: user.id },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("books");
        toast.success("Book borrowed successfully", {
          position: "bottom-right",
          autoClose: 3000,
        });
      },
      onError: () => toast.error("Failed to borrow book", {
        position: "bottom-right",
      }),
    }
  );

  const reserveBook = useMutation(
    (bookId) =>
      axios.post(
        "/api/reservations",
        { bookId, userId: user.id },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("books");
        toast.success("Book reserved successfully", {
          position: "bottom-right",
          autoClose: 3000,
        });
        setOpenReserve(false);
        reset();
      },
      onError: () => toast.error("Failed to reserve book", {
        position: "bottom-right",
      }),
    }
  );

  const handleReserve = (book) => {
    setSelectedBook(book);
    setOpenReserve(true);
  };

  const onReserveSubmit = () => {
    reserveBook.mutate(selectedBook.BookID);
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === "asc" ? "desc" : "asc");
  };

  // Filter and sort books
  const filteredAndSortedBooks = books ? books
    .filter(book => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        book.Title?.toLowerCase().includes(searchLower) ||
        book.Author?.toLowerCase().includes(searchLower) ||
        book.ISBN?.toLowerCase().includes(searchLower)
      );
    })
    .filter(book => {
      if (filterCategory === "all") return true;
      return book.CategoryID === parseInt(filterCategory);
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "title":
          comparison = a.Title.localeCompare(b.Title);
          break;
        case "author":
          comparison = a.Author.localeCompare(b.Author);
          break;
        case "year":
          comparison = a.PublicationYear - b.PublicationYear;
          break;
        case "available":
          comparison = a.AvailableCopies - b.AvailableCopies;
          break;
        default:
          comparison = a.Title.localeCompare(b.Title);
      }
      return sortDirection === "asc" ? comparison : -comparison;
    }) : [];

  // Generate a color from book title for placeholder covers
  const generateColorFromTitle = (title) => {
    if (!title) return "#6a1b9a";
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 70%, 40%)`;
  };

  // Function to get initials from title
  const getInitials = (title) => {
    if (!title) return "BK";
    const words = title.split(' ');
    if (words.length === 1) {
      return title.substring(0, 2).toUpperCase();
    }
    return words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join('');
  };

  if (isLoading) return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      height: '80vh'
    }}>
      <CircularProgress size={60} thickness={4} />
    </Box>
  );

  return (
    <Box sx={{ padding: 3, maxWidth: 1400, margin: '0 auto' }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        sx={{ 
          fontWeight: 700, 
          marginBottom: 4,
          background: 'linear-gradient(90deg, #3f51b5 0%, #673ab7 100%)',
          backgroundClip: 'text',
          textFillColor: 'transparent',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Book Catalog
      </Typography>

      {/* Top Controls */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          gap: 2,
          marginBottom: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          padding: 2,
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          alignItems: 'center',
          gap: 2,
          width: { xs: '100%', md: 'auto' }
        }}>
          <TextField
            placeholder="Search books..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              width: { xs: '100%', sm: '220px' },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="category-filter-label">Category</InputLabel>
            <Select
              labelId="category-filter-label"
              value={filterCategory}
              label="Category"
              onChange={(e) => setFilterCategory(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {categories?.map(category => (
                <MenuItem key={category.CategoryID} value={category.CategoryID}>
                  {category.Name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="sort-label">Sort By</InputLabel>
              <Select
                labelId="sort-label"
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="title">Title</MenuItem>
                <MenuItem value="author">Author</MenuItem>
                <MenuItem value="year">Year</MenuItem>
                <MenuItem value="available">Availability</MenuItem>
              </Select>
            </FormControl>
            <IconButton onClick={toggleSortDirection} color="primary" size="small">
              {sortDirection === "asc" ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Book count indicator */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredAndSortedBooks.length} of {books?.length || 0} books
        </Typography>
      </Box>

      {/* Books Grid */}
      <Grid container spacing={3}>
        {filteredAndSortedBooks.length > 0 ? (
          filteredAndSortedBooks.map((book) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={book.BookID}>
              <Zoom in timeout={300}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 2,
                    overflow: 'hidden',
                    transition: 'all 0.3s',
                    transform: hoveredCard === book.BookID ? 'translateY(-8px)' : 'none',
                    boxShadow: hoveredCard === book.BookID 
                      ? '0 12px 20px rgba(0,0,0,0.2)' 
                      : '0 2px 8px rgba(0,0,0,0.1)',
                    '&:hover': {
                      boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                    }
                  }}
                  onMouseEnter={() => setHoveredCard(book.BookID)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {book.CoverImageURL ? (
                    <CardMedia
                      component="img"
                      height="220"
                      image={book.CoverImageURL}
                      alt={book.Title}
                      sx={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <Box 
                      sx={{ 
                        height: 220, 
                        background: generateColorFromTitle(book.Title),
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'white',
                        padding: 2,
                        textAlign: 'center'
                      }}
                    >
                      <Typography 
                        variant="h2" 
                        component="div" 
                        sx={{ 
                          fontSize: '64px', 
                          fontWeight: 700,
                          marginBottom: 1,
                          textShadow: '1px 1px 3px rgba(0,0,0,0.3)'
                        }}
                      >
                        {getInitials(book.Title)}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: '12px',
                          opacity: 0.9,
                          maxWidth: '100%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          textShadow: '0px 1px 2px rgba(0,0,0,0.3)'
                        }}
                      >
                        {book.Title}
                      </Typography>
                    </Box>
                  )}
                  
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography 
                      variant="h6" 
                      component="div" 
                      sx={{ 
                        fontWeight: 600,
                        lineHeight: 1.2,
                        marginBottom: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                      title={book.Title}
                    >
                      {book.Title}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        marginBottom: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={book.Author}
                    >
                      by {book.Author}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, marginBottom: 2 }}>
                      <Chip 
                        label={book.CategoryName || "Uncategorized"}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip 
                        label={`${book.PublicationYear || "Unknown"}`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        marginTop: 'auto',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Tooltip title="Available copies">
                        <Chip 
                          label={`${book.AvailableCopies}/${book.TotalCopies} available`}
                          size="small"
                          color={book.AvailableCopies > 0 ? "success" : "error"}
                          sx={{ fontSize: '0.75rem' }}
                        />
                      </Tooltip>
                      
                      <Box>
                        {book.AvailableCopies > 0 ? (
                          <Tooltip title="Borrow book">
                            <Button 
                              variant="contained"
                              size="small"
                              color="primary"
                              onClick={() => borrowBook.mutate(book.BookID)}
                              sx={{ 
                                textTransform: 'none',
                                borderRadius: 2,
                                padding: '4px 12px',
                                fontSize: '0.75rem'
                              }}
                            >
                              Borrow
                            </Button>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Reserve book">
                            <Button 
                              variant="outlined"
                              size="small"
                              color="primary"
                              onClick={() => handleReserve(book)}
                              sx={{ 
                                textTransform: 'none',
                                borderRadius: 2,
                                padding: '4px 12px',
                                fontSize: '0.75rem'
                              }}
                            >
                              Reserve
                            </Button>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box 
              sx={{ 
                textAlign: 'center', 
                padding: 4,
                backgroundColor: 'rgba(0,0,0,0.02)',
                borderRadius: 2,
              }}
            >
              <BookIcon sx={{ fontSize: 60, color: 'text.disabled', opacity: 0.5 }} />
              <Typography variant="h6" color="text.secondary">
                No books found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search or filters
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Reserve Dialog */}
      <Dialog 
        open={openReserve} 
        onClose={() => setOpenReserve(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid rgba(0,0,0,0.1)',
          fontWeight: 600,
          background: 'linear-gradient(45deg, #3f51b5 30%, #673ab7 90%)',
          color: 'white'
        }}>
          Reserve Book
        </DialogTitle>
        <DialogContent sx={{ padding: 3, mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            You're about to reserve the book:
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: 2 }}>
            "{selectedBook?.Title}"
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You'll be notified when this book becomes available.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <Button 
            onClick={() => setOpenReserve(false)}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={onReserveSubmit}
            variant="contained"
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none',
              background: 'linear-gradient(45deg, #3f51b5 30%, #673ab7 90%)',
              boxShadow: '0 2px 4px rgba(103, 58, 183, .3)',
            }}
          >
            Confirm Reservation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default BookCatalog;