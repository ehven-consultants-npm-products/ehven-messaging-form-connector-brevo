# Brevo messaging form connector

`@ehven/messaging-form-connector-brevo` sends an application-composed transactional email through Brevo. The server connector targets Node.js 24 or later and is MIT licensed.

## Install

```sh
npm install @ehven/messaging-form-connector-brevo
```

```js
import { sendBrevoEmail } from '@ehven/messaging-form-connector-brevo';

const receipt = await sendBrevoEmail({
  apiKey: process.env.BREVO_API_KEY,
  message: {
    sender: { email: 'receipts@example.org' },
    to: [{ email: 'visitor@example.org' }],
    replyTo: { email: 'contact@example.org' },
    subject: 'Message received',
    textContent: 'Thank you for getting in touch.',
  },
  signal: AbortSignal.timeout(10_000),
});
```

- Supply a Brevo account, a configured sender and a server-only API key. Message copy, recipients, reply routing, templates and tags come from the application.
- Success returns provider JSON or `null` when there is no JSON body. A returned `messageId` identifies Brevo's accepted request. Inbox arrival depends on later delivery. Non-success responses throw `BrevoDeliveryError` with the HTTP status. Transport and cancellation errors propagate.
- Pass a cancellation signal or inject `fetchImpl` for controlled testing. The connector declines redirects and makes one POST per call. Reconcile an ambiguous timeout before retrying. Keep keys, recipients and provider responses out of normal logs.
- When composing with core, await `sendBrevoEmail` inside the acknowledgment callback and return `{ ok: true }` after success. An acknowledgment failure still permits acceptance after a confirmed primary operation.

The transport tests use synthetic responses. Run `npm ci --ignore-scripts --offline` and `npm run check` to verify the request contract locally.

## Support

Patch releases within 0.1 are intended to be compatible. Future 0.x minor releases may change APIs. Open an issue for bugs and usage questions. For a security concern, use the contact form to request a private reporting channel and keep credentials, tokens and submissions out of the public tracker. [Issues](https://github.com/ehven-consultants-npm-products/ehven-messaging-form-connector-brevo/issues) · [Contact](https://ehven.com/contact/)
