#!/usr/bin/env python3
"""Lädt eine Seite in einem Headless-Browser (Chromium über Playwright) und gibt das fertig aufgebaute HTML aus.

Für Veranstaltungskalender und Start-up-Listen, die ihre Inhalte erst per JavaScript nachladen.
Wird von tools/abruf.py für Quellen mit "rendern": true aufgerufen – robots.txt prüft abruf.py vorher.
Keine Anmeldung, keine Formulare, kein Umgehen von Zugangssperren oder Bot-Schutz: Wird die Seite
blockiert (z. B. HTTP 403 oder eine Captcha-Seite), endet das Skript mit einem Fehler.

    python3 tools/rendern.py https://example.org/kalender > seite.html
"""
import sys

UA = "Mozilla/5.0 (compatible; StartupEventRadar/1.0; +https://fcypkszck7-web.github.io/startup-radar/)"


def main():
    if len(sys.argv) != 2:
        sys.exit("Aufruf: rendern.py URL")
    url = sys.argv[1]
    from playwright.sync_api import sync_playwright  # erst hier, damit abruf.py ohne Playwright lauffähig bleibt
    with sync_playwright() as p:
        browser = p.chromium.launch()
        try:
            seite = browser.new_page(user_agent=UA, locale="de-DE")
            antwort = seite.goto(url, wait_until="domcontentloaded", timeout=30000)
            if antwort is not None and antwort.status >= 400:
                sys.exit(f"HTTP {antwort.status}")
            try:
                seite.wait_for_load_state("networkidle", timeout=15000)
            except Exception:  # noqa: BLE001 – manche Seiten laden dauerhaft nach; dann reicht der Stand
                pass
            seite.wait_for_timeout(1500)
            html = seite.content()
            if any(w in html.lower() for w in ("captcha", "cf-challenge", "are you a robot", "access denied")) and len(html) < 20000:
                sys.exit("Seite verlangt eine Bot-Prüfung – wird nicht umgangen")
            sys.stdout.write(f"<!-- finale-url: {seite.url} -->\n")
            sys.stdout.write(html)
        finally:
            browser.close()


if __name__ == "__main__":
    main()
