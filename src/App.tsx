import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Profile from "./components/Profile";

function App() {
  return (
    <div className="App">
      <Router basename="/mf-expert-profile">
          <Routes>
              <Route path="/profile" element={<Profile />}/>
          </Routes>
        
      </Router>
    </div>
  );
}

export default App;