import * as bootstrap from "bootstrap";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;



function ProductModal({getProducts, modalType, templateData, setTemplateData, isProductModelOpen , setIsProductModelOpen, productsRateData, setProductsRateData, tempRateData, setTempRateData}) {
    const myModal = useRef(null);
    const productModalRef = useRef(null);   
    
    //編輯星等
    const productRateChange = (e) => {
      const res = e.target.value

      // 先將暫存的資料存起來
      // console.log("查: ", templateData);
      setTempRateData({
        id: templateData.id || "temp",
        rate: res
      });
    }

    useEffect(() => {
      if (!tempRateData.id) return;

      setProductsRateData(prev => {
        const index = prev.findIndex(item => item.id === tempRateData.id);

        if (index !== -1) {
          const arr = [...prev];
          arr[index] = tempRateData;
          return arr;
        }

        return [...prev, tempRateData];
      });
    }, [tempRateData]);

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
            getProducts();
            closeModal();
        } catch (error) {
            alert("產品上傳失敗: " + error.response.data.message);
        }

    }

    //上傳圖片功能
    const handleFileChange = async(e) => {
        // console.dir(e.target);
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file-to-upload', file);
        // console.log(formData);
        try {
        const res = await axios.post(`${API_BASE}/api/${API_PATH}/admin/upload`, formData);
        const uploadImageUrl = res.data.imageUrl;
        // console.log(res.data.imageUrl);
        setTemplateData({
            ...templateData,
            imageUrl: uploadImageUrl
        })
        } catch (error) {
        alert('上傳失敗: ' + error.response.data.message);
        }
    }   

    //Modal關
    const closeModal = () => {
        productModalRef.current.hide();
    }

    useEffect(() => {
        productModalRef.current = new bootstrap.Modal(myModal.current);
    }, []);    

    useEffect(() => {
      if (!myModal.current) return;
      const handleHidden = () => {
        setIsProductModelOpen(false);
      };
      myModal.current.addEventListener('hidden.bs.modal', handleHidden);
      return () => {
        myModal.current.removeEventListener('hidden.bs.modal', handleHidden);
      };
    }, []);   

    useEffect(() => {
        if (!productModalRef.current) return;
        if (isProductModelOpen) {
            productModalRef.current.show();
        } else {
            productModalRef.current.hide();
        }
    }, [isProductModelOpen]);  
    
    return (<>
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

                            {/* 圖片上傳功能 */}
                            <div className="mb-3">
                              <label htmlFor="fileInput" className="form-label"> 檔案上傳 </label>
                              <input
                                type="file"
                                accept=".jpg,.jpeg,.png"
                                className="form-control"
                                id="fileInput"
                                onChange={(e)=>handleFileChange(e)}
                              />
                            </div>

                            {/* 圖片網址 */}
                            <div className="mb-2">
                              <div className="mb-3">
                                <label htmlFor="imageUrl" className="form-label">
                                  主圖
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
                                <label htmlFor="productRating" className="form-label">評價星級</label>
                                <select id="productRating" className="form-select" 
                                aria-label="Default select example"  
                                value={tempRateData.rate}                       
                                onChange={(e) => productRateChange(e)}>
                                <option value="" hidden>請選擇星級</option>
                                <option value="★★★★★">★★★★★</option>
                                <option value="★★★★">★★★★</option>
                                <option value="★★★">★★★</option>
                                <option value="★★">★★</option>
                                <option value="★">★</option>
                                </select>
                            </div>

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
    </>)
}

export default ProductModal;