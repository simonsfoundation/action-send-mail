const core = require('@actions/core');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

function parseAddressList(value) {
  if (!value || !value.trim()) return undefined;
  return value.split(',').map(s => s.trim()).filter(Boolean).join(', ');
}

async function resolveAttachments(attachmentsInput) {
  if (!attachmentsInput || !attachmentsInput.trim()) return [];

  const patterns = attachmentsInput.split(',').map(s => s.trim()).filter(Boolean);
  const attachments = [];

  for (const pattern of patterns) {
    const matches = await glob(pattern, { absolute: true });
    if (matches.length === 0) {
      core.warning(`No files matched attachment pattern: ${pattern}`);
      continue;
    }
    for (const filePath of matches) {
      if (!fs.existsSync(filePath)) {
        core.warning(`Attachment not found: ${filePath}`);
        continue;
      }
      attachments.push({
        filename: path.basename(filePath),
        path: filePath,
      });
      core.info(`Attachment: ${filePath}`);
    }
  }

  return attachments;
}

async function run() {
  try {
    const serverAddress = core.getInput('server_address', { required: true });
    const serverPort = parseInt(core.getInput('server_port') || '587', 10);
    const secure = core.getInput('secure') === 'true';
    const username = core.getInput('username');
    const password = core.getInput('password');
    const subject = core.getInput('subject', { required: true });
    const to = core.getInput('to', { required: true });
    const from = core.getInput('from', { required: true });
    const envelopeFrom = core.getInput('envelope_from') || undefined;
    const replyTo = core.getInput('reply_to') || undefined;
    const cc = core.getInput('cc') || undefined;
    const bcc = core.getInput('bcc') || undefined;
    const body = core.getInput('body') || undefined;
    const htmlBody = core.getInput('html_body') || undefined;
    const attachmentsInput = core.getInput('attachments') || '';
    const ignoreCert = core.getInput('ignore_cert') === 'true';
    const priority = core.getInput('priority') || 'normal';

    if (!body && !htmlBody) {
      throw new Error('At least one of body or html_body must be provided.');
    }

    const transportOptions = {
      host: serverAddress,
      port: serverPort,
      secure: secure,
    };

    if (username && password) {
      transportOptions.auth = { user: username, pass: password };
    }

    if (ignoreCert) {
      transportOptions.tls = { rejectUnauthorized: false };
    }

    const transporter = nodemailer.createTransport(transportOptions);

    const attachments = await resolveAttachments(attachmentsInput);

    const mailOptions = {
      from: from,
      to: parseAddressList(to),
      subject: subject,
      priority: priority,
    };

    if (envelopeFrom) {
      mailOptions.envelope = { from: envelopeFrom, to: parseAddressList(to) };
    }

    if (replyTo) mailOptions.replyTo = replyTo;
    if (cc) mailOptions.cc = parseAddressList(cc);
    if (bcc) mailOptions.bcc = parseAddressList(bcc);
    if (body) mailOptions.text = body;
    if (htmlBody) mailOptions.html = htmlBody;
    if (attachments.length > 0) mailOptions.attachments = attachments;

    core.info(`Sending email to: ${mailOptions.to}`);
    core.info(`Subject: ${subject}`);
    core.info(`Via: ${serverAddress}:${serverPort} (secure=${secure})`);

    const info = await transporter.sendMail(mailOptions);

    core.info(`Email sent. Message ID: ${info.messageId}`);
    core.setOutput('result', info.response || info.messageId);
  } catch (error) {
    core.setFailed(error.message);
  }
}

if (require.main === module) {
  run();
}

module.exports = { run };
