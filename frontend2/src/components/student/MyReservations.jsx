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
  Tooltip,
  Zoom,
  Divider,
  Avatar,
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
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  AccessTime as PendingIcon,
  Help as ExpiredIcon
} from "@mui/icons-material";

function MyReservations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);

  const { data: reservations, isLoading } = useQuery(
    ["reservations", user.id],
    async () => {
      const response = await axios.get(`/api/reservations/user/${user.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      return response.data.reservations;
    }
  );

  const cancelReservation = useMutation(
    (reservationId) =>
      axios.put(
        `/api/reservations/${reservationId}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["reservations", user.id]);
        toast.success("Reservation cancelled successfully", {
          position: "bottom-right",
          autoClose: 3000,
        });
        setOpenCancelDialog(false);
      },
      onError: () => toast.error("Failed to cancel reservation", {
        position: "bottom-right",
      }),
    }
  );

  const handleOpenCancelDialog = (reservation) => {
    setSelectedReservation(reservation);
    setOpenCancelDialog(true);
  };

  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
    setSelectedReservation(null);
  };

  const filteredReservations = reservations?.filter(reservation => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      reservation.BookTitle?.toLowerCase().includes(searchLower) ||
      reservation.Status?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Pending': return <PendingIcon color="warning" />;
      case 'Completed': return <CheckCircleIcon color="success" />;
      case 'Expired': return <ExpiredIcon color="error" />;
      default: return <PendingIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'warning';
      case 'Completed': return 'success';
      case 'Expired': return 'error';
      default: return 'default';
    }
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
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <BookIcon fontSize="large" />
        My Reservations
      </Typography>

      {/* Summary Card */}
      <Card sx={{ 
        mb: 4, 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" color="text.secondary">
              Active Reservations
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {reservations?.filter(r => r.Status === 'Pending').length || 0}
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
              {reservations?.length || 0} Total
            </Typography>
            <BookIcon sx={{ ml: 1, color: 'primary.main' }} />
          </Box>
        </CardContent>
      </Card>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search reservations..."
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

      {/* Reservations Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Table>
          <TableHead sx={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Book</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Reserved Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Expiry Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReservations?.length > 0 ? (
              filteredReservations.map((reservation) => (
                <TableRow 
                  key={reservation.ReservationID}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: 'rgba(0,0,0,0.02)',
                      transition: 'background-color 0.3s'
                    } 
                  }}
                >
                  <TableCell>
                    <Typography sx={{ fontWeight: 500 }}>
                      {reservation.BookTitle}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon color="action" fontSize="small" />
                      {new Date(reservation.ReservedAt).toLocaleDateString()}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon color="action" fontSize="small" />
                      {new Date(reservation.ExpiryDate).toLocaleDateString()}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      icon={getStatusIcon(reservation.Status)}
                      label={reservation.Status}
                      color={getStatusColor(reservation.Status)}
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {reservation.Status === "Pending" && (
                      <Tooltip title="Cancel reservation">
                        <IconButton
                          color="error"
                          onClick={() => handleOpenCancelDialog(reservation)}
                        >
                          <CancelIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                  <Box sx={{ 
                    textAlign: 'center', 
                    p: 2,
                    backgroundColor: 'rgba(0,0,0,0.02)',
                    borderRadius: 2,
                  }}>
                    <BookIcon sx={{ fontSize: 60, color: 'text.disabled', opacity: 0.5 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                      No reservations found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchTerm ? 'Try adjusting your search' : 'You have no active reservations'}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Cancel Reservation Dialog */}
      <Dialog 
        open={openCancelDialog} 
        onClose={handleCloseCancelDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid rgba(0,0,0,0.1)',
          fontWeight: 600,
          background: 'linear-gradient(45deg, #ff5252 30%, #ff867f 90%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <CancelIcon />
          Cancel Reservation
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to cancel your reservation for:
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            "{selectedReservation?.BookTitle}"
          </Typography>
          <Box sx={{ 
            backgroundColor: 'warning.light', 
            p: 2, 
            borderRadius: 2,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <PendingIcon color="warning" />
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Reserved on: {selectedReservation && new Date(selectedReservation.ReservedAt).toLocaleDateString()}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone. The book will become available for others to reserve.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <Button 
            onClick={handleCloseCancelDialog}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Keep Reservation
          </Button>
          <Button 
            onClick={() => cancelReservation.mutate(selectedReservation.ReservationID)}
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
            Confirm Cancellation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MyReservations;