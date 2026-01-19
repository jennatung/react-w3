import { useState } from "react";
import Pagination from "../components/Pagination";
import ProductModal from "../components/ProductModal";


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

const INITIAL_TEMPLATE_DATA_INCLUDE_RATE = {
  id: "",
  rate: "無評價",
};

function ProductPage({getProducts, products, pageInfo}) {
  const [templateData, setTemplateData] = useState(INITIAL_TEMPLATE_DATA); //儲存Modal的資料
  const [modalType, setModalType] = useState(""); // 決定開啟哪一種Modal "create", "edit", "delete"
  const [isProductModelOpen, setIsProductModelOpen] = useState(false); //決定是否開啟Model

  const [productsRateData, setProductsRateData] = useState([]); //儲存所有資料(含星等)
  const [tempRateData, setTempRateData] = useState({INITIAL_TEMPLATE_DATA_INCLUDE_RATE}); //儲存星等的資料 


  return (<>
    <div className="container">
      <h2 className="py-4 fw-bold">產品列表</h2>
      <div className="text-end my-2">
       <button type="button" className="btn btn-primary" 
       onClick={()=>{
        setModalType("create");
        setIsProductModelOpen(true);
        setTemplateData((prevData)=>({
          ...prevData,
          ...INITIAL_TEMPLATE_DATA
        }))
       }}>建立新的產品</button>
      </div>
      <table className="table">
            <thead>
              <tr>
                <th>分類</th>
                <th>產品名稱</th>
                <th>原價</th>
                <th>售價</th>
                <th>是否啟用</th>
                <th>評價星級</th>
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
                    <td>{
                        productsRateData.find(item => item.id === product.id)?.rate ?? "無評價"
                    }
                    </td>
                    <td>
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-outline-primary "
                          onClick={()=>{
                            setModalType("edit");
                            setIsProductModelOpen(true);
                            setTemplateData((prevData)=>({
                              ...prevData,
                              ...product
                            }))
                          }}
                        >
                          編輯
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={()=>{
                            setModalType("delete");
                            setIsProductModelOpen(true);
                            setTemplateData((prevData)=>({
                              ...prevData,
                              ...product
                            }))
                          }}
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
      <Pagination pageInfo={pageInfo} getProducts={getProducts}/>              
    </div>
    <ProductModal 
      getProducts={getProducts}
      modalType={modalType} 
      templateData={templateData} 
      setTemplateData={setTemplateData} 
      isProductModelOpen={isProductModelOpen}
      setIsProductModelOpen={setIsProductModelOpen}
      productsRateData={productsRateData}
      setProductsRateData={setProductsRateData} 
      tempRateData={tempRateData}
      setTempRateData={setTempRateData}     
    />   
  </>)
}

export default ProductPage;