import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
export default function Famille() {
  const nav = useNavigate();
  useEffect(() => { nav("/sante/profils-familiaux", { replace: true }); }, [nav]);
  return null;
}
