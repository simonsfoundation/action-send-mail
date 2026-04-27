const mockSendMail = jest.fn();
const mockCreateTransport = jest.fn(() => ({ sendMail: mockSendMail }));

jest.mock('nodemailer', () => ({ createTransport: mockCreateTransport }));

const mockGetInput = jest.fn();
const mockSetOutput = jest.fn();
const mockSetFailed = jest.fn();
const mockInfo = jest.fn();
const mockWarning = jest.fn();

jest.mock('@actions/core', () => ({
  getInput: mockGetInput,
  setOutput: mockSetOutput,
  setFailed: mockSetFailed,
  info: mockInfo,
  warning: mockWarning,
}));

jest.mock('glob', () => ({ glob: jest.fn() }));
jest.mock('fs', () => ({ existsSync: jest.fn(() => true) }));

const { glob } = require('glob');
const { run } = require('../index');

function setInputs(inputs) {
  mockGetInput.mockImplementation((name) => inputs[name] ?? '');
}

const baseInputs = {
  server_address: 'smtp.example.com',
  server_port: '587',
  secure: 'false',
  username: '',
  password: '',
  subject: 'Test Subject',
  to: 'recipient@example.com',
  from: 'sender@example.com',
  envelope_from: '',
  reply_to: '',
  cc: '',
  bcc: '',
  body: 'Hello world',
  html_body: '',
  attachments: '',
  ignore_cert: 'false',
  priority: 'normal',
};

beforeEach(() => {
  jest.clearAllMocks();
  mockSendMail.mockResolvedValue({ messageId: '<test@msg>', response: '250 OK' });
  glob.mockResolvedValue([]);
});

describe('action-send-mail', () => {
  test('sends plain text email', async () => {
    setInputs(baseInputs);
    await run();

    const [mailOpts] = mockSendMail.mock.calls[0];
    expect(mailOpts.text).toBe('Hello world');
    expect(mailOpts.html).toBeUndefined();
    expect(mockSendMail).toHaveBeenCalledTimes(1);
  });

  test('sends HTML email', async () => {
    setInputs({ ...baseInputs, body: '', html_body: '<h1>Hi</h1>' });
    await run();

    const [mailOpts] = mockSendMail.mock.calls[0];
    expect(mailOpts.html).toBe('<h1>Hi</h1>');
    expect(mailOpts.text).toBeUndefined();
  });

  test('sends multipart when both body and html_body set', async () => {
    setInputs({ ...baseInputs, html_body: '<h1>Hi</h1>' });
    await run();

    const [mailOpts] = mockSendMail.mock.calls[0];
    expect(mailOpts.text).toBe('Hello world');
    expect(mailOpts.html).toBe('<h1>Hi</h1>');
  });

  test('parses multiple recipients correctly', async () => {
    setInputs({
      ...baseInputs,
      to: 'a@example.com, b@example.com',
      cc: 'c@example.com,d@example.com',
      bcc: 'e@example.com',
    });
    await run();

    const [mailOpts] = mockSendMail.mock.calls[0];
    expect(mailOpts.to).toBe('a@example.com, b@example.com');
    expect(mailOpts.cc).toBe('c@example.com, d@example.com');
    expect(mailOpts.bcc).toBe('e@example.com');
  });

  test('sets envelope when envelope_from provided', async () => {
    setInputs({ ...baseInputs, envelope_from: 'bounces@example.com' });
    await run();

    const [mailOpts] = mockSendMail.mock.calls[0];
    expect(mailOpts.envelope).toEqual({
      from: 'bounces@example.com',
      to: 'recipient@example.com',
    });
  });

  test('no envelope when envelope_from not provided', async () => {
    setInputs(baseInputs);
    await run();

    const [mailOpts] = mockSendMail.mock.calls[0];
    expect(mailOpts.envelope).toBeUndefined();
  });

  test('resolves glob attachments and passes to sendMail', async () => {
    glob.mockResolvedValue(['/tmp/report.pdf']);
    setInputs({ ...baseInputs, attachments: '*.pdf' });
    await run();

    const [mailOpts] = mockSendMail.mock.calls[0];
    expect(mailOpts.attachments).toEqual([{ filename: 'report.pdf', path: '/tmp/report.pdf' }]);
  });

  test('warns when attachment pattern matches no files', async () => {
    glob.mockResolvedValue([]);
    setInputs({ ...baseInputs, attachments: '*.pdf' });
    await run();

    expect(mockWarning).toHaveBeenCalledWith(expect.stringContaining('*.pdf'));
    const [mailOpts] = mockSendMail.mock.calls[0];
    expect(mailOpts.attachments).toBeUndefined();
  });

  test('fails when neither body nor html_body provided', async () => {
    setInputs({ ...baseInputs, body: '', html_body: '' });
    await run();

    expect(mockSetFailed).toHaveBeenCalledWith(
      'At least one of body or html_body must be provided.'
    );
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  test('skips auth when username and password not provided', async () => {
    setInputs(baseInputs);
    await run();

    const [transportOpts] = mockCreateTransport.mock.calls[0];
    expect(transportOpts.auth).toBeUndefined();
  });

  test('includes auth when credentials provided', async () => {
    setInputs({ ...baseInputs, username: 'user@example.com', password: 'secret' });
    await run();

    const [transportOpts] = mockCreateTransport.mock.calls[0];
    expect(transportOpts.auth).toEqual({ user: 'user@example.com', pass: 'secret' });
  });

  test('sets rejectUnauthorized false when ignore_cert is true', async () => {
    setInputs({ ...baseInputs, ignore_cert: 'true' });
    await run();

    const [transportOpts] = mockCreateTransport.mock.calls[0];
    expect(transportOpts.tls).toEqual({ rejectUnauthorized: false });
  });

  test('calls setFailed on SMTP error', async () => {
    mockSendMail.mockRejectedValue(new Error('Connection refused'));
    setInputs(baseInputs);
    await run();

    expect(mockSetFailed).toHaveBeenCalledWith('Connection refused');
  });

  test('sets output result on success', async () => {
    mockSendMail.mockResolvedValue({ messageId: '<abc@msg>', response: '250 OK' });
    setInputs(baseInputs);
    await run();

    expect(mockSetOutput).toHaveBeenCalledWith('result', '250 OK');
  });
});
