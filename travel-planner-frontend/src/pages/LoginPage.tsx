import React, {useState} from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/AuthService";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const {login} = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try{
            const response = await authService.login({email, password});
            const token = response.token;

            const payload = JSON.parse(atob(token.split(".")[1]));
            const userId = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

            const user = await authService.getUserById(Number(userId), token);
            login(token, user);
            navigate("/dashboard");
        }catch{
            setError("Pogresan email ili lozinka.");
        }
    };

    return(
        <div style={{maxWidth: 400, margin: "100px auto", padding: 24}}>
            <h2>Prijava</h2>
            {error && <p style={{color: "red"}}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email</label>
                    <input type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required style={{display:"block", width:"100%", marginBottom: 12}}/>
                </div>
                <div>
                    <label>Lozinka</label>
                    <input type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required style={{display:"block", width:"100%", marginBottom: 12}}/>
                </div>
                <button type="submit">Prijavi se</button>
            </form>
            <p>Nemate nalog? <Link to="/register">Registrujte se</Link></p>
        </div>
    );
};

export default LoginPage;