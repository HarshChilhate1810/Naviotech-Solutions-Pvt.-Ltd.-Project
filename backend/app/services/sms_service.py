import json
import logging
import re
import urllib.error
import urllib.parse
import urllib.request
import base64
from typing import Dict, Any, Tuple
from app.core.config import settings

logger = logging.getLogger("bibliobox.sms")


def clean_phone_for_sms(phone: str) -> Tuple[str, str]:
    """
    Extract 10-digit number and E.164 formatted number (+91XXXXXXXXXX by default for India).
    """
    digits = re.sub(r"\D", "", phone or "")
    if len(digits) >= 10:
        ten_digits = digits[-10:]
    else:
        ten_digits = digits

    if phone.startswith("+"):
        e164 = f"+{digits}"
    else:
        # Default country code +91 (India)
        e164 = f"+91{ten_digits}"

    return ten_digits, e164


def send_fast2sms(phone_10: str, otp_code: str) -> Dict[str, Any]:
    """
    Deliver OTP via Fast2SMS Quick/OTP API (India).
    Docs: https://docs.fast2sms.com/
    """
    api_key = settings.FAST2SMS_API_KEY.strip()
    if not api_key:
        return {"sent": False, "error": "FAST2SMS_API_KEY is not configured"}

    url = "https://www.fast2sms.com/dev/bulkV2"
    payload = json.dumps({
        "route": "otp",
        "variables_values": otp_code,
        "numbers": phone_10
    }).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "authorization": api_key,
            "Content-Type": "application/json",
            "User-Agent": "BiblioBox-SMS/1.0"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=6) as response:
            resp_body = response.read().decode("utf-8")
            data = json.loads(resp_body)
            # Fast2SMS returns {"return": true, "request_id": "...", "message": ["..."]}
            if data.get("return") is True:
                logger.info(f"[SMS SERVICE] Fast2SMS sent successfully to {phone_10}. Request ID: {data.get('request_id')}")
                return {
                    "sent": True,
                    "provider": "fast2sms",
                    "message": "SMS dispatched to your mobile phone via Fast2SMS gateway",
                    "request_id": data.get("request_id")
                }
            else:
                msg = ", ".join(data.get("message", ["Unknown Fast2SMS error"]))
                logger.warning(f"[SMS SERVICE] Fast2SMS rejected request for {phone_10}: {msg}")
                return {
                    "sent": False,
                    "provider": "fast2sms",
                    "error": msg,
                    "message": f"Fast2SMS error: {msg}"
                }
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8", errors="ignore")
        logger.error(f"[SMS SERVICE] Fast2SMS HTTP {e.code}: {err_msg}")
        return {"sent": False, "provider": "fast2sms", "error": f"HTTP {e.code}: {err_msg}"}
    except Exception as e:
        logger.error(f"[SMS SERVICE] Fast2SMS unexpected error: {e}")
        return {"sent": False, "provider": "fast2sms", "error": str(e)}


def send_twilio(e164_phone: str, otp_code: str) -> Dict[str, Any]:
    """
    Deliver OTP via Twilio REST API (Global).
    """
    sid = settings.TWILIO_ACCOUNT_SID.strip()
    auth_token = settings.TWILIO_AUTH_TOKEN.strip()
    from_number = settings.TWILIO_FROM_NUMBER.strip()

    if not (sid and auth_token and from_number):
        return {"sent": False, "error": "Twilio credentials incomplete in configuration"}

    url = f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json"
    auth_header = "Basic " + base64.b64encode(f"{sid}:{auth_token}".encode("ascii")).decode("ascii")

    body_text = f"Your BiblioBox verification code is {otp_code}. Valid for 5 minutes. Please do not share this code."
    form_data = urllib.parse.urlencode({
        "To": e164_phone,
        "From": from_number,
        "Body": body_text,
    }).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=form_data,
        headers={
            "Authorization": auth_header,
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "BiblioBox-SMS/1.0"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=6) as response:
            resp_body = response.read().decode("utf-8")
            data = json.loads(resp_body)
            sid_returned = data.get("sid")
            logger.info(f"[SMS SERVICE] Twilio SMS dispatched to {e164_phone}. SID: {sid_returned}")
            return {
                "sent": True,
                "provider": "twilio",
                "message": "SMS dispatched to your mobile phone via Twilio gateway",
                "request_id": sid_returned
            }
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8", errors="ignore")
        logger.error(f"[SMS SERVICE] Twilio HTTP {e.code}: {err_msg}")
        return {"sent": False, "provider": "twilio", "error": f"HTTP {e.code}: {err_msg}"}
    except Exception as e:
        logger.error(f"[SMS SERVICE] Twilio unexpected error: {e}")
        return {"sent": False, "provider": "twilio", "error": str(e)}


def send_2factor(phone_10: str, otp_code: str) -> Dict[str, Any]:
    """
    Deliver OTP via 2Factor.in transactional API (India).
    """
    api_key = settings.TWO_FACTOR_API_KEY.strip()
    if not api_key:
        return {"sent": False, "error": "TWO_FACTOR_API_KEY is not configured"}

    url = f"https://2factor.in/API/V1/{api_key}/SMS/{phone_10}/{otp_code}/OTP1"
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "BiblioBox-SMS/1.0"},
        method="GET"
    )

    try:
        with urllib.request.urlopen(req, timeout=6) as response:
            resp_body = response.read().decode("utf-8")
            data = json.loads(resp_body)
            if data.get("Status") == "Success":
                logger.info(f"[SMS SERVICE] 2Factor SMS sent to {phone_10}. Session ID: {data.get('Details')}")
                return {
                    "sent": True,
                    "provider": "2factor",
                    "message": "SMS dispatched to your mobile phone via 2Factor gateway",
                    "request_id": data.get("Details")
                }
            else:
                return {"sent": False, "provider": "2factor", "error": data.get("Details", "2Factor error")}
    except Exception as e:
        logger.error(f"[SMS SERVICE] 2Factor error: {e}")
        return {"sent": False, "provider": "2factor", "error": str(e)}


def send_webhook(phone_e164: str, otp_code: str) -> Dict[str, Any]:
    """
    Dispatch SMS request to custom HTTP webhook/microservice.
    """
    url = settings.SMS_WEBHOOK_URL.strip()
    if not url:
        return {"sent": False, "error": "SMS_WEBHOOK_URL is not configured"}

    payload = json.dumps({
        "phone": phone_e164,
        "otp": otp_code,
        "message": f"Your BiblioBox verification code is {otp_code}. Valid for 5 minutes."
    }).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "BiblioBox-SMS/1.0"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=6) as response:
            return {
                "sent": True,
                "provider": "webhook",
                "message": "SMS dispatched to your custom SMS webhook endpoint",
                "status_code": response.status
            }
    except Exception as e:
        logger.error(f"[SMS SERVICE] Webhook error: {e}")
        return {"sent": False, "provider": "webhook", "error": str(e)}


def send_sms_otp(phone_number: str, otp_code: str) -> Dict[str, Any]:
    """
    Primary entrypoint to send an OTP SMS to a user's phone.
    Inspects configured environment variables and chooses the active gateway:
    1. Fast2SMS (if FAST2SMS_API_KEY is configured)
    2. Twilio (if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are configured)
    3. 2Factor (if TWO_FACTOR_API_KEY is configured)
    4. Custom Webhook (if SMS_WEBHOOK_URL is configured)
    5. Fallback simulation (returns demo OTP for testing without external balance)
    """
    phone_10, phone_e164 = clean_phone_for_sms(phone_number)

    logger.info(f"[SMS SERVICE] Requested OTP dispatch for phone={phone_e164} (10-digit={phone_10})")

    # Fast2SMS check
    if settings.FAST2SMS_API_KEY and settings.FAST2SMS_API_KEY.strip():
        logger.info("[SMS SERVICE] Routing via Fast2SMS gateway...")
        res = send_fast2sms(phone_10, otp_code)
        if res.get("sent"):
            return res

    # Twilio check
    if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN and settings.TWILIO_FROM_NUMBER:
        logger.info("[SMS SERVICE] Routing via Twilio gateway...")
        res = send_twilio(phone_e164, otp_code)
        if res.get("sent"):
            return res

    # 2Factor check
    if settings.TWO_FACTOR_API_KEY and settings.TWO_FACTOR_API_KEY.strip():
        logger.info("[SMS SERVICE] Routing via 2Factor gateway...")
        res = send_2factor(phone_10, otp_code)
        if res.get("sent"):
            return res

    # Custom Webhook check
    if settings.SMS_WEBHOOK_URL and settings.SMS_WEBHOOK_URL.strip():
        logger.info("[SMS SERVICE] Routing via custom SMS webhook...")
        res = send_webhook(phone_e164, otp_code)
        if res.get("sent"):
            return res

    # If no provider key is configured or all attempts failed, report sandbox fallback
    logger.info(
        f"[SMS SERVICE] [SANDBOX MODE] No external SMS API key is configured in backend/.env. "
        f"Verification code for {phone_e164} is: {otp_code}"
    )

    return {
        "sent": False,
        "provider": "sandbox",
        "message": "SMS gateway key not configured. Using sandbox delivery mode.",
        "setup_guide": "Add FAST2SMS_API_KEY or Twilio credentials to backend/.env for real SMS delivery to your mobile phone."
    }
