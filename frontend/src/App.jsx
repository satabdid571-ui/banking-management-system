import { BrowserRouter, Routes, Route } from "react-router-dom";
// Using absolute src reference ensures Vite or Webpack finds it regardless of folder nesting
import HomePage from"../components/Home/index.jsx";
 const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;