import React, { useState, useEffect } from 'react'

const API_BASE_URL = 'http://localhost:8089/api/companies'

// Mock data for demonstration
const MOCK_COMPANIES = [
  { id: 1, name: 'Tech Corp', email: 'contact@techcorp.com', phone: '123-456-7890', address: '123 Tech Street' },
  { id: 2, name: 'Design Studio', email: 'hello@designstudio.com', phone: '098-765-4321', address: '456 Creative Ave' },
  { id: 3, name: 'Marketing Plus', email: 'info@marketingplus.com', phone: '555-123-4567', address: '789 Business Blvd' }
]

function App() {
  const [companies, setCompanies] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [useMockData, setUseMockData] = useState(false)
  const [nextId, setNextId] = useState(4)

  // Fetch all companies
  const fetchCompanies = async () => {
    setLoading(true)
    setError('')

    if (useMockData) {
      // Use mock data
      setTimeout(() => {
        setCompanies([...MOCK_COMPANIES])
        setLoading(false)
      }, 500)
      return
    }

    try {
      const response = await fetch(API_BASE_URL)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned HTML instead of JSON - API endpoint may not exist')
      }

      const data = await response.json()

      // Ensure data is an array
      if (Array.isArray(data)) {
        setCompanies(data)
      } else if (data && Array.isArray(data.companies)) {
        // Handle case where API returns { companies: [...] }
        setCompanies(data.companies)
      } else {
        console.warn('API returned non-array data:', data)
        setCompanies([])
        setError('Invalid data format received from server')
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
      setError(`Failed to fetch companies: ${error.message}. Using mock data instead.`)
      setUseMockData(true)
      setCompanies([...MOCK_COMPANIES])
    } finally {
      setLoading(false)
    }
  }

  // Load companies on component mount
  useEffect(() => {
    fetchCompanies()
  }, [])

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Create or update company
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (useMockData) {
      // Mock data operations
      setTimeout(() => {
        if (editingId) {
          // Update existing company
          setCompanies(prev => prev.map(company =>
            company.id === editingId ? { ...formData, id: editingId } : company
          ))
          setEditingId(null)
        } else {
          // Create new company
          const newCompany = { ...formData, id: nextId }
          setCompanies(prev => [...prev, newCompany])
          setNextId(prev => prev + 1)
        }

        // Reset form
        setFormData({ name: '', email: '', phone: '', address: '' })
        setLoading(false)
      }, 300)
      return
    }

    try {
      let response
      if (editingId) {
        // Update existing company
        response = await fetch(`${API_BASE_URL}/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        })
        setEditingId(null)
      } else {
        // Create new company
        response = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        })
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Reset form and refresh list
      setFormData({ name: '', email: '', phone: '', address: '' })
      await fetchCompanies()
    } catch (error) {
      console.error('Error saving company:', error)
      setError(`Failed to save company: ${error.message}. Switching to mock data mode.`)
      setUseMockData(true)

      // Perform operation with mock data
      if (editingId) {
        setCompanies(prev => prev.map(company =>
          company.id === editingId ? { ...formData, id: editingId } : company
        ))
        setEditingId(null)
      } else {
        const newCompany = { ...formData, id: nextId }
        setCompanies(prev => [...prev, newCompany])
        setNextId(prev => prev + 1)
      }
      setFormData({ name: '', email: '', phone: '', address: '' })
    } finally {
      setLoading(false)
    }
  }

  // Delete company
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      setLoading(true)
      setError('')

      if (useMockData) {
        // Mock data operation
        setTimeout(() => {
          setCompanies(prev => prev.filter(company => company.id !== id))
          setLoading(false)
        }, 300)
        return
      }

      try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
          method: 'DELETE'
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        await fetchCompanies()
      } catch (error) {
        console.error('Error deleting company:', error)
        setError(`Failed to delete company: ${error.message}. Switching to mock data mode.`)
        setUseMockData(true)
        setCompanies(prev => prev.filter(company => company.id !== id))
      } finally {
        setLoading(false)
      }
    }
  }

  // Edit company
  const handleEdit = (company) => {
    setFormData({
      name: company.name || '',
      email: company.email || '',
      phone: company.phone || '',
      address: company.address || ''
    })
    setEditingId(company.id)
  }

  // Cancel edit
  const handleCancelEdit = () => {
    setFormData({ name: '', email: '', phone: '', address: '' })
    setEditingId(null)
  }

  // Search companies
  const handleSearch = async () => {
    if (searchTerm.trim()) {
      setLoading(true)
      setError('')

      if (useMockData) {
        // Mock search operation
        setTimeout(() => {
          const filtered = MOCK_COMPANIES.concat(
            companies.filter(c => !MOCK_COMPANIES.find(m => m.id === c.id))
          ).filter(company =>
            company.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          setCompanies(filtered)
          setLoading(false)
        }, 300)
        return
      }

      try {
        const response = await fetch(`${API_BASE_URL}/search?name=${encodeURIComponent(searchTerm)}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server returned HTML instead of JSON - API endpoint may not exist')
        }

        const data = await response.json()

        // Ensure data is an array
        if (Array.isArray(data)) {
          setCompanies(data)
        } else if (data && Array.isArray(data.companies)) {
          setCompanies(data.companies)
        } else {
          console.warn('Search API returned non-array data:', data)
          setCompanies([])
          setError('Invalid search results format')
        }
      } catch (error) {
        console.error('Error searching companies:', error)
        setError(`Failed to search companies: ${error.message}. Using mock data instead.`)
        setUseMockData(true)
        const filtered = MOCK_COMPANIES.filter(company =>
          company.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        setCompanies(filtered)
      } finally {
        setLoading(false)
      }
    } else {
      await fetchCompanies()
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Company Management System</h1>

      {useMockData && (
        <div style={{
          backgroundColor: '#fff3cd',
          color: '#856404',
          padding: '10px',
          marginBottom: '20px',
          borderRadius: '4px',
          border: '1px solid #ffeaa7'
        }}>
          <strong>Demo Mode:</strong> API server not available. Using mock data for demonstration.
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '10px',
          marginBottom: '20px',
          borderRadius: '4px',
          border: '1px solid #ef5350'
        }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{
          backgroundColor: '#e3f2fd',
          color: '#1976d2',
          padding: '10px',
          marginBottom: '20px',
          borderRadius: '4px',
          border: '1px solid #42a5f5'
        }}>
          Loading...
        </div>
      )}

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <input
          type="text"
          placeholder="Search companies by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px',
            marginRight: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            width: '300px'
          }}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            padding: '8px 16px',
            marginRight: '10px',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Search
        </button>
        <button
          onClick={() => { setSearchTerm(''); fetchCompanies() }}
          disabled={loading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#757575',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Show All
        </button>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
        <h2>{editingId ? 'Edit Company' : 'Add New Company'}</h2>
        <div onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px', marginBottom: '15px' }}>
            <input
              type="text"
              name="name"
              placeholder="Company Name"
              value={formData.name}
              onChange={handleInputChange}
              required
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              required
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleInputChange}
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleInputChange}
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: '10px 20px',
                marginRight: '10px',
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {editingId ? 'Update Company' : 'Add Company'}
            </button>
            {editingId && (
              <button
                onClick={handleCancelEdit}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2>Companies List ({Array.isArray(companies) ? companies.length : 0})</h2>
        {!Array.isArray(companies) || companies.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
            No companies found.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Phone</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Address</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>{company.id}</td>
                    <td style={{ padding: '12px' }}>{company.name}</td>
                    <td style={{ padding: '12px' }}>{company.email}</td>
                    <td style={{ padding: '12px' }}>{company.phone}</td>
                    <td style={{ padding: '12px' }}>{company.address}</td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => handleEdit(company)}
                        disabled={loading}
                        style={{
                          padding: '6px 12px',
                          marginRight: '5px',
                          backgroundColor: '#ff9800',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(company.id)}
                        disabled={loading}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default App