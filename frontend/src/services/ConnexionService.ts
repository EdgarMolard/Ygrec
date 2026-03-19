export async function login(username: string, password: string): Promise<{ message: string; userId?: string; error?: string }> {
    const apiBaseUrl = "http://localhost:3000";
    const response = await fetch(`${apiBaseUrl}/api/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ username, password })
    });

    const data = (await response.json()) as { message: string; userId?: string; username?: string; error?: string };

    if (!response.ok) {
        throw new Error(data.error ?? "Erreur lors de la connexion.");
    }

    if (data.userId) {
        localStorage.setItem("userId", data.userId);
    }

    if (data.username) {
        localStorage.setItem("username", data.username);
    }
    return data;
}

export async function logout(): Promise<void> {
    const apiBaseUrl = "http://localhost:3000";
    const response = await fetch(`${apiBaseUrl}/api/logout`, {
        method: "POST",
        credentials: "include"
    });

    if (!response.ok) {
        throw new Error("Erreur lors de la deconnexion.");
    }

    localStorage.removeItem("userId");
    localStorage.removeItem("username");
}
