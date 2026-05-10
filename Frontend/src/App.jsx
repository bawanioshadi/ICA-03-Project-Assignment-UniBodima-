import { useState } from 'react'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Container from 'react-bootstrap/Container'
import Navbar from 'react-bootstrap/Navbar'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand>UniBodima</Navbar.Brand>
        </Container>
      </Navbar>

      <Container className="pb-5">
        <Card className="shadow-sm">
          <Card.Body>
            <Card.Title>React + Bootstrap</Card.Title>
            <Card.Text className="text-muted">
              Edit <code>src/App.jsx</code> and save to test HMR.
            </Card.Text>
            <Button
              variant="primary"
              onClick={() => setCount((c) => c + 1)}
            >
              Count is {count}
            </Button>
          </Card.Body>
        </Card>
      </Container>
    </>
  )
}

export default App
