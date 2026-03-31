module.exports = function orderEmailTemplate({
  fullName,
  orderId,
  paymentReference,
  totalAmount,
  packageName,
  packageCode,
  modulesCount,
  paymentStatus,
  payNowUrl,
  frontendUrl,
}) {
  const safeName = fullName ? String(fullName) : "Student";
  const safeFrontend = frontendUrl || "";
  const safeStatus = paymentStatus ? String(paymentStatus) : "pending";
  const safePayNowUrl = payNowUrl || "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Order Created</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7fb;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:600px;max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 24px rgba(17,24,39,0.08);">
            <tr>
              <td style="background:#111827;padding:20px 24px;">
                <div style="font-size:18px;font-weight:700;color:#ffffff;">Unisa Tut</div>
                <div style="font-size:12px;color:#cbd5e1;margin-top:4px;">Order Confirmation</div>
              </td>
            </tr>

            <tr>
              <td style="padding:24px;">
                <h1 style="margin:0 0 8px 0;font-size:20px;line-height:1.3;">Your order has been created</h1>
                <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#374151;">Hi ${safeName}, your order was created successfully. Please continue to payment to complete your booking.</p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
                  <tr>
                    <td style="padding:14px 16px;background:#f9fafb;font-size:13px;color:#111827;font-weight:700;">Order details</td>
                  </tr>
                  <tr>
                    <td style="padding:14px 16px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:13px;color:#111827;">
                        <tr>
                          <td style="padding:6px 0;color:#6b7280;">Order ID</td>
                          <td style="padding:6px 0;text-align:right;font-weight:700;">${orderId}</td>
                        </tr>
                        <tr>
                          <td style="padding:6px 0;color:#6b7280;">Payment reference</td>
                          <td style="padding:6px 0;text-align:right;font-weight:700;">${paymentReference}</td>
                        </tr>
                        <tr>
                          <td style="padding:6px 0;color:#6b7280;">Package</td>
                          <td style="padding:6px 0;text-align:right;font-weight:700;">${packageName} (${packageCode})</td>
                        </tr>
                        <tr>
                          <td style="padding:6px 0;color:#6b7280;">Modules selected</td>
                          <td style="padding:6px 0;text-align:right;font-weight:700;">${modulesCount}</td>
                        </tr>
                        <tr>
                          <td style="padding:6px 0;color:#6b7280;">Total amount</td>
                          <td style="padding:6px 0;text-align:right;font-weight:700;">R ${totalAmount}</td>
                        </tr>
                        <tr>
                          <td style="padding:6px 0;color:#6b7280;">Payment status</td>
                          <td style="padding:6px 0;text-align:right;font-weight:700;">${safeStatus}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <div style="height:16px;"></div>

                <p style="margin:0 0 14px 0;font-size:13px;line-height:1.6;color:#374151;">To continue, please complete payment for this order.</p>

                ${safePayNowUrl ? `
                <div style="margin:0 0 10px 0;">
                  <a href="${safePayNowUrl}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;padding:10px 14px;border-radius:10px;font-size:13px;font-weight:700;">Pay Now</a>
                </div>
                <div style="font-size:12px;color:#6b7280;margin:0 0 14px 0;">If the button doesn’t work, copy and paste this link into your browser:<br/><span style="word-break:break-all;">${safePayNowUrl}</span></div>
                ` : ""}

                ${safeFrontend ? `
                <div style="margin:0 0 8px 0;">
                  <a href="${safeFrontend}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:10px 14px;border-radius:10px;font-size:13px;font-weight:700;">Open Unisa Tut</a>
                </div>
                ` : ""}

                <p style="margin:16px 0 0 0;font-size:12px;line-height:1.6;color:#6b7280;">If you did not create this order, you can ignore this email.</p>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;">
                <div style="font-size:12px;color:#6b7280;">© ${new Date().getFullYear()} Unisa Tut</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};
