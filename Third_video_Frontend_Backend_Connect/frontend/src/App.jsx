import { useState } from 'react'
import './App.css'
import axios from 'axios'
import { useEffect } from 'react'

function App() {
  const [jokes,setJokes] = useState([])

  useEffect (()=>{
    axios.get('/api/jokes')
    .then((response)=>{
      setJokes(response.data)
    })
    .catch((error)=>{
      console.log(error);
      
    })
  })
  return (
    <>
      <h1>Chai and Full stack</h1>
      <p>JOKES: {jokes.length}</p>

      {
        jokes.map((joke)=>(
          <div key={joke.id}> // key need when map used react 
          // use key prop to uniquely identify each for virtual DOM optimization 
            <h3>{joke.title}</h3>
            <p>{joke.content}</p>
          </div>
        ))
      }
    </>
  )
}

export default App
