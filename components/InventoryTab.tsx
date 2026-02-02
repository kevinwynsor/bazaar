import { useEffect, useState, useActionState } from 'react';
import { Plus, Minus, X } from 'lucide-react';
import Modal from 'react-modal';
import { addInventoryItem, addSales, getInventoryItems, getSalesRecords, removeSales } from '@/app/actions';
import { toast } from 'react-toastify';
import { DNA } from 'react-loader-spinner';


interface Item {
  id: string;
  name: string;
  quantity: number;
  category: string;
  price: number;
  createdAt: Date;
}

interface Sale {
  id: string;
  itemName: string;
  action: 'sale' | 'unsale';
  timestamp: Date;
  quantity: number;
  price: number;
}

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    padding: '0',
    width: '90%',
  },
};

export function InventoryTab({ owner }: { owner: 'kevin' | 'aya' }) {
  const [state, formCreateItem, createItemIsPending] = useActionState(addInventoryItem, null)
  const [inventory, setInventory] = useState<Item[]>();
  const [salesLog, setSalesLog] = useState<Sale[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    quantity: 0,
    price: 0,
  });
  const [modalIsOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function openModal() {
    setIsOpen(true);
  }

  function afterOpenModal() {
    // references are now sync'd and can be accessed
  }

  function closeModal() {
    setIsOpen(false);
  }

  useEffect(() => {
    if(state?.success){
      toast.success('success', {
        position: 'top-right',
      });
    }else if(state?.error){
      toast.error('error', {
        position: 'top-right',
      });
    }
    closeModal()
    setNewProduct({
      name: '',
      category: '',
      quantity: 0,
      price: 0,
    })
    fetchInventoryAndSales()
  },[state])

  // Update inventory when tab changes
  useEffect(() => {
    fetchInventoryAndSales()
  },[owner]);

  const fetchInventoryAndSales = async () => {
    setIsLoading(true)
    const newInventory = await getInventoryItems(owner);
    const sales = await getSalesRecords(owner);
    setInventory(newInventory);
    setSalesLog(
      sales.map(sale => ({
        id: sale.id,
        itemName: sale.product.name,
        action: sale.type === 'sale' ? 'sale' : 'unsale',
        timestamp: sale.createdAt,
        quantity: sale.quantity,
        price: sale.price,
      }))
    );
    setIsLoading(false)
  }

  const handleSale = async (itemId: string, price: number) => {
    setIsLoading(true)
    const addSale = await addSales(itemId, owner, price)
    setInventory(prev =>
      prev?.map(item =>
        item.id === itemId && item.quantity > 0
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );

    const item = inventory?.find(i => i.id === itemId);
    if (item && item.quantity > 0) {
      const newSale: Sale = {
        id: `${Date.now()}-${itemId}`,
        itemName: item.name,
        action: 'sale',
        timestamp: new Date(),
        quantity: 1,
        price: item.price,
      };
      setSalesLog(prev => [newSale, ...prev]);
    }
    setIsLoading(false)
  };

  const handleRestock = async (itemId: string, price: number) => {
    setIsLoading(true)
    console.log('restock')
    const removeSale = await removeSales(itemId, owner, price)
    setInventory(prev =>
      prev?.map(item =>
        item.id === itemId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );

    const item = inventory?.find(i => i.id === itemId);
    if (item) {
      const newSale: Sale = {
        id: `${Date.now()}-${itemId}`,
        itemName: item.name,
        action: 'unsale',
        timestamp: new Date(),
        quantity: 1,
        price: item.price,
      };
      setSalesLog(prev => [newSale, ...prev]);
    }
    setIsLoading(false)
  };

  // Group items by category
  const categorizedItems = inventory?.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, Item[]>);

  return (
    <>
    {isLoading ?
      <DNA
        visible={true}
        height="80"
        width="80"
        ariaLabel="dna-loading"
        wrapperStyle={{}}
        wrapperClass="dna-wrapper"
      />: 
      <div className="space-y-8">
        {/* Inventory Section */}
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2>Inventory</h2>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          </div>
          <div className="space-y-6">
            {Object.entries(categorizedItems ?? {}).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-gray-700 mb-3">{category}</h3>
                <div className="space-y-2">
                  {items.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">{item.name}</span>
                        <span
                          className={`ml-4 px-3 py-1 rounded-full text-sm ${
                            item.quantity === 0
                              ? 'bg-red-100 text-red-700'
                              : item.quantity < 5
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {item.quantity} in stock
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSale(item.id, item.price)}
                          className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                          title="Unsale"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleRestock(item.id, item.price)}
                          disabled={item.quantity === 0}
                          className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                          title="Record Sale"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
  
        {/* Add Product Modal */}
        <Modal
          isOpen={modalIsOpen}
          onAfterOpen={afterOpenModal}
          onRequestClose={closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >
          <div className="">
            <div className="bg-white rounded-lg shadow-xl w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2>Add New Product</h2>
                <button
                  onClick={() => closeModal()}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
  
              <form action={formCreateItem} className="space-y-4">
                <input
                    id="category"
                    name='owner'
                    value={owner}
                    className="hidden"
                  />
                <div>
                  <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    id="productName"
                    name='name'
                    autoComplete='off'
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
  
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    autoComplete='off'
                    id="category"
                    name='category'
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
  
                <div>
                  <label htmlFor="stocks" className="block text-sm font-medium text-gray-700 mb-1">
                    Stocks
                  </label>
                  <input
                    type="number"
                    autoComplete='off'
                    id="stocks"
                    name='quantity'
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="0"
                    required
                  />
                </div>
  
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    autoComplete='off'
                    id="price"
                    name='price'
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
  
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => closeModal()}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 px-4 py-2 ${createItemIsPending ? 'bg-gray-500' : 'bg-purple-500'} text-white rounded-lg hover:bg-purple-600 transition-colors`}
                    disabled={createItemIsPending}
                  >
                    Add Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Modal>
  
        {/* Sales Log Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="mb-4">Sales Log</h2>
          {salesLog.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No sales recorded yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Time</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Item Sold</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Quantity</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Price</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {salesLog.map(sale => (
                    <tr
                      key={sale.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 text-gray-900">
                        {sale.timestamp.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {sale.timestamp.toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">{sale.itemName}</td>
                      <td className="py-3 px-4 text-center text-gray-900">{sale.quantity}</td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        ${sale.price.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${
                            sale.action === 'sale'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {sale.action === 'sale' ? 'Sale' : 'Unsale'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    }
  </>
  );
}