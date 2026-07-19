#!/usr/bin/env python3
"""Generate printable A4 flyer PNG for bikur-bayit."""

from pathlib import Path

from bidi.algorithm import get_display
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).parent
ASSETS = ROOT / "assets"
OUTPUT = ASSETS / "flyer-print.png"

WIDTH = 1654   # A4 @ 200 DPI
HEIGHT = 2339
MARGIN = 90

COLOR_PRIMARY = (91, 141, 239)
COLOR_PRIMARY_DARK = (58, 110, 200)
COLOR_TEXT = (30, 41, 59)
COLOR_MUTED = (100, 116, 139)
COLOR_BG = (248, 250, 252)
COLOR_WHITE = (255, 255, 255)


def rtl(text: str) -> str:
    return get_display(text)


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        "/System/Library/Fonts/SFHebrew.ttf",
        "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
        "/Library/Fonts/Arial.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def wrap_text(text: str, font: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        trial = f"{current} {word}".strip()
        if font.getlength(rtl(trial)) <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_wrapped(
    draw: ImageDraw.ImageDraw,
    text: str,
    xy: tuple[int, int],
    font: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int],
    max_width: int,
    line_gap: int = 10,
) -> int:
    x, y = xy
    for line in wrap_text(text, font, max_width):
        draw.text((x, y), rtl(line), font=font, fill=fill)
        y += font.size + line_gap
    return y


def draw_bullet_list(
    draw: ImageDraw.ImageDraw,
    items: list[str],
    xy: tuple[int, int],
    font: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int],
    max_width: int,
) -> int:
    x, y = xy
    bullet_gap = 14
    for item in items:
        lines = wrap_text(item, font, max_width - 34)
        for i, line in enumerate(lines):
            prefix = "• " if i == 0 else "  "
            draw.text((x, y), rtl(prefix + line), font=font, fill=fill)
            y += font.size + 8
        y += bullet_gap
    return y


def main() -> None:
    img = Image.new("RGB", (WIDTH, HEIGHT), COLOR_WHITE)
    draw = ImageDraw.Draw(img)

    header_h = 300
    draw.rectangle((0, 0, WIDTH, header_h), fill=COLOR_PRIMARY)
    draw.rectangle((0, header_h - 8, WIDTH, header_h), fill=COLOR_PRIMARY_DARK)

    logo_path = ASSETS / "logo.png"
    if logo_path.exists():
        logo = Image.open(logo_path).convert("RGBA")
        logo_size = 150
        logo = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
        img.paste(logo, ((WIDTH - logo_size) // 2, 36), logo)

    title_font = load_font(58, bold=True)
    subtitle_font = load_font(30)
    h2_font = load_font(34)
    body_font = load_font(26)
    small_font = load_font(22)
    qr_label_font = load_font(28)

    draw.text(
        (WIDTH // 2, 205),
        rtl("ביקור בית ליולדת"),
        font=title_font,
        fill=COLOR_WHITE,
        anchor="ma",
    )

    y = header_h + 50
    content_w = WIDTH - MARGIN * 2

    draw.text((WIDTH // 2, y), rtl("ברוכה הבאה!"), font=h2_font, fill=COLOR_PRIMARY, anchor="ma")
    y += 52
    y = draw_wrapped(
        draw,
        "מזל טוב על הולדת התינוק! האתר שלנו נוצר כדי ללוות אותך בימים הראשונים אחרי השחרור מבית החולים.",
        (MARGIN, y),
        subtitle_font,
        COLOR_TEXT,
        content_w,
        12,
    )
    y += 28

    draw.rounded_rectangle(
        (MARGIN, y, WIDTH - MARGIN, y + 130),
        radius=18,
        fill=COLOR_BG,
        outline=COLOR_PRIMARY,
        width=2,
    )
    draw_wrapped(
        draw,
        "אם ילדת ילד ראשון או אם תינוקך נולד פג — את זכאית לביקור בית מטעם שירותי בריאות הציבור (טיפת חלב).",
        (MARGIN + 24, y + 22),
        body_font,
        COLOR_TEXT,
        content_w - 48,
        10,
    )
    y += 160

    draw.text((MARGIN, y), rtl("מה תמצאי באתר?"), font=h2_font, fill=COLOR_PRIMARY)
    y += 48
    y = draw_bullet_list(
        draw,
        [
            "מידע על זכאות לביקור בית",
            "טופס קצר לקביעת ביקור בית",
            "מידע מקצועי לחודש הראשון: הנקה, צהבת, חיתולים, משקל",
            "מעקב יומי עם התראות כשיש צורך לפנות לעזרה",
            "סרטוני הדרכה ושאלות נפוצות",
            "יצירת קשר עם טיפת חלב ויועצת הנקה",
        ],
        (MARGIN, y),
        body_font,
        COLOR_TEXT,
        content_w,
    )
    y += 18

    draw.text((MARGIN, y), rtl("מה כולל ביקור הבית?"), font=h2_font, fill=COLOR_PRIMARY)
    y += 48
    y = draw_bullet_list(
        draw,
        [
            "ייעוץ הנקה אישי והערכת יעילות ההנקה",
            "הערכת משקל התינוק ומעקב אחר צהבת",
            "מענה לשאלות והדרכה לטיפול בתינוק בבית",
        ],
        (MARGIN, y),
        body_font,
        COLOR_TEXT,
        content_w,
    )

    qr_path = ASSETS / "qr-code.png"
    qr_size = 340
    qr_y = HEIGHT - qr_size - 210
    divider_y = qr_y - 36
    draw.line((MARGIN, divider_y, WIDTH - MARGIN, divider_y), fill=COLOR_PRIMARY, width=3)

    draw.text(
        (WIDTH // 2, qr_y - 42),
        rtl("סרקי את הקוד — וגשי לאתר"),
        font=qr_label_font,
        fill=COLOR_PRIMARY,
        anchor="ma",
    )

    if qr_path.exists():
        qr = Image.open(qr_path).convert("RGBA")
        qr = qr.resize((qr_size, qr_size), Image.Resampling.LANCZOS)
        qr_x = (WIDTH - qr_size) // 2
        draw.rounded_rectangle(
            (qr_x - 16, qr_y - 16, qr_x + qr_size + 16, qr_y + qr_size + 16),
            radius=20,
            fill=COLOR_WHITE,
            outline=COLOR_PRIMARY,
            width=3,
        )
        img.paste(qr, (qr_x, qr_y), qr)

    draw.text(
        (WIDTH // 2, qr_y + qr_size + 34),
        rtl("פתחי את המצלמה, כווני אל הקוד ולחצי על הקישור"),
        font=small_font,
        fill=COLOR_MUTED,
        anchor="ma",
    )

    draw.text(
        (WIDTH // 2, HEIGHT - 48),
        rtl("© 2026 מתן עמר — כל הזכויות שמורות | שירותי בריאות הציבור"),
        font=small_font,
        fill=COLOR_MUTED,
        anchor="ma",
    )

    ASSETS.mkdir(exist_ok=True)
    img.save(OUTPUT, "PNG", dpi=(200, 200))
    print(f"Saved: {OUTPUT}")


if __name__ == "__main__":
    main()
