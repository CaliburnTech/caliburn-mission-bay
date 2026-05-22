import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const ses = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const FROM = `Mission Bay <noreply@${process.env.EMAIL_DOMAIN}>`;
const NOTIFY_EMAIL = process.env.CALIBURN_NOTIFY_EMAIL;

const send = async (to, subject, body) => {
  await ses.send(new SendEmailCommand({
    Source: FROM,
    Destination: { ToAddresses: Array.isArray(to) ? to : [to] },
    Message: {
      Subject: { Data: subject },
      Body: { Text: { Data: body } },
    },
  }));
};

export const notifyPurchaseRequest = async ({ buyerName, buyerEmail, configName, companyName }) => {
  await send(
    NOTIFY_EMAIL,
    `[Mission Bay] Purchase request from ${buyerName}`,
    `${buyerName} (${buyerEmail}) has submitted a purchase request for configuration "${configName}".\n\nTheir company: ${companyName}\n\nLog in to Mission Bay admin to review.`
  );
};

export const notifyNewLead = async ({ buyerName, buyerEmail, productName, vendorEmail }) => {
  await send(
    [NOTIFY_EMAIL, vendorEmail].filter(Boolean),
    `[Mission Bay] New lead on ${productName}`,
    `${buyerName} (${buyerEmail}) is interested in ${productName}.\n\nLog in to Mission Bay to view their details.`
  );
};

export const notifyConfigUpdated = async ({ buyerEmail, productName, configName }) => {
  await send(
    buyerEmail,
    `[Mission Bay] Your configuration was updated`,
    `The product "${productName}" in your saved configuration "${configName}" has been updated to a new version.\n\nYour configuration has been automatically updated. Log in to Mission Bay to review the changes.`
  );
};

export const notifyVendorApplication = async ({ companyName, contactName, contactEmail }) => {
  await send(
    NOTIFY_EMAIL,
    `[Mission Bay] New vendor application: ${companyName}`,
    `${contactName} (${contactEmail}) has submitted an application to list ${companyName} on Mission Bay.\n\nLog in to the admin portal to review.`
  );
};
