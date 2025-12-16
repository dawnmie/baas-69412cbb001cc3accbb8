import { useState, useEffect } from 'react'
import { account } from './appwrite'

function App() {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const currentUser = await account.get()
      setUser(currentUser)
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (e) => {
    e.preventDefault()
    try {
      await account.createEmailPasswordSession(email, password)
      await checkUser()
    } catch (error) {
      alert(error.message)
    }
  }

  const register = async (e) => {
    e.preventDefault()
    try {
      await account.create('unique()', email, password, name)
      await login(e)
    } catch (error) {
      alert(error.message)
    }
  }

  const logout = async () => {
    await account.deleteSession('current')
    setUser(null)
  }

  if (loading) {
    return <div className="container"><p>Loading...</p></div>
  }

  if (user) {
    return (
      <div className="container">
        <h1>Welcome, {user.name || user.email}!</h1>
        <p>You are logged in.</p>
        <button onClick={logout}>Logout</button>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>Appwrite + React Demo</h1>
      <form onSubmit={login}>
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
      <form onSubmit={register}>
        <h2>Register</h2>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Register</button>
      </form>
    </div>
  )
}

export default App
