import { Navigate, Route, Routes } from "react-router-dom";
import ConnexionPage from "./pages/ConnexionPage";
import FeedPage from "./pages/FeedPage";
import InscriptionPage from "./pages/InscriptionPage";

export default function App() {
  return (
    <Routes>
      <Route path="/feed" element={<FeedPage />} />
      <Route path="/connexion" element={<ConnexionPage />} />
      <Route path="/inscription" element={<InscriptionPage />} />
      <Route path="/" element={<Navigate to="/feed" replace />} />
      <Route path="*" element={<Navigate to="/feed" replace />} />
    </Routes>
  );
}
