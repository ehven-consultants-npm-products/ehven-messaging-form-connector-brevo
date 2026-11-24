const BREVO_EMAIL_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

export class BrevoDeliveryError extends Error {
	constructor(status) {
		super(`Brevo rejected the transactional email with status ${status}.`);
		this.name = 'BrevoDeliveryError';
		this.status = status;
	}
}

export async function sendBrevoEmail({ apiKey, message, signal, fetchImpl = fetch }) {
	if (typeof apiKey !== 'string' || !apiKey.trim() || /[\r\n]/.test(apiKey)) {
		throw new TypeError('A Brevo API key is required.');
	}
	if (!message || typeof message !== 'object' || Array.isArray(message)) {
		throw new TypeError('A Brevo message object is required.');
	}
	signal?.throwIfAborted();

	const response = await fetchImpl(BREVO_EMAIL_ENDPOINT, {
		method: 'POST',
		redirect: 'manual',
		signal,
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			'api-key': apiKey,
		},
		body: JSON.stringify(message),
	});

	if (!response.ok) {
		throw new BrevoDeliveryError(response.status);
	}

	return response.json().catch(() => null);
}
