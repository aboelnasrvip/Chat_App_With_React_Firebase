import { useState } from "react";
import "./Login.css";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import upload from "../../lib/upload";
const Login = () => {
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });
  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true)
    const formData = new FormData(e.target);
  
    const { username, email, password } = Object.fromEntries(formData);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const imgUrl = await upload(avatar.file)
      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        avatar: imgUrl,
        id: res.user.uid,
        blocked: [],
      });
  
      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: [],
      });
  
      toast.success("Account Created! You Can Login Now!");
  
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    }finally{
      setLoading(false)
    }
  };
  

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true)
    const formData = new FormData(e.target);
  
    const {email, password } = Object.fromEntries(formData);
    try {
      await signInWithEmailAndPassword(auth, email, password);
  
      toast.success("Login Now!");
  
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    }finally{
      setLoading(false)
    }
  };

  return (
    <div className="auth-container">
      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input type="email" name="email" placeholder="Enter your email" />
          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
          />
          <button disabled={loading} type="submit">{loading ? "Loailng...!" : "Log In"}</button>
        </form>
      </div>


      <div className="create-account-container">
        <h2>Create Account</h2>
        <form onSubmit={handleRegister}>
          <div className="img-input">
            <img src={avatar.url || "./avatar.png"} alt="" className="imgg" />
            <label htmlFor="file" className="labell">
              Upload Image
            </label>
          </div>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleAvatar}
          />
          <label>Username</label>
          <input type="text" name="username" placeholder="Enter your Uuername" />
          <label>Email</label>
          <input type="email" name="email" placeholder="Enter your email" />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Create a password"
          />

          <button disabled={loading} type="submit">{loading ? "Loailng...!" : "Create Account"}</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
