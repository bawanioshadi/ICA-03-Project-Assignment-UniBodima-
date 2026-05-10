import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Button,
  Card,
  Carousel,
  Col,
  Container,
  Dropdown,
  Form,
  InputGroup,
  ListGroup,
  Modal,
  Row,
} from 'react-bootstrap'
import toast, { Toaster } from 'react-hot-toast'
import Swal from 'sweetalert2'

const students = [
  { id: 'student-1', name: 'Aisha Khan', email: 'aisha@student.unibodima.com' },
  { id: 'student-2', name: 'Ravi Patel', email: 'ravi@student.unibodima.com' },
]

const initialProperties = [
  {
    id: 'prop-1',
    ownerId: 'owner-1',
    title: 'Modern Studio Near Campus',
    city: 'Bangalore',
    price: 14500,
    description:
      'Fully furnished studio with high-speed Wi-Fi, dedicated study desk, and 24/7 security.',
    features: ['Wi-Fi', '24/7 Security', 'Laundry', 'Attached Bathroom', 'Power Backup'],
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    id: 'prop-2',
    ownerId: 'owner-2',
    title: 'Shared Apartment with Private Rooms',
    city: 'Pune',
    price: 9800,
    description:
      'Student-friendly apartment with clean common areas, kitchen access, and bike parking.',
    features: ['Private Room', 'Kitchen Access', 'Parking', 'CCTV', 'Housekeeping'],
    images: [
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=1200&q=80',
    ],
  },
]

const API_BASE_URL = 'http://localhost:5000/api'
const STORAGE_USER_KEY = 'UniBodima_user'

const LANDING_HERO_BG =
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=80'

function getInitialAuth() {
  try {
    const token = localStorage.getItem('authToken') || ''
    const raw = localStorage.getItem(STORAGE_USER_KEY)
    const user = raw ? JSON.parse(raw) : null
    if (token && user?.id && user?.role) return { token, user }
    if (token) localStorage.removeItem('authToken')
    if (raw) localStorage.removeItem(STORAGE_USER_KEY)
    return { token: '', user: null }
  } catch {
    localStorage.removeItem('authToken')
    localStorage.removeItem(STORAGE_USER_KEY)
    return { token: '', user: null }
  }
}

function parseBoardingDistanceKm(distanceStr) {
  if (distanceStr === null || distanceStr === undefined || String(distanceStr).trim() === '') return 999
  const match = String(distanceStr).match(/(\d+\.?\d*)/)
  return match ? parseFloat(match[1]) : 999
}

const DEFAULT_LISTING_IMG =
  'https://buysell.lk/wp-content/uploads/2024/03/House-for-Sale-in-Thandikulam-Vavuniya-600x375.jpg'

const normalizeProperty = (boarding) => {
  const owner = typeof boarding.ownerId === 'object' && boarding.ownerId !== null ? boarding.ownerId : null
  const rawOwnerId = owner?._id ?? boarding.ownerId
  return {
    id: String(boarding._id),
    ownerId: rawOwnerId != null ? String(rawOwnerId) : '',
    title: boarding.title,
    city: boarding.location,
    price: boarding.price,
    description: boarding.description,
    distanceFromUniversity: boarding.distanceFromUniversity,
    roomCount: boarding.roomCount,
    studentsCapacity: boarding.studentsCapacity,
    specialNote: boarding.specialNote || '',
    features: boarding.specialNote
      ? boarding.specialNote.split(',').map((item) => item.trim()).filter(Boolean)
      : ['Distance: ' + boarding.distanceFromUniversity, 'Rooms: ' + boarding.roomCount],
    images: [boarding.image].filter(Boolean),
    ownerName: owner?.name,
    ownerPhone: owner?.phone,
  }
}

function App() {
  const [_initAuth] = useState(() => getInitialAuth())
  const [authView, setAuthView] = useState('landing')
  const [currentUser, setCurrentUser] = useState(_initAuth.user)
  const [authToken, setAuthToken] = useState(_initAuth.token)
  const [properties, setProperties] = useState(initialProperties)
  const [ownerBoardingsList, setOwnerBoardingsList] = useState([])
  const [requests, setRequests] = useState([])
  const [selectedPropertyId, setSelectedPropertyId] = useState(initialProperties[0].id)
  const [activeFeature, setActiveFeature] = useState('')
  const [showPropertyModal, setShowPropertyModal] = useState(false)
  const [editingPropertyId, setEditingPropertyId] = useState('')
  const [propertyForm, setPropertyForm] = useState({
    title: '',
    city: '',
    price: '',
    distanceFromUniversity: '',
    roomCount: '',
    studentsCapacity: '',
    description: '',
    features: '',
    imageOne: '',
    imageTwo: '',
    imageThree: '',
  })
  const [loginForm, setLoginForm] = useState({ identifier: '', password: '', role: 'student' })
  const [signupForm, setSignupForm] = useState({
    name: '',
    phone: '',
    password: '',
    role: 'student',
  })
  const [dashTab, setDashTab] = useState('browse')
  const [browseSearch, setBrowseSearch] = useState('')
  const [studentDetailModal, setStudentDetailModal] = useState(false)
  const [landingMaxDistanceKm, setLandingMaxDistanceKm] = useState(10)
  const [landingMaxPrice, setLandingMaxPrice] = useState(15000)
  const [landingLocationQuery, setLandingLocationQuery] = useState('')
  const [landingChips, setLandingChips] = useState(() => new Set())

  const apiRequest = useCallback(async (endpoint, options = {}) => {
    const headers = { ...(options.headers || {}) }
    if (authToken) headers.Authorization = `Bearer ${authToken}`
    if (options.body != null) headers['Content-Type'] = 'application/json'

    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers })
    const data = await response.json().catch(() => ({}))
    if (!response.ok || data.status !== 'success') {
      throw new Error(data.message || 'Request failed')
    }
    return data
  }, [authToken])

  const loadPublicBoardings = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/boardings/public`)
      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.status !== 'success') {
        throw new Error(data.message || 'Failed to load listings')
      }
      const mapped = data.boardings.map(normalizeProperty)
      if (mapped.length > 0) {
        setProperties(mapped)
        setSelectedPropertyId(mapped[0].id)
      } else {
        setProperties(initialProperties)
        setSelectedPropertyId(initialProperties[0].id)
      }
    } catch {
      toast.error('Could not load properties from backend.')
      setProperties(initialProperties)
      setSelectedPropertyId(initialProperties[0].id)
    }
  }, [])

  const refreshOwnerBoardings = useCallback(async () => {
    try {
      const data = await apiRequest('/boardings/ownerBoardings', { method: 'GET' })
      setOwnerBoardingsList(data.boardings.map(normalizeProperty))
    } catch (error) {
      toast.error(error.message || 'Could not refresh your listings.')
    }
  }, [apiRequest])

  const selectedProperty = useMemo(
    () => properties.find((property) => property.id === selectedPropertyId) ?? properties[0],
    [properties, selectedPropertyId],
  )

  useEffect(() => {
    if (!selectedPropertyId) return
    const enrichOwnerDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/boardings/public/${selectedPropertyId}`)
        const data = await response.json()
        if (!response.ok || data.status !== 'success') return
        const normalized = normalizeProperty(data.boarding)
        setProperties((prev) =>
          prev.map((property) => (property.id === selectedPropertyId ? { ...property, ...normalized } : property)),
        )
      } catch {
        // Keep existing local values if detailed endpoint is unavailable.
      }
    }
    enrichOwnerDetails()
  }, [selectedPropertyId])

  useEffect(() => {
    const initBoardings = async () => {
      await loadPublicBoardings()
    }
    initBoardings()
  }, [loadPublicBoardings])

  useEffect(() => {
    if (!currentUser || !authToken) return

    const loadRoleRequests = async () => {
      try {
        if (currentUser.role === 'owner') {
          const data = await apiRequest('/requests/ownerRequests', { method: 'GET' })
          const filtered = data.requests.filter((request) => {
            const boardingOwnerId =
              typeof request.boardingId?.ownerId === 'object'
                ? request.boardingId.ownerId._id
                : request.boardingId?.ownerId
            return String(boardingOwnerId || '') === String(currentUser.id)
          })
          setRequests(filtered)
        } else {
          const data = await apiRequest('/requests/studentRequests', { method: 'GET' })
          setRequests(data.requests)
        }
      } catch {
        toast.error('Could not load requests from backend.')
      }
    }

    loadRoleRequests()
  }, [currentUser, authToken, apiRequest])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!currentUser || !authToken || currentUser.role !== 'owner') {
        await Promise.resolve()
        if (!cancelled) setOwnerBoardingsList([])
        return
      }
      try {
        const data = await apiRequest('/boardings/ownerBoardings', { method: 'GET' })
        if (!cancelled) setOwnerBoardingsList(data.boardings.map(normalizeProperty))
      } catch {
        if (!cancelled) {
          setOwnerBoardingsList([])
          toast.error('Could not load your boarding listings.')
        }
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [currentUser, authToken, apiRequest])

  const ownerDirectory = useMemo(() => {
    const entries = properties
      .filter((property) => property.ownerId)
      .map((property) => [
        property.ownerId,
        {
          name: property.ownerName || 'Owner',
          phone: property.ownerPhone || 'Not available',
          email: 'Not available',
        },
      ])
    return Object.fromEntries(entries)
  }, [properties])

  const studentDirectory = useMemo(
    () => Object.fromEntries(students.map((student) => [student.id, student])),
    [],
  )

  const loginAs = (user) => {
    setCurrentUser(user)
    setAuthView('landing')
    toast.success(`Logged in as ${user.name}`)
  }

  const logout = () => {
    setCurrentUser(null)
    setAuthToken('')
    setOwnerBoardingsList([])
    setDashTab('browse')
    setStudentDetailModal(false)
    localStorage.removeItem('authToken')
    localStorage.removeItem(STORAGE_USER_KEY)
    setAuthView('landing')
    toast('You have logged out.')
  }

  const submitLogin = async () => {
    if (!loginForm.identifier || !loginForm.password) {
      toast.error('Please enter phone/name and password.')
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginForm.identifier.trim(),
          password: loginForm.password,
        }),
      })

      const data = await response.json()
      if (!response.ok || data.status !== 'success') {
        toast.error(data.message || 'Login failed.')
        return
      }

      if (data.user.role !== loginForm.role) {
        toast.error(`This account is registered as ${data.user.role}.`)
        return
      }

      const normalizedUser = {
        id: data.user._id,
        name: data.user.name,
        phone: data.user.phone,
        role: data.user.role,
      }
      setAuthToken(data.token)
      localStorage.setItem('authToken', data.token)
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(normalizedUser))
      loginAs(normalizedUser)
    } catch {
      toast.error('Cannot connect to backend. Is server running on port 5000?')
    }
  }

  const submitSignup = async () => {
    if (!signupForm.name || !signupForm.phone || !signupForm.password) {
      toast.error('Please fill name, phone, and password.')
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupForm.name.trim(),
          phone: signupForm.phone.trim(),
          password: signupForm.password,
          role: signupForm.role,
        }),
      })

      const data = await response.json()
      if (!response.ok || data.status !== 'success') {
        toast.error(data.message || 'Signup failed.')
        return
      }

      toast.success('Signup successful. Please login.')
      setLoginForm({ identifier: signupForm.phone.trim(), password: '', role: signupForm.role })
      setSignupForm({ name: '', phone: '', password: '', role: 'student' })
      setAuthView('login')
    } catch {
      toast.error('Cannot connect to backend. Is server running on port 5000?')
    }
  }

  const openCreateProperty = () => {
    setEditingPropertyId('')
    setPropertyForm({
      title: '',
      city: '',
      price: '',
      distanceFromUniversity: '1 km',
      roomCount: '1',
      studentsCapacity: '1',
      description: '',
      features: '',
      imageOne: '',
      imageTwo: '',
      imageThree: '',
    })
    setShowPropertyModal(true)
  }

  const openEditProperty = (property) => {
    setEditingPropertyId(property.id)
    const featureText =
      property.specialNote?.trim() ||
      (property.features?.length && !String(property.features[0] || '').startsWith('Distance:')
        ? property.features.join(', ')
        : '')
    setPropertyForm({
      title: property.title,
      city: property.city,
      price: String(property.price),
      distanceFromUniversity: property.distanceFromUniversity != null ? String(property.distanceFromUniversity) : '1 km',
      roomCount: property.roomCount != null ? String(property.roomCount) : '1',
      studentsCapacity: property.studentsCapacity != null ? String(property.studentsCapacity) : '1',
      description: property.description,
      features: featureText,
      imageOne: property.images[0] ?? '',
      imageTwo: property.images[1] ?? '',
      imageThree: property.images[2] ?? '',
    })
    setShowPropertyModal(true)
  }

  const handlePropertySave = async () => {
    if (!propertyForm.title?.trim() || !propertyForm.city?.trim() || !propertyForm.price) {
      toast.error('Please fill title, location, and price.')
      return
    }
    if (!propertyForm.description?.trim()) {
      toast.error('Description is required by the server.')
      return
    }

    const imageUrl =
      [propertyForm.imageOne, propertyForm.imageTwo, propertyForm.imageThree].find((u) => u?.trim()) || ''

    const nextProperty = {
      title: propertyForm.title.trim(),
      location: propertyForm.city.trim(),
      distanceFromUniversity: (propertyForm.distanceFromUniversity || '1 km').trim(),
      price: Number(propertyForm.price),
      roomCount: Math.max(1, parseInt(propertyForm.roomCount, 10) || 1),
      studentsCapacity: Math.max(1, parseInt(propertyForm.studentsCapacity, 10) || 1),
      description: propertyForm.description.trim(),
      specialNote: propertyForm.features?.trim() || '',
      ...(imageUrl ? { image: imageUrl.trim() } : {}),
    }

    try {
      if (editingPropertyId) {
        await apiRequest(`/boardings/updateBoarding/${editingPropertyId}`, {
          method: 'PUT',
          body: JSON.stringify(nextProperty),
        })
        toast.success('Property updated successfully.')
      } else {
        await apiRequest('/boardings/createBoarding', {
          method: 'POST',
          body: JSON.stringify(nextProperty),
        })
        toast.success('Property created successfully.')
      }
      await loadPublicBoardings()
      if (currentUser?.role === 'owner') await refreshOwnerBoardings()
      setShowPropertyModal(false)
    } catch (error) {
      toast.error(error.message || 'Could not save property.')
    }
  }

  const deleteProperty = async (propertyId) => {
    const result = await Swal.fire({
      title: 'Delete property?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
    })
    if (!result.isConfirmed) return

    try {
      await apiRequest(`/boardings/deleteBoarding/${propertyId}`, { method: 'DELETE' })
      await loadPublicBoardings()
      if (currentUser?.role === 'owner') await refreshOwnerBoardings()
      setRequests((prev) =>
        prev.filter((request) => {
          const requestBoardingId =
            typeof request.boardingId === 'object' ? request.boardingId?._id : request.boardingId
          return String(requestBoardingId || '') !== String(propertyId)
        }),
      )
      toast.success('Property deleted.')
    } catch (error) {
      toast.error(error.message || 'Could not delete property.')
    }
  }

  const sendVisitRequest = async () => {
    if (!selectedProperty || currentUser.role !== 'student') return

    const result = await Swal.fire({
      title: 'Send visit request',
      input: 'text',
      inputLabel: 'Preferred visit time',
      inputPlaceholder: 'Tomorrow 5 PM',
      showCancelButton: true,
      confirmButtonText: 'Send request',
    })
    if (!result.isConfirmed) return

    try {
      const data = await apiRequest('/requests/create', {
        method: 'POST',
        body: JSON.stringify({
          boardingId: selectedProperty.id,
          studentName: currentUser.name,
          studentPhone: currentUser.phone || '0000000000',
        }),
      })
      setRequests((prev) => [data.request, ...prev])
      setStudentDetailModal(false)
      toast.success('Visit request sent to owner.')
    } catch (error) {
      toast.error(error.message || 'Could not send request.')
    }
  }

  const updateRequestStatus = async (requestId, status) => {
    try {
      if (status === 'accepted') {
        await apiRequest(`/requests/accept/${requestId}`, {
          method: 'PUT',
          body: JSON.stringify({ visitDate: 'Tomorrow', visitTime: '5:00 PM' }),
        })
      } else {
        await apiRequest(`/requests/reject/${requestId}`, {
          method: 'PUT',
          body: JSON.stringify({ rejectReason: 'Owner unavailable' }),
        })
      }
      setRequests((prev) =>
        prev.map((request) => (request._id === requestId ? { ...request, status } : request)),
      )
      toast.success(`Request marked as ${status}.`)
    } catch (error) {
      toast.error(error.message || 'Could not update request.')
    }
  }

  const ownerProperties = ownerBoardingsList
  const ownerRequests = requests
  const studentRequests = requests

  const filteredBrowseList = useMemo(() => {
    const q = browseSearch.trim().toLowerCase()
    if (!q) return properties
    return properties.filter(
      (p) =>
        (p.title && p.title.toLowerCase().includes(q)) ||
        String(p.city || '').toLowerCase().includes(q),
    )
  }, [properties, browseSearch])

  const landingFeatured = useMemo(() => {
    let list = properties.filter((p) => Number(p.price) <= landingMaxPrice)
    list = list.filter((p) => parseBoardingDistanceKm(p.distanceFromUniversity) <= landingMaxDistanceKm)
    if (landingLocationQuery.trim()) {
      const tokens = landingLocationQuery.toLowerCase().split(/\s+/).filter(Boolean)
      list = list.filter((p) => {
        const blob = `${p.title} ${p.city} ${p.description}`.toLowerCase()
        return tokens.every((t) => blob.includes(t))
      })
    }
    if (landingChips.size > 0) {
      list = list.filter((p) => {
        const blob = `${p.title} ${p.description} ${p.specialNote || ''}`.toLowerCase()
        return [...landingChips].some((chip) => {
          if (chip === 'boys') return /\bboys?\b|male|gents|mens\b/.test(blob)
          if (chip === 'girls') return /\bgirls?\b|female|ladies|womens?\b/.test(blob)
          if (chip === 'full') return /full\s*house|whole\s*house|\bentire\b/.test(blob)
          if (chip === 'single') return /single\s*room|private\s*room/.test(blob)
          return false
        })
      })
    }
    return list
  }, [properties, landingMaxPrice, landingMaxDistanceKm, landingLocationQuery, landingChips])

  const landingSix = useMemo(() => {
    const picked = landingFeatured.length > 0 ? landingFeatured : properties
    return picked.slice(0, 6)
  }, [landingFeatured, properties])

  const toggleLandingChip = useCallback((id) => {
    setLandingChips((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const landingChipDefs = [
    { id: 'boys', label: 'Boys Bodima' },
    { id: 'girls', label: 'Girls Bodima' },
    { id: 'full', label: 'Full House' },
    { id: 'single', label: 'Single room' },
  ]

  const logoBlock = (
    <div className="ub-brand-lockup">
      <div className="ub-logo-square" aria-hidden>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 4L4 10v9h6v-5h4v5h6v-9l-8-6z"
            stroke="white"
            strokeWidth="1.75"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path d="M9 8l6-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <div>
        <span className="ub-brand-title">UniBodima</span>
        <div className="ub-brand-tagline">STUDENT ACCOMMODATION</div>
      </div>
    </div>
  )

  const formatLkr = (n) => {
    const num = Number(n)
    if (!Number.isFinite(num)) return 'LKR —'
    return `LKR ${num.toLocaleString('en-LK')}`
  }

  return (
    <>
      <Toaster position="top-right" />
      {currentUser ? (
        <header className="ub-app-header border-bottom mb-4">
          <Container fluid="xxl" className="ub-header-inner py-3">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              {logoBlock}
              <nav className="ub-main-nav">
                {(currentUser.role === 'student' ? (
                  <>
                    <button
                      type="button"
                      className={`ub-nav-pill ${dashTab === 'browse' ? 'active' : ''}`}
                      onClick={() => setDashTab('browse')}
                    >
                      Home
                    </button>
                    <button
                      type="button"
                      className={`ub-nav-pill ${dashTab === 'requests' ? 'active' : ''}`}
                      onClick={() => setDashTab('requests')}
                    >
                      Request
                    </button>
                    <button
                      type="button"
                      className={`ub-nav-pill ${dashTab === 'browse' ? 'active' : ''}`}
                      onClick={() => setDashTab('browse')}
                    >
                      Properties
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className={`ub-nav-pill ${dashTab === 'browse' ? 'active' : ''}`}
                      onClick={() => setDashTab('browse')}
                    >
                      Home
                    </button>
                    <button
                      type="button"
                      className={`ub-nav-pill ${dashTab === 'browse' ? 'active' : ''}`}
                      onClick={() => setDashTab('browse')}
                    >
                      Properties
                    </button>
                    <button
                      type="button"
                      className={`ub-nav-pill ${dashTab === 'requests' ? 'active' : ''}`}
                      onClick={() => setDashTab('requests')}
                    >
                      Request
                    </button>
                  </>
                ))}
              </nav>
              <div className="ub-header-actions d-flex align-items-center gap-3">
                <button type="button" className="ub-icon-btn ub-bell-btn position-relative border-0 bg-transparent rounded-circle" aria-label="Notifications">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 01-3.46 0" />
                  </svg>
                  <span className="ub-bell-badge rounded-pill">
                    {(currentUser.role === 'student' ? studentRequests : ownerRequests).filter((r) => r.status === 'pending').length}
                  </span>
                </button>
                <Dropdown align="end">
                  <Dropdown.Toggle variant="light" className="ub-user-toggle d-flex align-items-center gap-2 border">
                    <span className="ub-user-avatar rounded-circle d-flex align-items-center justify-content-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </span>
                    <span className="d-none d-sm-inline text-capitalize">{currentUser.name}</span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.ItemText className="text-muted small text-capitalize">
                      Signed in as {currentUser.role}
                    </Dropdown.ItemText>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
          </Container>
        </header>
      ) : (
        <header className="ub-public-header border-bottom mb-4">
          <Container className="py-3 d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div className="d-flex align-items-center gap-4 flex-wrap">
              {logoBlock}
              {(authView === 'login' || authView === 'signup') && (
                <button
                  type="button"
                  className="ub-public-home border-0 bg-transparent text-muted fw-medium"
                  onClick={() => setAuthView('landing')}
                >
                  ← Home
                </button>
              )}
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-dark" size="sm" onClick={() => setAuthView('login')}>Login</Button>
              <Button className="ub-btn-orange" size="sm" onClick={() => setAuthView('signup')}>Signup</Button>
            </div>
          </Container>
        </header>
      )}

      <Container fluid={currentUser ? 'xxl' : false} className={`pb-5 ${currentUser ? 'ub-dashboard-wrap' : ''}`}>
        {!currentUser && authView === 'landing' ? (
          <>
            <section className="ub-landing-hero text-center text-white position-relative overflow-hidden rounded-3 mb-5">
              <div className="ub-landing-hero-bg" style={{ backgroundImage: `url(${LANDING_HERO_BG})` }} aria-hidden />
              <div className="ub-landing-hero-overlay" />
              <Container className="position-relative py-5 pb-md-5 ub-landing-hero-content">
                <h1 className="ub-hero-headline display-4 fw-bold mb-3">Find Your Ideal Bodima</h1>
                <p className="ub-hero-sub lead mx-auto mb-4 mb-md-5 col-lg-9">
                  Perfectly specialized for Vavuniya University students. Discover affordable and comfortable stays near the campus.
                </p>
                <div className="ub-hero-search-card bg-white text-dark rounded-4 shadow-lg p-4 p-md-4 mx-auto text-start">
                  <Row className="g-3 align-items-end">
                    <Col md={12} lg={4}>
                      <Form.Label className="ub-hero-field-label text-uppercase small fw-semibold text-muted mb-1">Location</Form.Label>
                      <Form.Control
                        className="rounded-3"
                        value={landingLocationQuery}
                        onChange={(e) => setLandingLocationQuery(e.target.value)}
                        placeholder="e.g. Vavuniya, near campus..."
                      />
                    </Col>
                    <Col md={6} lg={3}>
                      <Form.Label className="ub-hero-field-label text-uppercase small fw-semibold text-muted mb-1">
                        Distance ({landingMaxDistanceKm} km)
                      </Form.Label>
                      <Form.Range
                        min={1}
                        max={30}
                        value={landingMaxDistanceKm}
                        onChange={(e) => setLandingMaxDistanceKm(Number(e.target.value))}
                        className="ub-range-orange"
                      />
                    </Col>
                    <Col md={6} lg={3}>
                      <Form.Label className="ub-hero-field-label text-uppercase small fw-semibold text-muted mb-1">
                        Max price (LKR {landingMaxPrice.toLocaleString('en-LK')})
                      </Form.Label>
                      <Form.Range
                        min={3000}
                        max={100000}
                        step={1000}
                        value={landingMaxPrice}
                        onChange={(e) => setLandingMaxPrice(Number(e.target.value))}
                        className="ub-range-orange"
                      />
                    </Col>
                    <Col md={12} lg={2} className="d-grid">
                      <Button
                        className="ub-btn-orange rounded-pill py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                        onClick={() => document.getElementById('featured-boardings')?.scrollIntoView({ behavior: 'smooth' })}
                      >
                        Search
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                          <circle cx="11" cy="11" r="7" />
                          <path d="M20 20l-4-4" />
                        </svg>
                      </Button>
                    </Col>
                  </Row>
                  <div className="d-flex flex-wrap gap-2 justify-content-center justify-content-md-start mt-4 pt-2">
                    {landingChipDefs.map((chip) => (
                      <button
                        key={chip.id}
                        type="button"
                        className={`ub-filter-chip ${landingChips.has(chip.id) ? 'active' : ''}`}
                        onClick={() => toggleLandingChip(chip.id)}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              </Container>
            </section>

            <section id="featured-boardings" className="py-2 pb-5">
              <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
                <div>
                  <h2 className="ub-section-title mb-1">Featured boardings</h2>
                  <p className="text-secondary mb-0 small">Six public listings — sign in to request a visit or explore all after login.</p>
                </div>
                <Button variant="outline-dark" size="sm" className="rounded-pill" onClick={() => setAuthView('login')}>
                  Sign in to see more
                </Button>
              </div>
              <Row className="g-4 row-cols-1 row-cols-md-2 row-cols-xl-3">
                {landingSix.length === 0 ? (
                  <Col xs={12}>
                    <Card className="border-0 shadow-sm py-5 text-center text-muted">No listings match your filters. Try widening distance or price.</Card>
                  </Col>
                ) : (
                  landingSix.map((property) => (
                    <Col key={property.id}>
                      <Card className="ub-prop-card border-0 shadow-sm overflow-hidden h-100">
                        <div className="ub-prop-media">
                          <span className="ub-for-rent-tag">For Rent</span>
                          <img src={property.images[0] || DEFAULT_LISTING_IMG} alt="" className="ub-prop-img" />
                        </div>
                        <Card.Body className="d-flex flex-column">
                          <Card.Title className="ub-prop-card-title">{property.title}</Card.Title>
                          <div className="ub-prop-loc small text-muted d-flex align-items-center gap-1 mb-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                            </svg>
                            {property.city}
                          </div>
                          <div className="small text-muted mb-3">
                            {property.roomCount ?? '—'} Rooms · {property.studentsCapacity ?? '—'} Capacity
                          </div>
                          <div className="ub-prop-actions mt-auto d-flex justify-content-between align-items-center pt-2">
                            <span className="ub-price-accent">{formatLkr(property.price)}</span>
                            <button
                              type="button"
                              className="ub-icon-circle"
                              aria-label="View details"
                              onClick={() => {
                                setSelectedPropertyId(property.id)
                                setStudentDetailModal(true)
                              }}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))
                )}
              </Row>
            </section>
          </>
        ) : null}

        {!currentUser && authView === 'login' ? (
          <Row className="justify-content-center">
            <Col md={8} lg={5}>
              <Card className="shadow-sm border-0 auth-card">
                <Card.Body className="p-4">
                  <h3 className="mb-3">Login</h3>
                  <p className="text-secondary">Access your student or owner dashboard.</p>
                  <Form className="d-grid gap-3">
                    <div>
                      <Form.Label htmlFor="login-role" className="form-label-subtle">Account type</Form.Label>
                      <Form.Select id="login-role" value={loginForm.role} onChange={(event) => setLoginForm((prev) => ({ ...prev, role: event.target.value }))}>
                        <option value="student">Student</option>
                        <option value="owner">Property Owner</option>
                      </Form.Select>
                    </div>
                    <div>
                      <Form.Label htmlFor="login-identifier" className="form-label-subtle">Phone number or name</Form.Label>
                      <Form.Control id="login-identifier" placeholder="e.g. 9876543210 or your full name" value={loginForm.identifier} onChange={(event) => setLoginForm((prev) => ({ ...prev, identifier: event.target.value }))} />
                    </div>
                    <div>
                      <Form.Label htmlFor="login-password" className="form-label-subtle">Password</Form.Label>
                      <InputGroup>
                        <Form.Control id="login-password" type="password" placeholder="Enter your password" value={loginForm.password} onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))} />
                      </InputGroup>
                    </div>
                    <Button onClick={submitLogin}>Login</Button>
                    <Button variant="link" onClick={() => setAuthView('signup')}>New here? Create an account</Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        ) : null}

        {!currentUser && authView === 'signup' ? (
          <Row className="justify-content-center">
            <Col md={10} lg={6}>
              <Card className="shadow-sm border-0 auth-card">
                <Card.Body className="p-4">
                  <h3 className="mb-3">Create Account</h3>
                  <p className="text-secondary">Sign up as a student or property owner.</p>
                  <Form className="d-grid gap-3">
                    <div>
                      <Form.Label htmlFor="signup-role" className="form-label-subtle">Account type</Form.Label>
                      <Form.Select id="signup-role" value={signupForm.role} onChange={(event) => setSignupForm((prev) => ({ ...prev, role: event.target.value }))}>
                        <option value="student">Student</option>
                        <option value="owner">Property Owner</option>
                      </Form.Select>
                    </div>
                    <div>
                      <Form.Label htmlFor="signup-name" className="form-label-subtle">Full name</Form.Label>
                      <Form.Control id="signup-name" placeholder="As it should appear on your profile" value={signupForm.name} onChange={(event) => setSignupForm((prev) => ({ ...prev, name: event.target.value }))} />
                    </div>
                    <div>
                      <Form.Label htmlFor="signup-phone" className="form-label-subtle">Phone</Form.Label>
                      <Form.Control id="signup-phone" placeholder="10-digit mobile number" value={signupForm.phone} onChange={(event) => setSignupForm((prev) => ({ ...prev, phone: event.target.value }))} />
                    </div>
                    <div>
                      <Form.Label htmlFor="signup-password" className="form-label-subtle">Password</Form.Label>
                      <Form.Control id="signup-password" type="password" placeholder="At least 6 characters" value={signupForm.password} onChange={(event) => setSignupForm((prev) => ({ ...prev, password: event.target.value }))} />
                    </div>
                    <Button onClick={submitSignup}>Create Account</Button>
                    <Button variant="link" onClick={() => setAuthView('login')}>Already registered? Login</Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        ) : null}

        {currentUser && currentUser.role === 'student' && dashTab === 'browse' ? (
          <>
            <div className="d-flex flex-wrap justify-content-between align-items-start gap-4 mb-4">
              <div>
                <h1 className="ub-page-title mb-2">Find accommodation</h1>
                <p className="text-secondary mb-0">Browse verified boarding near your campus</p>
              </div>
              <div className="d-flex flex-wrap gap-2 flex-grow-1 ub-toolbar-search">
                <Form.Control
                  className="ub-search-field"
                  placeholder="Search by name or area..."
                  value={browseSearch}
                  onChange={(e) => setBrowseSearch(e.target.value)}
                />
                <Button variant="outline-secondary" className="px-4">Filter</Button>
              </div>
            </div>
            <Row className="g-4 pb-5 row-cols-1 row-cols-md-2 row-cols-xl-3">
              {filteredBrowseList.length === 0 ? (
                <Col xs={12}>
                  <Card className="border-0 shadow-sm py-5 text-center text-muted">No listings match your search.</Card>
                </Col>
              ) : (
                filteredBrowseList.map((property) => (
                  <Col key={property.id}>
                    <Card className="ub-prop-card border-0 shadow-sm overflow-hidden h-100">
                      <div className="ub-prop-media">
                        <span className="ub-for-rent-tag">For Rent</span>
                        <img src={property.images[0] || DEFAULT_LISTING_IMG} alt="" className="ub-prop-img" />
                      </div>
                      <Card.Body className="d-flex flex-column">
                        <Card.Title className="ub-prop-card-title">{property.title}</Card.Title>
                        <div className="ub-prop-loc small text-muted d-flex align-items-center gap-1 mb-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                          </svg>
                          {property.city}
                        </div>
                        <div className="small text-muted mb-3">
                          {property.roomCount ?? '—'} Rooms · {property.studentsCapacity ?? '—'} Capacity
                        </div>
                        <div className="ub-prop-actions mt-auto d-flex justify-content-between align-items-center pt-2">
                          <span className="ub-price-accent">{formatLkr(property.price)}</span>
                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="ub-icon-circle"
                              aria-label="View details"
                              onClick={() => {
                                setSelectedPropertyId(property.id)
                                setStudentDetailModal(true)
                              }}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              )}
            </Row>
          </>
        ) : null}

        {currentUser && currentUser.role === 'student' && dashTab === 'requests' ? (
          <>
            <div className="mb-4">
              <h1 className="ub-page-title mb-2">My requests</h1>
              <p className="text-secondary mb-0">Track visit requests you have sent</p>
            </div>
            <Row className="g-3">
              {studentRequests.length === 0 ? (
                <Col xs={12}>
                  <Card className="border-0 shadow-sm py-5 text-center text-muted">No requests yet. Browse properties under Home.</Card>
                </Col>
              ) : (
                studentRequests.map((request) => (
                  <Col md={6} xl={4} key={request._id}>
                    <Card className="border-0 shadow-sm ub-request-summary h-100">
                      <Card.Body>
                        <div className="fw-semibold">{request.boardingId?.title}</div>
                        <div className="small text-secondary mt-1">
                          {request.status === 'accepted'
                            ? `Visit on ${request.visitDate} at ${request.visitTime}`
                            : request.rejectReason || 'Visit request pending.'}
                        </div>
                        <Badge bg={request.status === 'accepted' ? 'success' : request.status === 'rejected' ? 'danger' : 'warning'} className="mt-2">
                          {request.status}
                        </Badge>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              )}
            </Row>
          </>
        ) : null}

        {currentUser && currentUser.role === 'owner' && dashTab === 'browse' ? (
          <>
            <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
              <div>
                <h1 className="ub-page-title mb-2">My properties</h1>
                <p className="text-secondary mb-0">Manage and update your property listings</p>
              </div>
              <Button className="ub-btn-orange rounded-pill px-4" onClick={openCreateProperty}>
                + Add property
              </Button>
            </div>
            <Row className="g-4 pb-5 row-cols-1 row-cols-md-2 row-cols-xl-3">
              {ownerProperties.length === 0 ? (
                <Col xs={12}>
                  <Card className="border-0 shadow-sm py-5 text-center text-muted">No properties yet. Add your first boarding.</Card>
                </Col>
              ) : (
                ownerProperties.map((property) => (
                  <Col key={property.id}>
                    <Card className="ub-prop-card border-0 shadow-sm overflow-hidden h-100">
                      <div className="ub-prop-media">
                        <span className="ub-for-rent-tag">For Rent</span>
                        <img src={property.images[0] || DEFAULT_LISTING_IMG} alt="" className="ub-prop-img" />
                      </div>
                      <Card.Body className="d-flex flex-column">
                        <Card.Title className="ub-prop-card-title">{property.title}</Card.Title>
                        <div className="ub-prop-loc small text-muted d-flex align-items-center gap-1 mb-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                          </svg>
                          {property.city}
                        </div>
                        <div className="small text-muted mb-3">
                          {property.roomCount ?? '—'} Rooms · {property.studentsCapacity ?? '—'} Capacity
                        </div>
                        <div className="ub-prop-actions mt-auto d-flex justify-content-between align-items-center pt-2">
                          <span className="ub-price-accent">{formatLkr(property.price)}</span>
                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="ub-icon-circle"
                              aria-label="Preview"
                              onClick={() => {
                                setSelectedPropertyId(property.id)
                                setStudentDetailModal(true)
                              }}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </button>
                            <button type="button" className="ub-icon-circle" aria-label="Edit" onClick={() => openEditProperty(property)}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 3a2.828 2.828 0 114 4L7 21H3v-4L17 3z" />
                              </svg>
                            </button>
                            <button type="button" className="ub-icon-circle ub-icon-danger" aria-label="Delete" onClick={() => deleteProperty(property.id)}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              )}
            </Row>
          </>
        ) : null}

        {currentUser && currentUser.role === 'owner' && dashTab === 'requests' ? (
          <>
            <div className="mb-4">
              <h1 className="ub-page-title mb-2">Visit requests</h1>
              <p className="text-secondary mb-0">Approve or reschedule student visits</p>
            </div>
            <Row className="g-3">
              {ownerRequests.length === 0 ? (
                <Col xs={12}>
                  <Card className="border-0 shadow-sm py-5 text-center text-muted">No requests yet.</Card>
                </Col>
              ) : (
                ownerRequests.map((request) => (
                  <Col md={6} xl={4} key={request._id}>
                    <Card className="border-0 shadow-sm ub-request-summary h-100">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start gap-2">
                          <div>
                            <div className="fw-semibold">{request.studentName || studentDirectory[request.studentId]?.name}</div>
                            <small className="text-secondary">{request.studentPhone}</small>
                            <div className="small text-muted mt-1">{request.boardingId?.title}</div>
                          </div>
                          <Badge bg={request.status === 'accepted' ? 'success' : request.status === 'rejected' ? 'danger' : 'warning'}>
                            {request.status}
                          </Badge>
                        </div>
                        {request.status === 'pending' ? (
                          <div className="mt-3 d-flex gap-2">
                            <Button size="sm" className="ub-btn-orange" onClick={() => updateRequestStatus(request._id, 'accepted')}>Approve</Button>
                            <Button size="sm" variant="outline-danger" onClick={() => updateRequestStatus(request._id, 'rejected')}>Reject</Button>
                          </div>
                        ) : null}
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              )}
            </Row>
          </>
        ) : null}
      </Container>

      {!currentUser ? (
        <footer className="ub-site-footer border-top bg-light mt-auto">
          <Container className="py-5">
            <Row className="g-4">
              <Col md={5} lg={4}>
                <div className="ub-brand-lockup mb-3">
                  <div className="ub-logo-square" aria-hidden>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 4L4 10v9h6v-5h4v5h6v-9l-8-6z"
                        stroke="white"
                        strokeWidth="1.75"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                      <path d="M9 8l6-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <span className="ub-brand-title">UniBodima</span>
                    <div className="ub-brand-tagline">STUDENT ACCOMMODATION</div>
                  </div>
                </div>
                <p className="text-muted small mb-0">Student housing near Vavuniya University and beyond. Verified owners and simple visit requests.</p>
              </Col>
              <Col md={3} lg={2}>
                <h6 className="fw-semibold mb-3">Explore</h6>
                <ul className="list-unstyled small text-muted mb-0">
                  <li className="mb-2">
                    <button type="button" className="btn btn-link p-0 text-decoration-none text-muted" onClick={() => setAuthView('landing')}>
                      Home
                    </button>
                  </li>
                  <li className="mb-2">
                    <button type="button" className="btn btn-link p-0 text-decoration-none text-muted" onClick={() => setAuthView('login')}>
                      Login
                    </button>
                  </li>
                  <li className="mb-2">
                    <button type="button" className="btn btn-link p-0 text-decoration-none text-muted" onClick={() => setAuthView('signup')}>
                      Sign up
                    </button>
                  </li>
                </ul>
              </Col>
              <Col md={4} lg={3}>
                <h6 className="fw-semibold mb-3">For owners</h6>
                <p className="text-muted small mb-0">
                  List boarding houses, manage visit requests, and connect with students—all in one dashboard after you register.
                </p>
              </Col>
            </Row>
            <div className="text-center text-muted small pt-4 mt-4 border-top">© {new Date().getFullYear()} UniBodima. All rights reserved.</div>
          </Container>
        </footer>
      ) : null}

      <Modal show={studentDetailModal} onHide={() => setStudentDetailModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="ub-modal-title">{selectedProperty?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProperty ? (
            <>
              <Carousel className="ub-detail-carousel rounded-3 overflow-hidden mb-3">
                {(selectedProperty.images.length > 0 ? selectedProperty.images : [DEFAULT_LISTING_IMG]).map((image, idx) => (
                  <Carousel.Item key={`${selectedProperty.id}-img-${idx}`}>
                    <img src={image} alt="" style={{ width: '100%', maxHeight: 320, objectFit: 'cover' }} />
                  </Carousel.Item>
                ))}
              </Carousel>
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <span className="ub-price-accent mb-0">{formatLkr(selectedProperty.price)}</span>
                <span className="text-muted small">/ month</span>
                <Badge bg="light" text="dark" className="ms-auto border">{selectedProperty.city}</Badge>
              </div>
              <p className="text-secondary">{selectedProperty.description}</p>
              <ListGroup horizontal className="feature-list mb-3 flex-wrap">
                {selectedProperty.features.map((feature) => (
                  <ListGroup.Item key={feature} action active={feature === activeFeature} onClick={() => setActiveFeature(feature)}>
                    {feature}
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <Card className="p-3 owner-contact border-0 bg-light mb-3">
                <div className="small text-uppercase text-muted fw-semibold mb-1">Owner contact</div>
                <div className="fw-medium">{ownerDirectory[selectedProperty.ownerId]?.name}</div>
                <div className="small">{ownerDirectory[selectedProperty.ownerId]?.phone}</div>
              </Card>
              {!currentUser ? (
                <div className="d-grid gap-2">
                  <Button
                    className="ub-btn-orange"
                    onClick={() => {
                      setStudentDetailModal(false)
                      setAuthView('login')
                    }}
                  >
                    Login to request a visit
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => {
                      setStudentDetailModal(false)
                      setAuthView('signup')
                    }}
                  >
                    Create account
                  </Button>
                </div>
              ) : null}
              {currentUser?.role === 'student' ? (
                <Button className="ub-btn-orange w-100" onClick={sendVisitRequest}>Send visit request</Button>
              ) : null}
              {currentUser?.role === 'owner' ? (
                <p className="text-muted small mb-0">Listing preview · students see this when they browse.</p>
              ) : null}
            </>
          ) : null}
        </Modal.Body>
      </Modal>

      <Modal show={showPropertyModal} onHide={() => setShowPropertyModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingPropertyId ? 'Edit Property' : 'Create Property'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="d-grid gap-3">
            <div>
              <Form.Label htmlFor="boarding-title" className="form-label-subtle">Title</Form.Label>
              <Form.Control id="boarding-title" placeholder="Short name for your boarding" value={propertyForm.title} onChange={(event) => setPropertyForm((prev) => ({ ...prev, title: event.target.value }))} />
            </div>
            <div>
              <Form.Label htmlFor="boarding-location" className="form-label-subtle">Location / city</Form.Label>
              <Form.Control id="boarding-location" placeholder="Area or city name" value={propertyForm.city} onChange={(event) => setPropertyForm((prev) => ({ ...prev, city: event.target.value }))} />
            </div>
            <div>
              <Form.Label htmlFor="boarding-distance" className="form-label-subtle">Distance from university</Form.Label>
              <Form.Control id="boarding-distance" placeholder="e.g. 1.5 km" value={propertyForm.distanceFromUniversity} onChange={(event) => setPropertyForm((prev) => ({ ...prev, distanceFromUniversity: event.target.value }))} />
            </div>
            <Row className="g-2">
              <Col sm={6}>
                <Form.Label htmlFor="boarding-rooms" className="form-label-subtle">Room count</Form.Label>
                <Form.Control id="boarding-rooms" placeholder="e.g. 3" type="number" min={1} value={propertyForm.roomCount} onChange={(event) => setPropertyForm((prev) => ({ ...prev, roomCount: event.target.value }))} />
              </Col>
              <Col sm={6}>
                <Form.Label htmlFor="boarding-capacity" className="form-label-subtle">Student capacity</Form.Label>
                <Form.Control id="boarding-capacity" placeholder="e.g. 6" type="number" min={1} value={propertyForm.studentsCapacity} onChange={(event) => setPropertyForm((prev) => ({ ...prev, studentsCapacity: event.target.value }))} />
              </Col>
            </Row>
            <div>
              <Form.Label htmlFor="boarding-price" className="form-label-subtle">Monthly rent</Form.Label>
              <Form.Control id="boarding-price" placeholder="Amount in Rs." type="number" value={propertyForm.price} onChange={(event) => setPropertyForm((prev) => ({ ...prev, price: event.target.value }))} />
            </div>
            <div>
              <Form.Label htmlFor="boarding-description" className="form-label-subtle">Description</Form.Label>
              <Form.Control id="boarding-description" as="textarea" rows={3} placeholder="Required — describe the space and what is included" value={propertyForm.description} onChange={(event) => setPropertyForm((prev) => ({ ...prev, description: event.target.value }))} />
            </div>
            <div>
              <Form.Label htmlFor="boarding-features" className="form-label-subtle">Special note / features</Form.Label>
              <Form.Control id="boarding-features" placeholder="Optional — comma separated (Wi‑Fi, meals, …)" value={propertyForm.features} onChange={(event) => setPropertyForm((prev) => ({ ...prev, features: event.target.value }))} />
            </div>
            <div>
              <Form.Label htmlFor="boarding-image-1" className="form-label-subtle">Main image URL</Form.Label>
              <Form.Control id="boarding-image-1" placeholder="Optional — uses server default if empty" value={propertyForm.imageOne} onChange={(event) => setPropertyForm((prev) => ({ ...prev, imageOne: event.target.value }))} />
            </div>
            <div>
              <Form.Label htmlFor="boarding-image-2" className="form-label-subtle">Additional image URL</Form.Label>
              <Form.Control id="boarding-image-2" placeholder="Optional" value={propertyForm.imageTwo} onChange={(event) => setPropertyForm((prev) => ({ ...prev, imageTwo: event.target.value }))} />
            </div>
            <div>
              <Form.Label htmlFor="boarding-image-3" className="form-label-subtle">Additional image URL</Form.Label>
              <Form.Control id="boarding-image-3" placeholder="Optional" value={propertyForm.imageThree} onChange={(event) => setPropertyForm((prev) => ({ ...prev, imageThree: event.target.value }))} />
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPropertyModal(false)}>Cancel</Button>
          <Button onClick={handlePropertySave}>Save</Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default App
