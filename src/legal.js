import { contact } from './data.js';

const UPDATED = '25 October 2026';
const reach = `Email ${contact.email} or call ${contact.phone}.`;

export const privacy = {
  title: 'Privacy Policy',
  updated: UPDATED,
  intro: 'This Privacy Policy explains what personal information Rex Groups collects through this website, how we use it, who it may be shared with, and the choices you have. By using this website you confirm that you have read it.',
  sections: [
    {
      h: 'Who we are',
      p: [
        'Rex Groups provides logistics, hotel and restaurant, and vacation services. This website lets you learn about our services, send enquiries, track packages, create an account and share reviews.',
        `If you have any question about this policy or your information, ${reach}`
      ]
    },
    {
      h: 'Information we collect',
      p: ['Depending on how you use the website, we may collect:'],
      ul: [
        'Account details: your full name, email address and password. Your password is handled by our authentication provider and stored in protected form. We cannot read it.',
        'Profile picture: an optional photo you choose to upload to your account.',
        'Enquiries: your name, email address, the service you are interested in, your message and any booking details you give us (such as dates, number of guests, destination or budget). If you are signed in, the enquiry is linked to your account so you can see its status.',
        'Reviews: the name on your account, your star rating and your review text.',
        'Package tracking: when you look up a tracking code we do not ask for personal details. For shipments we handle, our team may record the origin, destination, status updates and, privately, a receiver name or internal notes.',
        'Technical information: such as your IP address, browser and device type, which our hosting and service providers process to deliver and secure the website. Your browser also stores a sign-in session so you stay signed in.'
      ],
      after: [
        'We do not collect payment card details on this website. If online payments are added in future, they will be handled by a payment provider and we will update this policy first.'
      ]
    },
    {
      h: 'How we use your information',
      ul: [
        'To reply to your enquiries and arrange the services you ask about.',
        'To run your account, including showing your name and profile picture and the status of your enquiries.',
        'To provide package tracking updates.',
        'To review and, if approved, display customer reviews.',
        'To keep the website secure, prevent misuse and fix problems.',
        'To meet legal and regulatory obligations.'
      ],
      after: ['Where the law requires a lawful basis, we rely on your consent, the need to respond to your request or provide a service, our legitimate interest in running a safe and useful website, or a legal obligation.']
    },
    {
      h: 'What is visible to other people',
      ul: [
        'Reviews you submit are shown publicly only after our team approves them, with your name and rating.',
        'Photos in our gallery are public.',
        'Profile pictures are stored in a publicly accessible location, so anyone who has the picture’s link can view it.',
        'Package tracking pages show the origin, destination, status and update notes to anyone who has the exact tracking code. Please share your code carefully.',
        'Your enquiries, email address and account details are visible only to you and to authorised Rex Groups staff.'
      ]
    },
    {
      h: 'Who we share information with',
      p: ['We do not sell your personal information. We use trusted service providers who process information on our behalf to run the website:'],
      ul: [
        'Supabase: database, account sign-in and file storage. Our project is hosted in the West EU (Ireland) region.',
        'Vercel: website hosting.',
        'Google Fonts and Unsplash: fonts and some stock images load from their servers, so they may receive your IP address and browser details when you visit.',
        'WhatsApp, email and phone providers: if you contact us through these, your message is handled by those services under their own policies.',
        'Authorities or professional advisers, where we are required or permitted by law to share information.'
      ]
    },
    {
      h: 'Transfers outside your country',
      p: ['Our providers may store and process information in countries outside Nigeria, including in Europe and the United States. We choose reputable providers and take reasonable steps to protect your information wherever it is processed.']
    },
    {
      h: 'Cookies and similar technologies',
      p: ['We use your browser’s storage only to keep you signed in and make the website work. We do not currently use advertising or analytics cookies. If that changes, we will update this policy.']
    },
    {
      h: 'How long we keep information',
      p: ['We keep information for as long as it is needed for the purposes above, for example while your account is open or while an enquiry or shipment is being handled, and for any period the law requires. You can ask us to delete your account and the information linked to it.']
    },
    {
      h: 'Keeping your information safe',
      p: ['We use access controls, secure connections and a reputable authentication provider to protect your information, and only authorised staff can see enquiries and shipment records. No website or online service can be completely secure, so please use a unique password and never share it.']
    },
    {
      h: 'Your rights',
      p: ['Depending on the law that applies to you, you may have the right to ask us to:'],
      ul: [
        'tell you what personal information we hold about you and give you a copy;',
        'correct information that is wrong or out of date;',
        'delete your information or close your account;',
        'restrict or object to certain uses of your information;',
        'withdraw consent you have given, without affecting what we did before you withdrew it.'
      ],
      after: [
        `To make a request, ${reach} We may need to confirm who you are first. If you are unhappy with how we handle your information, you may also contact the data protection authority in your country, such as the Nigeria Data Protection Commission.`
      ]
    },
    {
      h: 'Children',
      p: ['This website is not directed at children under 18, and we do not knowingly collect their personal information. If you believe a child has given us information, please contact us and we will delete it.']
    },
    {
      h: 'Changes to this policy',
      p: ['We may update this policy from time to time. The date at the top shows when it was last changed. If we make important changes, we will make that clear on the website.']
    },
    {
      h: 'Contact us',
      p: [`Rex Groups. ${reach}`]
    }
  ]
};

export const terms = {
  title: 'Terms of Service',
  updated: UPDATED,
  intro: 'These Terms of Service apply to your use of the Rex Groups website. By using the website, creating an account or sending an enquiry, you agree to them. If you do not agree, please do not use the website.',
  sections: [
    {
      h: 'About our website and services',
      p: ['This website provides information about Rex Groups’ logistics, hotel and restaurant, and vacation services and lets you contact us, track packages, manage an account and share reviews. Information on the website is for general guidance and may change without notice.']
    },
    {
      h: 'Enquiries are not bookings',
      p: ['Sending an enquiry does not create a booking, order or contract. Prices, availability, timelines and the details of any service are confirmed directly by our team. A service only begins once we have confirmed it with you, and we may decline an enquiry.']
    },
    {
      h: 'Payments, cancellations and refunds',
      p: [
        'Online payments are not available on this website. Our team will explain how and when payment is made when your service is confirmed.',
        'Cancellation and refund terms for a service will be confirmed by our team when you book. Please do not send card details, passwords or other sensitive payment information through the website or contact form.'
      ]
    },
    {
      h: 'Package tracking',
      ul: [
        'Tracking updates are entered by our team and are provided for convenience. They may be delayed or occasionally incomplete, and they are not a guarantee of delivery times.',
        'Anyone with a tracking code can see the status of that shipment, so please share your code carefully.',
        'We may refuse, hold or return any shipment that we reasonably believe is unlawful, unsafe or prohibited. You are responsible for making sure that what you send is legal and properly described.'
      ]
    },
    {
      h: 'Your account',
      ul: [
        'Give accurate information when you register and keep it up to date.',
        'Keep your password confidential. You are responsible for activity under your account.',
        'Tell us straight away if you think someone has used your account without permission.',
        'We may suspend or close an account that breaks these terms or is used to harm the website or other people.',
        'You can ask us to delete your account at any time.'
      ]
    },
    {
      h: 'Reviews and content you submit',
      ul: [
        'Reviews must be honest, based on your own experience, and must not be unlawful, offensive, misleading or private information about other people.',
        'Reviews are checked by our team before they appear, and we may decline, edit for length or remove a review at our discretion.',
        'You keep ownership of what you submit, but you give Rex Groups a non-exclusive, free right to display it on this website and in our marketing for as long as it is published.',
        'The profile picture you upload must be your own or one you have the right to use.'
      ]
    },
    {
      h: 'Acceptable use',
      p: ['You agree not to:'],
      ul: [
        'try to gain unauthorised access to the website, other accounts or our systems;',
        'upload viruses or harmful code, or interfere with how the website works;',
        'copy or collect information from the website in bulk by automated means;',
        'pretend to be another person or organisation;',
        'use the website for anything unlawful, fraudulent or abusive.'
      ]
    },
    {
      h: 'Ownership of website content',
      p: ['The Rex Groups name, logo, design and written content belong to Rex Groups or its licensors. Some images are provided by third parties such as Unsplash under their own licences. You may not copy, republish or sell website content without our written permission, except for normal personal use.']
    },
    {
      h: 'Links to other services',
      p: ['The website links to other services such as WhatsApp, email and phone. We are not responsible for those services or their policies.']
    },
    {
      h: 'Limits on our responsibility',
      p: [
        'We work to keep the website accurate and available, but it is provided “as is”, and we cannot promise that it will always be error-free or uninterrupted.',
        'To the extent the law allows, Rex Groups is not responsible for losses that come from relying on information on the website, from the website being unavailable, or from events outside our reasonable control. Nothing in these terms limits any right or liability that cannot legally be limited.'
      ]
    },
    {
      h: 'Changes to the website and these terms',
      p: ['We may change or withdraw parts of the website at any time. We may also update these terms, and the date at the top shows the latest version. Using the website after a change means you accept the updated terms.']
    },
    {
      h: 'Governing law and disputes',
      p: ['These terms are governed by the laws of the Federal Republic of Nigeria. If you have a problem or complaint, please contact us first so we can try to resolve it informally.']
    },
    {
      h: 'Contact us',
      p: [`Rex Groups. ${reach}`]
    }
  ]
};
