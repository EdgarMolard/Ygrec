export type PasswordValidationResult = {
	isValid: boolean;
	errors: string[];
};

type CreateUserPayload = {
	username: string;
	email: string;
	password: string;
};

type CreateUserResponse = {
	message?: string;
	error?: string;
	code?: "USERNAME_ALREADY_USED" | "EMAIL_ALREADY_USED";
};

export function validateInscriptionPassword(password: string, passwordConfirm: string): PasswordValidationResult {
	const errors: string[] = [];

	if (!/\d/.test(password)) {
		errors.push("Le mot de passe doit contenir au moins 1 chiffre.");
	}

	if (!/[A-Z]/.test(password)) {
		errors.push("Le mot de passe doit contenir au moins 1 lettre majuscule.");
	}

	if (!/[^A-Za-z0-9]/.test(password)) {
		errors.push("Le mot de passe doit contenir au moins 1 caractère spécial.");
	}

	if (password.length < 12) {
		errors.push("Le mot de passe doit contenir au moins 12 caractères.");
	}

	if (errors.length === 0 && password !== passwordConfirm) {
		errors.push("La confirmation du mot de passe ne correspond pas.");
	}

	return {
		isValid: errors.length === 0,
		errors
	};
}

export async function createUser(payload: CreateUserPayload): Promise<CreateUserResponse> {
	const apiBaseUrl = "http://localhost:3000";
	const response = await fetch(`${apiBaseUrl}/api/create-user`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		credentials: "include",
		body: JSON.stringify(payload)
	});

	const data = (await response.json()) as CreateUserResponse;

	if (!response.ok) {
		if (response.status === 409) {
			if (data.code === "USERNAME_ALREADY_USED") {
				throw new Error("Le nom d'utilisateur est déjà utilisé.");
			}

			if (data.code === "EMAIL_ALREADY_USED") {
				throw new Error("L'email est déjà utilisé.");
			}
		}

		throw new Error(data.error ?? "Erreur lors de la création du compte.");
	}

	return data;
}
