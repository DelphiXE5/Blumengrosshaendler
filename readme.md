# Blumengroßhändler Service
Dieser JavaScript Service dient der Simulation eines echten Servers, wie er beim Blumengroßhändler vorzufinden sein könnte. 

## Features
Der Service ist weitestgehend dynamisch strukturiert. Folgende Vorgaben gibt es jedoch
1. Unter `/` befindet sich ein Katalog, der alle Unterverzeichnisse für den Katalog abbildet. Diese Unterverzeichnisse leiten sich aus den Datenbanknamen ab.
2. Alle Unterverzeichnisse können mit `/${name}` aufgerufen werden.
3. Alle Unterverzeichnisse geben die in der Datenbank abgespeicherten Informationen als __JSON__ zurückgegeben.

## Konfiguration
Die Konfiguration ist in der `defaultDatabase.json` gesichert. Das zu verwendende Schema dort anschauen.

## Starten der Anwendung
### Vorraussetzungen
 - Node.js
 - npm

### Verwendung
1. Repo clonen
2. `npm install` ausführen.
3. `npm run start` ausführen.

__Hinweis__: Um die Datenbank mit Beispieldaten zu füllen `npm run start` mit `npm run fill` erstetzen

## Fehler
Die Routes werden vor der Datenbankfüllung generiert. Es ist also notwendig den Server nach dem füllen erneut zu starten.
