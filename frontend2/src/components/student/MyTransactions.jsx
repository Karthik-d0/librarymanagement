import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  InputAdornment,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  IconButton
} from "@mui/material";
import {
  Book as BookIcon,
  CalendarToday as CalendarIcon,
  Check as ReturnedIcon,
  EventAvailable as DueDateIcon,
  Event as BorrowDateIcon,
  MonetizationOn as FineIcon,
  Search as SearchIcon,
  Autorenew as RenewIcon
} from "@mui/icons-material";

function MyTransactions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [openReturnDialog, setOpenReturnDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const { data: transactions, isLoading, isError } = useQuery(
    ["transactions", user.id],
    async () => {
      const response = await axios.get(`/api/transactions/my/transactions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      // Ensure FineAmount is always a number
      return response.data.transactions.map(t => ({
        ...t,
        FineAmount: Number(t.FineAmount) || 0
      }));
    },
    {
      retry: 2,
      refetchOnWindowFocus: false
    }
  );

  const returnBook = useMutation(
    (transactionId) =>
      axios.post(
        `/api/transactions/return/${transactionId}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["transactions", user.id]);
        toast.success("Book returned successfully", {
          position: "bottom-right",
          autoClose: 3000,
        });
        setOpenReturnDialog(false);
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.message || "Failed to return book";
        toast.error(errorMessage, {
          position: "bottom-right",
        });
      },
    }
  );

  const handleOpenReturnDialog = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenReturnDialog(true);
  };

  const handleCloseReturnDialog = () => {
    setOpenReturnDialog(false);
    setSelectedTransaction(null);
  };

  const filteredTransactions = transactions?.filter(transaction => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      transaction.BookTitle?.toLowerCase().includes(searchLower) ||
      transaction.Status?.toLowerCase().includes(searchLower)
    );
  }) || [];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Borrowed': return 'warning';
      case 'Returned': return 'success';
      case 'Overdue': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Borrowed': return <RenewIcon color="warning" />;
      case 'Returned': return <ReturnedIcon color="success" />;
      case 'Overdue': return <FineIcon color="error" />;
      default: return <RenewIcon />;
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '80vh'
      }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '80vh',
        flexDirection: 'column',
        textAlign: 'center'
      }}>
        <Typography variant="h6" color="error" sx={{ mb: 2 }}>
          Failed to load transactions
        </Typography>
        <Button 
          variant="contained"
          onClick={() => queryClient.refetchQueries(["transactions", user.id])}
        >
          Retry
        </Button>
      </Box>
    );
  }

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
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <BookIcon fontSize="large" />
        My Transactions
      </Typography>

      {/* Summary Card */}
      <Card sx={{ 
        mb: 4, 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <CardContent sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2
        }}>
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h6" color="text.secondary">
              Active Borrowings
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {transactions?.filter(t => t.Status === 'Borrowed').length || 0}
            </Typography>
          </Box>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'primary.light',
            padding: '8px 16px',
            borderRadius: 2
          }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {transactions?.length || 0} Total
            </Typography>
            <BookIcon sx={{ ml: 1, color: 'primary.main' }} />
          </Box>
        </CardContent>
      </Card>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search transactions..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            width: { xs: '100%', sm: '300px' },
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
      </Box>

      {/* Transactions Table */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: 2, 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          maxHeight: 'calc(100vh - 300px)',
          overflow: 'auto'
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Book</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Borrow Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Fine</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <TableRow 
                  key={transaction.TransactionID}
                  hover
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    opacity: transaction.Status === 'Returned' ? 0.7 : 1
                  }}
                >
                  <TableCell>
                    <Typography sx={{ fontWeight: 500 }}>
                      {transaction.BookTitle}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BorrowDateIcon color="action" fontSize="small" />
                      {new Date(transaction.BorrowDate).toLocaleDateString()}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DueDateIcon color={transaction.Status === 'Overdue' ? 'error' : 'action'} fontSize="small" />
                      {new Date(transaction.DueDate).toLocaleDateString()}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      icon={getStatusIcon(transaction.Status)}
                      label={transaction.Status}
                      color={getStatusColor(transaction.Status)}
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FineIcon color={transaction.FineAmount > 0 ? 'error' : 'disabled'} fontSize="small" />
                      <Typography color={transaction.FineAmount > 0 ? 'error.main' : 'text.secondary'}>
                        ${(transaction.FineAmount || 0).toFixed(2)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    {transaction.Status !== "Returned" && (
                      <Tooltip title="Return book">
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => handleOpenReturnDialog(transaction)}
                          size="small"
                          startIcon={<ReturnedIcon />}
                          sx={{ 
                            textTransform: 'none',
                            borderRadius: 2
                          }}
                        >
                          Return
                        </Button>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                  <Box sx={{ 
                    textAlign: 'center', 
                    p: 2,
                    backgroundColor: 'rgba(0,0,0,0.02)',
                    borderRadius: 2,
                  }}>
                    <BookIcon sx={{ fontSize: 60, color: 'text.disabled', opacity: 0.5 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                      No transactions found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchTerm ? 'Try adjusting your search' : 'You have no active transactions'}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Return Book Dialog */}
      <Dialog 
        open={openReturnDialog} 
        onClose={handleCloseReturnDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid rgba(0,0,0,0.1)',
          fontWeight: 600,
          background: 'linear-gradient(45deg, #3f51b5 30%, #673ab7 90%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <ReturnedIcon />
          Return Book
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to return:
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            "{selectedTransaction?.BookTitle}"
          </Typography>
          
          <Box sx={{ 
            backgroundColor: 'primary.light', 
            p: 2, 
            borderRadius: 2,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <BorrowDateIcon color="primary" />
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Borrowed on: {selectedTransaction && new Date(selectedTransaction.BorrowDate).toLocaleDateString()}
            </Typography>
          </Box>

          <Box sx={{ 
            backgroundColor: selectedTransaction?.Status === 'Overdue' ? 'error.light' : 'warning.light', 
            p: 2, 
            borderRadius: 2,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <DueDateIcon color={selectedTransaction?.Status === 'Overdue' ? 'error' : 'warning'} />
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Due Date: {selectedTransaction && new Date(selectedTransaction.DueDate).toLocaleDateString()}
            </Typography>
          </Box>

          {selectedTransaction?.FineAmount > 0 && (
            <Box sx={{ 
              backgroundColor: 'error.light', 
              p: 2, 
              borderRadius: 2,
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <FineIcon color="error" />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Outstanding Fine: ${(selectedTransaction?.FineAmount || 0).toFixed(2)}
              </Typography>
            </Box>
          )}

          <Typography variant="body2" color="text.secondary">
            Please ensure you have the book with you before confirming the return.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <Button 
            onClick={handleCloseReturnDialog}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => returnBook.mutate(selectedTransaction?.TransactionID)}
            variant="contained"
            color="primary"
            disabled={returnBook.isLoading}
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(45deg, #3f51b5 30%, #673ab7 90%)',
              boxShadow: '0 2px 4px rgba(63, 81, 181, .3)',
            }}
          >
            {returnBook.isLoading ? 'Processing...' : 'Confirm Return'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MyTransactions;