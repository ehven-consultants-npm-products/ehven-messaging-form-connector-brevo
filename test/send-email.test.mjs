import assert from 'node:assert/strict';
import test from 'node:test';

import { BrevoDeliveryError, sendBrevoEmail } from '@ehven/messaging-form-connector-brevo';

test('the Brevo connector sends a complete transactional message', async () => {
	let request;
	const message = {
		sender: { name: "Example Robot", email: 'robot@example.org' },
		to: [{ email: 'visitor@example.com' }],
		subject: 'Message received',
		textContent: 'Thank you.',
	};

	await sendBrevoEmail({
		apiKey: 'test-key',
		message,
		fetchImpl(url, init) {
			request = { url, init };
			return Promise.resolve(new Response('{"messageId":"test"}'));
		},
	});

	assert.equal(request.url, 'https://api.brevo.com/v3/smtp/email');
	assert.equal(request.init.headers['api-key'], 'test-key');
	assert.deepEqual(JSON.parse(request.init.body), message);
});

test('forwards cancellation and declines redirects without a second request', async () => {
	const controller = new AbortController();
	let calls = 0;
	const send = () => sendBrevoEmail({
		apiKey:'example-key',message:{subject:'Example'},signal:controller.signal,
		fetchImpl:async (_url, init) => {
			calls++;
			assert.equal(init.signal,controller.signal);
			assert.equal(init.redirect,'manual');
			return new Response('private provider body',{status:307,headers:{Location:'https://example.org'}});
		},
	});
	await assert.rejects(send(), error => error instanceof BrevoDeliveryError && error.status === 307 && !error.message.includes('private'));
	controller.abort();
	await assert.rejects(send(), {name:'AbortError'});
	assert.equal(calls,1);
});

test('invalid credentials or message fail before making a request', async () => {
	const fetchImpl = () => assert.fail('unexpected fetch');
	await assert.rejects(sendBrevoEmail({apiKey:'  ',message:{},fetchImpl}), TypeError);
	await assert.rejects(sendBrevoEmail({apiKey:'example-key',message:null,fetchImpl}), TypeError);
});
