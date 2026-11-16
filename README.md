# Lotte Windanzeige: NASA Target Wireless per USB auf dem Tablet

## So funktioniert es

```
Mastgeber ──Funk──> NASA Data Box ──NMEA 0183 (4800 Baud, $IIMWV)──┬──> NASA Display (läuft weiter wie bisher)
                                                                     └──> USB-NMEA-Adapter ──USB-OTG──> Android-Tablet (Chrome, Web-App)
```

Die Data Box gibt laut NASA-Anleitung NMEA 0183 mit 4800 Baud aus, Satz `MWV`, Pegel 0 bis 12 V aus 220 Ω, also ein einzelnes Signal gegen Minus (kein RS422). Der USB-Adapter wird parallel zum Display an diese Leitung geklemmt.

## Einkaufsliste

| Teil | Zweck | ca. Preis |
|---|---|---|
| **Olafs Wahl:** Waveshare „USB to RS232/485 Serial Converter, FT232RNL“ (USB-Stick mit Schraubklemmen GND / TX_A / RX_B), ca. 23 € | Schalter auf RS232, NMEA OUT an RX_B, Minus an GND, TX_A frei. Ohne galvanische Trennung | ca. 23 € |
| *Isolierte Variante:* Waveshare „FT232RNL USB TO RS232/485/422/TTL“, galvanisch getrennt (USB-Kabel liegt bei; nicht die CH343G-Variante) | Liest das NMEA-Signal über den RS232-Anschluss, Trennung schützt Tablet und Bordelektronik | ca. 30 € |
| DB9-Buchse (female) auf Schraubklemmen | Kabel ohne Löten an den RS232-Stecker anschließen | ca. 5 € |
| *Profi-Alternative:* Actisense USG-2 | Fertiger NMEA-Adapter, galvanisch getrennt | 120–160 € |
| *Günstig-Alternative:* USB-RS232-Kabel mit FTDI-Chip | Funktioniert auch, aber ohne galvanische Trennung | 15–20 € |
| USB-OTG-Adapter passend zum Tablet (meist USB-C auf USB-A) | Adapter ans Tablet | 5–10 € |
| Optional: USB-C-OTG-Adapter mit Ladebuchse | Tablet laden und gleichzeitig Daten lesen | 10–20 € |
| 2-adriges Kabel, Aderendhülsen, ggf. Klemmleiste | Abgriff an der Data Box | wenige € |

Die App unterstützt Adapter mit diesen Chips: **FTDI** (empfohlen), Silabs CP210x, WCH CH340/CH341, Prolific PL2303 und USB-CDC. Beim Kauf auf den Chip achten. Bei FTDI ist die Unterstützung am verlässlichsten.

## Anschluss an der Data Box

Die Data Box hat einen NMEA-Ausgang (NMEA OUT) und Minus (0 V), die heute zum Display gehen. Dort parallel anklemmen:

| Data Box | Waveshare / RS232-Kabel (DB9, über Schraubklemmen-Adapter) | Actisense USG-2 |
|---|---|---|
| NMEA OUT | Pin 2 (RXD) | NMEA IN + |
| 0 V / Minus | Pin 5 (GND) | NMEA IN − |

Beim Waveshare den RS232-Stecker (DB9) nehmen, nicht die RS485/422-Klemmen: Diese erwarten ein Differenzsignal und lesen das einfache NASA-Signal nicht zuverlässig.

Hinweise:
- Die Data Box liefert durch den 220-Ω-Ausgang genug Strom für Display und Adapter zusammen.
- Nur der Eingang (RX) des Adapters wird gebraucht. Den Ausgang (TX) nicht anschließen.
- Die Data Box ist nicht wasserdicht. Den Adapter ebenfalls trocken unterbringen.

## Tablet

- **Android-Tablet mit Chrome** ist nötig. iPads erlauben Webseiten keinen Zugriff auf USB-Adapter.
- Die App muss über **https** geöffnet werden (z.B. über GitHub Pages). Dann in Chrome „Zum Startbildschirm hinzufügen“ wählen. Danach läuft sie auch ohne Internet an Bord.
- Erstes Verbinden: Adapter einstecken, in der App „USB-Adapter verbinden“ tippen, Adapter auswählen, Zugriff erlauben. Danach verbindet sich die App beim Einstecken von selbst.
- In den Einstellungen zeigt „Letzte NMEA-Sätze“ die rohen Daten. Dort muss etwas wie `$IIMWV,045.0,R,12.5,N,A*xx` stehen.

## Fehlersuche

| Anzeige | Ursache |
|---|---|
| „USB-Adapter nicht verbunden“ | Adapter nicht ausgewählt, OTG-Adapter defekt, oder Tablet kann kein OTG |
| „Keine Winddaten“, Log leer | Kabel an der Data Box prüfen, Baudrate 4800 einstellen |
| Log zeigt Zeichensalat | Baudrate falsch, oder Plus und Minus vertauscht |
| Verbindung bricht beim Laden ab | Viele Tablets schalten OTG beim Laden ab: OTG-Adapter mit Ladebuchse nehmen |

Tipp: Man kann alles vorher am Laptop testen. Chrome oder Edge unter Windows/Mac öffnen die App ebenfalls und lesen den Adapter dort über Web Serial.

## Dateien

- `web/app.html`: die App (eine Datei, Quelltext)
- `build.js`: baut daraus mit `node build.js` die installierbare Offline-App in `docs/`
- `docs/`: fertige App zum Hochladen auf GitHub Pages oder einen anderen https-Webspace

## Tiefe und wahrer Wind

- **Mehrere Adapter:** In der App „Weiteren Adapter verbinden“ tippen. Über einen USB-OTG-Hub können z.B. Wind (NASA-Box) und Tiefe gleichzeitig gelesen werden.
- **Tiefe:** Die App liest `DPT` und `DBT`. Die Tiefenanzeige erscheint, sobald Tiefendaten ankommen. Flachwasser-Alarm in den Einstellungen (Standard 2,0 m, 0 = aus), mit Piepton.
- **Wahrer Wind:** In den Einstellungen „Fahrt für den wahren Wind“ wählen:
  - *GPS des Tablets*: nutzt die Standortfreigabe des Browsers.
  - *NMEA über USB*: liest `RMC`/`VTG`, z.B. vom Raymarine Element über SeaTalkNG und ein NMEA-2000-USB-Gateway (Yacht Devices YDNU-02).
  - Berechnet wird der Wind über Grund (mit SOG). Im Zifferblatt zeigt das Symbol „W“ die Richtung des wahren Windes.
