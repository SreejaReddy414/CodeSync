import EditorPage from "./component/EditorPage.js";
import Home from "./component/home.js";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
function App() {
  return (
    <>
      <Toaster position="top-center"></Toaster>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/editor/:roomId" element={<EditorPage />}></Route>
      </Routes>
    </>
  );
}

export default App;
