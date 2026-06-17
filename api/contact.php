<?php
// Contact / waitlist form handler. Sends a notification to a kiota.ai inbox
// via the local mail server. The visitor's address is only set as Reply-To,
// never mailed directly.

header('Content-Type: application/json');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$NOTIFY_TO     = 'info@kiota.ai';
$FROM          = 'Kiota Website <no-reply@kiota.ai>';
$RATE_SECONDS  = 20;
$RATE_MAX_HOUR = 12;

$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    $data = $_POST;
}

$clean = static function ($v) {
    return str_replace(["\r", "\n", "\0"], ' ', trim((string) ($v ?? '')));
};

$name     = $clean($data['name'] ?? '');
$email    = $clean($data['email'] ?? '');
$org      = $clean($data['organisation'] ?? '');
$interest = $clean($data['interest'] ?? '');
$phone    = $clean($data['phone'] ?? '');
$message  = trim((string) ($data['message'] ?? ''));
$honeypot = trim((string) ($data['company_website'] ?? ''));

// Bots fill the hidden honeypot. Pretend success and send nothing.
if ($honeypot !== '') {
    echo json_encode(['ok' => true]);
    exit;
}

$ip   = preg_replace('/[^a-zA-Z0-9]/', '_', $_SERVER['REMOTE_ADDR'] ?? '0');
$file = sys_get_temp_dir() . '/kiota_rl_' . $ip . '.json';
$now  = time();
$hits = is_file($file) ? (json_decode(@file_get_contents($file), true) ?: []) : [];
$hits = array_values(array_filter($hits, static fn($t) => $t > $now - 3600));
if ($hits && ($now - max($hits) < $RATE_SECONDS || count($hits) >= $RATE_MAX_HOUR)) {
    http_response_code(429);
    echo json_encode(['error' => 'Too many requests. Please try again shortly.']);
    exit;
}
$hits[] = $now;
@file_put_contents($file, json_encode($hits));

if ($name === '' || $email === '' || $message === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'That email looks invalid']);
    exit;
}

$labels = [
    'waitlist'           => 'Consumer Waitlist',
    'whatsapp-commerce'  => 'WhatsApp Commerce',
    'financial-services' => 'Financial Services',
    'community-savings'  => 'Community Savings & Stokvels',
    'partnership'        => 'Partnership / Investment',
    'other'              => 'Something else',
];
$interestLabel = $labels[$interest] ?? ($interest !== '' ? $interest : 'Not specified');
$isWaitlist    = ($interest === 'waitlist');
$subject       = $isWaitlist ? "New waitlist signup: $name" : "New message from $name";

$rows = [
    $isWaitlist ? 'New waitlist signup from the Kiota site.' : 'New contact message from the Kiota site.',
    '',
    "Name:  $name",
    "Email: $email",
];
if ($phone !== '') $rows[] = "Phone: $phone";
if ($org !== '')   $rows[] = "Organisation: $org";
$rows[] = "Type:  $interestLabel";
$rows[] = '';
$rows[] = 'Message:';
$rows[] = $message;
$body = implode("\n", $rows);

$headers = implode("\r\n", [
    'From: ' . $FROM,
    'Reply-To: ' . $name . ' <' . $email . '>',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: Kiota-Form',
]);

if (!mail($NOTIFY_TO, $subject, $body, $headers)) {
    http_response_code(502);
    echo json_encode(['error' => 'Failed to send']);
    exit;
}

echo json_encode(['ok' => true]);
