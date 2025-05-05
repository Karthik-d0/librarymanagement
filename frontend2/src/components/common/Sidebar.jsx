import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Avatar,
  Tooltip
} from "@mui/material";
import {
  People as UsersIcon,
  Book as BooksIcon,
  Category as CategoriesIcon,
  History as TransactionsIcon,
  Receipt as FinesIcon,
  Payment as PaymentsIcon,
  Report as ReportsIcon,
  ExitToApp as LogoutIcon,
  MenuBook as ReservationsIcon,
  AccountCircle as ProfileIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { deepPurple } from "@mui/material/colors";

function Sidebar({ role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const adminMenu = [
    { text: "Users", icon: <UsersIcon />, path: "/admin/users" },
    { text: "Reports", icon: <ReportsIcon />, path: "/admin/reports" },
    { text: "Books", icon: <BooksIcon />, path: "/admin/books" },
    { text: "Categories", icon: <CategoriesIcon />, path: "/admin/categories" },
    { text: "Transactions", icon: <TransactionsIcon />, path: "/admin/transactions" },
    { text: "Fines", icon: <FinesIcon />, path: "/admin/fines" },
    { text: "Payments", icon: <PaymentsIcon />, path: "/admin/payments" },
  ];

  const librarianMenu = [
    { text: "Books", icon: <BooksIcon />, path: "/librarian/books" },
    { text: "Categories", icon: <CategoriesIcon />, path: "/librarian/categories" },
    { text: "Transactions", icon: <TransactionsIcon />, path: "/librarian/transactions" },
    { text: "Reservations", icon: <ReservationsIcon />, path: "/librarian/reservations" },
    { text: "Fines", icon: <FinesIcon />, path: "/librarian/fines" },
    { text: "Payments", icon: <PaymentsIcon />, path: "/librarian/payments" },
    { text: "Reports", icon: <ReportsIcon />, path: "/librarian/reports" },
  ];

  const studentMenu = [
    { text: "Books", icon: <BooksIcon />, path: "/student/books" },
    { text: "My Transactions", icon: <TransactionsIcon />, path: "/student/transactions" },
    { text: "My Reservations", icon: <ReservationsIcon />, path: "/student/reservations" },
    { text: "My Fines", icon: <FinesIcon />, path: "/student/fines" },
    { text: "My Payments", icon: <PaymentsIcon />, path: "/student/payments" },
  ];

  const menuItems =
    role === "Admin"
      ? adminMenu
      : role === "Librarian"
      ? librarianMenu
      : studentMenu;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #f5f7fa 0%, #e4e8f0 100%)',
          borderRight: 'none',
          boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
        },
      }}
    >
      <Box sx={{ pt: 8 }}></Box> {/* Spacer for header */}
      <List>
        {menuItems.map((item) => (
          <Tooltip title={item.text} key={item.text} placement="right" arrow>
            <ListItem
              button
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 1,
                mx: 1,
                mb: 0.5,
                backgroundColor: location.pathname.startsWith(item.path) 
                  ? 'rgba(103, 58, 183, 0.1)' 
                  : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(103, 58, 183, 0.08)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: location.pathname.startsWith(item.path) 
                    ? 'primary.main' 
                    : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: location.pathname.startsWith(item.path) ? 600 : 500,
                  color: location.pathname.startsWith(item.path) 
                    ? 'primary.main' 
                    : 'text.primary',
                }}
              />
            </ListItem>
          </Tooltip>
        ))}
      </List>
      <Divider sx={{ my: 1 }} />
      <List>
        <Tooltip title="Logout" placement="right" arrow>
          <ListItem
            button
            onClick={logout}
            sx={{
              borderRadius: 1,
              mx: 1,
              '&:hover': {
                backgroundColor: 'rgba(244, 67, 54, 0.08)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{ color: 'error.main', fontWeight: 500 }}
            />
          </ListItem>
        </Tooltip>
      </List>
    </Drawer>
  );
}

export default Sidebar;