import { useMemo, useState } from 'react'
import {
  Badge,
  Button,
  Card,
  Carousel,
  Col,
  Container,
  Form,
  InputGroup,
  ListGroup,
  Modal,
  Navbar,
  Row,
  Table,
} from 'react-bootstrap'
import toast, { Toaster } from 'react-hot-toast'
import Swal from 'sweetalert2'

const owners = [
  { id: 'owner-1', name: 'Arjun Mehta', email: 'arjun.owner@unibodima.com', phone: '+91 90000 11111' },
  { id: 'owner-2', name: 'Nidhi Sharma', email: 'nidhi.owner@unibodima.com', phone: '+91 90000 22222' },
]

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

function App() {
  const [authView, setAuthView] = useState('landing')
  const [currentUser, setCurrentUser] = useState(null)
  const [, setAuthToken] = useState(localStorage.getItem('authToken') || '')
  const [properties, setProperties] = useState(initialProperties)
  const [requests, setRequests] = useState([])
  const [selectedPropertyId, setSelectedPropertyId] = useState(initialProperties[0].id)
  const [activeFeature, setActiveFeature] = useState('')
  const [showPropertyModal, setShowPropertyModal] = useState(false)
  const [editingPropertyId, setEditingPropertyId] = useState('')
  const [propertyForm, setPropertyForm] = useState({
    title: '',
    city: '',
    price: '',
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

  const selectedProperty = useMemo(
    () => properties.find((property) => property.id === selectedPropertyId) ?? properties[0],
    [properties, selectedPropertyId],
  )

  const ownerDirectory = useMemo(
    () => Object.fromEntries(owners.map((owner) => [owner.id, owner])),
    [],
  )

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
    localStorage.removeItem('authToken')
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
    setPropertyForm({
      title: property.title,
      city: property.city,
      price: String(property.price),
      description: property.description,
      features: property.features.join(', '),
      imageOne: property.images[0] ?? '',
      imageTwo: property.images[1] ?? '',
      imageThree: property.images[2] ?? '',
    })
    setShowPropertyModal(true)
  }

  const handlePropertySave = () => {
    if (!propertyForm.title || !propertyForm.city || !propertyForm.price) {
      toast.error('Please fill title, city, and price.')
      return
    }

    const nextProperty = {
      id: editingPropertyId || `prop-${Date.now()}`,
      ownerId: currentUser.id,
      title: propertyForm.title.trim(),
      city: propertyForm.city.trim(),
      price: Number(propertyForm.price),
      description: propertyForm.description.trim(),
      features: propertyForm.features.split(',').map((item) => item.trim()).filter(Boolean),
      images: [propertyForm.imageOne, propertyForm.imageTwo, propertyForm.imageThree].filter(Boolean),
    }

    if (nextProperty.images.length === 0) {
      toast.error('Add at least one image URL.')
      return
    }

    if (editingPropertyId) {
      setProperties((prev) => prev.map((property) => (property.id === editingPropertyId ? nextProperty : property)))
      toast.success('Property updated successfully.')
    } else {
      setProperties((prev) => [nextProperty, ...prev])
      toast.success('Property created successfully.')
    }

    setSelectedPropertyId(nextProperty.id)
    setShowPropertyModal(false)
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

    setProperties((prev) => prev.filter((property) => property.id !== propertyId))
    setRequests((prev) => prev.filter((request) => request.propertyId !== propertyId))
    toast.success('Property deleted.')
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

    const nextRequest = {
      id: `req-${Date.now()}`,
      propertyId: selectedProperty.id,
      studentId: currentUser.id,
      message: result.value || 'Student requested a visit.',
      status: 'pending',
    }
    setRequests((prev) => [nextRequest, ...prev])
    toast.success('Visit request sent to owner.')
  }

  const updateRequestStatus = (requestId, status) => {
    setRequests((prev) => prev.map((request) => (request.id === requestId ? { ...request, status } : request)))
    toast.success(`Request marked as ${status}.`)
  }

  const ownerProperties = properties.filter((property) => property.ownerId === currentUser?.id)
  const ownerRequests = requests.filter((request) => {
    const property = properties.find((item) => item.id === request.propertyId)
    return property?.ownerId === currentUser?.id
  })
  const studentRequests = requests.filter((request) => request.studentId === currentUser?.id)

  return (
    <>
      <Toaster position="top-right" />
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 py-3">
        <Container>
          <Navbar.Brand>UniBodima Housing</Navbar.Brand>
          <div className="d-flex align-items-center gap-2 text-light">
            {currentUser ? (
              <>
                <small>
                  {currentUser.name} ({currentUser.role})
                </small>
                <Button size="sm" variant="outline-light" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="outline-light" onClick={() => setAuthView('login')}>
                  Login
                </Button>
                <Button size="sm" variant="light" onClick={() => setAuthView('signup')}>
                  Signup
                </Button>
              </>
            )}
          </div>
        </Container>
      </Navbar>

      <Container className="pb-5">
        {!currentUser && authView === 'landing' ? (
          <Row className="g-4 align-items-stretch">
            <Col lg={7}>
              <Card className="shadow-sm border-0 landing-hero h-100">
                <Card.Body className="p-4 p-md-5">
                  <Badge bg="dark" className="mb-3">Modern Student Housing</Badge>
                  <h1 className="landing-title">Find your perfect student home with confidence.</h1>
                  <p className="text-secondary mb-4">
                    UniBodima connects students and verified owners with smart dashboards, property management, and instant visit request tracking.
                  </p>
                  <div className="d-flex gap-2 flex-wrap">
                    <Button size="lg" onClick={() => setAuthView('signup')}>Get Started</Button>
                    <Button size="lg" variant="outline-dark" onClick={() => setAuthView('login')}>
                      I Already Have an Account
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={5}>
              <Card className="shadow-sm border-0 h-100">
                <Card.Body className="p-4">
                  <h4 className="mb-3">Why UniBodima?</h4>
                  <ListGroup variant="flush">
                    <ListGroup.Item>Role-based dashboards for students and owners</ListGroup.Item>
                    <ListGroup.Item>Property CRUD operations for owners</ListGroup.Item>
                    <ListGroup.Item>Visit requests with status updates</ListGroup.Item>
                    <ListGroup.Item>Detailed listings with owner contact info</ListGroup.Item>
                    <ListGroup.Item>Mobile-first responsive experience</ListGroup.Item>
                  </ListGroup>
                  <hr />
                  <small className="text-secondary">Use your backend API to register, then login with phone or name.</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        ) : null}

        {!currentUser && authView === 'login' ? (
          <Row className="justify-content-center">
            <Col md={8} lg={5}>
              <Card className="shadow-sm border-0 auth-card">
                <Card.Body className="p-4">
                  <h3 className="mb-3">Login</h3>
                  <p className="text-secondary">Access your student or owner dashboard.</p>
                  <Form className="d-grid gap-3">
                    <Form.Select value={loginForm.role} onChange={(event) => setLoginForm((prev) => ({ ...prev, role: event.target.value }))}>
                      <option value="student">Student</option>
                      <option value="owner">Property Owner</option>
                    </Form.Select>
                    <Form.Control placeholder="Phone number or name" value={loginForm.identifier} onChange={(event) => setLoginForm((prev) => ({ ...prev, identifier: event.target.value }))} />
                    <InputGroup>
                      <Form.Control type="password" placeholder="Password" value={loginForm.password} onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))} />
                    </InputGroup>
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
                    <Form.Select value={signupForm.role} onChange={(event) => setSignupForm((prev) => ({ ...prev, role: event.target.value }))}>
                      <option value="student">Student</option>
                      <option value="owner">Property Owner</option>
                    </Form.Select>
                    <Form.Control placeholder="Full name" value={signupForm.name} onChange={(event) => setSignupForm((prev) => ({ ...prev, name: event.target.value }))} />
                    <Form.Control placeholder="Phone (10 digits)" value={signupForm.phone} onChange={(event) => setSignupForm((prev) => ({ ...prev, phone: event.target.value }))} />
                    <Form.Control type="password" placeholder="Password" value={signupForm.password} onChange={(event) => setSignupForm((prev) => ({ ...prev, password: event.target.value }))} />
                    <Button onClick={submitSignup}>Create Account</Button>
                    <Button variant="link" onClick={() => setAuthView('login')}>Already registered? Login</Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        ) : null}

        {currentUser ? (
          <Row className="g-4">
            <Col lg={8}>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                    <div>
                      <h3 className="mb-1">Detailed Property Views</h3>
                      <p className="text-secondary m-0">Explore photos, feature highlights, and direct owner contact details.</p>
                    </div>
                    <Form.Select className="property-select" value={selectedProperty?.id} onChange={(event) => { setSelectedPropertyId(event.target.value); setActiveFeature('') }}>
                      {properties.map((property) => (
                        <option value={property.id} key={property.id}>{property.title} - {property.city}</option>
                      ))}
                    </Form.Select>
                  </div>

                  {selectedProperty ? (
                    <>
                      <Carousel className="property-carousel mb-3">
                        {selectedProperty.images.map((image) => (
                          <Carousel.Item key={image}>
                            <img src={image} alt={selectedProperty.title} className="property-image" />
                          </Carousel.Item>
                        ))}
                      </Carousel>

                      <div className="d-flex justify-content-between flex-wrap gap-2 mb-2">
                        <h4 className="m-0">{selectedProperty.title}</h4>
                        <Badge bg="info">{selectedProperty.city}</Badge>
                      </div>
                      <p className="text-secondary">{selectedProperty.description}</p>
                      <p className="mb-3 fw-semibold">Rent: Rs. {selectedProperty.price}/month</p>

                      <h6>Interactive Feature List</h6>
                      <ListGroup horizontal className="feature-list mb-3">
                        {selectedProperty.features.map((feature) => (
                          <ListGroup.Item key={feature} action active={feature === activeFeature} onClick={() => setActiveFeature(feature)}>
                            {feature}
                          </ListGroup.Item>
                        ))}
                      </ListGroup>

                      <Card className="p-3 owner-contact">
                        <h6 className="mb-2">Owner Contact Information</h6>
                        <p className="m-0">{ownerDirectory[selectedProperty.ownerId]?.name} | {ownerDirectory[selectedProperty.ownerId]?.phone}</p>
                        <small className="text-secondary">{ownerDirectory[selectedProperty.ownerId]?.email}</small>
                      </Card>

                      {currentUser.role === 'student' ? (
                        <Button variant="primary" className="mt-3" onClick={sendVisitRequest}>Send Visit Request</Button>
                      ) : null}
                    </>
                  ) : null}
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              {currentUser.role === 'owner' ? (
                <Card className="shadow-sm border-0 h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h4 className="m-0">Owner Dashboard</h4>
                      <Button size="sm" onClick={openCreateProperty}>Add Property</Button>
                    </div>
                    <p className="text-secondary">Full property CRUD and visit request management.</p>

                    <h6>My Properties</h6>
                    <Table responsive size="sm">
                      <tbody>
                        {ownerProperties.map((property) => (
                          <tr key={property.id}>
                            <td>{property.title}</td>
                            <td className="text-end">
                              <Button size="sm" variant="outline-primary" className="me-1" onClick={() => openEditProperty(property)}>Edit</Button>
                              <Button size="sm" variant="outline-danger" onClick={() => deleteProperty(property.id)}>Delete</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>

                    <h6 className="mt-3">Interest Requests</h6>
                    {ownerRequests.length === 0 ? (
                      <p className="text-secondary mb-0">No requests yet.</p>
                    ) : (
                      ownerRequests.map((request) => (
                        <Card key={request.id} className="mb-2 request-card">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start gap-2">
                              <div>
                                <div className="fw-semibold">{studentDirectory[request.studentId]?.name}</div>
                                <small className="text-secondary">{request.message}</small>
                              </div>
                              <Badge bg={request.status === 'approved' ? 'success' : request.status === 'rejected' ? 'danger' : 'warning'}>
                                {request.status}
                              </Badge>
                            </div>
                            {request.status === 'pending' ? (
                              <div className="mt-2 d-flex gap-2">
                                <Button size="sm" variant="success" onClick={() => updateRequestStatus(request.id, 'approved')}>Approve</Button>
                                <Button size="sm" variant="danger" onClick={() => updateRequestStatus(request.id, 'rejected')}>Reject</Button>
                              </div>
                            ) : null}
                          </Card.Body>
                        </Card>
                      ))
                    )}
                  </Card.Body>
                </Card>
              ) : (
                <Card className="shadow-sm border-0 h-100">
                  <Card.Body>
                    <h4>Student Dashboard</h4>
                    <p className="text-secondary">Track your visit requests and status updates in real-time.</p>
                    {studentRequests.length === 0 ? (
                      <p className="text-secondary mb-0">No requests yet. Open a property and send one.</p>
                    ) : (
                      studentRequests.map((request) => (
                        <Card key={request.id} className="mb-2 request-card">
                          <Card.Body>
                            <div className="fw-semibold">{properties.find((property) => property.id === request.propertyId)?.title}</div>
                            <div className="small text-secondary">{request.message}</div>
                            <Badge bg={request.status === 'approved' ? 'success' : request.status === 'rejected' ? 'danger' : 'warning'} className="mt-2">
                              {request.status}
                            </Badge>
                          </Card.Body>
                        </Card>
                      ))
                    )}
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
        ) : null}
      </Container>

      <Modal show={showPropertyModal} onHide={() => setShowPropertyModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingPropertyId ? 'Edit Property' : 'Create Property'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="d-grid gap-2">
            <Form.Control placeholder="Property title" value={propertyForm.title} onChange={(event) => setPropertyForm((prev) => ({ ...prev, title: event.target.value }))} />
            <Form.Control placeholder="City" value={propertyForm.city} onChange={(event) => setPropertyForm((prev) => ({ ...prev, city: event.target.value }))} />
            <Form.Control placeholder="Monthly rent" type="number" value={propertyForm.price} onChange={(event) => setPropertyForm((prev) => ({ ...prev, price: event.target.value }))} />
            <Form.Control as="textarea" rows={3} placeholder="Description" value={propertyForm.description} onChange={(event) => setPropertyForm((prev) => ({ ...prev, description: event.target.value }))} />
            <Form.Control placeholder="Features (comma separated)" value={propertyForm.features} onChange={(event) => setPropertyForm((prev) => ({ ...prev, features: event.target.value }))} />
            <Form.Control placeholder="Image URL 1" value={propertyForm.imageOne} onChange={(event) => setPropertyForm((prev) => ({ ...prev, imageOne: event.target.value }))} />
            <Form.Control placeholder="Image URL 2" value={propertyForm.imageTwo} onChange={(event) => setPropertyForm((prev) => ({ ...prev, imageTwo: event.target.value }))} />
            <Form.Control placeholder="Image URL 3" value={propertyForm.imageThree} onChange={(event) => setPropertyForm((prev) => ({ ...prev, imageThree: event.target.value }))} />
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
