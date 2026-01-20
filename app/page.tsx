'use client'

import React, { useActionState, useCallback, useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import { createProduct, getProducts, createSale, removeSale, getProductSalesLogs } from './actions';
import type { Product } from '@/types/product';
import { toast, ToastContainer } from 'react-toastify';
import { Sales } from '@/types/sale';
import { CircleLoader } from "react-spinners";


export default function ProductManager() {
  const [activeTab, setActiveTab] = useState('kevin');
  const [productList, setProductList] = useState<Product[]>([]);
  const [salePerProduct, setSalePerProduct] = useState<any[]>([]);
  const [saleLogs, setSaleLogs] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState({ action: '', productId: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [state, formCreateProduct, createProductIsPending] = useActionState(createProduct, null)

  useEffect(() => {
    console.log(state)
    if(state?.success){
      toast.success('success', {
        position: 'top-right',
      });
      onTabClick(activeTab)
    }else{
      toast.error('error', {
        position: 'top-right',
      });
    }
    setShowCreateModal(false)
  },[state])

  useEffect(() => {
    onTabClick('kevin')
  },[])

  const openConfirmModal = (action: string, productId: string) => {
    setConfirmAction({ action, productId });
    setShowConfirmModal(true);
  };

  const onTabClick = useCallback(async (name: string) => {
    setIsLoading(true)
    setActiveTab(name);
    const list = await getProducts(name);
    setProductList(list);
    console.log(list, 'get products')
    await getProductSalesAndLogs()
    setIsLoading(false)
    },[])

  const getProductSalesAndLogs = useCallback(async () => {
    const sales = await getProductSalesLogs()
    const list = await getProducts(activeTab);
    setProductList(list);
    setSalePerProduct(sales.totalSales)
    setSaleLogs(sales.saleLogs)
    console.log(sales, ' get sales per product')
    },[])

  const addRemoveSale = useCallback(async (productId : string) => {
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

  const createModal = <>
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
                  <CircleLoader size={40} color="#3b82f6" />
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
            <h2 className="text-2xl font-bold text-gray-800">{activeTab}'s Products</h2>
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
                <CircleLoader size={40} color="#3b82f6" />
              </div>
            ) : 
            productList.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No products yet. Create one to get started!</p>
            ) : (
              productList.map(product => (
                <div key={product.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div>
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
              ))
            )}
          </div>
        </div>
      </div>

      {/* sales log */}
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden mt-10">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <CircleLoader size={40} color="#3b82f6" />
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
      {createModal}

      {/* Confirmation Modal */}
      {confirmModal}
    </div>
  );
}