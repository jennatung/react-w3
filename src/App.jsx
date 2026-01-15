import { useEffect, useState, useRef } from "react";
import axios from "axios";
import * as bootstrap from "bootstrap";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

const INITIAL_TEMPLATE_DATA = {
  id: "",
  title: "",
  category: "",
  origin_price: "",
  price: "",
  unit: "",
  description: "",
  content: "",
  is_enabled: false,
  imageUrl: "",
  imagesUrl: [],
};

function App() {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [templateData, setTemplateData] = useState(INITIAL_TEMPLATE_DATA);
  const [modalType, setModalType] = useState(""); // "create", "edit", "delete"
  const myModal = useRef(null);
  const productModalRef = useRef(null);


  const handleInputChange = (e) => {
    const {name, value} = e.target;
    // console.log(name, value);
    setFormData((prevData)=>({
      ...prevData,
      [name]: value,
    }))
  };

  //編輯產品，set帶入資料
  const handleModalInputChange = (e) => {
    const {name, value, checked, type} = e.target;
    setTemplateData((prev)=>({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }
  //編輯產品照片(帶入資料)
  //React 以「參考值是否改變」判斷 state 更新，直接修改陣列或物件不會觸發 rerender，需建立新資料再 setState
  const handleModalImageChange = (index, value) => {
    setTemplateData((prev)=>{
      const newImage = [...prev.imagesUrl]
      newImage[index] = value;
      return {
        ...prev,
        imagesUrl: newImage
      } 
    })
  }
  //編輯產品照片(新增照片)
  const handleAddImage = () => {
    setTemplateData((prev)=>{
      const newImage = [...prev.imagesUrl]
      newImage.push("");
      return {
        ...prev,
        imagesUrl: newImage
      } 
    })
  }
  //編輯產品照片(移除照片)
  const handleRemoveImage = () => {
    setTemplateData((prev)=>{
      const newImage = [...prev.imagesUrl]
      newImage.pop();
      return {
        ...prev,
        imagesUrl: newImage
      } 
    })
  }

  //刪除產品
  const delProduct = async(id) => {
    try {
      const response = await axios.delete(`${API_BASE}/api/${API_PATH}/admin/product/${id}`, id);
      getProducts();
      closeModal();
    } catch (error) {
      alert('刪除失敗:', error.response);
    }
  }

  //更新產品列表
  const updateProduct = async(id) => {
    //新增
    let url = `${API_BASE}/api/${API_PATH}/admin/product`;
    let method = 'post';
    //編輯
    if(modalType === 'edit'){
      url = `${API_BASE}/api/${API_PATH}/admin/product/${id}`
      method = 'put';
    }

    const productData = {
      data:{...templateData,
        origin_price: Number(templateData.origin_price),
        price: Number(templateData.price),
        is_enabled: templateData.is_enabled ? 1 : 0,
        imagesUrl: [...templateData.imagesUrl.filter((url) => url !== "")]
      }
    }

    try {
      const response = await axios[method](url, productData);
      console.log(response.data);
      getProducts();
      closeModal();
    } catch (error) {
      alert(error.response);
    }


  }
  //取得產品列表
  const getProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products`);      
      setProducts(res.data.products);
    } catch (error) {
      console.log(error.message);
    }
  }

  //提交登入
  const onSubmit = async (e) => {
    try{
      e.preventDefault();
      const res = await axios.post(`${API_BASE}/admin/signin`, formData);
      console.log(res.data);
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

  //登入驗證
  const checkLogin = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/user/check`);
      console.log(res.data);
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
    productModalRef.current = new bootstrap.Modal(myModal.current); 
  },[])

  //Modal開
  const openModal = (type, product) => {
    setTemplateData((prevData)=>({
      ...prevData,
      ...product
    }))
    setModalType(type);
    productModalRef.current.show();
  }

  //Modal關
  const closeModal = () => {
    productModalRef.current.hide();
  }

  return (
    <>{!isAuth ? (
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
      ) : (
        <div className="container">
          <h2 className="py-4 fw-bold">產品列表</h2>
          <div className="text-end my-2">
           <button type="button" className="btn btn-primary" 
           onClick={()=>openModal("create", INITIAL_TEMPLATE_DATA)}>建立新的產品</button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>分類</th>
                <th>產品名稱</th>
                <th>原價</th>
                <th>售價</th>
                <th>是否啟用</th>
                <th>編輯</th>
              </tr>
            </thead>
            <tbody>
              {products && products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id}>                    
                    <td>{product.category}</td>
                    <td>{product.title}</td>
                    <td>{product.origin_price}</td>
                    <td>{product.price}</td>
                    <td className={`${product.is_enabled ? "text-success" : ""}`}>{product.is_enabled ? "啟用" : "未啟用"}</td>
                    <td>
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-outline-primary "
                          onClick={()=>openModal("edit", product)}
                        >
                          編輯
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={()=>openModal("delete", product)}
                        >
                          刪除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">尚無產品資料</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="modal fade" ref={myModal} id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-xl">
          <div className="modal-content border-0">
                <div 
                className={`modal-header bg-${modalType === 'delete'? 'danger' : 'dark'}
                dark text-white`}>
                  <h5 id="productModalLabel" className="modal-title">
                    <span>{modalType === 'delete'? '刪除': 
                    modalType === 'edit'? '編輯' : '新增'}產品</span>
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                    ></button>
                </div>
                <div className="modal-body">
                  {
                    modalType === 'delete' ? (
                      <p className="fs-4">
	                      確定要刪除
	                      <span className="text-danger">{templateData.title}</span>嗎？
	                    </p>
                    ) : (
                      <div className="row">
                        <div className="col-sm-4">
                          <div className="mb-2">
                            <div className="mb-3">
                              <label htmlFor="imageUrl" className="form-label">
                                輸入圖片網址
                              </label>
                              <input
                                type="text"
                                id="imageUrl"
                                name="imageUrl"
                                className="form-control"
                                placeholder="請輸入圖片連結"
                                value={templateData.imageUrl}
                                onChange={(e)=>handleModalInputChange(e)}
                                />
                            </div>
                            {
                              templateData.imageUrl && (
                                <img className="img-fluid" src={templateData.imageUrl} alt="主圖"/>
                              )
                            }
                          </div>
                          <div>
                            {templateData.imagesUrl.map((url,index)=>(
                              <div key={index}>
                                <label htmlFor="imageUrl" className="form-label">
                                  輸入圖片網址
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder={`圖片網址${index + 1}`}
                                  value={url}
                                  onChange={(e)=>handleModalImageChange(index, e.target.value)}
                                />
                                {
                                  url && 
                                  (<img
                                    className="img-fluid"
                                    src={url}
                                    alt={`副圖${index + 1}`}
                                  />)
                                }
                              </div>
                            ))}
                            <button className="btn btn-outline-primary btn-sm d-block w-100" onClick={handleAddImage}>
                              新增圖片
                            </button>
                          </div>
                          <div>
                            <button className="btn btn-outline-danger btn-sm d-block w-100" onClick={handleRemoveImage}>
                              刪除圖片
                            </button>
                          </div>
                        </div>
                        <div className="col-sm-8">
                          <div className="mb-3">
                            <label htmlFor="title" className="form-label">標題</label>
                            <input
                              name="title"
                              id="title"
                              type="text"
                              className="form-control"
                              placeholder="請輸入標題"
                              value={templateData.title}
                              onChange={(e)=>handleModalInputChange(e)}
                              />
                          </div>

                          <div className="row">
                            <div className="mb-3 col-md-6">
                              <label htmlFor="category" className="form-label">分類</label>
                              <input
                                name="category"
                                id="category"
                                type="text"
                                className="form-control"
                                placeholder="請輸入分類"
                                value={templateData.category}
                                onChange={(e)=>handleModalInputChange(e)}
                                />
                            </div>
                            <div className="mb-3 col-md-6">
                              <label htmlFor="unit" className="form-label">單位</label>
                              <input
                                name="unit"
                                id="unit"
                                type="text"
                                className="form-control"
                                placeholder="請輸入單位"
                                value={templateData.unit}
                                onChange={(e)=>handleModalInputChange(e)}
                                />
                            </div>
                          </div>

                          <div className="row">
                            <div className="mb-3 col-md-6">
                              <label htmlFor="origin_price" className="form-label">原價</label>
                              <input
                                name="origin_price"
                                id="origin_price"
                                type="number"
                                min="0"
                                className="form-control"
                                placeholder="請輸入原價"
                                value={templateData.origin_price}
                                onChange={(e)=>handleModalInputChange(e)}
                                />
                            </div>
                            <div className="mb-3 col-md-6">
                              <label htmlFor="price" className="form-label">售價</label>
                              <input
                                name="price"
                                id="price"
                                type="number"
                                min="0"
                                className="form-control"
                                placeholder="請輸入售價"
                                value={templateData.price}
                                onChange={(e)=>handleModalInputChange(e)}
                                />
                            </div>
                          </div>
                          <hr />

                          <div className="mb-3">
                            <label htmlFor="description" className="form-label">產品描述</label>
                            <textarea
                              name="description"
                              id="description"
                              className="form-control"
                              placeholder="請輸入產品描述"
                              value={templateData.description}
                              onChange={(e)=>handleModalInputChange(e)}
                              ></textarea>
                          </div>
                          <div className="mb-3">
                            <label htmlFor="content" className="form-label">說明內容</label>
                            <textarea
                              name="content"
                              id="content"
                              className="form-control"
                              placeholder="請輸入說明內容"
                              value={templateData.content}
                              onChange={(e)=>handleModalInputChange(e)}
                              ></textarea>
                          </div>
                          <div className="mb-3">
                            <div className="form-check">
                              <input
                                name="is_enabled"
                                id="is_enabled"
                                className="form-check-input"
                                type="checkbox"
                                checked={templateData.is_enabled}
                                onChange={(e)=>handleModalInputChange(e)}
                                />
                              <label className="form-check-label" htmlFor="is_enabled">
                                是否啟用
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  }
                </div>
                <div className="modal-footer">
                  {
                    modalType === 'delete' ? (<>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        data-bs-dismiss="modal"
                        onClick={() => closeModal()}
                        >
                        取消
                      </button>
                      <button
                          type="button"
                          className="btn btn-danger"
                          onClick={()=>delProduct(templateData.id)}
                        >
                          刪除
                      </button>
                    </>
                  ) : (<>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        data-bs-dismiss="modal"
                        onClick={() => closeModal()}
                        >
                        取消
                      </button>
                      <button type="button" className="btn btn-primary" 
                      onClick={()=> updateProduct(templateData.id)}>確認</button>                   
                    </>
                    )
                  }

                </div>
              </div>
        </div>
      </div>
    </>
  )
}

export default App
