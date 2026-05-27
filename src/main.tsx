import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Register topics
import './topics/linked-list/index'
import './topics/stack/index'
import './topics/binary-tree/index'
import './topics/hash-table/index'
import './topics/heap/index'
import './topics/recursion/index'
import './topics/graph/index'
import './topics/sorting/index'
import './topics/shortest-path/index'
import './topics/binary-search/index'
import './topics/string-matching/index'
import './topics/union-find/index'
import './topics/dynamic-programming/index'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
