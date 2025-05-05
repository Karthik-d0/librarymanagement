import { AppBar, Toolbar, Typography, IconButton, Box, Avatar } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { deepPurple } from "@mui/material/colors";
import { useAuth } from "../../context/AuthContext";

function Header({ toggleSidebar }) {
  const { user } = useAuth();

  return (
    <AppBar
      position="fixed"
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: 'linear-gradient(45deg, #3f51b5 0%, #673ab7 100%)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        height: 64
      }}
    >
      <Toolbar sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        height: '100%'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            onClick={toggleSidebar}
            edge="start"
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
            Library Management System
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar 
            sx={{ 
              width: 36, 
              height: 36,
              bgcolor: deepPurple[500],
              fontSize: '1rem'
            }}
          >
            {user?.name?.charAt(0) || 'U'}
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;