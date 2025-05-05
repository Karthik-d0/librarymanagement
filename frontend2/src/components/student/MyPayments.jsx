import { useQuery } from "react-query";
import axios from "axios";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
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
  Paper
} from "@mui/material";
import {
  Search as SearchIcon,
  Receipt as ReceiptIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  Money as CashIcon,
  CalendarToday as DateIcon
} from "@mui/icons-material";

function MyPayments() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: payments, isLoading } = useQuery(
    ["payments", user.id],
    async () => {
      const response = await axios.get(`/api/payments/user/${user.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      return response.data.payments;
    }
  );

  const filteredPayments = payments?.filter(payment => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      payment.BookTitle?.toLowerCase().includes(searchLower) ||
      payment.PaymentMethod?.toLowerCase().includes(searchLower) ||
      payment.AmountPaid?.toString().includes(searchTerm) ||
      payment.PaymentDate?.toLowerCase().includes(searchLower)
    );
  });

  const totalPaid = payments?.reduce((sum, payment) => sum + payment.AmountPaid, 0);

  const getPaymentIcon = (method) => {
    switch(method) {
      case 'Credit Card': return <CreditCardIcon />;
      case 'Debit Card': return <CreditCardIcon />;
      case 'Bank Transfer': return <BankIcon />;
      default: return <CashIcon />;
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
        <ReceiptIcon fontSize="large" />
        Payment History
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
              Total Payments Made
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              ${totalPaid?.toFixed(2) || '0.00'}
            </Typography>
          </Box>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'success.light',
            padding: '8px 16px',
            borderRadius: 2
          }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {payments?.length || 0} Transactions
            </Typography>
            <ReceiptIcon sx={{ ml: 1, color: 'success.main' }} />
          </Box>
        </CardContent>
      </Card>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search payments..."
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

      {/* Payments Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Table>
          <TableHead sx={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Book</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Payment Method</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Receipt</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPayments?.length > 0 ? (
              filteredPayments.map((payment) => (
                <TableRow 
                  key={payment.PaymentID}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: 'rgba(0,0,0,0.02)',
                      transition: 'background-color 0.3s'
                    } 
                  }}
                >
                  <TableCell>
                    <Typography sx={{ fontWeight: 500 }}>
                      {payment.BookTitle || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={`$${payment.AmountPaid.toFixed(2)}`} 
                      color="success"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ 
                        width: 24, 
                        height: 24,
                        backgroundColor: 'primary.light',
                        color: 'primary.main'
                      }}>
                        {getPaymentIcon(payment.PaymentMethod)}
                      </Avatar>
                      {payment.PaymentMethod}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DateIcon color="action" fontSize="small" />
                      {new Date(payment.PaymentDate).toLocaleDateString()}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View receipt">
                      <Button 
                        variant="outlined" 
                        size="small"
                        startIcon={<ReceiptIcon />}
                        sx={{ 
                          textTransform: 'none',
                          borderRadius: 2
                        }}
                      >
                        Receipt
                      </Button>
                    </Tooltip>
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
                    <ReceiptIcon sx={{ fontSize: 60, color: 'text.disabled', opacity: 0.5 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                      No payments found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchTerm ? 'Try adjusting your search' : 'You have no payment history yet'}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default MyPayments;