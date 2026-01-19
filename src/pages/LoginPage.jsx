import { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

function LoginPage({setIsAuth, getProducts}){
    const [formData, setFormData] = useState({
      username: "",
      password: ""
    });

  //提交登入
  const onSubmit = async (e) => {
    try{
      e.preventDefault();
      const res = await axios.post(`${API_BASE}/admin/signin`, formData);
      // console.log(res);
      const {token, expired} = res.data;
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
      axios.defaults.headers.common['Authorization'] = token;
      getProducts();
      setIsAuth(true);
    }catch(error){
      setIsAuth(false);
      console.log(error.message);
    }
  }
  //登入
  const handleInputChange = (e) => {
    const {name, value} = e.target;
    // console.log(name, value);
    setFormData((prevData)=>({
      ...prevData,
      [name]: value,
    }))
  };


    return (
        <div className="container login">
          <h1 className="fs-5 fw-bold">請先登入</h1>
          <form onSubmit={(e)=> onSubmit(e)}>
            <div className="form-floating mb-3">
              <input type="email" className="form-control" name="username" placeholder="name@example.com" autoComplete="username" 
              value={formData.username}
              onChange={(e)=> handleInputChange(e)}
              />
              <label htmlFor="username">Email address</label>
            </div>
            <div className="form-floating">
              <input type="password" className="form-control" name="password" placeholder="Password" autoComplete="current-password" 
              value={formData.password}
              onChange={(e)=> handleInputChange(e)}
              />
              <label htmlFor="password">Password</label>
            </div>
            <button type="submit" className="btn btn-primary my-3 w-100">登入</button>
          </form>
        </div>      
      )
}

export default LoginPage;

