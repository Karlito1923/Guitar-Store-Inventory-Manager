import { useState, useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import styles from './App.module.css';

export default function App() {
const initialGuitars = [
  { id: 1, model: 'Fender Stratocaster', bodyType: 'Electric', brand: 'Fender', stock: 15, manufacturer: 'Fender Musical Instruments', userRole: 'Merchant' },
  { id: 2, model: 'Gibson Les Paul', bodyType: 'Electric', brand: 'Gibson', stock: 8, manufacturer: 'Gibson Brands, Inc.', userRole: 'Merchant' },
  { id: 3, model: 'Taylor 214ce', bodyType: 'Acoustic', brand: 'Taylor', stock: 4, manufacturer: 'Taylor Guitars', userRole: 'Consumer' },
  { id: 4, model: 'Ibanez SR500E', bodyType: 'Bass', brand: 'Ibanez', stock: 2, manufacturer: 'Hoshino Gakki', userRole: 'Merchant' },
  { id: 5, model: 'PRS Custom 24', bodyType: 'Electric', brand: 'PRS', stock: 12, manufacturer: 'Paul Reed Smith', userRole: 'Merchant' },
];

  const [items, setItems] = useState(initialGuitars);
  const [selectedItem, setSelectedItem] = useState(initialGuitars[0]);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const [formData, setFormData] = useState({
    model: '',
    bodyType: 'Electric',
    brand: '',
    stock: '',
    manufacturer: '',
    userRole: 'Merchant',
  });

  const [errors, setErrors] = useState({});

  const validate = (data) => {
    const errs = {};
    if (!data.model || data.model.length < 3) {
      errs.model = 'Guitar Model must be at least 3 characters.';
    }
    if (!data.brand || data.brand.length < 3) {
      errs.brand = 'Brand Name must be at least 3 characters.';
    }
    const stockNum = Number(data.stock);
    if (!data.stock || isNaN(stockNum) || stockNum < 1 || stockNum > 100) {
      errs.stock = 'Stock Quantity must be between 1 and 100.';
    }
    if (!data.manufacturer || data.manufacturer.trim() === '') {
      errs.manufacturer = 'Manufacturer Name is required.';
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    setErrors(validate(updated));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const newItem = { id: Date.now(), ...formData, stock: Number(formData.stock) };
    setItems((prev) => [newItem, ...prev]);
    setSelectedItem(newItem);

    setFormData({
      model: '',
      bodyType: 'Electric',
      brand: '',
      stock: '',
      manufacturer: '',
      userRole: 'Merchant',
    });
    setErrors({});
  };

  useEffect(() => {
    if (items.length > 0 && !items.some((i) => i.id === selectedItem?.id)) {
      setSelectedItem(items[0]);
    }
  }, [items, selectedItem]);

  const handleDelete = (id) => {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
    if (selectedItem?.id === id) {
      setSelectedItem(updated[0] || null);
    }
  };

  const totalStock = useMemo(() => items.reduce((acc, curr) => acc + Number(curr.stock), 0), [items]);
  const merchantCount = useMemo(() => items.filter((i) => i.userRole === 'Merchant').length, [items]);

  const filteredData = useMemo(() => {
    return items
      .filter((item) => {
        const matchesRole = roleFilter === 'ALL' || item.userRole === roleFilter;
        const matchesSearch =
          item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesRole && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'stock-asc') return a.stock - b.stock;
        if (sortBy === 'stock-desc') return b.stock - a.stock;
        if (sortBy === 'brand') return a.brand.localeCompare(b.brand);
        return b.id - a.id;
      });
  }, [items, roleFilter, searchTerm, sortBy]);

  const columns = useMemo(
    () => [
      { header: 'Model', accessorKey: 'model' },
      { header: 'Brand', accessorKey: 'brand' },
      { header: 'Body Type', accessorKey: 'bodyType' },
      {
        header: 'Stock',
        accessorKey: 'stock',
        cell: (info) => {
          const val = info.getValue();
          return (
            <span style={{ fontWeight: 700, color: val <= 5 ? '#D90429' : 'inherit' }}>
              {val} {val <= 5 && ' (Low)'}
            </span>
          );
        },
      },
      {
        header: 'Role',
        accessorKey: 'userRole',
        cell: (info) => (
          <span
            className={`${styles.badge} ${
              info.getValue() === 'Merchant' ? styles.merchant : styles.consumer
            }`}
          >
            {info.getValue()}
          </span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 3 },
    },
  });

  return (
    <div className={styles.container}>
      <h1 className={styles.title}> Guitar Store Inventory Manager</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className={styles.card} style={{ textAlign: 'center', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL MODELS</span>
          <h2 style={{ border: 'none', margin: '0.5rem 0 0 0', fontSize: '2rem' }}>{items.length}</h2>
        </div>
        <div className={styles.card} style={{ textAlign: 'center', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL STOCK UNITS</span>
          <h2 style={{ border: 'none', margin: '0.5rem 0 0 0', fontSize: '2rem' }}>{totalStock}</h2>
        </div>
        <div className={styles.card} style={{ textAlign: 'center', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>MERCHANT ROLES</span>
          <h2 style={{ border: 'none', margin: '0.5rem 0 0 0', fontSize: '2rem' }}>{merchantCount}</h2>
        </div>
      </div>

      <div className={styles.grid}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2> Add Guitar Entry</h2>

          <div className={styles.formGroup}>
            <label>Guitar Model</label>
            <input
              type="text"
              name="model"
              placeholder="e.g. Fender Stratocaster"
              value={formData.model}
              onChange={handleChange}
            />
            {errors.model && <span className={styles.error}>{errors.model}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Body Type</label>
            <select name="bodyType" value={formData.bodyType} onChange={handleChange}>
              <option value="Electric"> Electric</option>
              <option value="Acoustic"> Acoustic</option>
              <option value="Bass"> Bass</option>
              <option value="Classical"> Classical</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Brand Name</label>
            <input
              type="text"
              name="brand"
              placeholder="e.g. Fender"
              value={formData.brand}
              onChange={handleChange}
            />
            {errors.brand && <span className={styles.error}>{errors.brand}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Stock Quantity (1-100)</label>
            <input
              type="number"
              name="stock"
              placeholder="e.g. 25"
              value={formData.stock}
              onChange={handleChange}
            />
            {errors.stock && <span className={styles.error}>{errors.stock}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Manufacturer Name</label>
            <input
              type="text"
              name="manufacturer"
              placeholder="e.g. Fender Musical Instruments"
              value={formData.manufacturer}
              onChange={handleChange}
            />
            {errors.manufacturer && <span className={styles.error}>{errors.manufacturer}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>User Role</label>
            <div className={styles.radioGroup}>
              <label>
                <input
                  type="radio"
                  name="userRole"
                  value="Merchant"
                  checked={formData.userRole === 'Merchant'}
                  onChange={handleChange}
                />
                Merchant
              </label>
              <label>
                <input
                  type="radio"
                  name="userRole"
                  value="Consumer"
                  checked={formData.userRole === 'Consumer'}
                  onChange={handleChange}
                />
                Consumer
              </label>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn}>
            Add Entry to Store
          </button>
        </form>

        <div>
          <div className={styles.card}>
            <h2>🔍 Active Item Details</h2>
            {selectedItem ? (
              <div>
                <h3>{selectedItem.brand} - {selectedItem.model}</h3>
                <p><span>Body Type:</span> <strong>{selectedItem.bodyType}</strong></p>
                <p><span>Stock Quantity:</span> <strong>{selectedItem.stock} Units</strong></p>
                <p><span>Manufacturer:</span> <strong>{selectedItem.manufacturer}</strong></p>
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    className={`${styles.badge} ${
                      selectedItem.userRole === 'Merchant' ? styles.merchant : styles.consumer
                    }`}
                  >
                    {selectedItem.userRole}
                  </span>
                  <button
                    onClick={() => handleDelete(selectedItem.id)}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#D90429',
                      border: '1px solid #D90429',
                      borderRadius: '6px',
                      padding: '0.4rem 0.8rem',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                    }}
                  >
                    🗑️ Remove Entry
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ textAlign: 'center', padding: '2rem 0' }}>Select an entry from the registry table below to view active item metrics.</p>
            )}
          </div>
        </div>
      </div>

      <div className={styles.tableContainer} style={{ marginTop: '2.5rem' }}>
        <h2>📋 Registry Inventory Table</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
          <input
            type="text"
            placeholder=" Search model, brand, or manufacturer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid var(--border-light)',
              outline: 'none',
            }}
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}
          >
            <option value="ALL">All Roles</option>
            <option value="Merchant">Merchant Only</option>
            <option value="Consumer">Consumer Only</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}
          >
            <option value="newest">Sort: Newest First</option>
            <option value="stock-asc">Sort: Stock (Low to High)</option>
            <option value="stock-desc">Sort: Stock (High to Low)</option>
            <option value="brand">Sort: Brand (A-Z)</option>
          </select>
        </div>

        <table className={styles.table}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => setSelectedItem(row.original)}
                  className={selectedItem?.id === row.original.id ? styles.activeRow : ''}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No matching guitars found in registry.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className={styles.pagination}>
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            ← Previous
          </button>
          <span>
            Page <strong>{table.getState().pagination.pageIndex + 1}</strong> of{' '}
            <strong>{table.getPageCount() || 1}</strong>
          </span>
          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}