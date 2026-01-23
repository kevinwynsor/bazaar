'use client'

import React, { useActionState, useCallback, useState, useEffect } from 'react';
import { Plus, Minus, RefreshCcw } from 'lucide-react';
import { createProduct, getProducts, createSale, removeSale, getProductSalesLogs, createCategory, getCategories } from './actions';
import type { Product } from '@/types/product';
import { toast, ToastContainer } from 'react-toastify';
import { PacmanLoader } from "react-spinners";
import type { Category, Products, Sales } from '../app/generated/prisma';


type CategoryWithProducts = Category & {
  products: Products[];
};

export default function ProductManager() {
  const [activeTab, setActiveTab] = useState('kevin');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('');
  const [categoryWithProductList, setCategoryWithProductList] = useState<CategoryWithProducts[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [salePerProduct, setSalePerProduct] = useState<any[]>([]);
  const [saleLogs, setSaleLogs] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState({ action: '', productId: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSalesLoading, setIsSalesLoading] = useState(false);
  const [state, formCreateProduct, createProductIsPending] = useActionState(createProduct, null)
  const [categoryState, formCreateCategory, createCategorytIsPending] = useActionState(createCategory, null)

  useEffect(() => {
    console.log(state)
    if(state?.success){
      toast.success('success', {
        position: 'top-right',
      });
      onTabClick(activeTab)
    }else if(state?.error){
      toast.error('error', {
        position: 'top-right',
      });
    }
    setShowCreateModal(false)
  },[state])

  useEffect(() => {
    console.log(categoryState)
    if(categoryState?.success){
      toast.success('success', {
        position: 'top-right',
      });
      onTabClick(activeTab)
    }else if(categoryState?.error){
      toast.error('error', {
        position: 'top-right',
      });
    }
    setShowCategoryModal(false)
  },[categoryState])

  useEffect(() => {
    onTabChange()
  },[activeTab])

  const openConfirmModal = (action: string, productId: string) => {
    setConfirmAction({ action, productId });
    setShowConfirmModal(true);
  };

  const onTabClick = async (name: string, ) => {
    setActiveTab(name)
    setCategoryWithProductList([])
    setActiveCategory('')
  }

  
  const getProductSalesAndLogs = useCallback(async () => {
    setIsSalesLoading(true)
    const sales = await getProductSalesLogs(activeTab)
    setSalePerProduct(sales.totalSales)
    setSaleLogs(sales.saleLogs)
    setIsSalesLoading(false)
  },[activeTab, activeCategory])

  const refresh = async () =>{
    setIsRefreshing(true)
    setIsLoading(true)
    setIsSalesLoading(true)
    await onTabChange()
    await getProductSalesAndLogs()
    setIsLoading(false)
    setIsSalesLoading(false)
    setIsRefreshing(false)
  }

  const onTabChange = async () => {
    setIsLoading(true)
  
    try {
      const [
        category,
        list,
        _ // result of getProductSalesAndLogs (if you don’t need the return)
      ] = await Promise.all([
        getCategories(activeTab),
        getProducts(activeTab),
        getProductSalesAndLogs()
      ])
  
      console.log(list, 'product list')
      setCategoryWithProductList(list)
      setCategories(category)
  
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const addRemoveSale = useCallback(async (productId : string, ) => {
    setIsLoading(true)
    const tx = confirmAction.action === 'add' ? await createSale(productId) : await removeSale(productId)
    setIsLoading(false)
    setShowConfirmModal(false)
    console.log(tx)
    if(tx?.success){
      getProductSalesAndLogs()
      console.log(salePerProduct,'getSalesPerProduct')
      toast.success('success', {
        position: 'top-right',
      });
    }else{
      toast.error('error', {
        position: 'top-right',
      });
    }
  },[confirmAction])

  const createProductModal = <>
  {showCreateModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Create New Product</h3>
        <form action={formCreateProduct}>
        <div className="space-y-4">
          <input hidden value={activeTab} name='owner'/>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name*</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter product name"
              required
              name='name'
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity*</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter stock quantity"
              required
              name='stock'
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price*</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter price"
              required
              name='price'
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="string"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter description"
              name='description'
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="categoryId"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue=""
            >
              <option>
                  Select Category
              </option>
              {categories.map((category) => (
                <option key={category?.id} value={category.id}>
                  {category.name ? category.name : 'No Category'}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => {
              setShowCreateModal(false);
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            type='submit'
          >
            Create
          </button>
        </div>
        </form>
      </div>
    </div>
  )}
  </>
  const createCategoryModal = <>
  {showCategoryModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Create New Category</h3>
        <form action={formCreateCategory}>
        <div className="space-y-4">
          <input hidden value={activeTab} name='owner'/>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name*</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter category name"
              required
              name='name'
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">order*</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter order number"
              required
              name='order'
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => {
              setShowCategoryModal(false);
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            type='submit'
          >
            Create
          </button>
        </div>
        </form>
      </div>
    </div>
  )}
  </>

  const confirmModal = <>
  {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Confirm Action</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you {confirmAction?.action === 'remove' ? 'unsell' : 'sold'} this product?
            </p>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <PacmanLoader size={40} color="#000000" />
                </div>) : <></>
              }
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setConfirmAction({ action: '', productId: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => addRemoveSale(confirmAction.productId)}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                    confirmAction?.action === 'remove'
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  Confirm
                </button>
              </div>
          </div>
        </div>
      )}
  </>

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <ToastContainer />
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => onTabClick('kevin')}
            className={`flex-1 py-4 px-6 text-lg font-semibold transition-colors ${
              activeTab === 'kevin'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Kevin
          </button>
          <button
            onClick={() => onTabClick('aya')}
            className={`flex-1 py-4 px-6 text-lg font-semibold transition-colors ${
              activeTab === 'aya'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Aya
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <RefreshCcw size={40} onClick={!isRefreshing ? refresh : undefined}
              className={`cursor-pointer transition-all
                ${isRefreshing
                  ? 'animate-spin text-blue-500 opacity-70'
                  : 'text-gray-600 hover:text-blue-600 active:scale-90'
                }
            `}/>
            <h2 className="text-2xl font-bold text-gray-800">{activeTab}'s Products</h2>
            <button
              onClick={() => setShowCategoryModal(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Create Category
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Create Product
            </button>
          </div>

          {/* Product List */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <PacmanLoader size={40} color="#000000" />
              </div>
            ) : 
            categoryWithProductList.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No products yet. Create one to get started!</p>
            ) : (
              categoryWithProductList.map(category => (
                <div key={category.id} >
                    <div className="flex items-center justify-between px-4 py-2 bg-blue-100 border-l-4 border-blue-500 rounded-md">
                      <span className="text-sm font-semibold text-blue-800 uppercase tracking-wide">
                        {category.name}
                      </span>
                    </div>
                    <div className="items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200 divide-y divide-gray-200">
                      {category.products.map(product => (
                        <div className='flex items-center justify-between'>
                          <div className='flex flex-col'>
                            <h3 className="font-semibold text-gray-800">{product.name}, {product.stock} left</h3>
                            <p className="text-gray-600">P{product.price}</p>
                          </div>
                          <div className="flex gap-2">
                            {salePerProduct.some(s => s.productId === product.id) ? (
                              salePerProduct
                                .filter(s => s.productId === product.id)
                                .map((sale, index) => (
                                  <div key={index} className="text-sm text-gray-500">
                                    Sold {sale.totalSold}
                                  </div>
                                ))
                            ) : (
                              <div className="text-sm text-gray-500">
                                Sold 0
                              </div>
                            )}
                            <button
                              onClick={() => openConfirmModal('remove', product.id)}
                              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition-colors"
                            >
                              <Minus size={20} />
                            </button>
                            <button
                              onClick={() => openConfirmModal('add', product.id)}
                              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition-colors"
                            >
                              <Plus size={20} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* sales log */}
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden mt-10">
      <h2 className="text-2xl font-bold text-gray-800 ml-4">Sales Log</h2>
        {isSalesLoading ? (
          <div className="flex justify-center py-8">
            <PacmanLoader size={40} color="#000000" />
          </div>
        ) : 
        saleLogs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No sales yet</p>
        ) : (
          saleLogs.map(log => (
            <div key={log.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div>
                <h3 className="font-semibold text-gray-800">{new Date(log.sale_date).toLocaleString()}, {log.price}php, {log.quantity}, {log.product.name}</h3>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Product Modal */}
      {createProductModal}

      {/* Create Category Modal */}
      {createCategoryModal}

      {/* Confirmation Modal */}
      {confirmModal}
    </div>
  );
}