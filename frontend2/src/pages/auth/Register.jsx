import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "./style.css";

function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const user = await registerUser(
        data.name,
        data.email,
        data.password,
        data.role
      );
      navigate(`/${user.role.toLowerCase()}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="scene">
      <div className="book" id="book">
        <div className="book-spine">
          <span>NITK LIBRARY</span>
        </div>
        
        <div className="book-edge"></div>
        
        <div className="book-cover" id="book-cover">
          <div className="cover-content">
            <div style={{width: "120px", height: "120px", background: "#f8d775", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", margin: "0 auto 30px", border: "3px solid #e6c455", boxShadow: "0 5px 15px rgba(0,0,0,0.2)"}}>
              <div style={{fontSize: "40px", fontWeight: "bold", color: "#8b4513"}}>NITK</div>
            </div>
            <h1>NITK Library Management System</h1>
            <p>Knowledge is power - Francis Bacon</p>
            <button className="cover-btn" id="open-book">OPEN BOOK</button>
          </div>
        </div>
        
        {/* Login Page (hidden in Register view) */}
        <div className="page login-page" id="login-page">
          <div className="page-front">
            <div className="form-container">
              <h2>Login</h2>
              <form>
                {/* Form fields will be populated from Login component */}
                <div className="switch-link">
                  Don't have an account?
                  <Link to="/register" className="switch-btn">Sign up</Link>
                </div>
              </form>
            </div>
            
            <div className="book-decoration">
              <span className="ornament">❦</span> NITK Library <span className="ornament">❦</span>
            </div>
          </div>
        </div>
        
        {/* Signup Page */}
        <div className="page signup-page" id="signup-page">
          <div className="page-front">
            <div className="form-container">
              <h2>Sign Up</h2>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="input-group">
                  <label htmlFor="name">Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    {...register("name", { required: "Name is required" })}
                  />
                  {errors.name && <span className="error-message">{errors.name.message}</span>}
                </div>
                <div className="input-group">
                  <label htmlFor="email">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    {...register("email", {
                      required: "Email is required",
                      pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
                    })}
                  />
                  {errors.email && <span className="error-message">{errors.email.message}</span>}
                </div>
                <div className="input-group">
                  <label htmlFor="new-password">Password</label>
                  <input 
                    type="password" 
                    id="new-password" 
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                  />
                  {errors.password && <span className="error-message">{errors.password.message}</span>}
                </div>
                <div className="input-group">
                  <label htmlFor="role">Role</label>
                  <select 
                    id="role"
                    {...register("role", { required: "Role is required" })}
                  >
                    <option value="Student">Student</option>
                    <option value="Librarian">Librarian</option>
                    <option value="Admin">Admin</option>
                  </select>
                  {errors.role && <span className="error-message">{errors.role.message}</span>}
                </div>
                <button type="submit" className="form-btn">Sign Up</button>
              </form>
              <div className="switch-link">
                Already have an account?
                <Link to="/login" className="switch-btn">Login</Link>
              </div>
            </div>
            
            <div className="book-decoration">
              <span className="ornament">❦</span> NITK Library <span className="ornament">❦</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;