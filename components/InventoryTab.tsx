import { useEffect, useState } from 'react';
import { Plus, Minus, X } from 'lucide-react';
import Modal from 'react-modal';

interface Item {
  id: string;
  name: string;
  quantity: number;
  category: string;
  price: number;
}

interface Sale {
  id: string;
  itemName: string;
  action: 'sale' | 'restock';
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

const kevinInventory: Item[] = [
  { id: 'k1', name: 'Handmade Pottery', quantity: 15, category: 'Ceramics', price: 25.00 },
  { id: 'k2', name: 'Clay Vases', quantity: 8, category: 'Ceramics', price: 35.00 },
  { id: 'k3', name: 'Wool Scarves', quantity: 20, category: 'Textiles', price: 18.00 },
  { id: 'k4', name: 'Cotton Blankets', quantity: 12, category: 'Textiles', price: 45.00 },
  { id: 'k5', name: 'Wooden Spoons', quantity: 25, category: 'Kitchenware', price: 12.00 },
  { id: 'k6', name: 'Cutting Boards', quantity: 10, category: 'Kitchenware', price: 28.00 },
];

const ayaInventory: Item[] = [
  { id: 'a1', name: 'Silver Bracelets', quantity: 18, category: 'Jewelry', price: 42.00 },
  { id: 'a2', name: 'Beaded Necklaces', quantity: 22, category: 'Jewelry', price: 38.00 },
  { id: 'a3', name: 'Lavender Soap', quantity: 30, category: 'Bath & Body', price: 8.00 },
  { id: 'a4', name: 'Essential Oils', quantity: 15, category: 'Bath & Body', price: 15.00 },
  { id: 'a5', name: 'Embroidered Pillows', quantity: 10, category: 'Home Decor', price: 32.00 },
  { id: 'a6', name: 'Wall Hangings', quantity: 7, category: 'Home Decor', price: 55.00 },
];

export function InventoryTab({ owner }: { owner: 'kevin' | 'aya' }) {
  const initialInventory = owner === 'kevin' ? kevinInventory : ayaInventory;
  const [inventory, setInventory] = useState<Item[]>(initialInventory);
  const [salesLog, setSalesLog] = useState<Sale[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    quantity: 0,
    price: 0,
  });
  const [modalIsOpen, setIsOpen] = useState(false);

  function openModal() {
    setIsOpen(true);
  }

  function afterOpenModal() {
    // references are now sync'd and can be accessed
  }

  function closeModal() {
    setIsOpen(false);
  }

  // Update inventory when tab changes
  useEffect(() => {
    const newInventory = owner === 'kevin' ? kevinInventory : ayaInventory;
    setInventory(newInventory);
  },[owner]);

  const handleSale = (itemId: string) => {
    setInventory(prev =>
      prev.map(item =>
        item.id === itemId && item.quantity > 0
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );

    const item = inventory.find(i => i.id === itemId);
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
  };

  const handleRestock = (itemId: string) => {
    setInventory(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );

    const item = inventory.find(i => i.id === itemId);
    if (item) {
      const newSale: Sale = {
        id: `${Date.now()}-${itemId}`,
        itemName: item.name,
        action: 'restock',
        timestamp: new Date(),
        quantity: 1,
        price: item.price,
      };
      setSalesLog(prev => [newSale, ...prev]);
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProduct.name || !newProduct.category || newProduct.quantity < 0 || newProduct.price <= 0) {
      return;
    }

    const newItem: Item = {
      id: `${owner[0]}${Date.now()}`,
      name: newProduct.name,
      quantity: newProduct.quantity,
      category: newProduct.category,
      price: newProduct.price,
    };

    setInventory(prev => [...prev, newItem]);
    closeModal();
    setNewProduct({ name: '', category: '', quantity: 0, price: 0 });
  };

  // Group items by category
  const categorizedItems = inventory.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, Item[]>);

  return (
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
          {Object.entries(categorizedItems).map(([category, items]) => (
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
                        onClick={() => handleRestock(item.id)}
                        className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                        title="Restock"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleSale(item.id)}
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

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  id="productName"
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
                  id="category"
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
                  id="stocks"
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
                  id="price"
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
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
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
                        {sale.action === 'sale' ? 'Sale' : 'Restock'}
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
  );
}