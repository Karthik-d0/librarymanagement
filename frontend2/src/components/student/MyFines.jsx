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
  Grid,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Zoom,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import {
  AttachMoney as AttachMoneyIcon,
  Paid as PaidIcon,
  Search as SearchIcon,
  Info as InfoIcon,
  Receipt as ReceiptIcon
} from "@mui/icons-material";

function MyFines() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [selectedFine, setSelectedFine] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const { data: fines, isLoading } = useQuery(["fines", user.id], async () => {
    const response = await axios.get(`/api/fines/user/${user.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data.fines;
  });

  const payFine = useMutation(
    (fineId) =>
      axios.post(
        `/api/fines/${fineId}/pay`,
        { paymentMethod },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["fines", user.id]);
        toast.success("Fine paid successfully", {
          position: "bottom-right",
          autoClose: 3000,
        });
        setOpenPaymentDialog(false);
      },
      onError: () => toast.error("Failed to pay fine", {
        position: "bottom-right",
      }),
    }
  );

  const handleOpenPaymentDialog = (fine) => {
    setSelectedFine(fine);
    setOpenPaymentDialog(true);
  };

  const handleClosePaymentDialog = () => {
    setOpenPaymentDialog(false);
    setSelectedFine(null);
  };

  const filteredFines = fines?.filter(fine => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      fine.BookTitle?.toLowerCase().includes(searchLower) ||
      fine.Status?.toLowerCase().includes(searchLower) ||
      fine.Amount?.toString().includes(searchTerm)
    );
  });

  const totalUnpaid = fines?.reduce((sum, fine) => 
    fine.Status === "Unpaid" ? sum + fine.Amount : sum, 0);

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
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <ReceiptIcon fontSize="large" />
        My Fines
      </Typography>

      {/* Summary Card */}
      <Card sx={{ 
        mb: 4, 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" color="text.secondary">
              Total Unpaid Fines
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              ${totalUnpaid?.toFixed(2) || '0.00'}
            </Typography>
          </Box>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            backgroundColor: totalUnpaid > 0 ? 'error.light' : 'success.light',
            padding: '8px 16px',
            borderRadius: 2
          }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {totalUnpaid > 0 ? 'Payment Due' : 'All Paid Up'}
            </Typography>
            {totalUnpaid > 0 ? (
              <AttachMoneyIcon sx={{ ml: 1 }} />
            ) : (
              <PaidIcon sx={{ ml: 1, color: 'success.main' }} />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
        gap: 2,
        flexDirection: { xs: 'column', sm: 'row' }
      }}>
        <TextField
          placeholder="Search fines..."
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
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip 
            label="All Fines" 
            variant={searchTerm === '' ? 'filled' : 'outlined'}
            onClick={() => setSearchTerm('')}
            color="primary"
          />
          <Chip 
            label="Unpaid" 
            variant={searchTerm === 'Unpaid' ? 'filled' : 'outlined'}
            onClick={() => setSearchTerm('Unpaid')}
            color="error"
          />
          <Chip 
            label="Paid" 
            variant={searchTerm === 'Paid' ? 'filled' : 'outlined'}
            onClick={() => setSearchTerm('Paid')}
            color="success"
          />
        </Box>
      </Box>

      {/* Fines List */}
      <Grid container spacing={3}>
        {filteredFines?.length > 0 ? (
          filteredFines.map((fine) => (
            <Grid item xs={12} sm={6} md={4} key={fine.FineID}>
              <Zoom in timeout={300}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                    transform: 'translateY(-4px)'
                  }
                }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 2
                    }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {fine.BookTitle}
                      </Typography>
                      <Chip 
                        label={fine.Status} 
                        size="small"
                        color={fine.Status === 'Paid' ? 'success' : 'error'}
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Fine Amount:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        ${fine.Amount.toFixed(2)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Issued Date:
                      </Typography>
                      <Typography variant="body1">
                        {new Date(fine.IssuedDate).toLocaleDateString()}
                      </Typography>
                    </Box>

                    {fine.Status === 'Paid' && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Paid Date:
                        </Typography>
                        <Typography variant="body1">
                          {new Date(fine.PaidDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>

                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    {fine.Status === 'Unpaid' ? (
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<AttachMoneyIcon />}
                        onClick={() => handleOpenPaymentDialog(fine)}
                        sx={{ 
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600
                        }}
                      >
                        Pay Fine
                      </Button>
                    ) : (
                      <Tooltip title="Payment details">
                        <IconButton color="success">
                          <PaidIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Card>
              </Zoom>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box sx={{ 
              textAlign: 'center', 
              p: 4,
              backgroundColor: 'rgba(0,0,0,0.02)',
              borderRadius: 2,
            }}>
              <ReceiptIcon sx={{ fontSize: 60, color: 'text.disabled', opacity: 0.5 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                No fines found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm ? 'Try adjusting your search' : 'You currently have no fines'}
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Payment Dialog */}
      <Dialog 
        open={openPaymentDialog} 
        onClose={handleClosePaymentDialog}
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
          <AttachMoneyIcon />
          Pay Fine
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" gutterBottom>
              You're about to pay the fine for:
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              "{selectedFine?.BookTitle}"
            </Typography>
          </Box>

          <Box sx={{ 
            backgroundColor: 'error.light', 
            p: 2, 
            borderRadius: 2,
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <InfoIcon color="error" />
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Amount Due: ${selectedFine?.Amount.toFixed(2)}
            </Typography>
          </Box>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="payment-method-label">Payment Method</InputLabel>
            <Select
              labelId="payment-method-label"
              value={paymentMethod}
              label="Payment Method"
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Credit Card">Credit Card</MenuItem>
              <MenuItem value="Debit Card">Debit Card</MenuItem>
              <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="body2" color="text.secondary">
            By proceeding, you agree to the library's fine payment policy.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <Button 
            onClick={handleClosePaymentDialog}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => payFine.mutate(selectedFine.FineID)}
            variant="contained"
            color="error"
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(45deg, #ff5252 30%, #ff867f 90%)',
              boxShadow: '0 2px 4px rgba(255, 82, 82, .3)',
            }}
          >
            Confirm Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MyFines;