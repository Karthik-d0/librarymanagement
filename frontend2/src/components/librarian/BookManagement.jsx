import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  Button,
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  IconButton,
  Chip,
  Tooltip,
  Fade,
  Zoom,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Book as BookIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  FilterList as FilterListIcon
} from "@mui/icons-material";

function BookManagement() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const [image, setImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterCategory, setFilterCategory] = useState("all");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Watch window scroll position
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }
    });
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Get books data
  const { data: books, isLoading } = useQuery("books", async () => {
    const response = await axios.get("/api/books", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data.books;
  });

  // Get categories
  const { data: categories } = useQuery("categories", async () => {
    const response = await axios.get("/api/categories", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data.categories || [];
  }, {
    onError: () => {
      // Silently fail if categories endpoint is not available
      return [];
    }
  });

  const createBook = useMutation(
    (data) =>
      axios.post("/api/books", data, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("books");
        toast.success("Book added to library!", {
          position: "bottom-right",
          autoClose: 3000,
        });
        setOpen(false);
        reset();
        setImage(null);
      },
      onError: () => toast.error("Couldn't add book to library", {
        position: "bottom-right",
      }),
    }
  );

  const updateBook = useMutation(
    ({ id, data }) =>
      axios.put(`/api/books/${id}`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("books");
        toast.success("Book updated successfully", {
          position: "bottom-right",
          autoClose: 3000,
        });
        setOpen(false);
        reset();
        setImage(null);
      },
      onError: () => toast.error("Failed to update book details", {
        position: "bottom-right",
      }),
    }
  );

  const deleteBook = useMutation(
    (bookId) =>
      axios.delete(`/api/books/${bookId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("books");
        toast.success("Book removed from library", {
          position: "bottom-right",
          autoClose: 3000,
        });
      },
      onError: () => toast.error("Couldn't delete book", {
        position: "bottom-right",
      }),
    }
  );

  const handleCreate = () => {
    setIsEdit(false);
    setSelectedBook(null);
    setOpen(true);
    // Reset form with empty values explicitly
    reset({
      title: "",
      author: "",
      isbn: "",
      publicationYear: "",
      publisher: "",
      totalCopies: "",
      categoryId: ""
    });
    setImage(null);
  };

  const handleEdit = (book) => {
    setIsEdit(true);
    setSelectedBook(book);
    setOpen(true);
    reset({
      title: book.Title,
      author: book.Author,
      isbn: book.ISBN,
      publicationYear: book.PublicationYear,
      publisher: book.Publisher,
      totalCopies: book.TotalCopies,
      categoryId: book.CategoryID,
    });
    setImage(null);
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("author", data.author);
    formData.append("isbn", data.isbn);
    formData.append("publicationYear", data.publicationYear);
    formData.append("publisher", data.publisher);
    formData.append("totalCopies", data.totalCopies);
    formData.append("categoryId", data.categoryId);
    
    if (image) {
      formData.append("coverImage", image);
    }

    if (isEdit) {
      updateBook.mutate({ id: selectedBook.BookID, data: formData });
    } else {
      createBook.mutate(formData);
    }
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === "asc" ? "desc" : "asc");
  };

  // Filter and sort books
  const filteredAndSortedBooks = books ? books
    // Filter by search term
    .filter(book => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        book.Title?.toLowerCase().includes(searchLower) ||
        book.Author?.toLowerCase().includes(searchLower) ||
        book.ISBN?.toLowerCase().includes(searchLower)
      );
    })
    // Filter by category
    .filter(book => {
      if (filterCategory === "all") return true;
      return book.CategoryID === parseInt(filterCategory);
    })
    // Sort books
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
    if (!title) return "#6a1b9a"; // Default purple if no title
    
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
        Library Management
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
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreate}
          startIcon={<AddIcon />}
          sx={{ 
            fontWeight: 600,
            borderRadius: 2,
            textTransform: 'none',
            padding: '10px 20px',
            background: 'linear-gradient(45deg, #3f51b5 30%, #673ab7 90%)',
            boxShadow: '0 3px 5px 2px rgba(103, 58, 183, .3)',
            '&:hover': {
              background: 'linear-gradient(45deg, #303f9f 30%, #5e35b1 90%)',
            }
          }}
        >
          Add New Book
        </Button>

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
                        <Tooltip title="Edit book">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleEdit(book)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Delete book">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => deleteBook.mutate(book.BookID)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
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

      {/* Book Form Dialog */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
        transitionDuration={400}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid rgba(0,0,0,0.1)',
          fontWeight: 600,
          background: 'linear-gradient(45deg, #3f51b5 30%, #673ab7 90%)',
          color: 'white'
        }}>
          {isEdit ? "Edit Book Details" : "Add New Book"}
        </DialogTitle>
        <DialogContent sx={{ padding: 3, mt: 2 }}>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
          >
            <TextField
              label="Title"
              variant="outlined"
              fullWidth
              {...register("title", { required: true })}
              InputLabelProps={{ 
                shrink: true,
                sx: { fontWeight: 500 }
              }}
            />
            <TextField
              label="Author"
              variant="outlined"
              fullWidth
              {...register("author", { required: true })}
              InputLabelProps={{ shrink: true }}
            />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="ISBN"
                  variant="outlined"
                  fullWidth
                  {...register("isbn")}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Publication Year"
                  variant="outlined"
                  type="number"
                  fullWidth
                  {...register("publicationYear")}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: 1000, max: new Date().getFullYear() }}
                />
              </Grid>
            </Grid>
            
            <TextField
              label="Publisher"
              variant="outlined"
              fullWidth
              {...register("publisher")}
              InputLabelProps={{ shrink: true }}
            />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Total Copies"
                  variant="outlined"
                  type="number"
                  fullWidth
                  {...register("totalCopies", { required: true })}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    label="Category"
                    value={watch("categoryId") || ""}
                    onChange={(e) => setValue("categoryId", e.target.value)}
                    MenuProps={{
                      PaperProps: {
                        style: { maxHeight: 250 }
                      }
                    }}
                  >
                    <MenuItem value="">
                      <em>Select category</em>
                    </MenuItem>
                    {categories?.map(category => (
                      <MenuItem key={category.CategoryID} value={category.CategoryID}>
                        {category.Name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500 }}>
                Book Cover Image
              </Typography>
              <Box
                sx={{
                  border: '1px dashed rgba(0,0,0,0.2)',
                  borderRadius: 1,
                  padding: 2,
                  backgroundColor: 'rgba(0,0,0,0.01)',
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.03)',
                  }
                }}
                onClick={() => document.getElementById('cover-upload').click()}
              >
                <input
                  id="cover-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                {image ? (
                  <Box>
                    <Typography variant="body2" color="primary">
                      {image.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Click to change
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Click to upload book cover image
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <Button 
            onClick={() => setOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none',
              background: 'linear-gradient(45deg, #3f51b5 30%, #673ab7 90%)',
              boxShadow: '0 2px 4px rgba(103, 58, 183, .3)',
            }}
          >
            {isEdit ? "Update Book" : "Add Book"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Scroll to top button */}
      <Zoom in={showScrollToTop}>
        <Box
          onClick={scrollToTop}
          role="presentation"
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 50,
            height: 50,
            borderRadius: '50%',
            backgroundColor: 'primary.main',
            cursor: 'pointer',
            boxShadow: '0 3px 5px 2px rgba(0, 0, 0, .2)',
            color: 'white',
            transition: 'all 0.3s',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: '0 6px 10px 2px rgba(0, 0, 0, .2)',
            }
          }}
        >
          <ArrowUpwardIcon />
        </Box>
      </Zoom>
    </Box>
  );
}

export default BookManagement;