"""Future Trace AI analysis engine."""

import re

KNOWN_CITIES = [
    "new york",
    "los angeles",
    "chicago",
    "houston",
    "phoenix",
    "london",
    "paris",
    "tokyo",
    "sydney",
    "mumbai",
    "delhi",
    "bengaluru",
    "bangalore",
    "chennai",
    "hyderabad",
    "kolkata",
    "pune",
    "jaipur",
    "ahmedabad",
    "singapore",
    "dubai",
    "berlin",
    "toronto",
    "seattle",
]

IGNORE_NAME_WORDS = {
    "hi",
    "hello",
    "hey",
    "my",
    "dear",
    "team",
    "thanks",
    "regards",
}

DOB_PATTERN = re.compile(
    r"\b(?:0?[1-9]|[12][0-9]|3[01])[/-](?:0?[1-9]|1[0-2])[/-](?:19|20)\d{2}\b"
)
PHONE_CANDIDATE_PATTERN = re.compile(r"(?<!\d)(?:\+?\d[\d().\-\s]{8,}\d)(?!\d)")
GENERAL_NAME_PATTERN = re.compile(r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\b")
NAME_TRIGGER_PATTERNS = [
    re.compile(r"\b(?:i am|i'm|my name is|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})"),
    re.compile(r"\bname\s*[:\-]\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})"),
]


def unique_ordered(items):
    """Return a list with duplicates removed while preserving order."""
    seen = set()
    ordered = []
    for item in items:
        normalized = item.lower()
        if normalized not in seen:
            seen.add(normalized)
            ordered.append(item)
    return ordered


def detect_names(text):
    """Extract probable names while ignoring greeting words and locations."""
    candidates = []
    city_lookup = {city.title() for city in KNOWN_CITIES}

    for pattern in NAME_TRIGGER_PATTERNS:
        for match in pattern.finditer(text):
            candidates.append(match.group(1).strip())

    for match in GENERAL_NAME_PATTERN.finditer(text):
        candidate = match.group(1).strip()
        first_word = candidate.split()[0].lower()
        if first_word in IGNORE_NAME_WORDS:
            continue
        if candidate in city_lookup:
            continue
        candidates.append(candidate)

    filtered = []
    for candidate in unique_ordered(candidates):
        first_word = candidate.split()[0].lower()
        if first_word not in IGNORE_NAME_WORDS:
            filtered.append(candidate)
    return filtered


def detect_phones(text):
    """Extract 10-digit phone numbers from free-form text."""
    phones = []
    for match in PHONE_CANDIDATE_PATTERN.finditer(text):
        digits = re.sub(r"\D", "", match.group(0))
        if len(digits) == 10:
            phones.append(digits)
    return unique_ordered(phones)


def detect_dates(text):
    """Extract probable dates of birth."""
    return unique_ordered(DOB_PATTERN.findall(text))


def detect_locations(text):
    """Extract known city names from the text."""
    locations = []
    for city in sorted(KNOWN_CITIES, key=len, reverse=True):
        pattern = re.compile(rf"\b{re.escape(city)}\b", re.IGNORECASE)
        if pattern.search(text):
            locations.append(city.title())
    return unique_ordered(locations)


def calculate_risk_score(extracted_data):
    """Calculate a capped 0-100 risk score."""
    score = 0

    score += min(len(extracted_data["names"]) * 18, 28)
    score += min(len(extracted_data["phones"]) * 35, 40)
    score += min(len(extracted_data["dates"]) * 28, 32)
    score += min(len(extracted_data["locations"]) * 12, 18)

    detected_categories = sum(
        1
        for key in ("names", "phones", "dates", "locations")
        if extracted_data[key]
    )

    if detected_categories >= 2:
        score += 8
    if extracted_data["phones"] and extracted_data["dates"]:
        score += 10
    if extracted_data["names"] and extracted_data["locations"]:
        score += 6

    return min(score, 100)


def build_alerts(extracted_data, risk_score):
    """Create human-readable alert strings from extracted data."""
    alerts = []

    if extracted_data["names"]:
        alerts.append(
            "Identity clue detected: " + ", ".join(extracted_data["names"][:2])
        )
    if extracted_data["phones"]:
        alerts.append(
            "Phone number exposed: attackers can launch targeted smishing or SIM swap attempts."
        )
    if extracted_data["dates"]:
        alerts.append(
            "Date of birth found: this is a strong identity verification signal."
        )
    if extracted_data["locations"]:
        alerts.append(
            "Location trail detected: " + ", ".join(extracted_data["locations"][:3])
        )
    if risk_score >= 70:
        alerts.append(
            "Composite exposure is high: these details can be chained into a convincing impersonation profile."
        )
    if not alerts:
        alerts.append(
            "Low visible exposure: no obvious name, phone, DOB, or tracked city patterns were found."
        )

    return alerts


def analyze_text(text):
    """Analyze text for sensitive personal data."""
    extracted_data = {
        "names": detect_names(text),
        "phones": detect_phones(text),
        "dates": detect_dates(text),
        "locations": detect_locations(text),
    }

    risk_score = calculate_risk_score(extracted_data)
    alerts = build_alerts(extracted_data, risk_score)

    return {
        "risk_score": risk_score,
        "alerts": alerts,
        "extracted_data": extracted_data,
    }


def replace_phone(match):
    """Replace only 10-digit phone patterns."""
    digits = re.sub(r"\D", "", match.group(0))
    if len(digits) == 10:
        return "[PHONE]"
    return match.group(0)


def generate_safe_version(text):
    """Sanitize phone numbers, dates of birth, and city names."""
    safe_text = PHONE_CANDIDATE_PATTERN.sub(replace_phone, text)
    safe_text = DOB_PATTERN.sub("[DOB]", safe_text)

    for city in sorted(KNOWN_CITIES, key=len, reverse=True):
        safe_text = re.sub(
            rf"\b{re.escape(city)}\b",
            "[CITY]",
            safe_text,
            flags=re.IGNORECASE,
        )

    return safe_text


def simulate_attack(extracted_data, risk_score=0):
    """Generate a dramatic three-step attack narrative."""
    names = extracted_data.get("names", [])
    phones = extracted_data.get("phones", [])
    dates = extracted_data.get("dates", [])
    locations = extracted_data.get("locations", [])

    collected_items = []
    if names:
        collected_items.append("Identity anchor: " + ", ".join(names[:2]))
    if phones:
        collected_items.append("Direct contact path: " + ", ".join(phones[:2]))
    if dates:
        collected_items.append("Verification detail: " + ", ".join(dates[:2]))
    if locations:
        collected_items.append("Movement clue: " + ", ".join(locations[:2]))
    if not collected_items:
        collected_items.append("Only low-context text was captured, limiting attacker confidence.")

    profile_details = []
    if names and locations:
        profile_details.append(
            "An attacker can fuse the name and city into a searchable social profile."
        )
    if phones:
        profile_details.append(
            "The phone number becomes the fastest route for phishing, OTP bait, or fake support calls."
        )
    if dates:
        profile_details.append(
            "A birth date boosts credibility during impersonation and weak KYC-style checks."
        )
    if not profile_details:
        profile_details.append(
            "Without strong identifiers, the attacker is left with a weak and unreliable profile."
        )

    execution_details = []
    if phones:
        execution_details.append(
            "A spoofed urgent message can be sent to the exposed number within minutes."
        )
    if dates and names:
        execution_details.append(
            "Identity verification questions become easier to guess during account recovery abuse."
        )
    if locations:
        execution_details.append(
            "Location references make the scam feel local, familiar, and more believable."
        )
    if not execution_details:
        execution_details.append(
            "The attack chain stalls early because there is not enough usable personal data."
        )

    if risk_score >= 70:
        execution_details.append(
            "This mix of data is strong enough to support a convincing impersonation attempt."
        )

    return [
        {
            "step": 1,
            "title": "Data Collected",
            "description": "A scraper snapshots the message and lifts every personal clue it can harvest.",
            "details": collected_items,
        },
        {
            "step": 2,
            "title": "Profile Built",
            "description": "Those fragments are stitched into a believable profile that feels real to a target and a help desk.",
            "details": profile_details,
        },
        {
            "step": 3,
            "title": "Attack Executed",
            "description": "With enough confidence, the attacker moves from observation to direct exploitation.",
            "details": execution_details,
        },
    ]
