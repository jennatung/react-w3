import { useEffect, useState, useRef } from "react";
import axios from "axios";

import LoginPage from "./pages/LoginPage";
import ProductPage from "./pages/ProductPage";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;


function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [pageInfo, setpageInfo] = useState({});

  //登入驗證
  const checkLogin = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/user/check`);
      // console.log(res.data);
      setIsAuth(true);
      getProducts();
    } catch (error) {
      console.log(error.response?.data.message);
    }
  }

  //刷新後執行登入驗證
  useEffect(()=>{
    const token = document.cookie.split("; ")
    .find((row)=>row.startsWith("hexToken="))
    ?.split("=")[1];

    if (token) {
      axios.defaults.headers.common.Authorization = token;
    }
    checkLogin();
  },[])

  //取得產品列表
  const getProducts = async (page = 1) => {
    try {
      const res = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products?page=${page}`);      
      setProducts(res.data.products);
      setpageInfo(res.data.pagination);
    } catch (error) {
      console.log(error.message);
    }
  }

  return (
    <>{!isAuth ? 
    <LoginPage getProducts={getProducts} setIsAuth={setIsAuth}/> : 
    <ProductPage getProducts={getProducts} pageInfo={pageInfo} products={products} /> }
    </>
  )
}

export default App
