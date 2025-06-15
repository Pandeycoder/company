import React, { useState, useEffect } from 'react'

const API_BASE_URL = 'http://localhost:8089/api/companies'

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
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 10
  })

  // Fetch all companies with pagination
  const fetchCompanies = async (page = 0, size = 10) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}?page=${page}&size=${size}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned HTML instead of JSON - API endpoint may not exist')
      }

      const data = await response.json()

      // Handle Spring Boot Page response
      console.log('API Response:', data)

      if (data.content && Array.isArray(data.content)) {
        setCompanies(data.content)
        setPagination({
          currentPage: data.number || 0,
          totalPages: data.totalPages || 0,
          totalElements: data.totalElements || 0,
          size: data.size || 10
        })
      } else {
        console.warn('API returned unexpected data structure:', data)
        setCompanies([])
        setError('Invalid data format received from server')
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
      setError(`Failed to fetch companies: ${error.message}`)
      setCompanies([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()

    // Validate required fields
    if (!formData.name.trim()) {
      setError('Company name is required')
      return
    }
    if (!formData.email.trim()) {
      setError('Email is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      let response
      let url = API_BASE_URL
      let method = 'POST'

      if (editingId) {
        // Update existing company
        url = `${API_BASE_URL}/${editingId}`
        method = 'PUT'
      }

      console.log(`${method} request to:`, url)
      console.log('Request body:', formData)

      response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const result = await response.json()
      console.log('Success response:', result)

      // Reset form and refresh list
      setFormData({ name: '', email: '', phone: '', address: '' })
      setEditingId(null)

      // Refresh the company list
      await fetchCompanies(0, pagination.size)

      // Show success message
      const successMessage = editingId ? 'Company updated successfully!' : 'Company added successfully!'
      console.log(successMessage)

    } catch (error) {
      console.error('Error saving company:', error)
      setError(`Failed to save company: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Delete company
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      setLoading(true)
      setError('')

      try {
        console.log('Deleting company with ID:', id)

        const response = await fetch(`${API_BASE_URL}/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        })

        console.log('Delete response status:', response.status)
        console.log('Delete response ok:', response.ok)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Delete error response:', errorText)
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
        }

        console.log('Company deleted successfully')

        // Refresh the company list
        await fetchCompanies(pagination.currentPage, pagination.size)

      } catch (error) {
        console.error('Error deleting company:', error)
        setError(`Failed to delete company: ${error.message}`)
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
  const handleSearch = async (page = 0) => {
    if (searchTerm.trim()) {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(`${API_BASE_URL}/search?name=${encodeURIComponent(searchTerm)}&page=${page}&size=${pagination.size}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server returned HTML instead of JSON - API endpoint may not exist')
        }

        const data = await response.json()

        // Handle paginated search results
        if (data.content && Array.isArray(data.content)) {
          setCompanies(data.content)
          setPagination({
            currentPage: data.number || 0,
            totalPages: data.totalPages || 0,
            totalElements: data.totalElements || 0,
            size: data.size || 10
          })
        } else {
          console.warn('Search API returned unexpected data structure:', data)
          setCompanies([])
          setError('Invalid search results format')
        }
      } catch (error) {
        console.error('Error searching companies:', error)
        setError(`Failed to search companies: ${error.message}`)
        setCompanies([])
      } finally {
        setLoading(false)
      }
    } else {
      await fetchCompanies()
    }
  }

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (searchTerm.trim()) {
      handleSearch(newPage)
    } else {
      fetchCompanies(newPage, pagination.size)
    }
  }

  const handlePageSizeChange = (newSize) => {
    const newPagination = { ...pagination, size: newSize }
    setPagination(newPagination)

    if (searchTerm.trim()) {
      handleSearch(0)
    } else {
      fetchCompanies(0, newSize)
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>Company Management System</h1>

      {error && (
        <div style={{
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '15px',
          marginBottom: '20px',
          borderRadius: '8px',
          border: '1px solid #ef5350',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading && (
        <div style={{
          backgroundColor: '#e3f2fd',
          color: '#1976d2',
          padding: '15px',
          marginBottom: '20px',
          borderRadius: '8px',
          border: '1px solid #42a5f5',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'inline-block', marginRight: '10px' }}>⏳</div>
          Loading...
        </div>
      )}

      {/* Search Section */}
      <div style={{
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginTop: '0', color: '#333' }}>Search Companies</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search companies by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '12px',
              border: '2px solid #ddd',
              borderRadius: '6px',
              minWidth: '300px',
              fontSize: '14px',
              transition: 'border-color 0.3s'
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            onFocus={(e) => e.target.style.borderColor = '#2196f3'}
            onBlur={(e) => e.target.style.borderColor = '#ddd'}
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#1976d2')}
            onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#2196f3')}
          >
            🔍 Search
          </button>
          <button
            onClick={() => { setSearchTerm(''); fetchCompanies() }}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: '#757575',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#616161')}
            onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#757575')}
          >
            📋 Show All
          </button>
        </div>
      </div>

      {/* Form Section */}
      <div style={{
        marginBottom: '30px',
        padding: '25px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0'
      }}>
        <h2 style={{ marginTop: '0', color: '#333' }}>
          {editingId ? '✏️ Edit Company' : '➕ Add New Company'}
        </h2>
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <input
              type="text"
              name="name"
              placeholder="* Company Name"
              value={formData.name}
              onChange={handleInputChange}
              required
              style={{
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#4caf50'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
            <input
              type="email"
              name="email"
              placeholder="* Email Address"
              value={formData.email}
              onChange={handleInputChange}
              required
              style={{
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#4caf50'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleInputChange}
              style={{
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#4caf50'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleInputChange}
              style={{
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#4caf50'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !formData.name.trim() || !formData.email.trim()}
              style={{
                padding: '12px 24px',
                backgroundColor: (loading || !formData.name.trim() || !formData.email.trim()) ? '#ccc' : '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: (loading || !formData.name.trim() || !formData.email.trim()) ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'background-color 0.3s'
              }}
              onMouseOver={(e) => !loading && formData.name.trim() && formData.email.trim() && (e.target.style.backgroundColor = '#388e3c')}
              onMouseOut={(e) => !loading && formData.name.trim() && formData.email.trim() && (e.target.style.backgroundColor = '#4caf50')}
            >
              {editingId ? '💾 Update Company' : '➕ Add Company'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#d32f2f'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#f44336'}
              >
                ❌ Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0',
        overflow: 'hidden'
      }}>
        {/* Header with pagination info */}
        <div style={{
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <h2 style={{ margin: '0', color: '#333' }}>
            📊 Companies ({pagination.totalElements} total)
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', color: '#666' }}>
              Page {pagination.currentPage + 1} of {pagination.totalPages}
            </span>
            <select
              value={pagination.size}
              onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
              style={{
                padding: '6px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>

        {!Array.isArray(companies) || companies.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#666',
            padding: '60px 20px',
            fontSize: '16px'
          }}>
            {searchTerm ? '🔍 No companies found matching your search.' : '📝 No companies found. Add your first company above!'}
          </div>
        ) : (
          <>
            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f0f8ff' }}>
                    <th style={{ padding: '15px 12px', textAlign: 'left', borderBottom: '2px solid #2196f3', fontWeight: 'bold', color: '#333' }}>ID</th>
                    <th style={{ padding: '15px 12px', textAlign: 'left', borderBottom: '2px solid #2196f3', fontWeight: 'bold', color: '#333' }}>Company Name</th>
                    <th style={{ padding: '15px 12px', textAlign: 'left', borderBottom: '2px solid #2196f3', fontWeight: 'bold', color: '#333' }}>Email</th>
                    <th style={{ padding: '15px 12px', textAlign: 'left', borderBottom: '2px solid #2196f3', fontWeight: 'bold', color: '#333' }}>Phone</th>
                    <th style={{ padding: '15px 12px', textAlign: 'left', borderBottom: '2px solid #2196f3', fontWeight: 'bold', color: '#333' }}>Address</th>
                    <th style={{ padding: '15px 12px', textAlign: 'center', borderBottom: '2px solid #2196f3', fontWeight: 'bold', color: '#333' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company, index) => (
                    <tr
                      key={company.id}
                      style={{
                        borderBottom: '1px solid #eee',
                        backgroundColor: index % 2 === 0 ? '#fafafa' : '#ffffff',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f8ff'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fafafa' : '#ffffff'}
                    >
                      <td style={{ padding: '15px 12px', fontWeight: 'bold', color: '#666' }}>{company.id}</td>
                      <td style={{ padding: '15px 12px', fontWeight: 'bold', color: '#333' }}>{company.name}</td>
                      <td style={{ padding: '15px 12px', color: '#555' }}>{company.email}</td>
                      <td style={{ padding: '15px 12px', color: '#555' }}>{company.phone || '-'}</td>
                      <td style={{ padding: '15px 12px', color: '#555', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {company.address || '-'}
                      </td>
                      <td style={{ padding: '15px 12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleEdit(company)}
                            disabled={loading}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#ff9800',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: loading ? 'not-allowed' : 'pointer',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              transition: 'background-color 0.3s'
                            }}
                            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#f57c00')}
                            onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#ff9800')}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(company.id)}
                            disabled={loading}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#f44336',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: loading ? 'not-allowed' : 'pointer',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              transition: 'background-color 0.3s'
                            }}
                            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#d32f2f')}
                            onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#f44336')}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div style={{
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderTop: '1px solid #e0e0e0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => handlePageChange(0)}
                  disabled={pagination.currentPage === 0 || loading}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: pagination.currentPage === 0 ? '#ccc' : '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: (pagination.currentPage === 0 || loading) ? 'not-allowed' : 'pointer',
                    fontSize: '12px'
                  }}
                >
                  ⏮️ First
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 0 || loading}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: pagination.currentPage === 0 ? '#ccc' : '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: (pagination.currentPage === 0 || loading) ? 'not-allowed' : 'pointer',
                    fontSize: '12px'
                  }}
                >
                  ⏪ Prev
                </button>

                <span style={{
                  padding: '8px 16px',
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {pagination.currentPage + 1} / {pagination.totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages - 1 || loading}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: (pagination.currentPage >= pagination.totalPages - 1) ? '#ccc' : '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: (pagination.currentPage >= pagination.totalPages - 1 || loading) ? 'not-allowed' : 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Next ⏩
                </button>
                <button
                  onClick={() => handlePageChange(pagination.totalPages - 1)}
                  disabled={pagination.currentPage >= pagination.totalPages - 1 || loading}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: (pagination.currentPage >= pagination.totalPages - 1) ? '#ccc' : '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: (pagination.currentPage >= pagination.totalPages - 1 || loading) ? 'not-allowed' : 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Last ⏭️
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default App